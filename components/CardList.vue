<template>
  <div>
    <v-list v-if="cards.length" class="card-list py-0" lines="two">
      <template v-for="(card, i) in cards" :key="`${card.type}-${card.id}`">
        <v-divider v-if="i > 0" />
        <v-list-item class="card-row px-2 px-sm-3" @click="openDetail(card)">
          <template #prepend>
            <CardAvatar
              :type="card.type"
              :name="card.name"
              :icon-url="card.iconUrl"
              :img-url="card.imgUrl"
              :size="44"
              class="mr-3"
            />
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ card.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <template v-if="showType">
              <v-icon
                :icon="cardTypeMeta[card.type].icon"
                :color="cardTypeMeta[card.type].color"
                size="13"
                class="mr-0.5"
              />
              <span :class="`text-${cardTypeMeta[card.type].color}`" class="font-weight-medium">
                {{ cardTypeMeta[card.type].label }}
              </span>
              <span class="text-medium-emphasis"> · </span>
            </template>
            {{ releaseName(card) }}
            <span class="text-disabled"> · {{ releaseDate(card) }}</span>
          </v-list-item-subtitle>

          <template #append>
            <v-btn
              :icon="
                collectionStore.hasCard(card)
                  ? 'mdi-bookmark-check'
                  : 'mdi-bookmark-plus-outline'
              "
              :color="collectionStore.hasCard(card) ? 'success' : 'primary'"
              variant="text"
              :loading="busyIds.has(cardKey(card))"
              @click.stop="handleToggle(card)"
            />
          </template>
        </v-list-item>
      </template>
    </v-list>

    <!-- Empty state -->
    <div v-else class="text-center py-12 text-medium-emphasis">
      <v-icon :icon="emptyIcon" size="48" class="mb-3 text-disabled" />
      <p class="text-body-2">{{ emptyText }}</p>
    </div>

    <CardDetailDialog v-model="detailOpen" :card="selected" />
  </div>
</template>

<script setup lang="ts">
import type { CuratedCard } from "~/types/cards";

withDefaults(
  defineProps<{
    cards: CuratedCard[];
    showType?: boolean;
    emptyText?: string;
    emptyIcon?: string;
  }>(),
  {
    showType: false,
    emptyText: "No cards to show.",
    emptyIcon: "mdi-card-search-outline",
  },
);

const cardsStore = useCardsStore();
const { store: collectionStore, toggleCard } = useCollection();

// Per-card loading state — replacing the shared `busy` ref so only the
// clicked card's spinner fires.
const busyIds = ref<Set<string>>(new Set());

function cardKey(card: CuratedCard) {
  return `${card.type}-${card.id}`;
}

async function handleToggle(card: CuratedCard) {
  const key = cardKey(card);
  busyIds.value = new Set([...busyIds.value, key]);
  try {
    await toggleCard(card);
  } finally {
    const next = new Set(busyIds.value);
    next.delete(key);
    busyIds.value = next;
  }
}

const detailOpen = ref(false);
const selected = ref<CuratedCard | null>(null);

function openDetail(card: CuratedCard) {
  selected.value = card;
  detailOpen.value = true;
}

function releaseName(card: CuratedCard) {
  return cardsStore.getReleaseById(card.release_id)?.name ?? "—";
}
function releaseDate(card: CuratedCard) {
  return cardsStore.getReleaseById(card.release_id)?.release_date ?? "";
}
</script>

<style scoped>
.card-row {
  transition: background 0.12s ease;
  cursor: pointer;
}
.card-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}
</style>
