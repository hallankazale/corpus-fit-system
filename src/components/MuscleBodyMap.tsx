import type { WorkoutExercise } from "../services/workoutService";

type Region = "chest" | "shoulders" | "arms" | "back" | "core" | "glutes" | "quads" | "hamstrings" | "calves" | "forearms";

type Props = {
  exercise: Pick<WorkoutExercise, "muscle_group" | "name">;
};

export function MuscleBodyMap({ exercise }: Props) {
  const regions = detectRegions(`${exercise.muscle_group} ${exercise.name}`);
  const active = (region: Region) => regions.includes(region) ? "muscle-zone is-active" : "muscle-zone";

  return (
    <div className="muscle-map" aria-label={`Região trabalhada: ${exercise.muscle_group || "corpo"}`}>
      <div className="muscle-map__figure">
        <svg viewBox="0 0 180 360" role="img" aria-label="Mapa frontal do corpo humano">
          <circle className="body-base" cx="90" cy="30" r="21" />
          <rect className="body-base" x="68" y="53" width="44" height="103" rx="22" />
          <rect className="body-base" x="37" y="62" width="25" height="112" rx="13" transform="rotate(8 49 118)" />
          <rect className="body-base" x="118" y="62" width="25" height="112" rx="13" transform="rotate(-8 130 118)" />
          <rect className="body-base" x="65" y="149" width="28" height="156" rx="14" transform="rotate(2 79 227)" />
          <rect className="body-base" x="87" y="149" width="28" height="156" rx="14" transform="rotate(-2 101 227)" />
          <ellipse className={active("chest")} cx="78" cy="91" rx="15" ry="19" />
          <ellipse className={active("chest")} cx="102" cy="91" rx="15" ry="19" />
          <ellipse className={active("shoulders")} cx="59" cy="76" rx="12" ry="16" />
          <ellipse className={active("shoulders")} cx="121" cy="76" rx="12" ry="16" />
          <ellipse className={active("arms")} cx="49" cy="112" rx="10" ry="28" />
          <ellipse className={active("arms")} cx="131" cy="112" rx="10" ry="28" />
          <ellipse className={active("forearms")} cx="45" cy="153" rx="8" ry="24" />
          <ellipse className={active("forearms")} cx="135" cy="153" rx="8" ry="24" />
          <rect className={active("core")} x="76" y="111" width="28" height="42" rx="10" />
          <ellipse className={active("quads")} cx="78" cy="205" rx="12" ry="43" />
          <ellipse className={active("quads")} cx="102" cy="205" rx="12" ry="43" />
          <ellipse className={active("calves")} cx="76" cy="275" rx="10" ry="31" />
          <ellipse className={active("calves")} cx="104" cy="275" rx="10" ry="31" />
        </svg>
        <span>Frente</span>
      </div>
      <div className="muscle-map__figure">
        <svg viewBox="0 0 180 360" role="img" aria-label="Mapa traseiro do corpo humano">
          <circle className="body-base" cx="90" cy="30" r="21" />
          <rect className="body-base" x="68" y="53" width="44" height="103" rx="22" />
          <rect className="body-base" x="37" y="62" width="25" height="112" rx="13" transform="rotate(8 49 118)" />
          <rect className="body-base" x="118" y="62" width="25" height="112" rx="13" transform="rotate(-8 130 118)" />
          <rect className="body-base" x="65" y="149" width="28" height="156" rx="14" transform="rotate(2 79 227)" />
          <rect className="body-base" x="87" y="149" width="28" height="156" rx="14" transform="rotate(-2 101 227)" />
          <ellipse className={active("shoulders")} cx="59" cy="76" rx="12" ry="16" />
          <ellipse className={active("shoulders")} cx="121" cy="76" rx="12" ry="16" />
          <path className={active("back")} d="M70 72 Q90 58 110 72 L106 126 Q90 142 74 126 Z" />
          <ellipse className={active("arms")} cx="49" cy="112" rx="10" ry="28" />
          <ellipse className={active("arms")} cx="131" cy="112" rx="10" ry="28" />
          <ellipse className={active("forearms")} cx="45" cy="153" rx="8" ry="24" />
          <ellipse className={active("forearms")} cx="135" cy="153" rx="8" ry="24" />
          <ellipse className={active("glutes")} cx="78" cy="166" rx="14" ry="18" />
          <ellipse className={active("glutes")} cx="102" cy="166" rx="14" ry="18" />
          <ellipse className={active("hamstrings")} cx="78" cy="218" rx="11" ry="42" />
          <ellipse className={active("hamstrings")} cx="102" cy="218" rx="11" ry="42" />
          <ellipse className={active("calves")} cx="76" cy="275" rx="10" ry="31" />
          <ellipse className={active("calves")} cx="104" cy="275" rx="10" ry="31" />
        </svg>
        <span>Costas</span>
      </div>
      <div className="muscle-map__label"><b>Área principal</b><span>{exercise.muscle_group || "Geral"}</span></div>
    </div>
  );
}

function detectRegions(value: string): Region[] {
  const text = normalize(value);
  const found = new Set<Region>();
  if (has(text, ["peito", "peitoral", "chest", "supino", "bench press"])) found.add("chest");
  if (has(text, ["ombro", "shoulder", "deltoid", "deltoide"])) found.add("shoulders");
  if (has(text, ["biceps", "triceps", "braco", "arms", "curl", "rosca"])) found.add("arms");
  if (has(text, ["antebraco", "forearm"])) found.add("forearms");
  if (has(text, ["costas", "dorsal", "lats", "back", "remada", "row", "pulldown", "puxada", "trap", "lombar"])) found.add("back");
  if (has(text, ["abdomen", "abdominal", "core", "abs", "obliquo"])) found.add("core");
  if (has(text, ["gluteo", "glutes", "glute"])) found.add("glutes");
  if (has(text, ["quadriceps", "quad", "agachamento", "squat", "leg extension"])) found.add("quads");
  if (has(text, ["posterior", "hamstring", "stiff", "deadlift", "levantamento terra"])) found.add("hamstrings");
  if (has(text, ["panturrilha", "calf", "calves"])) found.add("calves");
  if (found.size === 0) found.add("core");
  return [...found];
}

function has(text: string, terms: string[]) { return terms.some((term) => text.includes(normalize(term))); }
function normalize(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
