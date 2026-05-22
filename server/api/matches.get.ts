// GET /api/matches — returns the current user's match history, most recently
// played first. Volume is low (one user's own games), so we return the full
// list and let the client cache it; a manual refresh re-fetches.
import { auth } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const prisma = event.context.prisma;
  return prisma.match.findMany({
    where: { userId: session.user.id },
    orderBy: { playedAt: "desc" },
  });
});
