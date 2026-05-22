// Boundary validation for the collection / match endpoints. Card content
// lives in static JSON, so the server only ever stores ids + small enums —
// these helpers keep handlers from trusting arbitrary client input.
import { ASPECTS, DIFFICULTIES } from "~~/types/cards";
import type {
  CardType,
  CollectionEntry,
  MatchHero,
  MatchInput,
} from "~~/types/cards";

const CARD_TYPES: CardType[] = ["hero", "encounter", "scenario"];
const ASPECT_SET = new Set<string>(ASPECTS);
const DIFFICULTY_SET = new Set<string>(DIFFICULTIES);

function isPositiveInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v > 0;
}

// Parses + validates the `{ cards: [{ cardType, cardId }] }` body shared by the
// collection POST/DELETE routes. Throws a 400 on any malformed entry.
export function parseCollectionCards(body: unknown): CollectionEntry[] {
  const cards = (body as { cards?: unknown })?.cards;
  if (!Array.isArray(cards) || cards.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: `cards` must be a non-empty array",
    });
  }
  return cards.map((c) => {
    const cardType = (c as CollectionEntry)?.cardType;
    const cardId = (c as CollectionEntry)?.cardId;
    if (!CARD_TYPES.includes(cardType) || !isPositiveInt(cardId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: invalid card entry",
      });
    }
    return { cardType, cardId };
  });
}

// Validates the match-creation body. Returns a normalized MatchInput.
export function parseMatchInput(body: unknown): MatchInput {
  const b = (body ?? {}) as Record<string, unknown>;

  if (typeof b.victory !== "boolean") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: `victory` must be a boolean",
    });
  }
  if (!isPositiveInt(b.scenarioId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: `scenarioId` is required",
    });
  }
  if (!Array.isArray(b.heroes) || b.heroes.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: at least one hero is required",
    });
  }

  const heroes: MatchHero[] = b.heroes.map((h) => {
    const heroId = (h as MatchHero)?.heroId;
    const aspects = (h as MatchHero)?.aspects ?? [];
    if (!isPositiveInt(heroId) || !Array.isArray(aspects)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: invalid hero entry",
      });
    }
    const cleanAspects = aspects.filter(
      (a): a is (typeof ASPECTS)[number] =>
        typeof a === "string" && ASPECT_SET.has(a),
    );
    return { heroId, aspects: cleanAspects };
  });

  const difficulty =
    typeof b.difficulty === "string" && DIFFICULTY_SET.has(b.difficulty)
      ? (b.difficulty as MatchInput["difficulty"])
      : "Standard";

  const encounterIds = Array.isArray(b.encounterIds)
    ? b.encounterIds.filter(isPositiveInt)
    : [];

  const comment =
    typeof b.comment === "string" && b.comment.trim().length > 0
      ? b.comment.trim().slice(0, 1000)
      : null;

  const playedAt =
    typeof b.playedAt === "string" && !Number.isNaN(Date.parse(b.playedAt))
      ? b.playedAt
      : new Date().toISOString();

  return {
    victory: b.victory,
    difficulty,
    scenarioId: b.scenarioId,
    heroes,
    encounterIds,
    comment,
    playedAt,
  };
}
