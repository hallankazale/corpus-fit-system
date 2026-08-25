import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { initialClasses, initialNotifications } from "../mocks/data";
import type { AppNotification, ClassSession, PublicProfile } from "../types";

export type ProfileSettings = {
  publicProfile: boolean;
  bio: string;
  social: { instagram: boolean; facebook: boolean; tiktok: boolean; whatsapp: boolean };
};

type ThemeMode = "light" | "dark";

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
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: Dispatch<SetStateAction<ThemeMode>>;
  resetDemoData: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

const profileDefaults: ProfileSettings = {
  publicProfile: true,
  bio: "Apaixonado por saúde, disciplina e evolução constante. Treinando hoje para ser melhor amanhã! 💪",
  social: { instagram: true, facebook: true, tiktok: true, whatsapp: false },
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // O app continua funcionando mesmo quando o navegador bloqueia armazenamento local.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = usePersistentState<ClassSession[]>("corpus:v1:classes", initialClasses);
  const [notifications, setNotifications] = usePersistentState<AppNotification[]>("corpus:v1:notifications", initialNotifications);
  const [profile, setProfile] = usePersistentState<ProfileSettings>("corpus:v1:profile", profileDefaults);
  const [theme, setTheme] = usePersistentState<ThemeMode>("corpus:v1:theme", "light");
  const [selectedPublicProfile, setSelectedPublicProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

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
  const toggleTheme = () => setTheme((current) => (current === "light" ? "dark" : "light"));
  const resetDemoData = () => {
    setClasses(initialClasses);
    setNotifications(initialNotifications);
    setProfile(profileDefaults);
    setTheme("light");
  };

  const value = useMemo(
    () => ({ classes, reserveClass, notifications, markRead, markAllRead, profile, setProfile, selectedPublicProfile, setSelectedPublicProfile, theme, toggleTheme, setTheme, resetDemoData }),
    [classes, notifications, profile, selectedPublicProfile, theme],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
