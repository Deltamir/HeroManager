// PATCH /api/matches/:id — updates an existing match owned by the current user.
// Scoped by userId so a client can't edit another user's match.
import type { Prisma } from "@prisma/client";
import { auth } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const id = getRouterParam(event, "id")?.toString();
  if (!id)
    throw createError({ statusCode: 400, statusMessage: "Bad Request: match id is required" });

  const input = parseMatchInput(await readBody(event));
  const prisma = event.context.prisma;

  const { count } = await prisma.match.updateMany({
    where: { id, userId: session.user.id },
    data: {
      victory: input.victory,
      difficulty: input.difficulty,
      scenarioId: input.scenarioId,
      heroes: input.heroes as unknown as Prisma.InputJsonValue,
      encounterIds: input.encounterIds,
      comment: input.comment ?? null,
      playedAt: new Date(input.playedAt ?? Date.now()),
    },
  });

  if (count === 0)
    throw createError({ statusCode: 404, statusMessage: "Match not found" });

  return prisma.match.findUnique({ where: { id } });
});
