export type LibraryExercise = {
  id: string;
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
};

const DATA_URL = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json";
const IMAGE_BASE = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/";

let cache: LibraryExercise[] | null = null;

const queryAliases: Record<string, string> = {
  supino: "bench press",
  agachamento: "squat",
  rosca: "curl",
  remada: "row",
  puxada: "pulldown",
  levantamento: "deadlift",
  flexao: "push up",
  "flexão": "push up",
  abdominal: "ab",
  panturrilha: "calf",
  peito: "chest",
  costas: "back",
  perna: "leg",
  pernas: "legs",
  ombro: "shoulder",
  ombros: "shoulders",
  biceps: "biceps",
  "bíceps": "biceps",
  triceps: "triceps",
  "tríceps": "triceps",
  gluteo: "glute",
  "glúteo": "glute",
  gluteos: "glutes",
  "glúteos": "glutes",
};

const muscleLabels: Record<string, string> = {
  abdominals: "Abdômen",
  abductors: "Abdutores",
  adductors: "Adutores",
  biceps: "Bíceps",
  calves: "Panturrilhas",
  chest: "Peitoral",
  forearms: "Antebraços",
  glutes: "Glúteos",
  hamstrings: "Posterior de coxa",
  lats: "Dorsais",
  lower_back: "Lombar",
  middle_back: "Costas",
  neck: "Pescoço",
  quadriceps: "Quadríceps",
  shoulders: "Ombros",
  traps: "Trapézio",
  triceps: "Tríceps",
};

const equipmentLabels: Record<string, string> = {
  barbell: "Barra",
  dumbbell: "Halteres",
  cable: "Cabo",
  machine: "Máquina",
  body_only: "Peso corporal",
  bands: "Elástico",
  kettlebells: "Kettlebell",
  "e-z_curl_bar": "Barra EZ",
  medicine_ball: "Medicine ball",
  exercise_ball: "Bola suíça",
  foam_roll: "Rolo",
};

export async function loadExerciseLibrary(): Promise<LibraryExercise[]> {
  if (cache) return cache;
  const response = await fetch(DATA_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Não foi possível carregar a biblioteca de exercícios.");
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Biblioteca de exercícios inválida.");
  cache = data as LibraryExercise[];
  return cache;
}

export function searchExerciseLibrary(items: LibraryExercise[], rawQuery: string, muscle: string, equipment: string) {
  const normalized = normalize(rawQuery);
  const translated = queryAliases[normalized] ?? normalized;
  const terms = translated.split(/\s+/).filter(Boolean);

  return items.filter((item) => {
    if (muscle && !item.primaryMuscles.includes(muscle)) return false;
    if (equipment && item.equipment !== equipment) return false;
    if (terms.length === 0) return true;
    const haystack = normalize([
      item.name,
      item.equipment ?? "",
      item.category,
      ...item.primaryMuscles,
      ...item.secondaryMuscles,
    ].join(" "));
    return terms.every((term) => haystack.includes(term));
  });
}

export function libraryImageUrl(item: LibraryExercise) {
  const path = item.images?.[0];
  return path ? `${IMAGE_BASE}${path}` : "";
}

export function muscleLabel(value: string) { return muscleLabels[value] ?? humanize(value); }
export function equipmentLabel(value: string | null) { return value ? (equipmentLabels[value] ?? humanize(value)) : "Sem equipamento"; }

export function libraryInstructions(item: LibraryExercise) {
  return (item.instructions ?? []).slice(0, 3).join(" ");
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
