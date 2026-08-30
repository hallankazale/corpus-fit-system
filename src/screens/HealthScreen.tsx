import { Activity, Bike, Droplets, Flame, RefreshCw, Ruler, Save, Scale, Target, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { fetchOwnHealthDashboard, saveOwnMeasurement, type HealthDashboard } from "../services/healthService";

const weekdayLabels: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
  7: "Domingo",
};

const intensityLabels = {
  light: "Leve",
  moderate: "Moderado",
  vigorous: "Intenso",
} as const;

type Tab = "nutrition" | "cardio" | "progress";

export function HealthScreen() {
  const [tab, setTab] = useState<Tab>("nutrition");
  const [dashboard, setDashboard] = useState<HealthDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    measuredAt: new Date().toISOString().slice(0, 10),
    weightKg: "",
    waistCm: "",
    bodyFatPercent: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setDashboard(await fetchOwnHealthDashboard());
    } catch (err) {
      setError(readError(err, "Não foi possível carregar seu plano."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const latest = dashboard?.measurements[0] ?? null;
  const progress = useMemo(() => {
    const items = dashboard?.measurements ?? [];
    if (items.length < 2) return null;
    const newest = items[0];
    const oldest = items[items.length - 1];
    return {
      weight: newest.weight_kg != null && oldest.weight_kg != null ? Number(newest.weight_kg) - Number(oldest.weight_kg) : null,
      waist: newest.waist_cm != null && oldest.waist_cm != null ? Number(newest.waist_cm) - Number(oldest.waist_cm) : null,
    };
  }, [dashboard]);

  const saveMeasurement = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await saveOwnMeasurement({
        measuredAt: form.measuredAt,
        weightKg: parseOptionalNumber(form.weightKg),
        waistCm: parseOptionalNumber(form.waistCm),
        bodyFatPercent: parseOptionalNumber(form.bodyFatPercent),
      });
      setSuccess("Medidas salvas com sucesso.");
      setForm((current) => ({ ...current, weightKg: "", waistCm: "", bodyFatPercent: "" }));
      await load();
    } catch (err) {
      setError(readError(err, "Não foi possível salvar suas medidas."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="Nutrição & Cardio">
      <div className="page-pad health-page">
        <section className="health-hero">
          <div className="health-hero__icon"><Target /></div>
          <div>
            <small>FOCO ATUAL</small>
            <h2>{dashboard?.nutritionPlan?.objective || "Definição corporal"}</h2>
            <p>Treino, alimentação e cardio trabalhando juntos.</p>
          </div>
        </section>

        <div className="health-tabs" role="tablist" aria-label="Nutrição, cardio e progresso">
          <button className={tab === "nutrition" ? "active" : ""} onClick={() => setTab("nutrition")}><Utensils size={18}/> Alimentação</button>
          <button className={tab === "cardio" ? "active" : ""} onClick={() => setTab("cardio")}><Bike size={18}/> Cardio</button>
          <button className={tab === "progress" ? "active" : ""} onClick={() => setTab("progress")}><Ruler size={18}/> Progresso</button>
        </div>

        {loading && <section className="section-card health-state"><RefreshCw className="spin"/><h3>Carregando seu plano...</h3></section>}
        {!loading && error && <section className="section-card health-state health-state--error"><Activity/><h3>Não foi possível carregar</h3><p>{error}</p><button className="outline-button" onClick={() => void load()}>Tentar novamente</button></section>}

        {!loading && !error && tab === "nutrition" && (
          <NutritionPanel dashboard={dashboard} />
        )}

        {!loading && !error && tab === "cardio" && (
          <CardioPanel dashboard={dashboard} />
        )}

        {!loading && !error && tab === "progress" && (
          <section className="health-stack">
            <div className="health-metrics-grid">
              <Metric icon={<Scale/>} label="Peso atual" value={latest?.weight_kg != null ? `${formatNumber(latest.weight_kg)} kg` : "—"} delta={progress?.weight ?? null} unit="kg" />
              <Metric icon={<Ruler/>} label="Cintura" value={latest?.waist_cm != null ? `${formatNumber(latest.waist_cm)} cm` : "—"} delta={progress?.waist ?? null} unit="cm" />
            </div>

            <section className="section-card health-form-card">
              <div className="health-section-title"><div className="health-section-icon"><Ruler/></div><div><small>ACOMPANHAMENTO</small><h3>Registrar medidas</h3></div></div>
              <div className="health-form-grid">
                <label>Data<input type="date" value={form.measuredAt} onChange={(e) => setForm({ ...form, measuredAt: e.target.value })}/></label>
                <label>Peso (kg)<input inputMode="decimal" placeholder="Ex.: 82,5" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })}/></label>
                <label>Cintura (cm)<input inputMode="decimal" placeholder="Ex.: 91" value={form.waistCm} onChange={(e) => setForm({ ...form, waistCm: e.target.value })}/></label>
                <label>Gordura corporal (%)<input inputMode="decimal" placeholder="Opcional" value={form.bodyFatPercent} onChange={(e) => setForm({ ...form, bodyFatPercent: e.target.value })}/></label>
              </div>
              {success && <p className="health-success">{success}</p>}
              <button className="primary-button" disabled={saving} onClick={() => void saveMeasurement()}>{saving ? <RefreshCw className="spin" size={18}/> : <Save size={18}/>} {saving ? "Salvando..." : "Salvar medidas"}</button>
            </section>

            <section className="section-card">
              <div className="health-section-title"><div className="health-section-icon"><Activity/></div><div><small>HISTÓRICO</small><h3>Últimas avaliações</h3></div></div>
              {(dashboard?.measurements.length ?? 0) === 0 ? <p className="health-muted">Nenhuma medida registrada ainda.</p> : (
                <div className="health-history">
                  {dashboard!.measurements.map((item) => <article key={item.id}>
                    <b>{formatDate(item.measured_at)}</b>
                    <span>{item.weight_kg != null ? `${formatNumber(item.weight_kg)} kg` : "Peso —"}</span>
                    <span>{item.waist_cm != null ? `${formatNumber(item.waist_cm)} cm cintura` : "Cintura —"}</span>
                    <span>{item.body_fat_percent != null ? `${formatNumber(item.body_fat_percent)}% gordura` : "Gordura —"}</span>
                  </article>)}
                </div>
              )}
            </section>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function NutritionPanel({ dashboard }: { dashboard: HealthDashboard | null }) {
  const plan = dashboard?.nutritionPlan;
  if (!plan) return <section className="section-card health-state"><Utensils/><h3>Plano alimentar ainda não cadastrado</h3><p>Quando o responsável montar a orientação, ela aparecerá aqui.</p></section>;
  return <section className="health-stack">
    <div className="health-metrics-grid health-metrics-grid--3">
      <Metric icon={<Flame/>} label="Calorias" value={plan.calories_target ? `${plan.calories_target} kcal` : "A ajustar"}/>
      <Metric icon={<Activity/>} label="Proteína" value={plan.protein_g ? `${plan.protein_g} g` : "A ajustar"}/>
      <Metric icon={<Droplets/>} label="Água" value={plan.water_ml ? `${Math.round(plan.water_ml / 100) / 10} L` : "Boa hidratação"}/>
    </div>
    <section className="section-card">
      <div className="health-section-title"><div className="health-section-icon"><Utensils/></div><div><small>PLANO ATIVO</small><h3>{plan.title}</h3></div></div>
      {plan.notes && <p className="health-plan-note">{plan.notes}</p>}
      <div className="health-meals">
        {plan.nutrition_meals.map((meal) => <article key={meal.id} className="health-meal-card">
          <header><div><small>{meal.time_label || `REFEIÇÃO ${meal.position}`}</small><h4>{meal.name}</h4></div><span>{String(meal.position).padStart(2, "0")}</span></header>
          <ul>{meal.nutrition_meal_items.map((item) => <li key={item.id}><b>{item.food_name}</b><span>{formatFoodQuantity(item.quantity, item.unit)}</span>{item.notes && <small>{item.notes}</small>}</li>)}</ul>
          {meal.notes && <p>{meal.notes}</p>}
        </article>)}
      </div>
    </section>
    <p className="health-disclaimer">Orientação geral de alimentação e acompanhamento. Metas clínicas individualizadas devem ser definidas por profissional habilitado.</p>
  </section>;
}

function CardioPanel({ dashboard }: { dashboard: HealthDashboard | null }) {
  const plan = dashboard?.cardioPlan;
  if (!plan) return <section className="section-card health-state"><Bike/><h3>Cardio ainda não cadastrado</h3><p>Quando o plano for definido, ele aparecerá aqui.</p></section>;
  return <section className="health-stack">
    <section className="section-card">
      <div className="health-section-title"><div className="health-section-icon"><Bike/></div><div><small>SEMANA</small><h3>{plan.title}</h3></div></div>
      <p className="health-plan-note">{plan.objective}</p>
      <div className="health-cardio-list">
        {plan.cardio_sessions.map((session) => <article key={session.id}>
          <div className="health-cardio-day"><small>DIA</small><b>{weekdayLabels[session.weekday]?.slice(0, 3).toUpperCase()}</b></div>
          <div className="health-cardio-copy"><h4>{session.activity}</h4><p>{session.notes || "Mantenha ritmo confortável e execução consistente."}</p></div>
          <div className="health-cardio-meta"><b>{session.duration_min} min</b><span className={`health-intensity health-intensity--${session.intensity}`}>{intensityLabels[session.intensity]}</span></div>
        </article>)}
      </div>
      {plan.notes && <p className="health-plan-note">{plan.notes}</p>}
    </section>
  </section>;
}

function Metric({ icon, label, value, delta, unit }: { icon: React.ReactNode; label: string; value: string; delta?: number | null; unit?: string }) {
  return <article className="health-metric"><div>{icon}</div><small>{label}</small><b>{value}</b>{delta != null && Math.abs(delta) >= 0.01 && <span className={delta < 0 ? "is-down" : "is-up"}>{delta > 0 ? "+" : ""}{delta.toFixed(1)} {unit}</span>}</article>;
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new Error("Confira os valores informados nas medidas.");
  return parsed;
}

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatFoodQuantity(quantity: number | null, unit: string) {
  if (quantity == null) return unit || "Conforme orientação";
  const amount = Number(quantity).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return `${amount}${unit ? ` ${unit}` : ""}`;
}

function readError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) return String((error as { message?: unknown }).message || fallback);
  return fallback;
}
