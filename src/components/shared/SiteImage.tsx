"use client";
import NextImage, {type ImageProps} from "next/image";
import {createContext,useContext,type ReactNode} from "react";
import type {Photo} from "@/lib/photos";
const Context=createContext<Photo[]>([]);
export function PhotoProvider({photos,children}:{photos:Photo[];children:ReactNode}){return <Context.Provider value={photos}>{children}</Context.Provider>;}
export function usePhotos(){return useContext(Context);}
export default function SiteImage(props:ImageProps){
 const photos=usePhotos();
 const key=typeof props.src === "string" ? props.src.split("?")[0] : "";
 const override=photos.find(p=>p.original===key);
 const src=override?.src || props.src;
 return <NextImage {...props} src={src} alt={override?.alt || props.alt} unoptimized={typeof src==="string" && src.startsWith("/api/photos/") ? true : props.unoptimized}/>;
}
