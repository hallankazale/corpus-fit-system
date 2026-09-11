export type WorkoutDayCode = "A" | "B" | "C" | "D" | "E" | "F";

export type TrincadoExercise = {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  rest: number;
  gif: string;
  cue: string;
  note?: string;
};

export type TrincadoWorkout = {
  code: WorkoutDayCode;
  shortLabel: string;
  title: string;
  subtitle: string;
  cardio?: string;
  exercises: TrincadoExercise[];
};

export const trincadoPlan: TrincadoWorkout[] = [
  {
    code: "A",
    shortLabel: "SEG",
    title: "Peito + tríceps + abdômen",
    subtitle: "Força primeiro, acabamento abdominal no final.",
    exercises: [
      { id: "supino", name: "Supino reto", muscle: "Peito", sets: 4, reps: "8–12", rest: 90, gif: "supino-reto.gif", cue: "Escápulas apoiadas e pés firmes. Desça a barra com controle." },
      { id: "flexao", name: "Flexão", muscle: "Peito", sets: 3, reps: "8–15", rest: 60, gif: "flexao.gif", cue: "Mantenha o corpo em linha e leve o peito entre as mãos." },
      { id: "triceps", name: "Tríceps corda", muscle: "Tríceps", sets: 3, reps: "10–15", rest: 60, gif: "triceps-corda.gif", cue: "Cotovelos junto ao tronco. Abra a corda no final." },
      { id: "crunch", name: "Crunch", muscle: "Abdômen", sets: 4, reps: "12–20", rest: 45, gif: "crunch.gif", cue: "Feche as costelas e evite puxar o pescoço." },
      { id: "prancha", name: "Prancha", muscle: "Core", sets: 3, reps: "40–60 s", rest: 45, gif: "prancha.gif", cue: "Contraia abdômen e glúteos; não deixe o quadril cair." }
    ]
  },
  {
    code: "B",
    shortLabel: "TER",
    title: "Costas + bíceps + cardio",
    subtitle: "Volume de puxada com cardio moderado ao final.",
    cardio: "20–30 min de caminhada inclinada em ritmo moderado.",
    exercises: [
      { id: "puxada", name: "Puxada alta", muscle: "Costas", sets: 4, reps: "8–12", rest: 90, gif: "puxada-alta.gif", cue: "Leve os cotovelos para baixo e mantenha o peito aberto." },
      { id: "remada", name: "Remada baixa", muscle: "Costas", sets: 4, reps: "8–12", rest: 90, gif: "remada-baixa.gif", cue: "Evite balançar o tronco; puxe usando as costas." },
      { id: "rosca", name: "Rosca direta", muscle: "Bíceps", sets: 3, reps: "10–15", rest: 60, gif: "rosca-direta.gif", cue: "Cotovelos fixos e subida sem embalo." },
      { id: "caminhada", name: "Caminhada inclinada", muscle: "Cardio", sets: 1, reps: "20–30 min", rest: 0, gif: "caminhada-inclinada.gif", cue: "Ritmo em que você ainda consegue falar frases curtas." }
    ]
  },
  {
    code: "C",
    shortLabel: "QUA",
    title: "Pernas completas",
    subtitle: "Treino principal da semana: técnica e progressão de carga.",
    exercises: [
      { id: "agachamento", name: "Agachamento", muscle: "Quadríceps + glúteos", sets: 4, reps: "6–10", rest: 120, gif: "agachamento.gif", cue: "Quadril para trás, joelhos acompanhando a ponta dos pés." },
      { id: "legpress", name: "Leg press", muscle: "Pernas", sets: 4, reps: "10–15", rest: 90, gif: "leg-press.gif", cue: "Desça até onde o quadril continua apoiado no banco." },
      { id: "romeno", name: "Levantamento romeno", muscle: "Posterior", sets: 4, reps: "8–12", rest: 90, gif: "romeno.gif", cue: "Coluna neutra e quadril recuando; barra perto do corpo." },
      { id: "panturrilha", name: "Panturrilha em pé", muscle: "Panturrilha", sets: 4, reps: "12–20", rest: 45, gif: "panturrilha.gif", cue: "Suba devagar e faça uma pausa curta no topo." }
    ]
  },
  {
    code: "D",
    shortLabel: "QUI",
    title: "Ombros + abdômen + cardio",
    subtitle: "Ombros bem trabalhados ajudam a destacar a cintura.",
    cardio: "20–25 min de bicicleta em intensidade moderada.",
    exercises: [
      { id: "desenvolvimento", name: "Desenvolvimento", muscle: "Ombros", sets: 4, reps: "8–12", rest: 90, gif: "desenvolvimento.gif", cue: "Evite arquear a lombar. Empurre a carga em linha estável." },
      { id: "lateral", name: "Elevação lateral", muscle: "Ombros", sets: 4, reps: "12–15", rest: 60, gif: "elevacao-lateral.gif", cue: "Suba até a linha dos ombros sem jogar o tronco." },
      { id: "pernas", name: "Elevação de pernas", muscle: "Abdômen inferior", sets: 3, reps: "10–15", rest: 45, gif: "elevacao-pernas.gif", cue: "Controle a lombar e evite usar impulso." },
      { id: "bike", name: "Bicicleta", muscle: "Cardio", sets: 1, reps: "20–25 min", rest: 0, gif: "bicicleta.gif", cue: "Cadência estável, sem transformar todo cardio em sprint." }
    ]
  },
  {
    code: "E",
    shortLabel: "SEX",
    title: "Upper metabólico",
    subtitle: "Corpo superior + densidade de treino sem perder técnica.",
    exercises: [
      { id: "supino-e", name: "Supino reto", muscle: "Peito", sets: 3, reps: "10–12", rest: 60, gif: "supino-reto.gif", cue: "Use carga moderada e repetições limpas." },
      { id: "remada-e", name: "Remada baixa", muscle: "Costas", sets: 3, reps: "10–12", rest: 60, gif: "remada-baixa.gif", cue: "Puxe e segure um instante com as escápulas juntas." },
      { id: "goblet", name: "Agachamento goblet", muscle: "Pernas", sets: 3, reps: "12–15", rest: 60, gif: "agachamento-goblet.gif", cue: "Halter perto do peito e joelhos alinhados." },
      { id: "mountain", name: "Mountain climber", muscle: "Condicionamento", sets: 4, reps: "30–40 s", rest: 40, gif: "mountain-climber.gif", cue: "Quadril baixo e passadas rápidas sem perder o controle." }
    ]
  },
  {
    code: "F",
    shortLabel: "SÁB",
    title: "Cardio + recuperação ativa",
    subtitle: "Gaste energia sem destruir a recuperação muscular.",
    cardio: "Escolha caminhada inclinada ou bicicleta por 30–45 min.",
    exercises: [
      { id: "caminhada-f", name: "Caminhada inclinada", muscle: "Cardio", sets: 1, reps: "30–45 min", rest: 0, gif: "caminhada-inclinada.gif", cue: "Mantenha intensidade sustentável e postura alta." },
      { id: "bike-f", name: "Bicicleta opcional", muscle: "Cardio", sets: 1, reps: "20–30 min", rest: 0, gif: "bicicleta.gif", cue: "Use se quiser variar ou poupar impacto nas articulações." },
      { id: "prancha-f", name: "Prancha", muscle: "Core", sets: 3, reps: "40–60 s", rest: 45, gif: "prancha.gif", cue: "Finalize com core firme, sem chegar à falha absoluta." }
    ]
  }
];

export function getTodayWorkoutCode(date = new Date()): WorkoutDayCode {
  const day = date.getDay();
  if (day === 1) return "A";
  if (day === 2) return "B";
  if (day === 3) return "C";
  if (day === 4) return "D";
  if (day === 5) return "E";
  if (day === 6) return "F";
  return "A";
}

export function getWorkoutByCode(code: WorkoutDayCode): TrincadoWorkout {
  const workout = trincadoPlan.find((item) => item.code === code);
  if (!workout) throw new Error(`Treino ${code} não encontrado.`);
  return workout;
}
