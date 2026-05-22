// Domain types for the static Marvel-Champions-style card data and the
// user-specific collection / match records. The four raw shapes mirror the
// JSON files in assets/data/; the `Curated*` shapes add the derived display
// fields (type label, display name, image URLs) injected by the cards store.

export type CardType = "hero" | "encounter" | "scenario";

export const ASPECTS = [
  "Justice",
  "Leadership",
  "Aggression",
  "Protection",
] as const;
export type Aspect = (typeof ASPECTS)[number];

export const DIFFICULTIES = ["Standard", "Expert", "Heroic"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// ─── Raw JSON shapes (assets/data/*.json) ──────────────────────────────────

export interface RawHero {
  id: number;
  hero_name: string;
  alterego_name: string;
  cover_basename: string;
  release_id: number;
}

export interface RawEncounterSet {
  id: number;
  name: string;
  cover_basename: string;
  release_id: number;
}

export interface RawScenario {
  id: number;
  name: string;
  encounter_set_number: number;
  cover_basename: string;
  release_id: number;
  mandatory_encounter_sets: number[];
  recommended_encounter_sets: number[];
}

export interface RawRelease {
  id: number;
  name: string;
  release_date: string;
  standalone: number;
  cover_basename: string;
}

// ─── Curated shapes (raw + derived display fields) ──────────────────────────

interface CuratedBase {
  type: CardType;
  // Human-facing label rendered in lists/dialogs.
  name: string;
  // Full card art (best-effort; falls back to an icon avatar when absent).
  imgUrl: string;
  // Small round icon (best-effort; same fallback).
  iconUrl: string;
}

export type CuratedHero = RawHero & CuratedBase & { type: "hero" };
export type CuratedEncounterSet = RawEncounterSet &
  CuratedBase & { type: "encounter" };
export type CuratedScenario = RawScenario &
  CuratedBase & { type: "scenario" };
export type CuratedCard = CuratedHero | CuratedEncounterSet | CuratedScenario;

export interface CuratedRelease extends RawRelease {
  imgUrl: string;
}

// ─── User records ───────────────────────────────────────────────────────────

export interface CollectionEntry {
  cardType: CardType;
  cardId: number;
}

// One hero played in a match, with the aspect(s) the deck used.
export interface MatchHero {
  heroId: number;
  aspects: Aspect[];
}

// Shape posted to the API when recording a match.
export interface MatchInput {
  victory: boolean;
  difficulty: Difficulty;
  scenarioId: number;
  heroes: MatchHero[];
  encounterIds: number[];
  comment?: string | null;
  playedAt?: string;
}

// Shape returned by the API.
export interface MatchRecord extends MatchInput {
  id: string;
  playedAt: string;
  createdAt: string;
}
