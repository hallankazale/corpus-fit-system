import { BookOpen, ChevronDown, Dumbbell, Film, Link2, Plus, RefreshCw, Save, Search, Trash2, UserRound, Weight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ExerciseMedia } from "../components/ExerciseMedia";
import {
  equipmentLabel,
  libraryImageUrl,
  libraryInstructions,
  loadExerciseLibrary,
  muscleLabel,
  searchExerciseLibrary,
  type LibraryExercise,
} from "../services/exerciseLibraryService";
import {
  listStudentWorkoutPrograms,
  listWorkoutStudents,
  saveWorkoutProgram,
  type WorkoutExerciseDraft,
  type WorkoutProgram,
  type WorkoutStudent,
} from "../services/workoutService";

const codes: WorkoutProgram["code"][] = ["A", "B", "C"];
const emptyExercise = (): WorkoutExerciseDraft => ({
  name: "",
  muscle_group: "",
  sets: 3,
  reps_min: 8,
  reps_max: 12,
  suggested_load_kg: null,
  rest_seconds: 60,
  notes: "",
  media_url: "",
  media_type: "none",
  media_attribution: "",
});

export function TrainerScreen() {
  const [students, setStudents] = useState<WorkoutStudent[]>([]);
  const [studentId, setStudentId] = useState("");
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [code, setCode] = useState<WorkoutProgram["code"]>("A");
  const [title, setTitle] = useState("Treino A");
  const [subtitle, setSubtitle] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<WorkoutExerciseDraft[]>([emptyExercise()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LibraryExercise[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryMuscle, setLibraryMuscle] = useState("");
  const [libraryEquipment, setLibraryEquipment] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const items = await listWorkoutStudents();
      setStudents(items);
      if (!studentId && items[0]) setStudentId(items[0].id);
    } catch (error) {
      setFeedback({ tone: "error", text: readError(error, "Não foi possível carregar os alunos.") });
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const loadPrograms = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const items = await listStudentWorkoutPrograms(id);
      setPrograms(items);
    } catch (error) {
      setFeedback({ tone: "error", text: readError(error, "Não foi possível carregar os treinos do aluno.") });
    }
  }, []);

  useEffect(() => { void loadStudents(); }, [loadStudents]);
  useEffect(() => { if (studentId) void loadPrograms(studentId); }, [studentId, loadPrograms]);

  const selectedStudent = useMemo(() => students.find((item) => item.id === studentId) ?? null, [students, studentId]);
  const selectedProgram = useMemo(() => programs.find((item) => item.code === code) ?? null, [programs, code]);

  useEffect(() => {
    if (selectedProgram) {
      setTitle(selectedProgram.title);
      setSubtitle(selectedProgram.subtitle);
      setNotes(selectedProgram.notes);
      setExercises(selectedProgram.workout_exercises.map((item) => ({
        name: item.name,
        muscle_group: item.muscle_group,
        sets: item.sets,
        reps_min: item.reps_min,
        reps_max: item.reps_max,
        suggested_load_kg: item.suggested_load_kg,
        rest_seconds: item.rest_seconds,
        notes: item.notes,
        media_url: item.media_url ?? "",
        media_type: item.media_type ?? "none",
        media_attribution: item.media_attribution ?? "",
      })));
      return;
    }
    setTitle(`Treino ${code}`);
    setSubtitle("");
    setNotes("");
    setExercises([emptyExercise()]);
  }, [selectedProgram, code]);

  const updateExercise = (index: number, patch: Partial<WorkoutExerciseDraft>) => {
    setExercises((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const removeExercise = (index: number) => setExercises((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const openLibrary = async () => {
    setLibraryOpen(true);
    if (libraryItems.length > 0 || libraryLoading) return;
    try {
      setLibraryLoading(true);
      setLibraryError("");
      setLibraryItems(await loadExerciseLibrary());
    } catch (error) {
      setLibraryError(readError(error, "Não foi possível carregar a biblioteca."));
    } finally {
      setLibraryLoading(false);
    }
  };

  const libraryMuscles = useMemo(() => Array.from(new Set(libraryItems.flatMap((item) => item.primaryMuscles))).sort(), [libraryItems]);
  const libraryEquipments = useMemo(() => Array.from(new Set(libraryItems.map((item) => item.equipment).filter((item): item is string => Boolean(item)))).sort(), [libraryItems]);
  const libraryResults = useMemo(
    () => searchExerciseLibrary(libraryItems, libraryQuery, libraryMuscle, libraryEquipment).slice(0, 30),
    [libraryItems, libraryQuery, libraryMuscle, libraryEquipment],
  );

  const addFromLibrary = (item: LibraryExercise) => {
    const draft: WorkoutExerciseDraft = {
      name: item.name,
      muscle_group: item.primaryMuscles.map(muscleLabel).join(" / "),
      sets: 3,
      reps_min: 8,
      reps_max: 12,
      suggested_load_kg: null,
      rest_seconds: 60,
      notes: libraryInstructions(item),
      media_url: libraryImageUrl(item),
      media_type: libraryImageUrl(item) ? "image" : "none",
      media_attribution: "Free Exercise DB • Public Domain / Unlicense",
    };
    setExercises((current) => current.length === 1 && !current[0].name.trim() ? [draft] : [...current, draft]);
    setLibraryOpen(false);
    setFeedback({ tone: "success", text: `${item.name} adicionado ao Treino ${code}.` });
    window.setTimeout(() => setFeedback(null), 1800);
  };

  const save = async () => {
    if (!studentId) return setFeedback({ tone: "error", text: "Selecione um aluno." });
    if (!title.trim()) return setFeedback({ tone: "error", text: "Informe o nome do treino." });
    if (exercises.length === 0 || exercises.some((item) => !item.name.trim())) return setFeedback({ tone: "error", text: "Todo exercício precisa ter um nome." });
    if (exercises.some((item) => item.media_url.trim() && !item.media_url.trim().startsWith("https://"))) return setFeedback({ tone: "error", text: "Os GIFs e vídeos precisam usar endereço HTTPS." });
    try {
      setSaving(true);
      setFeedback(null);
      await saveWorkoutProgram({ studentId, code, title, subtitle, notes, exercises });
      await loadPrograms(studentId);
      setFeedback({ tone: "success", text: `Treino ${code} salvo e liberado para o aluno.` });
    } catch (error) {
      setFeedback({ tone: "error", text: readError(error, "Não foi possível salvar o treino.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Professor" hideBottomNav>
      <div className="page-pad trainer-page">
        <div className="page-heading admin-heading">
          <div><h1>Painel do professor</h1><p>Monte fichas reais e acompanhe o que cada aluno recebe no aplicativo.</p></div>
          <button className="icon-button" onClick={() => void loadStudents()} aria-label="Atualizar alunos"><RefreshCw /></button>
        </div>

        <section className="section-card trainer-student-card">
          <div className="admin-action-title"><UserRound /><div><b>Aluno</b><small>Escolha para quem deseja montar o treino.</small></div></div>
          <label className="trainer-select">
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)} disabled={loading || students.length === 0}>
              {students.length === 0 && <option value="">Nenhum aluno disponível</option>}
              {students.map((student) => <option value={student.id} key={student.id}>{student.full_name} • #{student.membership_number}</option>)}
            </select>
            <ChevronDown />
          </label>
          {selectedStudent && <div className="trainer-student-summary"><div className="profile-avatar small">{initials(selectedStudent.full_name)}</div><div><h3>{selectedStudent.full_name}</h3><p>Matrícula #{selectedStudent.membership_number} • {selectedStudent.status === "active" ? "Ativo" : selectedStudent.status}</p></div></div>}
        </section>

        <div className="segmented trainer-tabs">{codes.map((item) => <button key={item} className={code === item ? "active" : ""} onClick={() => setCode(item)}>Treino {item}</button>)}</div>

        <section className="section-card trainer-builder">
          <div className="section-heading"><h2><Dumbbell size={20} /> Prescrição</h2><span>{selectedProgram ? "Editando" : "Novo"}</span></div>
          <div className="trainer-form-grid">
            <label><span>Nome do treino</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Peito e tríceps" /></label>
            <label><span>Objetivo / subtítulo</span><input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="Ex.: Hipertrofia" /></label>
          </div>
          <label className="admin-wide-label"><span>Observações gerais</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Orientações do professor..." /></label>
        </section>

        <div className="trainer-exercise-heading">
          <div><h2>Exercícios</h2><p>{exercises.length} exercício(s)</p></div>
          <div className="trainer-heading-actions">
            <button className="outline-button compact" onClick={() => void openLibrary()}><BookOpen /> Biblioteca</button>
            <button className="outline-button compact" onClick={() => setExercises((current) => [...current, emptyExercise()])}><Plus /> Manual</button>
          </div>
        </div>

        {libraryOpen && <section className="section-card exercise-library">
          <div className="exercise-library-head"><div><h2><BookOpen /> Biblioteca de exercícios</h2><p>Base pública com 800+ exercícios. Pesquise em português ou inglês.</p></div><button className="icon-button" onClick={() => setLibraryOpen(false)} aria-label="Fechar biblioteca"><X /></button></div>
          <div className="library-search"><Search /><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Ex.: supino, agachamento, bíceps..." autoFocus /></div>
          <div className="library-filters">
            <select value={libraryMuscle} onChange={(event) => setLibraryMuscle(event.target.value)}><option value="">Todos os músculos</option>{libraryMuscles.map((value) => <option value={value} key={value}>{muscleLabel(value)}</option>)}</select>
            <select value={libraryEquipment} onChange={(event) => setLibraryEquipment(event.target.value)}><option value="">Todos os equipamentos</option>{libraryEquipments.map((value) => <option value={value} key={value}>{equipmentLabel(value)}</option>)}</select>
          </div>
          {libraryLoading && <div className="library-state"><RefreshCw className="spin"/><span>Carregando biblioteca...</span></div>}
          {!libraryLoading && libraryError && <div className="library-state error"><span>{libraryError}</span><button className="outline-button compact" onClick={() => { setLibraryItems([]); void openLibrary(); }}>Tentar novamente</button></div>}
          {!libraryLoading && !libraryError && <>
            <div className="library-count">{libraryResults.length}{libraryResults.length === 30 ? "+" : ""} resultado(s)</div>
            <div className="library-grid">{libraryResults.map((item) => <article className="library-card" key={item.id}>
              <div className="library-media">{libraryImageUrl(item) ? <img src={libraryImageUrl(item)} alt={item.name} loading="lazy"/> : <Dumbbell />}</div>
              <div className="library-card-body"><h3>{item.name}</h3><p>{item.primaryMuscles.map(muscleLabel).join(" • ") || "Geral"}</p><div className="library-tags"><span>{equipmentLabel(item.equipment)}</span><span>{item.level || "geral"}</span></div><button className="primary-button compact" onClick={() => addFromLibrary(item)}><Plus /> Adicionar ao treino</button></div>
            </article>)}</div>
          </>}
          <small className="library-license">Fonte: Free Exercise DB • conteúdo em domínio público / Unlicense. GIFs próprios/licenciados podem ser adicionados depois em cada exercício.</small>
        </section>}

        <div className="trainer-exercise-list">
          {exercises.map((exercise, index) => (
            <article className="section-card trainer-exercise-card" key={index}>
              <div className="trainer-exercise-top"><span className="number-dot">{index + 1}</span><div><h3>{exercise.name || "Novo exercício"}</h3><p>{exercise.muscle_group || "Informe o grupo muscular"}</p></div><button className="icon-button danger-icon" onClick={() => removeExercise(index)} disabled={exercises.length === 1} aria-label={`Remover exercício ${index + 1}`}><Trash2 /></button></div>
              <div className="trainer-form-grid">
                <label><span>Exercício</span><input value={exercise.name} onChange={(event) => updateExercise(index, { name: event.target.value })} placeholder="Supino reto" /></label>
                <label><span>Grupo muscular</span><input value={exercise.muscle_group} onChange={(event) => updateExercise(index, { muscle_group: event.target.value })} placeholder="Peitoral / Tríceps" /></label>
                <label><span>Séries</span><input type="number" min="1" max="12" value={exercise.sets} onChange={(event) => updateExercise(index, { sets: numberValue(event.target.value, 1) })} /></label>
                <label><span>Repetições</span><div className="trainer-reps"><input type="number" min="1" value={exercise.reps_min} onChange={(event) => updateExercise(index, { reps_min: numberValue(event.target.value, 1) })} /><b>a</b><input type="number" min="1" value={exercise.reps_max} onChange={(event) => updateExercise(index, { reps_max: numberValue(event.target.value, 1) })} /></div></label>
                <label><span>Carga sugerida (kg)</span><div className="input-with-icon"><Weight /><input type="number" min="0" step="0.5" value={exercise.suggested_load_kg ?? ""} onChange={(event) => updateExercise(index, { suggested_load_kg: event.target.value === "" ? null : Number(event.target.value) })} /></div></label>
                <label><span>Descanso (seg)</span><input type="number" min="0" max="900" value={exercise.rest_seconds} onChange={(event) => updateExercise(index, { rest_seconds: numberValue(event.target.value, 0) })} /></label>
              </div>
              <label className="admin-wide-label"><span>Observação do exercício</span><input value={exercise.notes} onChange={(event) => updateExercise(index, { notes: event.target.value })} placeholder="Ex.: controlar a descida" /></label>

              <section className="trainer-media-editor">
                <div className="admin-action-title"><Film /><div><b>Vídeo / GIF demonstrativo</b><small>Use mídia própria ou com licença de reutilização.</small></div></div>
                <div className="trainer-form-grid">
                  <label><span>Tipo de mídia</span><select value={exercise.media_type} onChange={(event) => updateExercise(index, { media_type: event.target.value as WorkoutExerciseDraft["media_type"] })}><option value="none">Sem mídia</option><option value="gif">GIF animado</option><option value="video">Vídeo MP4/WebM</option><option value="image">Imagem</option></select></label>
                  <label><span>URL HTTPS</span><div className="input-with-icon"><Link2 /><input type="url" value={exercise.media_url} onChange={(event) => updateExercise(index, { media_url: event.target.value, media_type: event.target.value && exercise.media_type === "none" ? "gif" : exercise.media_type })} placeholder="https://.../supino.gif" /></div></label>
                </div>
                <label className="admin-wide-label"><span>Crédito / licença</span><input value={exercise.media_attribution} onChange={(event) => updateExercise(index, { media_attribution: event.target.value })} placeholder="Ex.: Vídeo próprio da academia" /></label>
                {exercise.media_url.trim() && <div className="trainer-media-preview"><ExerciseMedia exercise={exercise} /><small>Pré-visualização</small></div>}
              </section>
            </article>
          ))}
        </div>

        {feedback && <div className={feedback.tone === "success" ? "form-success" : "form-error"} role="status">{feedback.text}</div>}
        <button className="primary-button sticky-action" onClick={() => void save()} disabled={saving || !studentId}><Save /> {saving ? "Salvando..." : `Salvar Treino ${code}`}</button>
      </div>
    </AppShell>
  );
}

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AL"; }
function numberValue(value: string, fallback: number) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function readError(error: unknown, fallback: string) { if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || fallback); return fallback; }
