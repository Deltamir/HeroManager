// POST /api/collection — adds one or more cards to the current user's
// collection. Body: { cards: [{ cardType, cardId }] }. Idempotent: the unique
// (userId, cardType, cardId) constraint + skipDuplicates means re-adding an
// owned card is a no-op. Returns the full, updated collection.
import { auth } from "~~/lib/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const cards = parseCollectionCards(await readBody(event));
  const prisma = event.context.prisma;
  const userId = session.user.id;

  await prisma.collectionCard.createMany({
    data: cards.map((c) => ({ ...c, userId })),
    skipDuplicates: true,
  });

  return prisma.collectionCard.findMany({
    where: { userId },
    select: { cardType: true, cardId: true },
  });
});
