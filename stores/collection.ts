// The current user's owned cards. Source of truth is the database (via
// /api/collection); this store is a persisted client cache so navigating
// between pages doesn't refetch. `fetch()` is a no-op once loaded unless
// `force` is passed (the Refresh button). Mutations post to the server and
// re-seed local state from the authoritative response.
import type { CardType, CollectionEntry, CuratedCard } from "~/types/cards";

interface CollectionState {
  // Owned card ids keyed by card type — keys match CardType exactly so we can
  // index by a card's `type` without mapping.
  owned: Record<CardType, number[]>;
  loaded: boolean;
}

const rawFetch = $fetch as unknown as (
  url: string,
  options?: { method?: string; body?: unknown },
) => Promise<CollectionEntry[]>;

export const useCollectionStore = defineStore("collectionStore", {
  state: (): CollectionState => ({
    owned: { hero: [], encounter: [], scenario: [] },
    loaded: false,
  }),

  getters: {
    total(state): number {
      return (
        state.owned.hero.length +
        state.owned.encounter.length +
        state.owned.scenario.length
      );
    },
    countByType(state): Record<CardType, number> {
      return {
        hero: state.owned.hero.length,
        encounter: state.owned.encounter.length,
        scenario: state.owned.scenario.length,
      };
    },
  },

  actions: {
    // Re-seed the id arrays from the authoritative server list.
    applyEntries(entries: CollectionEntry[]) {
      const next: Record<CardType, number[]> = {
        hero: [],
        encounter: [],
        scenario: [],
      };
      for (const { cardType, cardId } of entries) {
        next[cardType].push(cardId);
      }
      this.owned = next;
    },

    async fetch(force = false) {
      if (this.loaded && !force) return;
      const entries = await rawFetch("/api/collection");
      this.applyEntries(entries);
      this.loaded = true;
    },

    async add(cards: CollectionEntry[]) {
      if (cards.length === 0) return;
      const entries = await rawFetch("/api/collection", {
        method: "post",
        body: { cards },
      });
      this.applyEntries(entries);
      this.loaded = true;
    },

    async remove(cards: CollectionEntry[]) {
      if (cards.length === 0) return;
      const entries = await rawFetch("/api/collection", {
        method: "delete",
        body: { cards },
      });
      this.applyEntries(entries);
      this.loaded = true;
    },

    // Add / remove every card belonging to a release in one request.
    async addRelease(releaseId: number) {
      await this.add(releaseEntries(releaseId));
    },
    async removeRelease(releaseId: number) {
      await this.remove(releaseEntries(releaseId));
    },

    // ── ownership checks (plain methods so components can call freely) ──
    has(type: CardType, id: number): boolean {
      return this.owned[type].includes(id);
    },
    hasCard(card: Pick<CuratedCard, "type" | "id">): boolean {
      return this.has(card.type, card.id);
    },
    hasEverythingFromRelease(releaseId: number): boolean {
      const cards = useCardsStore().getCardsByRelease(releaseId);
      return cards.length > 0 && cards.every((c) => this.hasCard(c));
    },
    ownedCountForRelease(releaseId: number): number {
      const cards = useCardsStore().getCardsByRelease(releaseId);
      return cards.filter((c) => this.hasCard(c)).length;
    },
  },

  persist: true,
});

// Maps a release to the { cardType, cardId } entries for all its cards.
function releaseEntries(releaseId: number): CollectionEntry[] {
  return useCardsStore()
    .getCardsByRelease(releaseId)
    .map((c) => ({ cardType: c.type, cardId: c.id }));
}
