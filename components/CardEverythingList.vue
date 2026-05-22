<template>
  <div>
    <div class="d-flex flex-wrap ga-4 align-center mb-4">
      <v-text-field
        v-model="query"
        label="Search cards"
        placeholder="Search by name…"
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        variant="outlined"
        rounded="lg"
        hide-details
        clearable
        style="min-width: 260px; max-width: 360px"
      />
      <v-spacer />
      <v-chip variant="tonal" size="small">{{ visibleCards.length }} cards</v-chip>
    </div>

    <CardList
      :cards="visibleCards"
      show-type
      :empty-text="
        show === 'collection'
          ? 'Your collection is empty — add cards from the Cards page.'
          : 'No cards match your search.'
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { CuratedCard } from "~/types/cards";

const props = withDefaults(
  defineProps<{ show?: "cards" | "collection" }>(),
  { show: "cards" },
);

const cardsStore = useCardsStore();
const collectionStore = useCollectionStore();

const query = ref("");

const visibleCards = computed<CuratedCard[]>(() => {
  let list = cardsStore.allCards;
  if (props.show === "collection") {
    list = list.filter((c) => collectionStore.hasCard(c));
  }
  const q = query.value?.trim().toLowerCase();
  if (q) {
    list = list.filter((c) => c.name.toLowerCase().includes(q));
  }
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
});
</script>
