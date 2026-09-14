export type AiExercise={id:string;name:string;category:string;muscle:string;equipment:string;camera:string};

export const AI_EXERCISES:AiExercise[]=[
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
{id:"desenvolvimento-halteres",name:"Desenvolvimento com halteres",category:"shoulders",muscle:"deltoides",equipment:"halteres",camera:"3/4 frontal"},
{id:"elevacao-lateral",name:"Elevação lateral",category:"shoulders",muscle:"deltoide lateral",equipment:"halteres",camera:"frontal"}
];

const ENDPOINT="https://promptvision-ai-hallankazales-projects.vercel.app/api/trincado-generate";

export async function generateExerciseSprite(exercise:AiExercise,quality="medium"){
 const response=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...exercise,quality})});
 const data:any=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data?.error||`Falha na IA (${response.status})`);
 if(!data?.imageBase64)throw new Error("A IA não retornou imagem.");
 return `data:image/png;base64,${data.imageBase64}`;
}
