// POST /api/matches — records a new match for the current user. Body is
// validated/normalized by parseMatchInput (heroes + aspects, difficulty,
// scenario, encounter sets, comment, playedAt). Returns the created record.
import type { Prisma } from "@prisma/client";
import { auth } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const input = parseMatchInput(await readBody(event));
  const prisma = event.context.prisma;

  return prisma.match.create({
    data: {
      userId: session.user.id,
      victory: input.victory,
      difficulty: input.difficulty,
      scenarioId: input.scenarioId,
      heroes: input.heroes as unknown as Prisma.InputJsonValue,
      encounterIds: input.encounterIds,
      comment: input.comment,
      playedAt: new Date(input.playedAt ?? Date.now()),
    },
  });
});
