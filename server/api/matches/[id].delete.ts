// DELETE /api/matches/:id — removes a single match from the current user's
// history. Scoped by userId so a client can't delete another user's match;
// deleteMany returns a count we use to surface a 404 when nothing matched.
import { auth } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const id = getRouterParam(event, "id")?.toString();
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: match id is required",
    });
  }

  const prisma = event.context.prisma;
  const { count } = await prisma.match.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (count === 0) {
    throw createError({ statusCode: 404, statusMessage: "Match not found" });
  }

  return { id };
});
