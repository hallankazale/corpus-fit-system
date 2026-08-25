import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { initialClasses, initialNotifications } from "../mocks/data";
import type { AppNotification, ClassSession, PublicProfile } from "../types";

export type ProfileSettings = {
  publicProfile: boolean;
  bio: string;
  social: { instagram: boolean; facebook: boolean; tiktok: boolean; whatsapp: boolean };
};

type AppStateValue = {
  classes: ClassSession[];
  reserveClass: (id: string) => void;
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  profile: ProfileSettings;
  setProfile: Dispatch<SetStateAction<ProfileSettings>>;
  selectedPublicProfile: PublicProfile | null;
  setSelectedPublicProfile: (profile: PublicProfile | null) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ClassSession[]>(initialClasses);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [profile, setProfile] = useState<ProfileSettings>({
    publicProfile: true,
    bio: "Apaixonado por saúde, disciplina e evolução constante. Treinando hoje para ser melhor amanhã! 💪",
    social: { instagram: true, facebook: true, tiktok: true, whatsapp: false },
  });
  const [selectedPublicProfile, setSelectedPublicProfile] = useState<PublicProfile | null>(null);

  const reserveClass = (id: string) => {
    setClasses((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "reserved") return { ...item, status: "available", vacancies: item.vacancies + 1 };
        if (item.status === "waitlist") return { ...item, status: "reserved" };
        return { ...item, status: "reserved", vacancies: Math.max(0, item.vacancies - 1) };
      }),
    );
  };

  const markRead = (id: string) => setNotifications((items) => items.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setNotifications((items) => items.map((n) => ({ ...n, read: true })));

  const value = useMemo(
    () => ({ classes, reserveClass, notifications, markRead, markAllRead, profile, setProfile, selectedPublicProfile, setSelectedPublicProfile }),
    [classes, notifications, profile, selectedPublicProfile],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
