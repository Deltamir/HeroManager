<template>
  <div>
    <div class="d-flex flex-wrap ga-4 align-center mb-4 pt-2">
      <v-select
        v-model="cardType"
        :items="typeItems"
        label="Show"
        density="comfortable"
        variant="outlined"
        rounded="lg"
        hide-details
        style="max-width: 220px"
      />
      <v-select
        v-model="orderBy"
        :items="orderItems"
        label="Order by"
        density="comfortable"
        variant="outlined"
        rounded="lg"
        hide-details
        style="max-width: 220px"
      />
      <v-spacer />
      <v-chip variant="tonal" size="small">{{ visibleCards.length }} cards</v-chip>
    </div>

    <CardList
      :cards="visibleCards"
      :empty-text="
        show === 'collection'
          ? `No ${cardTypeMeta[cardType].plural.toLowerCase()} in your collection yet.`
          : 'No cards match.'
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { CardType, CuratedCard } from "~/types/cards";

const props = withDefaults(
  defineProps<{ show?: "cards" | "collection" }>(),
  { show: "cards" },
);

const cardsStore = useCardsStore();
const collectionStore = useCollectionStore();

const cardType = ref<CardType>("hero");
const orderBy = ref<"name" | "release">("name");

const typeItems = (["hero", "scenario", "encounter"] as CardType[]).map((t) => ({
  title: cardTypeMeta[t].plural,
  value: t,
}));
const orderItems = [
  { title: "Name", value: "name" },
  { title: "Release date", value: "release" },
];

const sourceCards = computed<CuratedCard[]>(() => {
  switch (cardType.value) {
    case "hero":
      return cardsStore.curatedHeroes;
    case "scenario":
      return cardsStore.curatedScenarios;
    case "encounter":
      return cardsStore.curatedEncounterSets;
    default:
      return [];
  }
});

const visibleCards = computed<CuratedCard[]>(() => {
  let list = sourceCards.value;
  if (props.show === "collection") {
    list = list.filter((c) => collectionStore.hasCard(c));
  }
  const sorted = [...list];
  if (orderBy.value === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sorted.sort((a, b) => {
      const da = cardsStore.getReleaseById(a.release_id)?.release_date ?? "";
      const db = cardsStore.getReleaseById(b.release_id)?.release_date ?? "";
      return da.localeCompare(db) || a.name.localeCompare(b.name);
    });
  }
  return sorted;
});
</script>
