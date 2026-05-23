<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <div class="d-flex align-center ga-3 px-5 pt-4 pb-2">
        <v-icon icon="mdi-sword-cross" color="primary" />
        <span class="text-h5 flex-grow-1">{{ match ? "Edit match" : "Record a match" }}</span>
        <v-chip
          :color="onlyOwned ? 'primary' : undefined"
          :variant="onlyOwned ? 'flat' : 'outlined'"
          size="small"
          prepend-icon="mdi-bookmark-check"
          class="cursor-pointer"
          @click="onlyOwned = !onlyOwned"
        >
          Owned only
        </v-chip>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </div>
      <v-divider />

      <v-card-text class="pa-5">
        <form id="match-form" @submit.prevent="submit">
          <!-- Result toggle -->
          <label class="field-label">Result</label>
          <v-btn-toggle
            v-model="victory.value.value"
            mandatory
            divided
            rounded="lg"
            class="mb-5 d-flex"
          >
            <v-btn :value="true" color="success" class="flex-grow-1" prepend-icon="mdi-trophy">
              Victory
            </v-btn>
            <v-btn :value="false" color="error" class="flex-grow-1" prepend-icon="mdi-skull-crossbones">
              Defeat
            </v-btn>
          </v-btn-toggle>

          <!-- Scenario + difficulty -->
          <div class="d-flex flex-column flex-sm-row ga-4 mb-1">
            <v-autocomplete
              v-model="scenarioId.value.value"
              :items="scenarioItems"
              label="Scenario"
              placeholder="Who did you face?"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              prepend-inner-icon="mdi-skull"
              :error-messages="scenarioId.errorMessage.value"
              class="flex-grow-1"
            />
            <v-select
              v-model="difficulty.value.value"
              :items="difficultyItems"
              label="Difficulty"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              style="max-width: 180px"
            />
          </div>

          <!-- Heroes repeater -->
          <label class="field-label">Heroes</label>
          <div
            v-for="(field, i) in heroFields"
            :key="field.key"
            class="hero-row d-flex ga-2 mb-2 align-start"
          >
            <v-autocomplete
              :model-value="field.value.heroId"
              :items="heroItems"
              label="Hero"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              hide-details
              class="flex-grow-1"
              prepend-inner-icon="mdi-shield-account"
              @update:model-value="setHero(i, $event)"
            />
            <v-select
              :model-value="field.value.aspects"
              :items="aspectItems"
              label="Aspects"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              hide-details
              multiple
              chips
              closable-chips
              style="max-width: 230px"
              @update:model-value="setAspects(i, $event)"
            />
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              :disabled="heroFields.length <= 1"
              class="mt-1"
              @click="removeHero(i)"
            />
          </div>
          <div v-if="heroError" class="text-error text-caption mb-2">{{ heroError }}</div>
          <v-btn
            v-if="heroFields.length < 4"
            variant="text"
            size="small"
            prepend-icon="mdi-plus"
            class="mb-5"
            @click="addHero"
          >
            Add hero
          </v-btn>

          <!-- Extra encounter sets -->
          <v-select
            v-model="encounterIds.value.value"
            :items="encounterItems"
            label="Extra encounter sets (optional)"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            prepend-inner-icon="mdi-cards"
            multiple
            chips
            closable-chips
            class="mb-1"
          />

          <!-- Date + comment -->
          <v-text-field
            v-model="playedAt.value.value"
            type="date"
            label="Date played"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            prepend-inner-icon="mdi-calendar"
            :error-messages="playedAt.errorMessage.value"
            class="mb-1"
          />
          <v-textarea
            v-model="comment.value.value"
            label="Notes (optional)"
            variant="outlined"
            rounded="lg"
            rows="2"
            auto-grow
            counter="1000"
            :error-messages="comment.errorMessage.value"
          />
        </form>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn variant="text" rounded="lg" @click="close">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          type="submit"
          form="match-form"
          prepend-icon="mdi-content-save-outline"
          :loading="saving"
        >
          Save match
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import * as yup from "yup";
import { ASPECTS, DIFFICULTIES } from "~/types/cards";
import type { Aspect, MatchInput, MatchRecord } from "~/types/cards";

const props = defineProps<{
  modelValue: boolean;
  saving?: boolean;
  match?: MatchRecord | null;
}>();
const emit = defineEmits<{
  "update:modelValue": [boolean];
  submit: [MatchInput];
}>();

const cardsStore = useCardsStore();
const collectionStore = useCollectionStore();
const onlyOwned = ref(true);

const scenarioItems = computed(() =>
  [...cardsStore.curatedScenarios]
    .filter((s) => !onlyOwned.value || collectionStore.hasCard(s))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({ title: s.name, value: s.id })),
);
const heroItems = computed(() =>
  [...cardsStore.curatedHeroes]
    .filter((h) => !onlyOwned.value || collectionStore.hasCard(h))
    .sort((a, b) => a.hero_name.localeCompare(b.hero_name))
    .map((h) => ({ title: `${h.hero_name} / ${h.alterego_name}`, value: h.id })),
);
const encounterItems = computed(() =>
  [...cardsStore.curatedEncounterSets]
    .filter((e) => !onlyOwned.value || collectionStore.hasCard(e))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => ({ title: e.name, value: e.id })),
);
const aspectItems = ASPECTS.map((a) => ({ title: a, value: a }));
const difficultyItems = DIFFICULTIES.map((d) => ({ title: d, value: d }));

function today() {
  return new Date().toISOString().slice(0, 10);
}

// vee-validate + yup, mirroring pages/settings.vue.
const { handleSubmit, resetForm } = useForm({
  validationSchema: yup.object({
    victory: yup.boolean().required(),
    scenarioId: yup
      .number()
      .typeError("Pick a scenario")
      .required("Pick a scenario"),
    difficulty: yup.string().oneOf(DIFFICULTIES as unknown as string[]),
    playedAt: yup.string().required("Pick a date"),
    comment: yup.string().max(1000).nullable(),
    encounterIds: yup.array().of(yup.number()),
    heroes: yup
      .array()
      .of(
        yup.object({
          heroId: yup.number().nullable(),
          aspects: yup.array().of(yup.string()),
        }),
      )
      .min(1),
  }),
  initialValues: {
    victory: true,
    scenarioId: null as number | null,
    difficulty: "Standard",
    playedAt: today(),
    comment: "",
    encounterIds: [] as number[],
    heroes: [{ heroId: null as number | null, aspects: [] as Aspect[] }],
  },
});

const victory = useField<boolean>("victory");
const scenarioId = useField<number | null>("scenarioId");
const difficulty = useField<string>("difficulty");
const playedAt = useField<string>("playedAt");
const comment = useField<string>("comment");
const encounterIds = useField<number[]>("encounterIds");

const {
  fields: heroFields,
  push: pushHero,
  remove: removeHeroField,
  update: updateHero,
} = useFieldArray<{ heroId: number | null; aspects: Aspect[] }>("heroes");

const heroError = ref("");

function addHero() {
  pushHero({ heroId: null, aspects: [] });
}
function removeHero(i: number) {
  if (heroFields.value.length > 1) removeHeroField(i);
}
function setHero(i: number, heroId: number | null) {
  const current = heroFields.value[i]?.value;
  updateHero(i, { heroId, aspects: current?.aspects ?? [] });
}
function setAspects(i: number, aspects: Aspect[]) {
  const current = heroFields.value[i]?.value;
  updateHero(i, { heroId: current?.heroId ?? null, aspects });
}

function close() {
  emit("update:modelValue", false);
}

const submit = handleSubmit((values) => {
  // At least one hero must actually be chosen — yup can't easily express
  // "non-null heroId in array" cleanly, so we guard here.
  const heroes = (values.heroes ?? [])
    .filter((h) => h.heroId != null)
    .map((h) => ({ heroId: h.heroId!, aspects: (h.aspects ?? []) as Aspect[] }));

  if (heroes.length === 0) {
    heroError.value = "Select at least one hero.";
    return;
  }
  heroError.value = "";

  emit("submit", {
    victory: values.victory,
    difficulty: values.difficulty as MatchInput["difficulty"],
    scenarioId: values.scenarioId as unknown as number,
    heroes,
    encounterIds: (values.encounterIds ?? []) as number[],
    comment: values.comment || null,
    playedAt: new Date(values.playedAt).toISOString(),
  });
});

// Reset form each time the dialog opens; pre-populate when editing.
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.match) {
        const m = props.match;
        onlyOwned.value = false;
        resetForm({
          values: {
            victory: m.victory,
            scenarioId: m.scenarioId,
            difficulty: m.difficulty,
            playedAt: m.playedAt.slice(0, 10),
            comment: m.comment ?? "",
            encounterIds: m.encounterIds as number[],
            heroes: (m.heroes as import("~/types/cards").MatchHero[]).map((h) => ({
              heroId: h.heroId,
              aspects: h.aspects as Aspect[],
            })),
          },
        });
      } else {
        onlyOwned.value = true;
        resetForm({
          values: {
            victory: true,
            scenarioId: null,
            difficulty: "Standard",
            playedAt: today(),
            comment: "",
            encounterIds: [],
            heroes: [{ heroId: null as number | null, aspects: [] as Aspect[] }],
          },
        });
      }
      heroError.value = "";
    }
  },
);
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 0.4rem;
  opacity: 0.85;
}
</style>
