import type { User } from "@supabase/supabase-js";
import { APP_PUBLIC_URL, isSupabaseConfigured, supabase } from "../lib/supabase";

function requireClient() {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Supabase ainda não está configurado no deploy.");
  }
  return supabase;
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const client = requireClient();
    const { error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { ok: false, error: "E-mail ou senha incorretos." } as const;
    return { ok: true, error: null } as const;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Não foi possível entrar." } as const;
  }
}

export async function signUpWithEmail(input: { fullName: string; email: string; phone: string; password: string }) {
  try {
    const client = requireClient();
    const { data, error } = await client.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        emailRedirectTo: APP_PUBLIC_URL,
        data: {
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
        },
      },
    });

    if (error) return { ok: false, needsConfirmation: false, error: error.message } as const;
    return { ok: true, needsConfirmation: !data.session, error: null } as const;
  } catch (error) {
    return { ok: false, needsConfirmation: false, error: error instanceof Error ? error.message : "Não foi possível criar a conta." } as const;
  }
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string) {
  try {
    const client = requireClient();
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${APP_PUBLIC_URL}#/login`,
    });
    if (error) return { ok: false, error: error.message } as const;
    return { ok: true, error: null } as const;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Não foi possível enviar o e-mail." } as const;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function subscribeToAuth(callback: (authenticated: boolean) => void) {
  if (!supabase) {
    callback(false);
    return () => undefined;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(Boolean(session)));
  return () => data.subscription.unsubscribe();
}

export async function getSessionStatus() {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}
