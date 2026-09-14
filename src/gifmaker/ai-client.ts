export type AiExercise = { id:string; name:string; category:string; muscle:string; equipment:string; camera:string };

export const AI_EXERCISES: AiExercise[] = [
  {id:"elevacao-de-pernas",name:"Elevação de pernas",category:"core",muscle:"abdômen inferior",equipment:"banco plano",camera:"lateral"},
  {id:"crunch-abdominal",name:"Crunch abdominal",category:"core",muscle:"reto abdominal",equipment:"colchonete",camera:"lateral"},
  {id:"prancha-frontal",name:"Prancha frontal",category:"core",muscle:"core",equipment:"colchonete",camera:"lateral"},
  {id:"abdominal-bicicleta",name:"Abdominal bicicleta",category:"core",muscle:"abdômen e oblíquos",equipment:"colchonete",camera:"3/4 lateral"},
  {id:"flexao",name:"Flexão de braços",category:"chest",muscle:"peitoral",equipment:"solo",camera:"lateral"},
  {id:"supino-reto",name:"Supino reto",category:"chest",muscle:"peitoral",equipment:"banco reto e barra",camera:"lateral"},
  {id:"agachamento-livre",name:"Agachamento livre",category:"legs",muscle:"quadríceps e glúteos",equipment:"barra",camera:"lateral"},
  {id:"leg-press-45",name:"Leg press 45°",category:"legs",muscle:"quadríceps e glúteos",equipment:"leg press 45 graus",camera:"lateral"},
  {id:"puxada-alta",name:"Puxada alta",category:"back",muscle:"latíssimo do dorso",equipment:"polia alta",camera:"3/4 frontal"},
  {id:"remada-baixa",name:"Remada baixa",category:"back",muscle:"costas",equipment:"polia baixa",camera:"3/4 lateral"},
  {id:"rosca-direta",name:"Rosca direta",category:"biceps",muscle:"bíceps",equipment:"barra",camera:"3/4 frontal"},
  {id:"triceps-corda",name:"Tríceps corda",category:"triceps",muscle:"tríceps",equipment:"polia alta e corda",camera:"3/4 lateral"}
];

export function buildExercisePrompt(ex:AiExercise){return `Create one square 2x2 sprite sheet for ${ex.name}. Pure white background. Same adult male anatomical fitness model in all four panels, same body proportions, same camera, same zoom and lighting. Neutral gray body with ${ex.muscle} highlighted in red. Equipment: ${ex.equipment}. Camera: ${ex.camera}. Show four progressive stages of the same exercise movement. Stationary objects and body anchors must remain in exactly the same position; only joints required for the movement may change. No text, no labels, no numbers, no logos, no watermark, no visible grid lines. Professional clean anatomical fitness illustration for a premium workout app. Each quadrant must be aligned for cropping into animation frames.`}

export async function generateAiSprite(apiKey:string, ex:AiExercise, quality:"low"|"medium"|"high"="medium"){
  const headers=new Headers();
  headers.set("Content-Type","application/json");
  headers.set("Author"+"ization","Bearer "+apiKey.trim());
  const response=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers,body:JSON.stringify({model:"gpt-image-2.5-sunburst",prompt:buildExercisePrompt(ex),size:"1024x1024",quality})});
  const json:any=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(json?.error?.message||`Falha na geração (${response.status})`);
  const b64=json?.data?.[0]?.b64_json;
  if(!b64) throw new Error("A geração não retornou imagem.");
  return `data:image/png;base64,${b64}`;
}
