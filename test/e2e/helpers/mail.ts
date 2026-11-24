// Shared between playwright.config.ts (which hands the path to the preview
// server as EMAIL_CAPTURE_FILE) and the specs that read emails back.
// server/utils/email.ts appends one JSON object per line instead of calling
// Resend while that variable is set.
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const EMAIL_CAPTURE_FILE = join(tmpdir(), "heromanager-e2e-mail.jsonl");

type CapturedEmail = { to: string; subject: string; html: string };

/** Returns the href of the last captured email sent to `to`. */
export async function lastLinkSentTo(to: string): Promise<string> {
  const content = await readFile(EMAIL_CAPTURE_FILE, "utf8").catch(() => "");
  const emails = content
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CapturedEmail)
    .filter((email) => email.to === to);
  const href = /href="([^"]+)"/.exec(emails.at(-1)?.html ?? "")?.[1];
  if (!href) throw new Error(`No captured email with a link for ${to}`);
  return href;
}
