import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? "vertice-assets";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

// Generate a presigned URL for the client to upload directly to R2
export async function getUploadPresignedUrl({
  key,
  contentType,
  expiresIn = 300, // 5 minutes
}: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

// Build the public URL for an already-uploaded object
export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

// Generate a presigned GET URL for the agency to download an asset
export async function getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn });
}

// Delete an object from R2
export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// Build a deterministic R2 key for onboarding assets
export function buildAssetKey({
  agencyId,
  onboardingId,
  fileName,
}: {
  agencyId: string;
  onboardingId: string;
  fileName: string;
}): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `agencies/${agencyId}/onboardings/${onboardingId}/${Date.now()}_${sanitized}`;
}
