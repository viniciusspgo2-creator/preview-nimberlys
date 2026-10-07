// Exercises the real React upload UI with a DOM and simulated HTTP/image-decoding.
// The separate admin tests exercise real upload handlers and Sharp processing.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const Module=require('node:module');const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');
const React=require('react');const {act}=React;
const originalLoad=Module._load;
Module._load=function(id,parent,...rest){if(id==='next/navigation')return {useRouter:()=>({refresh(){}})};if(id.startsWith('@/'))id=path.join(__dirname,'../src',id.slice(2));return originalLoad.call(this,id,parent,...rest);};
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
const {PhotosView}=require('../src/components/admin/PhotosView.tsx');
test('multiple selection, partial upload failure, retry, and restoring gallery photos are usable',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost/admin/photos'});
 global.window=dom.window;global.document=dom.window.document;global.HTMLElement=dom.window.HTMLElement;global.IS_REACT_ACT_ENVIRONMENT=true;
 global.createImageBitmap=async()=>({width:2400,height:1200,close(){}});
 dom.window.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){}});
 dom.window.HTMLCanvasElement.prototype.toBlob=function(callback){assert.equal(this.width,1800);assert.equal(this.height,900);callback(new Blob(['test-image'],{type:'image/webp'}));};
 const {createRoot}=require('react-dom/client');const root=createRoot(document.getElementById('root'));
 let attempts=0;let photos=[];let patchBody;
 global.fetch=async(url,opts={})=>{
  if(opts.method==='POST'){attempts++;if(attempts===2)return new Response(JSON.stringify({error:'Temporary upload failure'}),{status:500});photos.push({id:String(attempts),src:'/images/logo.png',caption:'A moment',alt:'A moment',gallery:true,original:null,position:0});return Response.json({ok:true});}
  if(opts.method==='PATCH'){patchBody=JSON.parse(opts.body);photos[0].gallery=patchBody.gallery;return Response.json({ok:true});}
  return Response.json({photos});
 };
 const tick=async()=>{await new Promise(r=>setTimeout(r,0));};
 const click=async(label)=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===label);assert.ok(b,`button ${label}`);await act(async()=>{b.click();await tick();});};
 await act(async()=>{root.render(React.createElement(PhotosView));await tick();});
 const input=document.querySelector('input[multiple]');assert.ok(input);
 Object.defineProperty(input,'files',{configurable:true,value:[new File(['a'],'first.png',{type:'image/png'}),new File(['b'],'second.png',{type:'image/png'})]});
 await act(async()=>{input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
 assert.match(document.body.textContent,/Ready to add \(2\)/);
 await click('Publish 2 photos');
 assert.match(document.body.textContent,/1 new photo published/);assert.match(document.body.textContent,/Temporary upload failure/);assert.match(document.body.textContent,/Ready to add \(1\)/);
 await click('Publish 1 photo');assert.equal(attempts,3);assert.doesNotMatch(document.body.textContent,/Ready to add/);assert.match(document.body.textContent,/Gallery \(2\)/);
 dom.window.confirm=()=>true;await click('Remove from gallery');assert.equal(patchBody.gallery,false);
 await click('Other website photos');await click('Add to gallery');assert.equal(patchBody.gallery,true);
 await act(async()=>root.unmount());dom.window.close();
});
