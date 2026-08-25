import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { isDemoAuthenticated } from "./services/demoAuth";
import { AboutScreen } from "./screens/AboutScreen";
import { ActiveWorkoutScreen } from "./screens/ActiveWorkoutScreen";
import { ClassesScreen } from "./screens/ClassesScreen";
import { EvolutionScreen } from "./screens/EvolutionScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { PaymentsScreen } from "./screens/PaymentsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { StudentsScreen } from "./screens/StudentsScreen";
import { WorkoutsScreen } from "./screens/WorkoutsScreen";

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isDemoAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

function Private({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/cadastro" element={<RegisterScreen />} />
      <Route path="/" element={<Private><HomeScreen /></Private>} />
      <Route path="/treinos" element={<Private><WorkoutsScreen /></Private>} />
      <Route path="/treinos/ativo" element={<Private><ActiveWorkoutScreen /></Private>} />
      <Route path="/evolucao" element={<Private><EvolutionScreen /></Private>} />
      <Route path="/aulas" element={<Private><ClassesScreen /></Private>} />
      <Route path="/pagamentos" element={<Private><PaymentsScreen /></Private>} />
      <Route path="/notificacoes" element={<Private><NotificationsScreen /></Private>} />
      <Route path="/perfil" element={<Private><ProfileScreen /></Private>} />
      <Route path="/alunos" element={<Private><StudentsScreen /></Private>} />
      <Route path="/configuracoes" element={<Private><SettingsScreen /></Private>} />
      <Route path="/sobre" element={<Private><AboutScreen /></Private>} />
      <Route path="*" element={<Navigate to={isDemoAuthenticated() ? "/" : "/login"} replace />} />
    </Routes>
  );
}
