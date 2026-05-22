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
            <span v-if="showType" class="text-medium-emphasis">
              {{ cardTypeMeta[card.type].label }} ·
            </span>
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
              :loading="busy"
              @click.stop="toggleCard(card)"
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
const { store: collectionStore, busy, toggleCard } = useCollection();

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
