/**
 * Unit tests for the magic-link intent guard in `lib/auth.ts` (`hooks.before`).
 *
 * The login form sends `{ email }`, the signup form `{ email, name }`. The
 * guard rejects any request that contradicts the user's actual state:
 *
 *   | account exists | name sent | outcome                    |
 *   | -------------- | --------- | -------------------------- |
 *   | no             | no        | NOT_FOUND  (login typo)    |
 *   | no             | yes       | pass       (sign-up)       |
 *   | yes            | no        | pass       (login)         |
 *   | yes            | yes       | BAD_REQUEST (sign-up clash)|
 *
 * Any other endpoint, or a body without email, is passed through untouched.
 *
 * `createAuthMiddleware` is stubbed as identity so `hooks.before` is the raw
 * async function; `APIError` keeps the status so assertions can target it.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

type Ctx = { path: string; body?: { email?: string; name?: string } };
type Hook = (ctx: Ctx) => Promise<void>;

let capturedConfig: { hooks: { before: Hook } } | undefined;
const findUnique = vi.fn();

vi.mock("better-auth", () => ({
  betterAuth: (config: { hooks: { before: Hook } }) => {
    capturedConfig = config;
    return { handler: vi.fn(), api: {} };
  },
}));
vi.mock("better-auth/adapters/prisma", () => ({ prismaAdapter: () => ({}) }));
vi.mock("better-auth/plugins", () => ({ magicLink: () => ({}) }));
vi.mock("better-auth/api", () => ({
  createAuthMiddleware: (fn: unknown) => fn,
  APIError: class APIError extends Error {
    constructor(
      public status: string,
      body: { message: string },
    ) {
      super(body.message);
    }
  },
}));
vi.mock("~~/server/utils/email", () => ({
  sendMagicLinkEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
}));
vi.mock("~~/lib/prisma", () => ({
  default: { user: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

describe("lib/auth hooks.before — magic-link intent guard", () => {
  let before: Hook;
  const path = "/sign-in/magic-link";

  beforeAll(async () => {
    await import("~~/lib/auth");
    before = capturedConfig!.hooks.before;
  });

  beforeEach(() => {
    findUnique.mockReset();
  });

  it("rejects login (no name) for an unknown email with NOT_FOUND", async () => {
    findUnique.mockResolvedValue(null);
    await expect(before({ path, body: { email: "new@x.tld" } })).rejects.toMatchObject({
      status: "NOT_FOUND",
      message: "No account found with this email.",
    });
    expect(findUnique).toHaveBeenCalledWith({ where: { email: "new@x.tld" } });
  });

  it("allows sign-up (name sent) for an unknown email", async () => {
    findUnique.mockResolvedValue(null);
    await expect(
      before({ path, body: { email: "new@x.tld", name: "Alice" } }),
    ).resolves.toBeUndefined();
  });

  it("allows login (no name) for an existing email", async () => {
    findUnique.mockResolvedValue({ id: "u1" });
    await expect(before({ path, body: { email: "a@x.tld" } })).resolves.toBeUndefined();
  });

  it("rejects sign-up (name sent) for an existing email with BAD_REQUEST", async () => {
    findUnique.mockResolvedValue({ id: "u1" });
    await expect(
      before({ path, body: { email: "a@x.tld", name: "Alice" } }),
    ).rejects.toMatchObject({
      status: "BAD_REQUEST",
      message: "An account already exists for this email.",
    });
  });

  it("treats a whitespace-only name as no name (login intent)", async () => {
    findUnique.mockResolvedValue(null);
    await expect(
      before({ path, body: { email: "new@x.tld", name: "   " } }),
    ).rejects.toMatchObject({ status: "NOT_FOUND" });
  });

  it("ignores other endpoints and bodies without email", async () => {
    await expect(
      before({ path: "/sign-in/social", body: { email: "a@x.tld" } }),
    ).resolves.toBeUndefined();
    await expect(before({ path, body: {} })).resolves.toBeUndefined();
    await expect(before({ path })).resolves.toBeUndefined();
    expect(findUnique).not.toHaveBeenCalled();
  });
});
