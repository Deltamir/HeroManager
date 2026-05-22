<template>
  <v-dialog :model-value="modelValue" max-width="640" @update:model-value="emit('update:modelValue', $event)">
    <v-card v-if="card" rounded="xl">
      <!-- Header -->
      <div class="d-flex align-center ga-3 px-5 pt-4 pb-2">
        <v-icon :icon="cardTypeMeta[card.type].icon" :color="cardTypeMeta[card.type].color" />
        <span class="text-h5 flex-grow-1">{{ card.name }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </div>
      <v-divider />

      <v-card-text class="pa-5">
        <div class="d-flex flex-column flex-sm-row ga-5">
          <!-- Art -->
          <CardAvatar
            :type="card.type"
            :name="card.name"
            :img-url="card.imgUrl"
            :icon-url="card.iconUrl"
            full
            rounded="lg"
            :size="160"
            class="flex-shrink-0 align-self-center align-self-sm-start detail-art"
          />

          <!-- Details table -->
          <div class="flex-grow-1">
            <dl class="detail-grid">
              <dt>Type</dt>
              <dd>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="cardTypeMeta[card.type].color"
                  :prepend-icon="cardTypeMeta[card.type].icon"
                >
                  {{ cardTypeMeta[card.type].label }}
                </v-chip>
              </dd>

              <dt>Release</dt>
              <dd>
                {{ release?.name ?? "—" }}
                <span v-if="release" class="text-caption text-medium-emphasis d-block">
                  {{ release.release_date }}
                </span>
              </dd>

              <template v-if="card.type === 'scenario'">
                <dt>Mandatory sets</dt>
                <dd>
                  <div v-if="mandatorySets.length" class="d-flex flex-wrap ga-1">
                    <v-chip v-for="es in mandatorySets" :key="es.id" size="x-small" variant="outlined">
                      {{ es.name }}
                    </v-chip>
                  </div>
                  <span v-else class="text-medium-emphasis">None</span>
                </dd>

                <dt>Recommended sets</dt>
                <dd>
                  <div v-if="recommendedSets.length" class="d-flex flex-wrap ga-1">
                    <v-chip v-for="es in recommendedSets" :key="es.id" size="x-small" variant="outlined">
                      {{ es.name }}
                    </v-chip>
                  </div>
                  <span v-else class="text-medium-emphasis">None</span>
                </dd>
              </template>
            </dl>
          </div>
        </div>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-chip
          v-if="owned"
          color="success"
          variant="tonal"
          prepend-icon="mdi-check-circle-outline"
          size="small"
        >
          In your collection
        </v-chip>
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="close">Close</v-btn>
        <v-btn
          :color="owned ? 'error' : 'primary'"
          :variant="owned ? 'tonal' : 'flat'"
          :prepend-icon="owned ? 'mdi-bookmark-remove-outline' : 'mdi-bookmark-plus-outline'"
          :loading="busy"
          rounded="lg"
          @click="toggle"
        >
          {{ owned ? "Remove" : "Add to collection" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { CuratedCard } from "~/types/cards";

const props = defineProps<{
  modelValue: boolean;
  card: CuratedCard | null;
}>();
const emit = defineEmits<{ "update:modelValue": [boolean] }>();

const cards = useCardsStore();
const { store, busy, toggleCard } = useCollection();

const release = computed(() =>
  props.card ? cards.getReleaseById(props.card.release_id) : undefined,
);

const mandatorySets = computed(() =>
  props.card?.type === "scenario"
    ? props.card.mandatory_encounter_sets
        .map((id) => cards.getEncounterSetById(id))
        .filter((e) => !!e)
    : [],
);
const recommendedSets = computed(() =>
  props.card?.type === "scenario"
    ? props.card.recommended_encounter_sets
        .map((id) => cards.getEncounterSetById(id))
        .filter((e) => !!e)
    : [],
);

const owned = computed(() => (props.card ? store.hasCard(props.card) : false));

function close() {
  emit("update:modelValue", false);
}
async function toggle() {
  if (props.card) await toggleCard(props.card);
}
</script>

<style scoped>
.detail-art {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
}

.detail-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5rem 1.25rem;
  align-items: start;
}
.detail-grid dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.6;
  font-weight: 600;
  padding-top: 2px;
}
.detail-grid dd {
  margin: 0;
}
</style>
