import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { subscribeToAuth } from "../services/authService";
import { fetchAccountSnapshot, updateOwnProfile, type AccountSnapshot, type ProfilePatch } from "../services/accountService";

type AccountContextValue = {
  account: AccountSnapshot | null;
  loading: boolean;
  error: string | null;
  refreshAccount: () => Promise<void>;
  saveProfile: (patch: ProfilePatch) => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAccount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAccount(await fetchAccountSnapshot());
    } catch (err) {
      setAccount(null);
      setError(err instanceof Error ? err.message : "Não foi possível carregar seu perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAccount();
    const unsubscribe = subscribeToAuth((authenticated) => {
      if (!authenticated) {
        setAccount(null);
        setLoading(false);
        return;
      }
      window.setTimeout(() => void refreshAccount(), 0);
    });
    return unsubscribe;
  }, [refreshAccount]);

  const saveProfile = useCallback(async (patch: ProfilePatch) => {
    const updated = await updateOwnProfile(patch);
    setAccount((current) => current ? { ...current, profile: updated } : current);
  }, []);

  const value = useMemo(() => ({ account, loading, error, refreshAccount, saveProfile }), [account, loading, error, refreshAccount, saveProfile]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount precisa estar dentro de AccountProvider");
  return context;
}
