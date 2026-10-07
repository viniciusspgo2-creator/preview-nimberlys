"use client";
import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {Images,Upload,Plus,RefreshCw,Trash2,CheckCircle2} from "lucide-react";
import type {Photo} from "@/lib/photos";
import {api,PageHeader,adminCard} from "./admin-shared";

type Pending={key:string;file:File;url:string;caption:string;error?:string};
const button="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand";
async function prepare(file:File){
 if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Use JPG, PNG or WebP images.");
 if(file.size>20_000_000)throw new Error("Choose an image smaller than 20 MB.");
 const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"});
 try{
 const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement("canvas");
 canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Your browser could not prepare this image.");ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Could not prepare image.")),"image/webp",0.82));
 if(blob.size>3_000_000)throw new Error("This image is too large. Please choose a smaller one.");return blob;
 }finally{bitmap.close();}
}
export function PhotosView(){
 const router=useRouter();const [photos,setPhotos]=useState<Photo[]>([]);const [loading,setLoading]=useState(true);
 const [mode,setMode]=useState<"gallery"|"site">("gallery");const [queue,setQueue]=useState<Pending[]>([]);
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
 const [progress,setProgress]=useState("");const [target,setTarget]=useState<Photo|null>(null);
 const addInput=useRef<HTMLInputElement>(null);const replaceInput=useRef<HTMLInputElement>(null);
 const urls=useRef(new Set<string>());
 async function load(){const result=await api<{photos:Photo[]}>("/api/admin/photos");setPhotos(result.photos);}
 useEffect(()=>{load().catch(e=>setError(e.message)).finally(()=>setLoading(false));return()=>{urls.current.forEach(url=>URL.revokeObjectURL(url));};},[]);
 function discard(key:string){setQueue(items=>items.filter(p=>{if(p.key!==key)return true;URL.revokeObjectURL(p.url);urls.current.delete(p.url);return false;}));}
 function select(files:FileList|null){if(!files)return;setError("");const picked=Array.from(files);if(queue.length+picked.length>20){setError("Add up to 20 photos at a time.");return;}
 setQueue(items=>[...items,...picked.map(file=>{const url=URL.createObjectURL(file);urls.current.add(url);return {key:crypto.randomUUID(),file,url,caption:"",error:undefined};})]);}
 async function send(file:File,caption:string,id?:string){const blob=await prepare(file);const body=new FormData();body.append("file",blob,"photo.webp");body.append("caption",caption);if(id)body.append("id",id);
 const response=await fetch("/api/admin/photos",{method:"POST",body,credentials:"same-origin"});if(response.status===401)window.dispatchEvent(new Event("nimb:unauthorized"));const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"Upload failed. Please try again.");}
 async function publish(){setBusy(true);setError("");setMessage("");let succeeded=0;
 for(let i=0;i<queue.length;i++){const p=queue[i];setProgress(`Uploading ${i+1} of ${queue.length}…`);try{await send(p.file,p.caption);discard(p.key);succeeded++;}catch(e){setQueue(items=>items.map(item=>item.key===p.key?{...item,error:e instanceof Error?e.message:"Upload failed."}:item));}}
 try{await load();router.refresh();}catch{setError("Photos were uploaded, but the list could not refresh. Reload this page.");}
 setMessage(succeeded?`${succeeded} new photo${succeeded===1?"":"s"} published in the gallery.`:"");setProgress("");setBusy(false);}
 async function replace(file:File|undefined){if(!file||!target)return;setBusy(true);setError("");setMessage("");setProgress("Replacing photo…");try{await send(file,target.caption,target.id);await load();router.refresh();setMessage("Photo replaced wherever it is used on the website.");}catch(e){setError(e instanceof Error?e.message:"Replacement failed.");}finally{setBusy(false);setTarget(null);setProgress("");}}
 async function update(photo:Photo,changes:{caption?:string;gallery?:boolean;moveFirst?:boolean}){setBusy(true);setError("");setMessage("");try{await api("/api/admin/photos",{method:"PATCH",body:JSON.stringify({id:photo.id,...changes})});await load();router.refresh();setMessage("Changes saved.");}catch(e){setError(e instanceof Error?e.message:"Unable to save.");}finally{setBusy(false);}}
 return <div className="min-w-0">
 <PageHeader title="Photos & gallery" subtitle="Share new moments and update your website photos."/>
 <div className={`${adminCard} mb-6 border-2 border-brand/20 p-5 sm:p-7`}>
 <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-xl font-semibold">Add new photos to the gallery</h2><p className="mt-1 max-w-xl text-sm text-ink-soft">Choose photos from your phone or computer. Review them below, then publish when you are ready.</p></div>
 <button className={`${button} bg-brand text-white`} disabled={busy||loading} onClick={()=>addInput.current?.click()}><Plus size={20}/> Add photos</button></div>
 <p className="mt-3 text-xs text-ink-faint">JPG, PNG or WebP · up to 20 photos at a time · images are automatically resized</p>
 <input ref={addInput} className="sr-only" tabIndex={-1} aria-label="Choose new gallery photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={e=>{select(e.target.files);e.target.value="";}}/>
 {queue.length>0&&<div className="mt-6"><h3 className="mb-3 font-bold">Ready to add ({queue.length})</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{queue.map(p=><div key={p.key} className="min-w-0 rounded-xl border p-3"><img src={p.url} alt="Selected photo preview" className="aspect-[4/3] w-full rounded-lg object-contain bg-cream"/><p className="mt-2 truncate text-xs text-ink-soft">{p.file.name}</p><label className="mt-2 block text-xs font-bold">Caption (optional)<input className="mt-1 w-full rounded-lg border p-2 text-sm font-normal" maxLength={200} value={p.caption} disabled={busy} placeholder="e.g. A morning of creative play" onChange={e=>setQueue(items=>items.map(x=>x.key===p.key?{...x,caption:e.target.value}:x))}/></label>{p.error&&<p role="alert" className="mt-2 text-sm text-red-700">{p.error}</p>}<button disabled={busy} className={`${button} mt-1 text-red-700`} onClick={()=>discard(p.key)}><Trash2 size={16}/>Remove from selection</button></div>)}</div><button disabled={busy} onClick={publish} className={`${button} mt-5 bg-brand text-white`}><Upload size={18}/>{busy?progress:`Publish ${queue.length} photo${queue.length===1?"":"s"}`}</button></div>}
 </div>
 {error&&<p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
 {(message||progress)&&<p role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-900"><CheckCircle2 size={18}/>{progress||message}</p>}
 <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Photo collections"><button disabled={busy} className={`${button} ${mode==="gallery"?"bg-brand text-white":"bg-white"}`} onClick={()=>setMode("gallery")}><Images size={18}/>Gallery ({photos.filter(p=>p.gallery).length})</button><button disabled={busy} className={`${button} ${mode==="site"?"bg-brand text-white":"bg-white"}`} onClick={()=>setMode("site")}>Other website photos</button></div>
 <p className="mb-5 text-sm text-ink-soft">{mode==="gallery"?"These photos appear on the gallery page. The first nine also appear on the home page. Removing a photo here only removes it from the gallery.":"Replace existing website photos, or add a photo back to the gallery. A replacement updates every place that uses the same image."}</p>
 {loading?<p role="status">Loading photos…</p>:<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{photos.filter(p=>mode==="gallery"?p.gallery:!p.gallery).map(photo=><PhotoCard key={photo.id+photo.src+photo.caption} photo={photo} busy={busy} onReplace={()=>{setTarget(photo);replaceInput.current?.click();}} onSave={caption=>update(photo,{caption})} onFirst={()=>update(photo,{moveFirst:true})} onVisibility={()=>{if(!photo.gallery||window.confirm("Remove this photo from the gallery? You can add it back from Other website photos."))update(photo,{gallery:!photo.gallery});}}/>)}</div>}
 {!loading&&!photos.some(p=>mode==="gallery"?p.gallery:!p.gallery)&&<p className="rounded-xl border border-dashed p-8 text-center">No photos here yet. Use Add photos to get started.</p>}
 <input ref={replaceInput} className="sr-only" tabIndex={-1} aria-label="Choose replacement photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{replace(e.target.files?.[0]);e.target.value="";}}/>
 </div>;
}
function PhotoCard({photo,busy,onReplace,onSave,onVisibility,onFirst}:{photo:Photo;busy:boolean;onReplace:()=>void;onSave:(caption:string)=>void;onVisibility:()=>void;onFirst:()=>void}){
 const [caption,setCaption]=useState(photo.caption);
 return <article className={`${adminCard} min-w-0 overflow-hidden`}><img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[4/3] w-full bg-cream object-contain"/><div className="p-4"><label className="block text-xs font-bold">Caption & image description<input value={caption} maxLength={200} disabled={busy} onChange={e=>setCaption(e.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"/></label>{caption!==photo.caption&&<button disabled={busy||!caption.trim()} onClick={()=>onSave(caption)} className={`${button} text-brand`}>Save caption</button>}<div className="mt-3 flex flex-wrap gap-2">{photo.gallery&&<button disabled={busy} onClick={onFirst} className={`${button} text-brand`}>Move to first</button>}<button disabled={busy} onClick={onReplace} className={`${button} bg-brand-soft text-brand`}><RefreshCw size={16}/>Replace photo</button><button disabled={busy} onClick={onVisibility} className={`${button} ${photo.gallery?"text-red-700":"text-brand"}`}>{photo.gallery?<Trash2 size={16}/>:<Plus size={16}/>} {photo.gallery?"Remove from gallery":"Add to gallery"}</button></div></div></article>;
}
