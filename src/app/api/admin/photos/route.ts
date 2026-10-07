import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import sharp from "sharp";
import {db} from "@/lib/db";
import {getAdminFromRequest} from "@/lib/admin-auth";
import {getPhotos} from "@/lib/photos";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
async function guard(req:Request){
 if(!(await getAdminFromRequest(req)))return fail("Please sign in again.",401);
 const origin=req.headers.get("origin");
 if(req.method!=="GET" && ((origin && origin!==new URL(req.url).origin)||req.headers.get("sec-fetch-site")==="cross-site"))return fail("Invalid request origin.",403);
}
export async function GET(req:Request){const denied=await guard(req);if(denied)return denied;
 try{return NextResponse.json({photos:await getPhotos()},{headers:{"Cache-Control":"no-store"}});}catch{return fail("Unable to load photos. Check that the latest database migration ran during deployment.",503);}}
export async function POST(req:Request){const denied=await guard(req);if(denied)return denied;
 try{
 if(Number(req.headers.get("content-length")||0)>3_200_000)return fail("Image is too large.",413);
 const form=await req.formData(); const file=form.get("file");
 if(!(file instanceof File)||!file.size||file.size>3_000_000)return fail("Choose a JPG, PNG or WebP image under 3 MB.",413);
 const id=String(form.get("id")||""); const photos=await getPhotos();const old=photos.find(p=>p.id===id);
 if(id&&!old)return fail("Photo not found.",404);
 let data:Buffer;
 try{const input=sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:40_000_000});const meta=await input.metadata();if(!["jpeg","png","webp"].includes(meta.format||""))return fail("Use JPG, PNG or WebP.");data=await input.rotate().resize(1800,1800,{fit:"inside",withoutEnlargement:true}).webp({quality:82}).toBuffer();}catch{return fail("This image could not be read. Please choose another JPG, PNG or WebP.");}
 if(data.length>1_500_000)return fail("Please choose a smaller image.",413);
 const photoId=old?.id||randomUUID();
 const caption=String(form.get("caption")||old?.caption||"A moment at Nimberly's").trim().slice(0,200);
 const shared={caption,alt:caption,data:new Uint8Array(data),version:randomUUID()};
 await db.sitePhoto.upsert({where:{id:photoId},create:{id:photoId,original:old?.original||null,gallery:old?.gallery??true,position:old?.position??-Date.now(),...shared},update:shared});
 return NextResponse.json({ok:true});
 }catch(error){console.error("[photos/upload]",error);return fail("Upload failed. Please try again.",500);}}
export async function PATCH(req:Request){const denied=await guard(req);if(denied)return denied;
 try{const body=await req.json();const old=(await getPhotos()).find(p=>p.id===body.id);if(!old)return fail("Photo not found.",404);
 const caption=typeof body.caption==="string"?body.caption.trim().slice(0,200):old.caption;
 if(!caption)return fail("Please enter a caption.");
 const gallery=typeof body.gallery==="boolean"?body.gallery:old.gallery;
 const update={caption,alt:caption,gallery,...(body.moveFirst===true ? {position:-Date.now()} : {})};
 await db.sitePhoto.upsert({where:{id:old.id},create:{id:old.id,original:old.original,position:old.position,version:"",...update},update});
 return NextResponse.json({ok:true});
 }catch{return fail("Unable to save changes. Please try again.",500);}}
