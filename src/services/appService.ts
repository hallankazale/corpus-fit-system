import { initialClasses, initialNotifications, membership, payments, publicProfiles, student, workouts } from "../mocks/data";

const delay = <T,>(data: T) => new Promise<T>((resolve) => setTimeout(() => resolve(data), 120));

export const appService = {
  getStudent: () => delay(student),
  getMembership: () => delay(membership),
  getWorkouts: () => delay(workouts),
  getClasses: () => delay(initialClasses),
  getPayments: () => delay(payments),
  getNotifications: () => delay(initialNotifications),
  getPublicProfiles: () => delay(publicProfiles),
};
