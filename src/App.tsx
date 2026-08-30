import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { TrainerRoute } from "./components/TrainerRoute";
import { AboutScreen } from "./screens/AboutScreen";
import { ActiveWorkoutScreen } from "./screens/ActiveWorkoutScreen";
import { AdminScreen } from "./screens/AdminScreen";
import { ClassesScreen } from "./screens/ClassesScreen";
import { EvolutionScreen } from "./screens/EvolutionScreen";
import { HealthScreen } from "./screens/HealthScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { PaymentsScreen } from "./screens/PaymentsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { StudentsScreen } from "./screens/StudentsScreen";
import { TrainerScreen } from "./screens/TrainerScreen";
import { TurnstileScreen } from "./screens/TurnstileScreen";
import { WorkoutsScreen } from "./screens/WorkoutsScreen";

function Private({ children }: { children: React.ReactNode }) { return <ProtectedRoute>{children}</ProtectedRoute>; }

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/cadastro" element={<RegisterScreen />} />
      <Route path="/" element={<Private><HomeScreen /></Private>} />
      <Route path="/treinos" element={<Private><WorkoutsScreen /></Private>} />
      <Route path="/treinos/ativo" element={<Private><ActiveWorkoutScreen /></Private>} />
      <Route path="/saude" element={<Private><HealthScreen /></Private>} />
      <Route path="/evolucao" element={<Private><EvolutionScreen /></Private>} />
      <Route path="/aulas" element={<Private><ClassesScreen /></Private>} />
      <Route path="/pagamentos" element={<Private><PaymentsScreen /></Private>} />
      <Route path="/notificacoes" element={<Private><NotificationsScreen /></Private>} />
      <Route path="/perfil" element={<Private><ProfileScreen /></Private>} />
      <Route path="/alunos" element={<Private><StudentsScreen /></Private>} />
      <Route path="/configuracoes" element={<Private><SettingsScreen /></Private>} />
      <Route path="/sobre" element={<Private><AboutScreen /></Private>} />
      <Route path="/professor" element={<Private><TrainerRoute><TrainerScreen /></TrainerRoute></Private>} />
      <Route path="/admin" element={<Private><AdminRoute><AdminScreen /></AdminRoute></Private>} />
      <Route path="/catraca" element={<Private><AdminRoute><TurnstileScreen /></AdminRoute></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
