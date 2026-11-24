// GET /api/health — public probe called by the post-deploy smoke test.
//
// `db`: one query per Better Auth table selecting every column of the Prisma
// model, so a missing table or column fails here instead of on the first
// sign-in. `config`: required env vars (see server/utils/env.ts).
//
// The response never says WHAT is wrong — names of missing variables or
// Postgres errors go to the server log only.
import { configProblems } from "~~/server/utils/env";

export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma;
  let db: "ok" | "error" = "ok";
  try {
    const probe = { where: { id: "__health__" } };
    await Promise.all([
      prisma.user.findFirst(probe),
      prisma.session.findFirst(probe),
      prisma.account.findFirst(probe),
      prisma.verification.findFirst(probe),
    ]);
  } catch (error) {
    console.error("[health] database check failed:", error);
    db = "error";
  }

  const problems = configProblems();
  if (problems.length > 0) {
    console.error("[health] missing configuration:", problems.join(", "));
  }
  const config = problems.length === 0 ? "ok" : "error";

  if (db !== "ok" || config !== "ok") {
    throw createError({
      statusCode: 503,
      statusMessage: `Unhealthy (db: ${db}, config: ${config})`,
    });
  }
  return { db, config };
});
