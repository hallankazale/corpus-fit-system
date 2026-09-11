import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { zipSync, strToU8 } from "fflate";

export type Frame = { id: string; name: string; dataUrl: string };
export type LoopMode = "ping-pong" | "linear";
export type Settings = { loopMode: LoopMode; delay: number; startPause: number; endPause: number; size: number };
export type SavedGif = { id: string; name: string; slug: string; category: string; createdAt: string; bytes: Uint8Array; frames?: Array<{name:string;dataUrl:string}>; settings?: Settings };

const DB_NAME="trincado-gif-maker", STORE="gifs";
export const CATEGORIES=[["chest","Peito"],["back","Costas"],["legs","Pernas"],["shoulders","Ombros"],["core","Abdômen / Core"],["cardio","Cardio"]] as const;

export function slugify(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function listSaved():Promise<SavedGif[]>{const db=await openDb();return new Promise((resolve,reject)=>{const req=db.transaction(STORE,"readonly").objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result as SavedGif[]);req.onerror=()=>reject(req.error);});}
export async function saveGif(item:SavedGif){const db=await openDb();await new Promise<void>((resolve,reject)=>{const req=db.transaction(STORE,"readwrite").objectStore(STORE).put(item);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});}
export async function deleteGif(id:string){const db=await openDb();await new Promise<void>((resolve,reject)=>{const req=db.transaction(STORE,"readwrite").objectStore(STORE).delete(id);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});}

export function fileToDataUrl(file:File):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error);r.readAsDataURL(file);});}
function loadImage(dataUrl:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=dataUrl;});}
export async function split2x2(dataUrl:string):Promise<Frame[]>{const img=await loadImage(dataUrl);const w=Math.floor(img.naturalWidth/2),h=Math.floor(img.naturalHeight/2);const cells=[[0,0],[w,0],[0,h],[w,h]];return cells.map(([sx,sy],i)=>{const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d")!;x.fillStyle="#fff";x.fillRect(0,0,w,h);x.drawImage(img,sx,sy,w,h,0,0,w,h);return{id:crypto.randomUUID(),name:`frame-${i+1}`,dataUrl:c.toDataURL("image/png")};});}
async function frameToRgba(frame:Frame,size:number){const img=await loadImage(frame.dataUrl);const c=document.createElement("canvas");c.width=size;c.height=size;const x=c.getContext("2d",{willReadFrequently:true})!;x.fillStyle="#fff";x.fillRect(0,0,size,size);const s=Math.min(size/img.naturalWidth,size/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s;x.drawImage(img,(size-dw)/2,(size-dh)/2,dw,dh);return x.getImageData(0,0,size,size).data;}
export function playbackFor(frames:Frame[],mode:LoopMode){return mode==="ping-pong"&&frames.length>=3?[...frames,...frames.slice(1,-1).reverse()]:frames;}
export function frameDuration(frame:Frame,frames:Frame[],settings:Settings){return settings.delay+(frame.id===frames[0]?.id?settings.startPause:0)+(frame.id===frames[frames.length-1]?.id?settings.endPause:0);}
export async function buildGif(frames:Frame[],settings:Settings){if(frames.length<2)throw new Error("Adicione pelo menos 2 quadros.");const gif=GIFEncoder();for(const frame of playbackFor(frames,settings.loopMode)){const rgba=await frameToRgba(frame,settings.size);const palette=quantize(rgba,256);gif.writeFrame(applyPalette(rgba,palette),settings.size,settings.size,{palette,delay:frameDuration(frame,frames,settings)});}gif.finish();return new Uint8Array(gif.bytes());}
function bytesToBase64(bytes:Uint8Array){let binary="";for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(binary);}
function dataUrlToBytes(dataUrl:string){const binary=atob(dataUrl.split(",")[1]??"");const out=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);return out;}
export async function shareBytes(bytes:Uint8Array,filename:string){const r=await Filesystem.writeFile({path:filename,data:bytesToBase64(bytes),directory:Directory.Cache});await Share.share({title:filename,text:"Arquivo criado no Trincado GIF Maker",url:r.uri,dialogTitle:"Salvar ou compartilhar"});}
export async function exportLibraryZip(saved:SavedGif[]){const manifest=saved.map(i=>({id:i.id,name:i.name,slug:i.slug,category:i.category,createdAt:i.createdAt,path:`${i.category}/${i.slug}/${i.slug}.gif`,size:i.bytes.length,frames:i.frames?.length??0,settings:i.settings??null}));const files:Record<string,Uint8Array>={"manifest.json":strToU8(JSON.stringify(manifest,null,2))};for(const item of saved){const base=`${item.category}/${item.slug}`;files[`${base}/${item.slug}.gif`]=item.bytes;files[`${base}/metadata.json`]=strToU8(JSON.stringify({id:item.id,name:item.name,category:item.category,createdAt:item.createdAt,frames:item.frames?.length??0,...(item.settings??{})},null,2));item.frames?.forEach((f,i)=>files[`${base}/frame-${i+1}.png`]=dataUrlToBytes(f.dataUrl));}return zipSync(files,{level:6});}
