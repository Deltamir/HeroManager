/**
 * E2E suite — sign-in flows against a real database.
 *
 * Magic link: emails are captured to a file (EMAIL_CAPTURE_FILE, see
 * helpers/mail.ts) instead of going through Resend, so the full round trip
 * request → email → link → session runs without any secret. This also
 * exercises the intent guard in lib/auth.ts (`hooks.before`) against the
 * real Prisma client.
 *
 * OAuth: no provider is contacted. We only assert that Better Auth builds
 * the authorize URL with a client_id, a state and the callback path we
 * registered with GitHub / Twitch — a renamed callback route would silently
 * break every social login.
 */
import { test, expect, type APIRequestContext } from "@playwright/test";
import { lastLinkSentTo } from "./helpers/mail";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

// One address per test run and browser project: the capture file is shared.
const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.test`;

const requestLink = (
  request: APIRequestContext,
  data: { email: string; name?: string },
) =>
  request.post("/api/auth/sign-in/magic-link", {
    headers: { origin: baseURL },
    data: { ...data, callbackURL: "/" },
  });

test.describe("Magic link", () => {
  test("sign-up link creates a session, and works only once", async ({ request }) => {
    const email = uniqueEmail("signup");
    expect((await requestLink(request, { email, name: "E2E User" })).ok()).toBeTruthy();

    const link = await lastLinkSentTo(email);
    expect(link).toContain("/api/auth/magic-link/verify");

    // Following the link sets the session cookie on this request context.
    await request.get(link);
    const me = await request.get("/api/user/infos");
    expect(me.status()).toBe(200);

    // Tokens are single-use: the second visit lands on the error redirect.
    const reuse = await request.get(link, { maxRedirects: 0 });
    expect(reuse.status()).toBe(302);
    expect(reuse.headers().location).toContain("error=INVALID_TOKEN");
  });

  test("login with an unknown email is refused with 404", async ({ request }) => {
    const res = await requestLink(request, { email: uniqueEmail("unknown") });
    expect(res.status()).toBe(404);
  });

  test("sign-up with an existing email is refused with 400", async ({ request }) => {
    const email = uniqueEmail("existing");
    await requestLink(request, { email, name: "First" });
    await request.get(await lastLinkSentTo(email));

    const res = await requestLink(request, { email, name: "Second" });
    expect(res.status()).toBe(400);
  });
});

test.describe("OAuth redirect", () => {
  for (const [provider, authorizeURL] of [
    ["github", "https://github.com/login/oauth/authorize"],
    ["twitch", "https://id.twitch.tv/oauth2/authorize"],
  ] as const) {
    test(`${provider} sign-in redirects to the provider with our callback`, async ({
      request,
    }) => {
      const res = await request.post("/api/auth/sign-in/social", {
        headers: { origin: baseURL },
        data: { provider, callbackURL: "/" },
      });
      expect(res.ok()).toBeTruthy();
      const url = new URL(((await res.json()) as { url: string }).url);

      expect(`${url.origin}${url.pathname}`).toBe(authorizeURL);
      expect(url.searchParams.get("client_id")).toBeTruthy();
      expect(url.searchParams.get("state")).toBeTruthy();
      expect(url.searchParams.get("redirect_uri")).toBe(
        `${baseURL}/api/auth/callback/${provider}`,
      );
    });
  }
});
