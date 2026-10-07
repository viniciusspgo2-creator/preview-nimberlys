/* Isolated contract tests: real auth/route handlers, in-memory Prisma substitute.
   No production database or secrets are read. */
const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
let state, failDatabase = false, failWrite = false, queue = Promise.resolve();
function check() { if (failDatabase) throw new Error('Test database offline'); }
function matches(row, where = {}) {
  return Object.entries(where).every(([k,v]) => typeof v === 'object' && v !== null ? (!v.gte || row[k] >= v.gte) : row[k] === v);
}
function table(name) {
  const rows = () => { check(); return state[name]; };
  return {
    async findUnique({where}) { return rows().find(r=>matches(r,where)) ?? null; },
    async findMany({where, take}={}) { const found=rows().filter(r=>matches(r,where)); return take ? found.slice(0,take) : found; },
    async count({where}={}) { return rows().filter(r=>matches(r,where)).length; },
    async groupBy() { return []; },
    async create({data}) {
      const list=rows();
      if (list.some(r => name === 'setting' ? r.key === data.key : data.slug && r.slug === data.slug)) throw Object.assign(new Error('Duplicate'),{code:'P2002'});
      if (failWrite && data.key === 'admin_password_hash') throw new Error('Test write failure');
      const row={...(name==='setting'?{}:{id:list.reduce((m,r)=>Math.max(m,r.id),0)+1,createdAt:new Date()}),...data}; list.push(row); return row;
    },
    async upsert({where,create,update}) { const row=await this.findUnique({where}); if (failWrite && where.key === 'admin_password_hash') throw new Error('Test write failure'); if(row){Object.assign(row,update);return row;} return this.create({data:create}); },
    async update({where,data}) { const row=await this.findUnique({where}); if(!row)throw new Error('Not found');Object.assign(row,data);return row; },
    async delete({where}) { const row=await this.findUnique({where});state[name]=rows().filter(r=>r!==row);return row; },
  };
}
const db = Object.fromEntries(['setting','post','faq','contactMessage','chatLog','pageView'].map(x=>[x,table(x)]));
db.$transaction = fn => {
  const next=queue.then(async()=>{const snapshot=structuredClone(state);try{return await fn(db);}catch(e){state=snapshot;throw e;}});
  queue=next.catch(()=>{});return next;
};
const originalLoad = Module._load;
Module._load = function(id,parent,...rest) {
  if(id==='@/lib/db')return {db};
  if(id.startsWith('@/'))id=path.join(root,'src',id.slice(2));
  return originalLoad.call(this,id,parent,...rest);
};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const auth=require('../src/lib/admin-auth.ts');
const route=name=>require(path.join(root,'src/app/api/admin',name,'route.ts'));
const originalEnv={ADMIN_SECRET:process.env.ADMIN_SECRET,ADMIN_RESET_TOKEN:process.env.ADMIN_RESET_TOKEN};
beforeEach(()=>{state={setting:[],post:[],faq:[],contactMessage:[],chatLog:[],pageView:[]};failDatabase=false;failWrite=false;process.env.ADMIN_SECRET='isolated-test-session-secret';process.env.ADMIN_RESET_TOKEN='isolated-test-recovery-token-at-least-32-chars';});
after(()=>{for(const [k,v]of Object.entries(originalEnv)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
function request(name,method='GET',body,cookie,origin){return new Request('http://localhost/api/admin/'+name,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{cookie:'nimb_admin='+cookie}:{}),...(origin?{origin}:{})},...(body?{body:JSON.stringify(body)}:{})});}
async function signedIn(){await auth.setupAdminPassword('Original-password-123');return (await auth.createToken()).token;}

test('setup is atomic and cannot overwrite an existing password',async()=>{
  const results=await Promise.all([auth.setupAdminPassword('First-password-123'),auth.setupAdminPassword('Second-password-123')]);
  assert.equal(results.filter(r=>r.ok).length,1);assert.equal(results.filter(r=>!r.ok&&r.status===403).length,1);
  const row=state.setting.find(x=>x.key==='admin_password_hash');assert.match(row.value,/^scrypt\$/);
});
test('changing ADMIN_SECRET invalidates sessions, not the password',async()=>{
  const token=await signedIn();assert.equal(await auth.verifyToken(token),true);
  process.env.ADMIN_SECRET='another-isolated-secret';assert.equal(await auth.verifyToken(token),false);assert.equal(await auth.checkAdminPassword('Original-password-123'),true);assert.equal(await auth.checkAdminPassword(process.env.ADMIN_SECRET),false);
});
test('recovery requires a separately configured token',async()=>{
  await signedIn();assert.equal((await auth.resetAdminPassword('wrong','New-password-123')).status,401);
  delete process.env.ADMIN_RESET_TOKEN;assert.equal((await auth.resetAdminPassword('wrong','New-password-123')).status,503);
  process.env.ADMIN_RESET_TOKEN=process.env.ADMIN_SECRET;assert.equal((await auth.resetAdminPassword(process.env.ADMIN_SECRET,'New-password-123')).status,503);
  assert.equal(await auth.checkAdminPassword('Original-password-123'),true);
});
test('one-use recovery replaces password and revokes previous sessions',async()=>{
  const token=await signedIn();const code=process.env.ADMIN_RESET_TOKEN;
  assert.equal((await auth.resetAdminPassword(code,'short')).status,400);
  assert.equal((await auth.resetAdminPassword(code,'Recovered-password-123')).ok,true);
  assert.equal(await auth.checkAdminPassword('Original-password-123'),false);assert.equal(await auth.checkAdminPassword('Recovered-password-123'),true);assert.equal(await auth.verifyToken(token),false);
  assert.equal((await auth.resetAdminPassword(code,'Overwrite-password-123')).status,409);
  assert.equal(await auth.verifyToken((await auth.createToken()).token),true);
});
test('concurrent recovery consumes a token only once',async()=>{
  await signedIn();const results=await Promise.all([auth.resetAdminPassword(process.env.ADMIN_RESET_TOKEN,'Recovered-one-123'),auth.resetAdminPassword(process.env.ADMIN_RESET_TOKEN,'Recovered-two-123')]);assert.equal(results.filter(r=>r.ok).length,1);assert.equal(results.filter(r=>r.status===409).length,1);
});
test('failed recovery rolls back consumption and preserves the old password',async()=>{
  await signedIn();failWrite=true;await assert.rejects(()=>auth.resetAdminPassword(process.env.ADMIN_RESET_TOKEN,'New-password-123'));failWrite=false;
  assert.equal(state.setting.some(r=>r.key.startsWith('admin_reset_used_')),false);assert.equal(await auth.checkAdminPassword('Original-password-123'),true);
  assert.equal((await auth.resetAdminPassword(process.env.ADMIN_RESET_TOKEN,'New-password-123')).ok,true);
});
test('database failure is reported as unavailable, never first-access setup',async()=>{
  failDatabase=true;const res=await route('me').GET(request('me'));assert.equal(res.status,503);assert.equal((await res.json()).configured,undefined);
  await assert.rejects(()=>auth.setupAdminPassword('New-password-123'));assert.equal(state.setting.length,0);
});
test('corrupt cookie and malformed password hashes are rejected',async()=>{
  await signedIn();assert.equal(await auth.getAdminFromRequest(new Request('http://localhost',{headers:{cookie:'nimb_admin=%zz'}})),false);
  state.setting.find(x=>x.key==='admin_password_hash').value='scrypt$$';assert.equal(await auth.checkAdminPassword('anything'),false);
});
test('login, session status and logout handlers issue and clear cookies',async()=>{
  await signedIn();const res=await route('login').POST(request('login','POST',{password:'Original-password-123'}));assert.equal(res.status,200);
  const cookie=res.headers.get('set-cookie');assert.match(cookie,/HttpOnly/i);const token=decodeURIComponent(cookie.match(/nimb_admin=([^;]+)/)[1]);
  const me=await route('me').GET(request('me','GET',null,token));assert.equal((await me.json()).authed,true);
  assert.equal((await route('login').POST(request('login','POST',{password:'wrong'}))).status,401);
  const out=await route('logout').POST();assert.match(out.headers.get('set-cookie'),/Max-Age=0/i);
});
test('panel data endpoints all reject unauthenticated access',async()=>{
  for(const name of ['stats','posts','faqs','settings','messages','chatlogs','download-project'])assert.equal((await route(name).GET(request(name))).status,401,name);
});
test('dashboard, messages and chat logs load with authentication',async()=>{
  const token=await signedIn();for(const name of ['stats','messages','chatlogs'])assert.equal((await route(name).GET(request(name,'GET',null,token))).status,200,name);
});
test('settings never reveal or overwrite authentication and recovery records',async()=>{
  const token=await signedIn();await db.setting.create({data:{key:'admin_reset_used_example',value:'used'}});
  await db.setting.create({data:{key:'gemini_api_key',value:'private-example-key'}});
  const res=await route('settings').GET(request('settings','GET',null,token));const {settings}=await res.json();assert.equal(Object.keys(settings).some(k=>k.startsWith('admin_')),false);assert.equal(settings.gemini_api_key,'');
  await route('settings').PUT(request('settings','PUT',{admin_reset_used_example:'',admin_password_hash:'malicious',site_name:'Test site'},token));
  assert.equal((await db.setting.findUnique({where:{key:'admin_reset_used_example'}})).value,'used');assert.equal(await auth.checkAdminPassword('Original-password-123'),true);
});
test('FAQ create, list, edit and delete handlers work with authentication',async()=>{
  const token=await signedIn();const created=await route('faqs').POST(request('faqs','POST',{question:'Hours?',answer:'9 to 5',published:true},token));assert.equal(created.status,201);const {faq}=await created.json();
  assert.equal((await (await route('faqs').GET(request('faqs','GET',null,token))).json()).faqs.length,1);
  const ctx={params:Promise.resolve({id:String(faq.id)})};assert.equal((await route('faqs/[id]').PUT(request('faqs/'+faq.id,'PUT',{answer:'8 to 6'},token),ctx)).status,200);
  assert.equal(state.faq[0].answer,'8 to 6');assert.equal((await route('faqs/[id]').DELETE(request('faqs/'+faq.id,'DELETE',null,token),ctx)).status,200);assert.equal(state.faq.length,0);
});
test('password change in settings signs out the previous session',async()=>{
  const token=await signedIn();assert.equal((await route('settings').PUT(request('settings','PUT',{new_admin_password:'Changed-password-123'},token))).status,200);assert.equal(await auth.verifyToken(token),false);assert.equal(await auth.checkAdminPassword('Changed-password-123'),true);
});
test('recovery endpoint blocks cross-site requests and supports matching passwords',async()=>{
  await signedIn();const body={token:process.env.ADMIN_RESET_TOKEN,password:'Recovered-password-123',confirm:'Recovered-password-123'};
  assert.equal((await route('reset-password').POST(request('reset-password','POST',body,null,'https://other.example'))).status,403);
  assert.equal((await route('reset-password').POST(request('reset-password','POST',{...body,confirm:'mismatch'}))).status,400);
  assert.equal((await route('reset-password').POST(request('reset-password','POST',body))).status,200);
});
test('posts can be created, opened, edited and deleted',async()=>{
  const token=await signedIn();const created=await route('posts').POST(request('posts','POST',{slug:'test-post',title:'Test post',excerpt:'A short excerpt',content:'Article body'},token));assert.equal(created.status,201);const {post}=await created.json();const ctx={params:Promise.resolve({id:String(post.id)})};
  assert.equal((await route('posts/[id]').GET(request('posts/'+post.id,'GET',null,token),ctx)).status,200);
  assert.equal((await route('posts/[id]').PUT(request('posts/'+post.id,'PUT',{title:'Updated title'},token),ctx)).status,200);assert.equal(state.post[0].title,'Updated title');
  assert.equal((await route('posts/[id]').DELETE(request('posts/'+post.id,'DELETE',null,token),ctx)).status,200);assert.equal(state.post.length,0);
});
test('messages can be marked handled and deleted',async()=>{
  const token=await signedIn();const message=await db.contactMessage.create({data:{name:'Test sender',email:'test@example.invalid',message:'Test message',handled:false}});const ctx={params:Promise.resolve({id:String(message.id)})};
  assert.equal((await route('messages/[id]').PATCH(request('messages/'+message.id,'PATCH',{handled:true},token),ctx)).status,200);assert.equal(state.contactMessage[0].handled,true);
  assert.equal((await route('messages/[id]').DELETE(request('messages/'+message.id,'DELETE',null,token),ctx)).status,200);assert.equal(state.contactMessage.length,0);
});
test('admin project download returns a ZIP when the archive has been built',async(t)=>{
  if(!fs.existsSync(path.join(root,'assets/nimberlys-daycare-vercel.zip')))return t.skip('Run npm run zip to verify the optional archive.');
  const token=await signedIn();const response=await route('download-project').GET(request('download-project','GET',null,token));assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/zip');const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.subarray(0,2).toString(),'PK');
});
