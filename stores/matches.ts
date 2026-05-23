// The current user's match history. Same caching contract as the collection
// store: persisted client cache, `fetch()` is a no-op once loaded unless
// forced (Refresh button). Mutations hit the server, then patch local state.
import type { MatchInput, MatchRecord } from "~/types/cards";

interface MatchesState {
  matches: MatchRecord[];
  loaded: boolean;
}

const getFetch = $fetch as unknown as (
  url: string,
) => Promise<MatchRecord[]>;
const postFetch = $fetch as unknown as (
  url: string,
  options: { method: string; body?: unknown },
) => Promise<MatchRecord>;
const delFetch = $fetch as unknown as (
  url: string,
  options: { method: string },
) => Promise<{ id: string }>;
const patchFetch = $fetch as unknown as (
  url: string,
  options: { method: string; body?: unknown },
) => Promise<MatchRecord>;

export const useMatchesStore = defineStore("matchesStore", {
  state: (): MatchesState => ({
    matches: [],
    loaded: false,
  }),

  getters: {
    count(state): number {
      return state.matches.length;
    },
    wins(state): number {
      return state.matches.filter((m) => m.victory).length;
    },
    winRate(state): number {
      if (state.matches.length === 0) return 0;
      const wins = state.matches.filter((m) => m.victory).length;
      return Math.round((wins / state.matches.length) * 100);
    },
  },

  actions: {
    async fetch(force = false) {
      if (this.loaded && !force) return;
      this.matches = await getFetch("/api/matches");
      this.loaded = true;
    },

    async add(input: MatchInput) {
      const created = await postFetch("/api/matches", {
        method: "post",
        body: input,
      });
      // Keep the list sorted most-recent-first to match the server.
      this.matches = [created, ...this.matches].sort(
        (a, b) => Date.parse(b.playedAt) - Date.parse(a.playedAt),
      );
      this.loaded = true;
      return created;
    },

    async remove(id: string) {
      await delFetch(`/api/matches/${id}`, { method: "delete" });
      this.matches = this.matches.filter((m) => m.id !== id);
    },

    async update(id: string, input: MatchInput) {
      const updated = await patchFetch(`/api/matches/${id}`, {
        method: "patch",
        body: input,
      });
      this.matches = this.matches.map((m) => (m.id === id ? updated : m));
      return updated;
    },
  },

  persist: true,
});
