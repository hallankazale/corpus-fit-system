import { useMemo, useState } from "react";
import { AI_EXERCISES, generateExerciseSprite, type AiExercise } from "./ai-backend";
import { centerFrames } from "./smart-tools";
import { split2x2, type Frame } from "./original-mode-core";

type Props={
  working:boolean;
  setWorking:(value:boolean)=>void;
  setFrames:(frames:Frame[])=>void;
  setName:(name:string)=>void;
  setCategory:(category:string)=>void;
  setMessage:(message:string)=>void;
};

export function AiGeneratorPanel({working,setWorking,setFrames,setName,setCategory,setMessage}:Props){
 const [selectedId,setSelectedId]=useState(AI_EXERCISES[0].id);
 const [quality,setQuality]=useState("medium");
 const selected=useMemo(()=>AI_EXERCISES.find(x=>x.id===selectedId)!,[selectedId]);
 function choose(id:string){const ex=AI_EXERCISES.find(x=>x.id===id)!;setSelectedId(id);setName(ex.name);setCategory(ex.category);setFrames([]);setMessage(`Pronto para gerar ${ex.name}.`)}
 async function generate(){
  setWorking(true);setMessage("IA criando a imagem 2×2...");
  try{
   const sprite=await generateExerciseSprite(selected,quality);
   setMessage("Recortando e alinhando os 4 quadros...");
   const frames=await centerFrames(await split2x2(sprite));
   setFrames(frames);setName(selected.name);setCategory(selected.category);
   setMessage("Pronto. A IA criou, recortou e alinhou tudo. Confira a prévia.");
  }catch(error){setMessage(`Erro na IA: ${error instanceof Error?error.message:String(error)}`)}finally{setWorking(false)}
 }
 return <section className="card hero"><div className="title-row"><div><small>GERAÇÃO INTELIGENTE</small><h2>Gerar exercício com IA</h2></div><span>AI BETA</span></div><p className="muted">Escolha o exercício. O sistema cria uma folha 2×2, recorta e alinha os quadros sozinho.</p><div className="two-col"><label>Exercício<select value={selectedId} onChange={e=>choose(e.target.value)}>{AI_EXERCISES.map(ex=><option value={ex.id} key={ex.id}>{ex.name}</option>)}</select></label><label>Qualidade<select value={quality} onChange={e=>setQuality(e.target.value)}><option value="low">Econômica</option><option value="medium">Média • recomendada</option><option value="high">Alta</option></select></label></div><div className="path">Músculo: <b>{selected.muscle}</b> • Equipamento: <b>{selected.equipment}</b> • Câmera: <b>{selected.camera}</b></div><button className="final-btn" disabled={working} onClick={generate}>{working?"Criando com IA...":"✨ Gerar tudo com IA"}</button></section>
}
