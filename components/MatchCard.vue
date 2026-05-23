<template>
  <v-card class="match-card" rounded="lg" variant="flat" :class="{ 'match-card--win': match.victory }">
    <div class="match-accent" :class="match.victory ? 'bg-success' : 'bg-error'" />
    <v-card-text class="pa-4">
      <!-- Header: result + date + delete -->
      <div class="d-flex align-center ga-2 mb-3">
        <v-chip
          :color="match.victory ? 'success' : 'error'"
          variant="flat"
          size="small"
          :prepend-icon="match.victory ? 'mdi-trophy' : 'mdi-skull-crossbones'"
          label
        >
          {{ match.victory ? "Victory" : "Defeat" }}
        </v-chip>
        <v-chip
          :color="difficultyMeta[match.difficulty].color"
          variant="tonal"
          size="small"
          label
        >
          {{ match.difficulty }}
        </v-chip>
        <v-spacer />
        <span class="text-caption text-medium-emphasis">{{ playedDate }}</span>
        <v-btn
          icon="mdi-pencil-outline"
          variant="text"
          size="small"
          @click="emit('edit', match)"
        />
        <v-btn
          icon="mdi-trash-can-outline"
          variant="text"
          size="small"
          color="error"
          :loading="deleting"
          @click="emit('delete', match.id)"
        />
      </div>

      <!-- Heroes VS scenario -->
      <div class="d-flex align-center ga-3 flex-wrap">
        <div class="d-flex flex-column ga-2 flex-grow-1">
          <div
            v-for="hero in heroes"
            :key="hero.heroId"
            class="d-flex align-center ga-2"
          >
            <CardAvatar
              v-if="hero.card"
              type="hero"
              :name="hero.card.name"
              :icon-url="hero.card.iconUrl"
              :size="32"
            />
            <span class="text-body-2 font-weight-medium">
              {{ hero.card?.hero_name ?? "Unknown hero" }}
            </span>
            <v-chip
              v-for="aspect in hero.aspects"
              :key="aspect"
              :color="aspectMeta[aspect].color"
              size="x-small"
              variant="tonal"
              label
            >
              {{ aspect }}
            </v-chip>
          </div>
        </div>

        <span class="text-overline text-medium-emphasis px-2">vs</span>

        <div class="d-flex align-center ga-2 text-right">
          <div>
            <div class="text-body-2 font-weight-medium">
              {{ scenario?.name ?? "Unknown scenario" }}
            </div>
            <div v-if="encounterNames.length" class="text-caption text-medium-emphasis">
              {{ encounterNames.join(", ") }}
            </div>
          </div>
          <CardAvatar
            v-if="scenario"
            type="scenario"
            :name="scenario.name"
            :icon-url="scenario.iconUrl"
            :size="32"
          />
        </div>
      </div>

      <!-- Comment -->
      <p v-if="match.comment" class="text-body-2 text-medium-emphasis mt-3 mb-0 match-comment">
        {{ match.comment }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { MatchHero, MatchRecord } from "~/types/cards";

const props = defineProps<{ match: MatchRecord; deleting?: boolean }>();
const emit = defineEmits<{ delete: [string]; edit: [MatchRecord] }>();

const cardsStore = useCardsStore();

// `heroes` is a JSON column → coerce to the typed shape before resolving.
const heroes = computed(() =>
  (props.match.heroes as MatchHero[]).map((h) => ({
    ...h,
    card: cardsStore.getHeroById(h.heroId),
  })),
);
const scenario = computed(() => cardsStore.getScenarioById(props.match.scenarioId));
const encounterNames = computed(() =>
  props.match.encounterIds
    .map((id) => cardsStore.getEncounterSetById(id)?.name)
    .filter((n): n is string => !!n),
);
const playedDate = computed(() =>
  new Date(props.match.playedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
);
</script>

<style scoped>
.match-card {
  position: relative;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.07);
  overflow: hidden;
}
.match-accent {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
}
.match-comment {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding-top: 0.5rem;
  font-style: italic;
}
</style>
