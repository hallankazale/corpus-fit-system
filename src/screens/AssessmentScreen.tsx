import { Activity, AlertTriangle, Apple, CheckCircle2, ChevronLeft, ChevronRight, Dumbbell, ShieldCheck, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import {
  buildAssessmentRecommendation,
  fetchOwnAssessment,
  saveOwnAssessment,
  type DailyActivity,
  type DietaryPattern,
  type EquipmentAccess,
  type ExperienceLevel,
  type FitnessAssessment,
  type FitnessAssessmentInput,
  type FitnessGoal,
  type TrainingStyle,
} from "../services/assessmentService";

const initial: FitnessAssessmentInput = {
  age: 35,
  weight_kg: 80,
  height_cm: 175,
  goal: "recomposition",
  experience: "beginner",
  training_days: 3,
  session_minutes: 60,
  equipment_access: "full_gym",
  training_style: "mixed",
  daily_activity: "moderate",
  sleep_hours: 7,
  dietary_pattern: "no_preference",
  meals_per_day: 4,
  allergies: "",
  foods_avoid: "",
  injury_or_pain: false,
  injury_details: "",
  medical_restriction: false,
  medical_details: "",
  exertion_warning_signs: false,
  warning_details: "",
  consent_sensitive_data: false,
};

export function AssessmentScreen() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<FitnessAssessmentInput>(initial);
  const [saved, setSaved] = useState<FitnessAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    void fetchOwnAssessment()
      .then((value) => {
        if (!mounted || !value) return;
        setSaved(value);
        setDraft({
          age: value.age,
          weight_kg: value.weight_kg,
          height_cm: value.height_cm,
          goal: value.goal,
          experience: value.experience,
          training_days: value.training_days,
          session_minutes: value.session_minutes,
          equipment_access: value.equipment_access,
          training_style: value.training_style,
          daily_activity: value.daily_activity,
          sleep_hours: value.sleep_hours,
          dietary_pattern: value.dietary_pattern,
          meals_per_day: value.meals_per_day,
          allergies: value.allergies,
          foods_avoid: value.foods_avoid,
          injury_or_pain: value.injury_or_pain,
          injury_details: value.injury_details,
          medical_restriction: value.medical_restriction,
          medical_details: value.medical_details,
          exertion_warning_signs: value.exertion_warning_signs,
          warning_details: value.warning_details,
          consent_sensitive_data: value.consent_sensitive_data,
        });
      })
      .catch(() => undefined)
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const preview = useMemo(() => buildAssessmentRecommendation(draft), [draft]);

  const next = () => {
    setError("");
    if (step === 0 && (draft.age < 16 || draft.weight_kg < 30 || draft.height_cm < 120)) {
      setError("Revise idade, peso e altura antes de continuar.");
      return;
    }
    if (step === 2) {
      if (draft.injury_or_pain && !draft.injury_details.trim()) return setError("Descreva a dor ou limitação informada.");
      if (draft.medical_restriction && !draft.medical_details.trim()) return setError("Descreva a restrição médica informada.");
      if (draft.exertion_warning_signs && !draft.warning_details.trim()) return setError("Descreva os sintomas informados.");
    }
    setStep((current) => Math.min(3, current + 1));
  };

  const save = async () => {
    if (!draft.consent_sensitive_data) {
      setError("Para salvar a avaliação, confirme o uso desses dados para personalizar treino e alimentação.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSaved(await saveOwnAssessment(draft));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar sua avaliação.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppShell title="Avaliação inicial"><div className="page-pad"><section className="section-card assessment-loading">Carregando sua avaliação...</section></div></AppShell>;

  return (
    <AppShell title="Avaliação inicial">
      <div className="page-pad assessment-page">
        <header className="assessment-head">
          <span>Etapa {step + 1} de 4</span>
          <h1>Vamos montar seu perfil de treino</h1>
          <p>Essas respostas ajudam o Ozorio Fit a escolher um treino e uma estratégia alimentar compatíveis com você.</p>
          <div className="assessment-progress"><i style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
        </header>

        {step === 0 && <section className="section-card assessment-section">
          <div className="assessment-section__title"><Target /><div><h2>Você e seu objetivo</h2><p>Dados básicos para dimensionar o plano.</p></div></div>
          <div className="assessment-grid">
            <NumberField label="Idade" value={draft.age} min={16} max={100} suffix="anos" onChange={(v) => setDraft((d) => ({ ...d, age: v }))} />
            <NumberField label="Peso" value={draft.weight_kg} min={30} max={300} suffix="kg" step={0.1} onChange={(v) => setDraft((d) => ({ ...d, weight_kg: v }))} />
            <NumberField label="Altura" value={draft.height_cm} min={120} max={230} suffix="cm" onChange={(v) => setDraft((d) => ({ ...d, height_cm: v }))} />
          </div>
          <SelectField label="Objetivo principal" value={draft.goal} onChange={(v) => setDraft((d) => ({ ...d, goal: v as FitnessGoal }))} options={[
            ["lose_fat","Perder gordura"],["gain_muscle","Ganhar massa muscular"],["recomposition","Perder gordura e ganhar músculo"],["conditioning","Melhorar condicionamento"]
          ]} />
        </section>}

        {step === 1 && <section className="section-card assessment-section">
          <div className="assessment-section__title"><Dumbbell /><div><h2>Sua rotina de treino</h2><p>O plano precisa caber na vida real.</p></div></div>
          <SelectField label="Experiência" value={draft.experience} onChange={(v) => setDraft((d) => ({ ...d, experience: v as ExperienceLevel }))} options={[
            ["beginner","Iniciante"],["intermediate","Intermediário"],["advanced","Avançado"]
          ]} />
          <div className="assessment-grid">
            <NumberField label="Dias por semana" value={draft.training_days} min={2} max={6} suffix="dias" onChange={(v) => setDraft((d) => ({ ...d, training_days: v }))} />
            <NumberField label="Tempo por treino" value={draft.session_minutes} min={25} max={120} suffix="min" step={5} onChange={(v) => setDraft((d) => ({ ...d, session_minutes: v }))} />
          </div>
          <SelectField label="Onde você treina?" value={draft.equipment_access} onChange={(v) => setDraft((d) => ({ ...d, equipment_access: v as EquipmentAccess }))} options={[
            ["full_gym","Academia completa"],["basic_gym","Academia pequena/básica"],["home","Em casa"]
          ]} />
          <SelectField label="Preferência" value={draft.training_style} onChange={(v) => setDraft((d) => ({ ...d, training_style: v as TrainingStyle }))} options={[
            ["machines","Mais máquinas"],["free_weights","Mais pesos livres"],["mixed","Misturado"],["no_preference","Sem preferência"]
          ]} />
        </section>}

        {step === 2 && <section className="section-card assessment-section">
          <div className="assessment-section__title"><ShieldCheck /><div><h2>Segurança e limitações</h2><p>Se houver sinal de alerta, o app não deve gerar um plano automático.</p></div></div>
          <ToggleQuestion label="Você tem dor ou lesão atual que limita algum movimento?" checked={draft.injury_or_pain} onChange={(v) => setDraft((d) => ({ ...d, injury_or_pain: v }))} />
          {draft.injury_or_pain && <TextField label="Onde e como isso limita você?" value={draft.injury_details} onChange={(v) => setDraft((d) => ({ ...d, injury_details: v }))} />}
          <ToggleQuestion label="Algum profissional de saúde já limitou seus exercícios?" checked={draft.medical_restriction} onChange={(v) => setDraft((d) => ({ ...d, medical_restriction: v }))} />
          {draft.medical_restriction && <TextField label="Qual foi a orientação/restrição?" value={draft.medical_details} onChange={(v) => setDraft((d) => ({ ...d, medical_details: v }))} />}
          <ToggleQuestion label="Você sente dor no peito, desmaio/tontura forte ou falta de ar fora do esperado durante esforço?" checked={draft.exertion_warning_signs} onChange={(v) => setDraft((d) => ({ ...d, exertion_warning_signs: v }))} />
          {draft.exertion_warning_signs && <TextField label="Descreva o que acontece" value={draft.warning_details} onChange={(v) => setDraft((d) => ({ ...d, warning_details: v }))} />}
          {(draft.injury_or_pain || draft.medical_restriction || draft.exertion_warning_signs) && <div className="assessment-warning"><AlertTriangle /><span>O Ozorio Fit vai salvar suas respostas, mas marcará o plano como <b>“revisão necessária”</b> antes de sugerir treino automático.</span></div>}
        </section>}

        {step === 3 && <section className="section-card assessment-section">
          <div className="assessment-section__title"><Apple /><div><h2>Alimentação e rotina</h2><p>Preferências e restrições mudam o tipo de plano alimentar.</p></div></div>
          <SelectField label="Padrão alimentar" value={draft.dietary_pattern} onChange={(v) => setDraft((d) => ({ ...d, dietary_pattern: v as DietaryPattern }))} options={[
            ["no_preference","Sem preferência"],["omnivore","Onívoro"],["vegetarian","Vegetariano"],["vegan","Vegano"],["low_carb","Prefiro baixo carboidrato"]
          ]} />
          <div className="assessment-grid">
            <NumberField label="Refeições por dia" value={draft.meals_per_day} min={2} max={7} suffix="refeições" onChange={(v) => setDraft((d) => ({ ...d, meals_per_day: v }))} />
            <NumberField label="Sono médio" value={draft.sleep_hours ?? 0} min={0} max={12} suffix="h" step={0.5} onChange={(v) => setDraft((d) => ({ ...d, sleep_hours: v || null }))} />
          </div>
          <SelectField label="Atividade fora da academia" value={draft.daily_activity} onChange={(v) => setDraft((d) => ({ ...d, daily_activity: v as DailyActivity }))} options={[
            ["sedentary","Fico sentado quase o dia todo"],["light","Caminho um pouco"],["moderate","Me movimento bastante"],["high","Trabalho/rotina muito ativa"]
          ]} />
          <TextField label="Alergias ou intolerâncias alimentares" value={draft.allergies} placeholder="Ex.: lactose, amendoim..." onChange={(v) => setDraft((d) => ({ ...d, allergies: v }))} />
          <TextField label="Alimentos que não come ou não gosta" value={draft.foods_avoid} placeholder="Ex.: peixe, leite..." onChange={(v) => setDraft((d) => ({ ...d, foods_avoid: v }))} />

          <div className={`assessment-result ${preview.autoPlanStatus === "allowed" ? "ok" : "review"}`}>
            {preview.autoPlanStatus === "allowed" ? <CheckCircle2 /> : <AlertTriangle />}
            <div>
              <b>{preview.autoPlanStatus === "allowed" ? "Plano automático liberado" : "Revisão necessária antes do plano automático"}</b>
              <p><strong>Treino:</strong> {preview.trainingRecommendation}</p>
              <p><strong>Alimentação:</strong> {preview.nutritionRecommendation}</p>
            </div>
          </div>

          <label className="assessment-consent">
            <input type="checkbox" checked={draft.consent_sensitive_data} onChange={(e) => setDraft((d) => ({ ...d, consent_sensitive_data: e.target.checked }))} />
            <span>Autorizo o uso dessas informações para personalizar meu treino e minhas orientações alimentares. Posso atualizar minha avaliação depois.</span>
          </label>
          <p className="assessment-disclaimer">O Ozorio Fit oferece orientação de condicionamento físico e alimentação geral. Não diagnostica doenças e não substitui avaliação médica ou nutricional quando necessária.</p>
        </section>}

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="assessment-actions">
          {step > 0 && <button className="outline-button" onClick={() => { setError(""); setStep((current) => current - 1); }}><ChevronLeft /> Voltar</button>}
          {step < 3
            ? <button className="primary-button" onClick={next}>Continuar <ChevronRight /></button>
            : <button className="primary-button" disabled={saving} onClick={() => void save()}>{saving ? "Salvando..." : saved ? "Atualizar avaliação" : "Salvar avaliação"}</button>}
        </div>

        {saved && <div className="toast">Avaliação salva. O Ozorio Fit já pode usar esse perfil para personalizar seus planos.</div>}
      </div>
    </AppShell>
  );
}

function NumberField({ label, value, min, max, suffix, step = 1, onChange }: { label: string; value: number; min: number; max: number; suffix: string; step?: number; onChange: (value: number) => void }) {
  return <label className="assessment-field"><span>{label}</span><div className="assessment-number"><input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} /><small>{suffix}</small></div></label>;
}
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: [string,string][]; onChange: (value: string) => void }) {
  return <label className="assessment-field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
}
function TextField({ label, value, placeholder = "", onChange }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void }) {
  return <label className="assessment-field"><span>{label}</span><textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}
function ToggleQuestion({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="assessment-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><i /></label>;
}
