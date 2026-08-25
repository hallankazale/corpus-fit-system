export type Student = {
  id: string;
  name: string;
  enrollment: string;
  age: number;
  sex: string;
  status: "active" | "inactive";
};

export type Membership = {
  name: string;
  monthlyAmount: number;
  dueDate: string;
  paymentStatus: "paid" | "pending" | "overdue";
  accessAllowed: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  sets: string;
  suggestedLoad: string;
  restSeconds: number;
};

export type Workout = {
  id: string;
  title: string;
  subtitle: string;
  exercises: Exercise[];
};

export type ClassSession = {
  id: string;
  title: string;
  time: string;
  instructor: string;
  vacancies: number;
  status: "available" | "waitlist" | "reserved";
};

export type Payment = {
  id: string;
  date: string;
  method: "PIX" | "Cartão";
  maskedCard?: string;
  amount: number;
  status: "Pago" | "Pendente";
};

export type AppNotification = {
  id: string;
  category: "Pagamentos" | "Aulas" | "Academia";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export type PublicProfile = {
  id: string;
  name: string;
  city: string;
  activity: string;
  initials: string;
  isNew?: boolean;
  activityScore?: number;
};
