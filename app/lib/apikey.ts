/**
 * API Key utilities for the Vértice public REST API.
 * Keys are stored as SHA-256 hashes — the raw key is never persisted.
 */

import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/** Generates a new API key pair. The raw key is shown once; only the hash is stored. */
export function generateApiKey(): { raw: string; hash: string } {
  const raw = "vtx_" + randomBytes(24).toString("hex"); // vtx_ + 48 hex chars
  return { raw, hash: hashApiKey(raw) };
}

/** Hashes an API key with SHA-256 for storage/comparison. */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Validates the API key from the request headers and returns the agencyId.
 * Accepts: `Authorization: Bearer vtx_xxx` OR `X-API-Key: vtx_xxx`.
 * Throws "UNAUTHORIZED" if missing or invalid.
 */
export async function requireApiKey(request: NextRequest): Promise<string> {
  const auth = request.headers.get("authorization") ?? "";
  const xKey = request.headers.get("x-api-key") ?? "";

  const raw = auth.startsWith("Bearer vtx_")
    ? auth.slice(7)
    : xKey.startsWith("vtx_")
    ? xKey
    : null;

  if (!raw) throw new Error("UNAUTHORIZED");

  const agency = await prisma.agency.findUnique({
    where: { apiKeyHash: hashApiKey(raw) },
    select: { id: true },
  });

  if (!agency) throw new Error("UNAUTHORIZED");
  return agency.id;
}
