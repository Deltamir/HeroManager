// Bridges the collection store with user feedback so any component can offer
// add/remove without re-implementing error handling and toasts. Auth is NOT
// checked up-front (that would mean an auth fetch per list row, and blocks
// SSR) — instead we attempt the write and treat a 401 from the API as "please
// sign in", redirecting to /login.
import type { CollectionEntry, CuratedCard } from "~/types/cards";

export function useCollection() {
  const store = useCollectionStore();
  const { success, error, info } = useSnackbar();
  const busy = ref(false);

  function isUnauthorized(e: unknown): boolean {
    return (e as { statusCode?: number })?.statusCode === 401;
  }

  async function run(fn: () => Promise<void>, message: string) {
    busy.value = true;
    try {
      await fn();
      success(message);
    } catch (e) {
      if (isUnauthorized(e)) {
        info("Sign in to manage your collection.");
        navigateTo("/login");
      } else {
        error("Something went wrong. Please try again.");
      }
    } finally {
      busy.value = false;
    }
  }

  // Toggle a single card in/out of the collection.
  async function toggleCard(card: CuratedCard) {
    const entry: CollectionEntry = { cardType: card.type, cardId: card.id };
    if (store.hasCard(card)) {
      await run(() => store.remove([entry]), `Removed ${card.name}`);
    } else {
      await run(() => store.add([entry]), `Added ${card.name}`);
    }
  }

  async function addCards(cards: CuratedCard[], label: string) {
    const entries = cards.map((c) => ({ cardType: c.type, cardId: c.id }));
    await run(() => store.add(entries), `Added ${label}`);
  }

  async function removeCards(cards: CuratedCard[], label: string) {
    const entries = cards.map((c) => ({ cardType: c.type, cardId: c.id }));
    await run(() => store.remove(entries), `Removed ${label}`);
  }

  // Toggle an entire release (all its heroes/scenarios/encounter sets).
  async function toggleRelease(releaseId: number, releaseName: string) {
    const owned = store.hasEverythingFromRelease(releaseId);
    if (owned) {
      await run(
        () => store.removeRelease(releaseId),
        `Removed all of ${releaseName}`,
      );
    } else {
      await run(() => store.addRelease(releaseId), `Added all of ${releaseName}`);
    }
  }

  return {
    store,
    busy,
    toggleCard,
    addCards,
    removeCards,
    toggleRelease,
  };
}
