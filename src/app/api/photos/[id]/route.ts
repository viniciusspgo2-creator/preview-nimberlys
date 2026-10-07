import {db} from "@/lib/db";
export const runtime="nodejs";
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(id))return new Response(null,{status:404});
 try{
 const photo=await db.sitePhoto.findUnique({where:{id},select:{data:true,version:true}});
 if(!photo?.data)return new Response(null,{status:404});
 return new Response(new Uint8Array(photo.data),{headers:{"Content-Type":"image/webp","Cache-Control":"public, max-age=0, must-revalidate","ETag":`"${photo.version}"`,"X-Content-Type-Options":"nosniff"}});
 }catch{return new Response(null,{status:503});}
}
