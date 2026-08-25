import { Navigate, Route, Routes } from "react-router-dom";
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

export function App(){return <Routes><Route path="/login" element={<LoginScreen/>}/><Route path="/cadastro" element={<RegisterScreen/>}/><Route path="/" element={<HomeScreen/>}/><Route path="/treinos" element={<WorkoutsScreen/>}/><Route path="/treinos/ativo" element={<ActiveWorkoutScreen/>}/><Route path="/evolucao" element={<EvolutionScreen/>}/><Route path="/aulas" element={<ClassesScreen/>}/><Route path="/pagamentos" element={<PaymentsScreen/>}/><Route path="/notificacoes" element={<NotificationsScreen/>}/><Route path="/perfil" element={<ProfileScreen/>}/><Route path="/alunos" element={<StudentsScreen/>}/><Route path="/configuracoes" element={<SettingsScreen/>}/><Route path="/sobre" element={<AboutScreen/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
