<template>
  <div>
    <v-row dense>
      <v-col
        v-for="release in releases"
        :key="release.id"
        cols="6"
        sm="4"
        md="3"
      >
        <v-card
          class="release-tile h-100 d-flex flex-column"
          rounded="lg"
          variant="flat"
          @click="openRelease(release)"
        >
          <!-- Banner: neutral gradient + package glyph, real art overlays if present -->
          <div class="release-banner">
            <v-icon icon="mdi-package-variant-closed" size="40" class="release-banner__icon" />
            <v-img
              :src="release.imgUrl"
              cover
              class="release-banner__img"
              :class="{ 'release-banner__img--ready': loaded.has(release.id) }"
              @load="loaded.add(release.id)"
            />
            <v-chip
              v-if="collectionStore.hasEverythingFromRelease(release.id)"
              size="x-small"
              color="success"
              variant="flat"
              class="release-banner__owned"
              prepend-icon="mdi-check"
            >
              Complete
            </v-chip>
          </div>

          <div class="pa-3 d-flex flex-column flex-grow-1">
            <div class="text-body-2 font-weight-semibold text-truncate">
              {{ release.name }}
            </div>
            <div class="text-caption text-medium-emphasis mb-2">
              {{ release.release_date }}
            </div>

            <v-spacer />

            <div class="d-flex align-center ga-2">
              <div class="flex-grow-1">
                <v-progress-linear
                  :model-value="ownedPct(release.id)"
                  :color="ownedPct(release.id) === 100 ? 'success' : 'primary'"
                  height="6"
                  rounded
                />
                <div class="text-caption text-disabled mt-1">
                  {{ collectionStore.ownedCountForRelease(release.id) }}/{{
                    cardCount(release.id)
                  }}
                  owned
                </div>
              </div>
              <v-btn
                :icon="
                  collectionStore.hasEverythingFromRelease(release.id)
                    ? 'mdi-bookmark-check'
                    : 'mdi-bookmark-plus-outline'
                "
                :color="
                  collectionStore.hasEverythingFromRelease(release.id)
                    ? 'success'
                    : 'primary'
                "
                variant="text"
                size="small"
                density="comfortable"
                :loading="busy"
                @click.stop="toggleRelease(release.id, release.name)"
              />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Release contents dialog -->
    <v-dialog v-model="dialogOpen" max-width="720" scrollable>
      <v-card v-if="activeRelease" rounded="xl">
        <div class="d-flex align-center ga-3 px-5 pt-4 pb-2">
          <div class="flex-grow-1">
            <div class="text-h5">{{ activeRelease.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ activeRelease.release_date }} ·
              {{ collectionStore.ownedCountForRelease(activeRelease.id) }}/{{
                releaseCards.length
              }}
              owned
            </div>
          </div>
          <v-btn
            :color="
              collectionStore.hasEverythingFromRelease(activeRelease.id)
                ? 'error'
                : 'primary'
            "
            :variant="
              collectionStore.hasEverythingFromRelease(activeRelease.id)
                ? 'tonal'
                : 'flat'
            "
            :prepend-icon="
              collectionStore.hasEverythingFromRelease(activeRelease.id)
                ? 'mdi-bookmark-remove-outline'
                : 'mdi-bookmark-multiple-outline'
            "
            :loading="busy"
            rounded="lg"
            size="small"
            @click="toggleRelease(activeRelease.id, activeRelease.name)"
          >
            {{
              collectionStore.hasEverythingFromRelease(activeRelease.id)
                ? "Remove all"
                : "Add all"
            }}
          </v-btn>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialogOpen = false" />
        </div>
        <v-divider />
        <v-card-text class="pa-2 pa-sm-3">
          <CardList :cards="releaseCards" show-type empty-text="This release has no listed cards." />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { CuratedCard, CuratedRelease } from "~/types/cards";

const cardsStore = useCardsStore();
const { store: collectionStore, busy, toggleRelease } = useCollection();

const releases = computed(() => cardsStore.curatedReleases);
const loaded = reactive(new Set<number>());

const dialogOpen = ref(false);
const activeRelease = ref<CuratedRelease | null>(null);
const releaseCards = ref<CuratedCard[]>([]);

function openRelease(release: CuratedRelease) {
  activeRelease.value = release;
  releaseCards.value = cardsStore.getCardsByRelease(release.id);
  dialogOpen.value = true;
}

function cardCount(releaseId: number): number {
  return cardsStore.getCardsByRelease(releaseId).length;
}
function ownedPct(releaseId: number): number {
  const total = cardCount(releaseId);
  if (total === 0) return 0;
  return Math.round((collectionStore.ownedCountForRelease(releaseId) / total) * 100);
}
</script>

<style scoped>
.release-tile {
  cursor: pointer;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.07);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  overflow: hidden;
}
.release-tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
}
.release-banner {
  position: relative;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-secondary), 0.55) 0%,
    rgba(var(--v-theme-primary), 0.45) 100%
  );
}
.release-banner__icon {
  color: rgba(255, 255, 255, 0.85);
}
.release-banner__img {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.release-banner__img--ready {
  opacity: 1;
}
.release-banner__owned {
  position: absolute;
  top: 6px;
  right: 6px;
}
</style>
