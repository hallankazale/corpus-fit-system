import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { subscribeToAuth } from "../services/authService";
import { fetchAccountSnapshot, updateOwnProfile, type AccountSnapshot, type ProfilePatch } from "../services/accountService";

const testAccount: AccountSnapshot = {
  user: { id: "test-user", email: "teste@corpusfit.com" },
  profile: {
    id: "test-user", full_name: "Aluno Teste", phone: null, role: "student", membership_number: 1001, status: "active",
    public_profile: true, bio: "Perfil de teste", birth_date: null, gender: null,
    instagram: null, facebook: null, tiktok: null, whatsapp: null,
    show_instagram: false, show_facebook: false, show_tiktok: false, show_whatsapp: false,
    created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z",
  },
  membership: {
    id: "test-membership", user_id: "test-user", plan_name: "Plano Teste", status: "active", amount_cents: 9990,
    next_due_date: null, access_enabled: true, billing_interval_months: 1, last_payment_at: null,
    created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z",
  },
};

type AccountContextValue = { account: AccountSnapshot | null; loading: boolean; error: string | null; refreshAccount: () => Promise<void>; saveProfile: (patch: ProfilePatch) => Promise<void> };
const AccountContext = createContext<AccountContextValue | null>(null);
const isTest = import.meta.env.MODE === "test";

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountSnapshot | null>(isTest ? testAccount : null);
  const [loading, setLoading] = useState(!isTest);
  const [error, setError] = useState<string | null>(null);

  const refreshAccount = useCallback(async () => {
    if (isTest) return;
    try { setLoading(true); setError(null); setAccount(await fetchAccountSnapshot()); }
    catch (err) { setAccount(null); setError(err instanceof Error ? err.message : "Não foi possível carregar seu perfil."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isTest) return;
    void refreshAccount();
    const unsubscribe = subscribeToAuth((authenticated) => {
      if (!authenticated) { setAccount(null); setLoading(false); return; }
      window.setTimeout(() => void refreshAccount(), 0);
    });
    return unsubscribe;
  }, [refreshAccount]);

  const saveProfile = useCallback(async (patch: ProfilePatch) => {
    if (isTest) {
      setAccount((current) => current ? { ...current, profile: { ...current.profile, ...patch, updated_at: new Date().toISOString() } } : current);
      return;
    }
    const updated = await updateOwnProfile(patch);
    setAccount((current) => current ? { ...current, profile: updated } : current);
  }, []);

  const value = useMemo(() => ({ account, loading, error, refreshAccount, saveProfile }), [account, loading, error, refreshAccount, saveProfile]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() { const context = useContext(AccountContext); if (!context) throw new Error("useAccount precisa estar dentro de AccountProvider"); return context; }
