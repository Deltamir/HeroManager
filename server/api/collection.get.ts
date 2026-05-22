// GET /api/collection — returns the current user's owned cards as a flat list
// of { cardType, cardId } pairs. The client joins these against the static
// card data in the cards store, so we never ship card content from here.
import { auth } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const prisma = event.context.prisma;
  return prisma.collectionCard.findMany({
    where: { userId: session.user.id },
    select: { cardType: true, cardId: true },
  });
});
