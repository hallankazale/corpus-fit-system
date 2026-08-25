import { supabase } from "../lib/supabase";

export type TurnstileCommandStatus = "pending" | "processed" | "failed";
export type TurnstileCommandType = "grant" | "revoke";

export type TurnstileCommand = {
  id: number;
  user_id: string;
  membership_id: string | null;
  command: TurnstileCommandType;
  reason: string | null;
  source: string;
  status: TurnstileCommandStatus;
  created_at: string;
  processed_at: string | null;
  device_response: Record<string, unknown> | null;
  student_name: string;
  membership_number: number | null;
};

function client() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

export async function listTurnstileCommands(limit = 50): Promise<TurnstileCommand[]> {
  const api = client();
  const { data: commands, error } = await api
    .from("turnstile_commands")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const ids = [...new Set((commands ?? []).map((item) => item.user_id))];
  const profileMap = new Map<string, { full_name: string; membership_number: number }>();
  if (ids.length > 0) {
    const { data: profiles, error: profileError } = await api
      .from("profiles")
      .select("id,full_name,membership_number")
      .in("id", ids);
    if (profileError) throw profileError;
    for (const profile of profiles ?? []) {
      profileMap.set(profile.id, { full_name: profile.full_name, membership_number: profile.membership_number });
    }
  }

  return (commands ?? []).map((item) => {
    const profile = profileMap.get(item.user_id);
    return {
      ...item,
      student_name: profile?.full_name ?? "Aluno",
      membership_number: profile?.membership_number ?? null,
    } as TurnstileCommand;
  });
}

export async function simulateTurnstileCommand(commandId: number, success = true) {
  const api = client();
  const { data, error } = await api.rpc("admin_process_turnstile_command", {
    p_command_id: commandId,
    p_success: success,
  });
  if (error) throw error;
  return data;
}

export async function retryTurnstileCommand(commandId: number) {
  const api = client();
  const { data, error } = await api.rpc("admin_retry_turnstile_command", { p_command_id: commandId });
  if (error) throw error;
  return data;
}
