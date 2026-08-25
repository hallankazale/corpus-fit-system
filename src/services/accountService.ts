import { supabase } from "../lib/supabase";

export type ProfileRole = "student" | "trainer" | "receptionist" | "manager" | "owner";
export type ProfileStatus = "active" | "inactive" | "blocked";
export type MembershipStatus = "pending" | "active" | "overdue" | "cancelled";
export type PaymentMethod = "pix" | "card" | "cash" | "transfer" | "other";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

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

export type PaymentRecord = {
  id: string;
  user_id: string;
  membership_id: string | null;
  amount_cents: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paid_at: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
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

export const profileStatusLabels: Record<ProfileStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

export const membershipStatusLabels: Record<MembershipStatus, string> = {
  pending: "Aguardando pagamento",
  active: "Plano ativo",
  overdue: "Em atraso",
  cancelled: "Cancelado",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  card: "Cartão",
  cash: "Dinheiro",
  transfer: "Transferência",
  other: "Outro",
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

export async function listOwnPayments(): Promise<PaymentRecord[]> {
  const api = client();
  const { data: userData, error: userError } = await api.auth.getUser();
  if (userError || !userData.user) return [];

  const { data, error } = await api
    .from("payments")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PaymentRecord[];
}

export async function listAdminPayments(userId: string): Promise<PaymentRecord[]> {
  const api = client();
  const { data, error } = await api
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as PaymentRecord[];
}

export async function adminSetMembership(input: {
  userId: string;
  planName: string;
  amountCents: number;
  status: MembershipStatus;
  nextDueDate: string | null;
  accessEnabled: boolean;
}) {
  const api = client();
  const { data, error } = await api.rpc("admin_set_membership", {
    p_user_id: input.userId,
    p_plan_name: input.planName.trim(),
    p_amount_cents: input.amountCents,
    p_status: input.status,
    p_next_due_date: input.nextDueDate || null,
    p_access_enabled: input.accessEnabled,
  });
  if (error) throw error;
  return data as Membership;
}

export async function adminRegisterPayment(input: {
  userId: string;
  amountCents: number;
  method: PaymentMethod;
  nextDueDate: string | null;
  note?: string;
}) {
  const api = client();
  const { data, error } = await api.rpc("admin_register_payment", {
    p_user_id: input.userId,
    p_amount_cents: input.amountCents,
    p_method: input.method,
    p_next_due_date: input.nextDueDate || null,
    p_note: input.note?.trim() || null,
  });
  if (error) throw error;
  return data as PaymentRecord;
}

export async function adminSetAccess(input: { userId: string; enabled: boolean; reason?: string }) {
  const api = client();
  const { data, error } = await api.rpc("admin_set_access", {
    p_user_id: input.userId,
    p_enabled: input.enabled,
    p_reason: input.reason?.trim() || null,
  });
  if (error) throw error;
  return data as Membership;
}

export async function adminSetProfileStatus(userId: string, status: ProfileStatus) {
  const api = client();
  const { data, error } = await api.rpc("admin_set_profile_status", {
    p_user_id: userId,
    p_status: status,
  });
  if (error) throw error;
  return data as AccountProfile;
}
