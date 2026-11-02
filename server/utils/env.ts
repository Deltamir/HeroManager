// Runtime configuration the app cannot work without. `lib/auth.ts` casts
// the OAuth credentials `as string`, so a missing one does not stop the
// server — the sign-in button just fails on click. /api/health reports this
// list so the post-deploy smoke test catches it instead of a user.
const REQUIRED_ENV = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "GHUB_CLIENT_ID",
  "GHUB_CLIENT_SECRET",
  "TWITCH_CLIENT_ID",
  "TWITCH_CLIENT_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
] as const;

/** Names of required variables that are unset, plus a too-short secret. */
export function configProblems(env: NodeJS.ProcessEnv = process.env): string[] {
  // eslint-disable-next-line security/detect-object-injection -- keys come from the constant list above
  const problems: string[] = REQUIRED_ENV.filter((name) => !env[name]);
  const secret = env.BETTER_AUTH_SECRET;
  if (secret && secret.length < 32) problems.push("BETTER_AUTH_SECRET (< 32 chars)");
  return problems;
}
