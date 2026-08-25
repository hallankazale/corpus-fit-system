const SESSION_KEY = "corpus-fit-session";
const ACCOUNT_KEY = "corpus-fit-demo-account";

export const DEMO_CREDENTIALS = {
  email: "hallan@corpusfit.com",
  password: "Corpus@2026",
  name: "Hallan Fernando",
};

type DemoAccount = {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
};

type DemoSession = {
  name: string;
  email: string;
  createdAt: number;
};

async function hashPassword(value: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(value);
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  // Fallback only for non-browser test environments. This is not production authentication.
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fallback-${(hash >>> 0).toString(16)}`;
}

function saveSession(session: DemoSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function isDemoAuthenticated(): boolean {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as DemoSession;
    return Boolean(parsed.email && parsed.name);
  } catch {
    return false;
  }
}

export async function authenticateDemo(identifier: string, password: string): Promise<boolean> {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  if (normalizedIdentifier === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    saveSession({ name: DEMO_CREDENTIALS.name, email: DEMO_CREDENTIALS.email, createdAt: Date.now() });
    return true;
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return false;
    const account = JSON.parse(raw) as DemoAccount;
    const matchesIdentity = normalizedIdentifier === account.email.toLowerCase() || identifier.trim() === account.phone;
    if (!matchesIdentity) return false;
    const passwordHash = await hashPassword(password);
    if (passwordHash !== account.passwordHash) return false;
    saveSession({ name: account.name, email: account.email, createdAt: Date.now() });
    return true;
  } catch {
    return false;
  }
}

export async function registerDemoAccount(input: { name: string; email: string; phone: string; password: string }) {
  const account: DemoAccount = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    passwordHash: await hashPassword(input.password),
  };

  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  saveSession({ name: account.name, email: account.email, createdAt: Date.now() });
}

export function signOutDemo() {
  window.localStorage.removeItem(SESSION_KEY);
}
