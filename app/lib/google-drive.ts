/**
 * Google Drive integration — Service Account
 * Creates a folder per client onboarding and returns the folder ID.
 */

import { google } from "googleapis";

const SA_EMAIL = process.env.GOOGLE_SA_EMAIL ?? "";
// In .env the key is stored with literal \n — parse them to real newlines
const SA_KEY = (process.env.GOOGLE_SA_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
// Optional: ID of a parent Drive folder owned by the agency
const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_PARENT_ID ?? "";

function getDriveClient() {
  if (!SA_EMAIL || !SA_KEY) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: SA_EMAIL,
    key: SA_KEY,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

/**
 * Creates a Google Drive folder for a new onboarding.
 * Returns the folder ID, or null if Drive is not configured.
 */
export async function createOnboardingFolder(
  clientName: string,
  company: string | null
): Promise<string | null> {
  const drive = getDriveClient();
  if (!drive) {
    console.warn("[google-drive] GOOGLE_SA_EMAIL or GOOGLE_SA_PRIVATE_KEY not set — skipping");
    return null;
  }

  const folderName = company
    ? `[Vértice] ${company} — ${clientName}`
    : `[Vértice] ${clientName}`;

  const metadata: Parameters<typeof drive.files.create>[0]["requestBody"] = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (PARENT_FOLDER_ID) {
    metadata.parents = [PARENT_FOLDER_ID];
  }

  const res = await drive.files.create({
    requestBody: metadata,
    fields: "id",
  });

  return res.data.id ?? null;
}

/**
 * Returns a shareable link for a Drive folder.
 */
export function getDriveFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}
