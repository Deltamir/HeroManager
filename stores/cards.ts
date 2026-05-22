// Static card catalogue. The four JSON files are bundled at build time (low
// volume, ~34KB) so browsing never hits the database or an API. Getters
// "curate" each raw record with display fields (type label, name, image URLs)
// the UI consumes. Image URLs point at /public/cards/* — they may not exist
// yet, so CardAvatar.vue falls back to an icon when the file 404s.
import heroes from "~/assets/data/heroes.json";
import encounterSets from "~/assets/data/encountersets.json";
import scenarios from "~/assets/data/scenarios.json";
import releases from "~/assets/data/releases.json";
import type {
  CuratedCard,
  CuratedEncounterSet,
  CuratedHero,
  CuratedRelease,
  CuratedScenario,
  RawEncounterSet,
  RawHero,
  RawRelease,
  RawScenario,
} from "~/types/cards";

const img = (type: string, base: string) => `/cards/${type}/${base}.png`;
const ico = (type: string, base: string) => `/cards/${type}/${base}_ico.png`;

export const useCardsStore = defineStore("cardsStore", {
  state: () => ({
    heroes: heroes as RawHero[],
    encounterSets: encounterSets as RawEncounterSet[],
    scenarios: scenarios as RawScenario[],
    releases: releases as RawRelease[],
  }),

  getters: {
    curatedHeroes(state): CuratedHero[] {
      return state.heroes.map((h) => ({
        ...h,
        type: "hero",
        name: `${h.hero_name} / ${h.alterego_name}`,
        imgUrl: img("heroes", h.cover_basename),
        iconUrl: ico("heroes", h.cover_basename),
      }));
    },
    curatedScenarios(state): CuratedScenario[] {
      return state.scenarios.map((s) => ({
        ...s,
        type: "scenario",
        name: s.name,
        imgUrl: img("scenarios", s.cover_basename),
        iconUrl: ico("scenarios", s.cover_basename),
      }));
    },
    curatedEncounterSets(state): CuratedEncounterSet[] {
      return state.encounterSets.map((e) => ({
        ...e,
        type: "encounter",
        name: e.name,
        imgUrl: img("encountersets", e.cover_basename),
        iconUrl: ico("encountersets", e.cover_basename),
      }));
    },
    curatedReleases(state): CuratedRelease[] {
      return [...state.releases]
        .sort((a, b) => a.release_date.localeCompare(b.release_date))
        .map((r) => ({
          ...r,
          imgUrl: img("releases", r.cover_basename),
        }));
    },
    // Flat list of every curated card across the three card types.
    allCards(): CuratedCard[] {
      return [
        ...this.curatedHeroes,
        ...this.curatedScenarios,
        ...this.curatedEncounterSets,
      ];
    },
  },

  actions: {
    getReleaseById(id: number): CuratedRelease | undefined {
      return this.curatedReleases.find((r) => r.id === id);
    },
    getHeroById(id: number): CuratedHero | undefined {
      return this.curatedHeroes.find((h) => h.id === id);
    },
    getScenarioById(id: number): CuratedScenario | undefined {
      return this.curatedScenarios.find((s) => s.id === id);
    },
    getEncounterSetById(id: number): CuratedEncounterSet | undefined {
      return this.curatedEncounterSets.find((e) => e.id === id);
    },
    getHeroesByRelease(releaseId: number): CuratedHero[] {
      return this.curatedHeroes.filter((h) => h.release_id === releaseId);
    },
    getScenariosByRelease(releaseId: number): CuratedScenario[] {
      return this.curatedScenarios.filter((s) => s.release_id === releaseId);
    },
    getEncounterSetsByRelease(releaseId: number): CuratedEncounterSet[] {
      return this.curatedEncounterSets.filter(
        (e) => e.release_id === releaseId,
      );
    },
    // Every card belonging to a release, across all three types.
    getCardsByRelease(releaseId: number): CuratedCard[] {
      return [
        ...this.getHeroesByRelease(releaseId),
        ...this.getScenariosByRelease(releaseId),
        ...this.getEncounterSetsByRelease(releaseId),
      ];
    },
  },
});
