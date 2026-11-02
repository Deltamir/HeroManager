/**
 * Unit tests for `server/api/health.get.ts` and `server/utils/env.ts`.
 *
 * The probe must answer 200 only when every Better Auth table is queryable
 * AND the required configuration is present, and must never leak the
 * underlying error or the names of missing variables in the response.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { configProblems } from "~~/server/utils/env";

const FULL_ENV = {
  DATABASE_URL: "postgresql://x",
  BETTER_AUTH_SECRET: "x".repeat(32),
  GHUB_CLIENT_ID: "id",
  GHUB_CLIENT_SECRET: "secret",
  TWITCH_CLIENT_ID: "id",
  TWITCH_CLIENT_SECRET: "secret",
  RESEND_API_KEY: "re_x",
  EMAIL_FROM: "noreply@example.com",
};

const mockPrisma = () => {
  const findFirst = vi.fn().mockResolvedValue(null);
  return {
    findFirst,
    prisma: {
      user: { findFirst },
      session: { findFirst },
      account: { findFirst },
      verification: { findFirst },
    },
  };
};

type Handler = (event: unknown) => Promise<unknown>;
const loadHandler = async () =>
  (await import("~~/server/api/health.get")).default as Handler;

describe("configProblems", () => {
  it("reports nothing when every variable is set", () => {
    expect(configProblems(FULL_ENV)).toEqual([]);
  });

  it("names missing variables and a short secret", () => {
    const { TWITCH_CLIENT_ID: _omit, ...env } = FULL_ENV;
    expect(configProblems({ ...env, BETTER_AUTH_SECRET: "short" })).toEqual([
      "TWITCH_CLIENT_ID",
      "BETTER_AUTH_SECRET (< 32 chars)",
    ]);
  });
});

describe("GET /api/health", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    Object.assign(process.env, FULL_ENV);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("returns ok after querying every Better Auth table", async () => {
    const { prisma, findFirst } = mockPrisma();
    const handler = await loadHandler();
    await expect(handler({ context: { prisma } })).resolves.toEqual({
      db: "ok",
      config: "ok",
    });
    expect(findFirst).toHaveBeenCalledTimes(4);
  });

  it("answers 503 without leaking the database error", async () => {
    const { prisma, findFirst } = mockPrisma();
    findFirst.mockRejectedValueOnce(new Error('column "issuer" does not exist'));
    const handler = await loadHandler();

    const error = await handler({ context: { prisma } }).catch((e: unknown) => e);
    expect(error).toMatchObject({ statusCode: 503 });
    expect((error as Error).message).not.toContain("issuer");
  });

  it("answers 503 without naming the missing variable", async () => {
    delete process.env.EMAIL_FROM;
    const { prisma } = mockPrisma();
    const handler = await loadHandler();

    const error = await handler({ context: { prisma } }).catch((e: unknown) => e);
    expect(error).toMatchObject({ statusCode: 503 });
    expect((error as Error).message).not.toContain("EMAIL_FROM");
  });
});
