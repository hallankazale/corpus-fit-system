import type { Frame } from "./original-mode-core";

export type ImportGuess = { name: string; category: string };

const RULES: Array<{ name: string; category: string; terms: string[] }> = [
  { name: "Elevação de pernas", category: "core", terms: ["elevacao de pernas", "leg raise"] },
  { name: "Crunch abdominal", category: "core", terms: ["crunch", "abdominal crunch"] },
  { name: "Prancha frontal", category: "core", terms: ["prancha", "plank"] },
  { name: "Abdominal bicicleta", category: "core", terms: ["abdominal bicicleta", "bicycle crunch"] },
  { name: "Supino reto", category: "chest", terms: ["supino reto", "bench press"] },
  { name: "Flexão", category: "chest", terms: ["flexao", "push up", "push-up"] },
  { name: "Tríceps corda", category: "triceps", terms: ["triceps corda", "rope pushdown"] },
  { name: "Puxada alta", category: "back", terms: ["puxada alta", "lat pulldown"] },
  { name: "Remada baixa", category: "back", terms: ["remada baixa", "seated row", "cable row"] },
  { name: "Rosca direta", category: "biceps", terms: ["rosca direta", "barbell curl"] },
  { name: "Agachamento", category: "legs", terms: ["agachamento", "squat"] },
  { name: "Leg press", category: "legs", terms: ["leg press"] },
  { name: "Levantamento romeno", category: "legs", terms: ["levantamento romeno", "romanian deadlift"] },
  { name: "Panturrilha em pé", category: "legs", terms: ["panturrilha", "calf raise"] },
  { name: "Desenvolvimento", category: "shoulders", terms: ["desenvolvimento", "shoulder press"] },
  { name: "Elevação lateral", category: "shoulders", terms: ["elevacao lateral", "lateral raise"] },
  { name: "Agachamento goblet", category: "legs", terms: ["goblet"] },
  { name: "Mountain climber", category: "full-body", terms: ["mountain climber"] },
  { name: "Caminhada inclinada", category: "cardio", terms: ["caminhada inclinada", "incline walk"] },
  { name: "Bicicleta ergométrica", category: "cardio", terms: ["bicicleta", "cycling"] }
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\b(2x2|final|ok|novo|nova|teste|versao|v\d+|imagem|quadro|quadros|frame|frames|master)\b/g, " ").replace(/\s+/g, " ").trim();
}

export function guessFromFilename(filename: string): ImportGuess | null {
  const value = normalize(filename);
  for (const rule of RULES) if (rule.terms.some(term => value.includes(normalize(term)))) return { name: rule.name, category: rule.category };
  return null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
}

export async function centerFrames(frames: Frame[]): Promise<Frame[]> {
  const size = 900;
  const result: Frame[] = [];
  for (const frame of frames) {
    const image = await loadImage(frame.dataUrl);
    const source = document.createElement("canvas"); source.width = image.naturalWidth; source.height = image.naturalHeight;
    const ctx = source.getContext("2d", { willReadFrequently: true })!; ctx.fillStyle = "white"; ctx.fillRect(0, 0, source.width, source.height); ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, source.width, source.height).data;
    let minX = source.width, minY = source.height, maxX = 0, maxY = 0, found = false;
    for (let y = 0; y < source.height; y += 3) for (let x = 0; x < source.width; x += 3) { const i = (y * source.width + x) * 4; if ((255-data[i])+(255-data[i+1])+(255-data[i+2]) > 90) { found = true; minX = Math.min(minX,x); minY = Math.min(minY,y); maxX = Math.max(maxX,x); maxY = Math.max(maxY,y); } }
    if (!found) { result.push(frame); continue; }
    const bw = Math.max(1,maxX-minX), bh = Math.max(1,maxY-minY), scale = Math.min((size*0.84)/bw,(size*0.84)/bh), dw = bw*scale, dh = bh*scale;
    const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size; const out = canvas.getContext("2d")!; out.fillStyle = "white"; out.fillRect(0,0,size,size); out.drawImage(source,minX,minY,bw,bh,(size-dw)/2,(size-dh)/2,dw,dh);
    result.push({ ...frame, dataUrl: canvas.toDataURL("image/png") });
  }
  return result;
}
