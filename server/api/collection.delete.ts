// DELETE /api/collection — removes one or more cards from the current user's
// collection. Body: { cards: [{ cardType, cardId }] }. Returns the full,
// updated collection. Scoped to the session user so a client can't delete
// another user's rows.
import { auth } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const cards = parseCollectionCards(await readBody(event));
  const prisma = event.context.prisma;
  const userId = session.user.id;

  await prisma.collectionCard.deleteMany({
    where: {
      userId,
      OR: cards.map((c) => ({ cardType: c.cardType, cardId: c.cardId })),
    },
  });

  return prisma.collectionCard.findMany({
    where: { userId },
    select: { cardType: true, cardId: true },
  });
});
