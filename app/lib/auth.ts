import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

const COOKIE_NAME = "vertice_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

// ─── Tipos de payload ────────────────────────────────────────────────────────

export type AgencySession = {
  type: "agency";
  userId: string;
  agencyId: string;
  email: string;
  role: string;
};

export type ClientSession = {
  type: "client";
  onboardingId: string;
  clientId: string;
  email: string;
};

export type Session = AgencySession | ClientSession;

// ─── Geração e verificação de JWT ───────────────────────────────────────────

export async function signToken(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

// ─── Cookie helpers ──────────────────────────────────────────────────────────

export async function setSessionCookie(session: Session): Promise<void> {
  const token = await signToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── OAuth state helpers ─────────────────────────────────────────────────────
// Use a separate signer/verifier so OAuth state payloads can carry extra fields
// (e.g. _oauthToken) without breaking the Session type.

export async function signOAuthState(
  payload: Record<string, unknown>
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(JWT_SECRET);
}

export async function verifyOAuthState(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ─── Guards ──────────────────────────────────────────────────────────────────

export async function requireAgencySession(): Promise<AgencySession> {
  const session = await getSession();
  if (!session || session.type !== "agency") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireClientSession(): Promise<ClientSession> {
  const session = await getSession();
  if (!session || session.type !== "client") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
