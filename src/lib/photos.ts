import { db } from "@/lib/db";
import defaults from "@/data/photo-defaults.json";
export type Photo = { id:string; original:string|null; src:string; caption:string; alt:string; gallery:boolean; position:number };
export const photoSelect = { id:true, original:true, caption:true, alt:true, gallery:true, position:true, version:true } as const;
export async function getPhotos(): Promise<Photo[]> {
 const rows = await db.sitePhoto.findMany({select:photoSelect});
 const result = new Map<string,Photo>(defaults.map(p=>[p.id,p]));
 for(const row of rows) result.set(row.id,{...row,src:row.version ? `/api/photos/${row.id}?v=${row.version}` : row.original || ""});
 return [...result.values()].sort((a,b)=>a.position-b.position || a.id.localeCompare(b.id));
}
export async function getPublicPhotos(){try{return await getPhotos();}catch(error){console.error("[photos] Unable to load photo library");return defaults;}}
