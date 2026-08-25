import { supabase } from "../lib/supabase";

export type ProfileRole = "student" | "trainer" | "receptionist" | "manager" | "owner";
export type ProfileStatus = "active" | "inactive" | "blocked";
export type MembershipStatus = "pending" | "active" | "overdue" | "cancelled";

export type AccountProfile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: ProfileRole;
  membership_number: number;
  status: ProfileStatus;
  public_profile: boolean;
  bio: string;
  birth_date: string | null;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  show_instagram: boolean;
  show_facebook: boolean;
  show_tiktok: boolean;
  show_whatsapp: boolean;
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  user_id: string;
  plan_name: string;
  status: MembershipStatus;
  amount_cents: number;
  next_due_date: string | null;
  access_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type AccountSnapshot = {
  user: { id: string; email: string };
  profile: AccountProfile;
  membership: Membership | null;
};

export type AdminAccount = AccountProfile & { membership: Membership | null };

export const roleLabels: Record<ProfileRole, string> = {
  student: "Aluno",
  trainer: "Professor",
  receptionist: "Recepção",
  manager: "Gerente",
  owner: "Administrador",
};

export function canAccessAdmin(role?: ProfileRole | null) {
  return role === "owner" || role === "manager" || role === "receptionist";
}

function client() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

export async function fetchAccountSnapshot(): Promise<AccountSnapshot | null> {
  const api = client();
  const { data: userData, error: userError } = await api.auth.getUser();
  if (userError || !userData.user) return null;

  const [profileResult, membershipResult] = await Promise.all([
    api.from("profiles").select("*").eq("id", userData.user.id).single(),
    api.from("memberships").select("*").eq("user_id", userData.user.id).maybeSingle(),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (membershipResult.error) throw membershipResult.error;

  return {
    user: { id: userData.user.id, email: userData.user.email ?? "" },
    profile: profileResult.data as AccountProfile,
    membership: (membershipResult.data as Membership | null) ?? null,
  };
}

export type ProfilePatch = Partial<Pick<AccountProfile,
  | "full_name"
  | "phone"
  | "public_profile"
  | "bio"
  | "birth_date"
  | "gender"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "show_instagram"
  | "show_facebook"
  | "show_tiktok"
  | "show_whatsapp"
>>;

export async function updateOwnProfile(patch: ProfilePatch) {
  const api = client();
  const { data: userData, error: userError } = await api.auth.getUser();
  if (userError || !userData.user) throw new Error("Sessão não encontrada.");

  const { data, error } = await api
    .from("profiles")
    .update(patch)
    .eq("id", userData.user.id)
    .select("*")
    .single();

  if (error) throw error;
  return data as AccountProfile;
}

export async function listAdminAccounts(): Promise<AdminAccount[]> {
  const api = client();
  const [profilesResult, membershipsResult] = await Promise.all([
    api.from("profiles").select("*").order("created_at", { ascending: false }),
    api.from("memberships").select("*"),
  ]);

  if (profilesResult.error) throw profilesResult.error;
  if (membershipsResult.error) throw membershipsResult.error;

  const memberships = new Map<string, Membership>(
    ((membershipsResult.data ?? []) as Membership[]).map((item) => [item.user_id, item]),
  );

  return ((profilesResult.data ?? []) as AccountProfile[]).map((profile) => ({
    ...profile,
    membership: memberships.get(profile.id) ?? null,
  }));
}
