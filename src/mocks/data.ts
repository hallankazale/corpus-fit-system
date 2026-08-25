import type { AppNotification, ClassSession, Membership, Payment, PublicProfile, Student, Workout } from "../types";

export const student: Student = {
  id: "student-6546",
  name: "Hallan Fernando Lehrbach",
  enrollment: "6546",
  age: 35,
  sex: "Masculino",
  status: "active",
};

export const membership: Membership = {
  name: "Plano Mensal",
  monthlyAmount: 99.9,
  dueDate: "08/09/2026",
  paymentStatus: "paid",
  accessAllowed: true,
};

export const workouts: Workout[] = [
  { id: "A", title: "Treino A", subtitle: "Costas e bíceps", exercises: [] },
  {
    id: "B",
    title: "Treino B",
    subtitle: "Peito e tríceps",
    exercises: [
      { id: "supino", name: "Supino reto", sets: "4 x 8-12", suggestedLoad: "70 kg", restSeconds: 90 },
      { id: "crucifixo", name: "Crucifixo inclinado", sets: "3 x 10-12", suggestedLoad: "18 kg", restSeconds: 60 },
      { id: "pulley", name: "Tríceps pulley", sets: "3 x 12-15", suggestedLoad: "45 kg", restSeconds: 60 },
      { id: "mergulho", name: "Mergulho no banco", sets: "3 x 10-15", suggestedLoad: "Peso corporal", restSeconds: 60 },
    ],
  },
  { id: "C", title: "Treino C", subtitle: "Pernas e ombros", exercises: [] },
];

export const initialClasses: ClassSession[] = [
  { id: "mob-0700", title: "Mobilidade", time: "07:00", instructor: "Prof. Juliana Santos", vacancies: 8, status: "available" },
  { id: "fun-1500", title: "Funcional", time: "15:00", instructor: "Prof. Rafael Costa", vacancies: 2, status: "available" },
  { id: "fun-1900", title: "Funcional", time: "19:00", instructor: "Prof. Rafael Costa", vacancies: 0, status: "waitlist" },
];

export const payments: Payment[] = [
  { id: "p1", date: "08/08/2026", method: "PIX", amount: 99.9, status: "Pago" },
  { id: "p2", date: "08/07/2026", method: "Cartão", maskedCard: "•••• 1234", amount: 99.9, status: "Pago" },
  { id: "p3", date: "08/06/2026", method: "PIX", amount: 99.9, status: "Pago" },
  { id: "p4", date: "08/05/2026", method: "Cartão", maskedCard: "•••• 1234", amount: 99.9, status: "Pago" },
];

export const initialNotifications: AppNotification[] = [
  { id: "n1", category: "Pagamentos", title: "Pagamento confirmado", message: "Seu pagamento do plano mensal foi confirmado com sucesso.", time: "Hoje, 20:25", read: false },
  { id: "n2", category: "Aulas", title: "Lembrete de aula", message: "Você tem aula de Funcional hoje às 19:00. Não falte!", time: "Hoje, 18:00", read: false },
  { id: "n3", category: "Academia", title: "Novo treino atualizado", message: "Seu Treino B foi atualizado pelo professor.", time: "Ontem, 14:32", read: true },
  { id: "n4", category: "Academia", title: "Aviso da academia", message: "No dia 30/05 não haverá expediente devido ao feriado.", time: "28/05, 10:15", read: true },
];

export const publicProfiles: PublicProfile[] = [
  { id: "a1", name: "Juliana", city: "São Paulo, SP", activity: "Musculação", initials: "JU", isNew: true, activityScore: 91 },
  { id: "a2", name: "Carlos", city: "São Paulo, SP", activity: "Funcional", initials: "CA", activityScore: 88 },
  { id: "a3", name: "Marina", city: "Campinas, SP", activity: "Musculação", initials: "MA", isNew: true, activityScore: 79 },
  { id: "a4", name: "Lucas", city: "Rio de Janeiro, RJ", activity: "Funcional", initials: "LU", activityScore: 95 },
  { id: "a5", name: "Beatriz", city: "Curitiba, PR", activity: "Musculação", initials: "BE", activityScore: 72 },
  { id: "a6", name: "Felipe", city: "Belo Horizonte, MG", activity: "Funcional", initials: "FE", activityScore: 84 },
];
