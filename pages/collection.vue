<template>
  <v-container class="py-6 py-md-10" max-width="1100">
    <div class="d-flex align-center ga-3 mb-6 flex-wrap">
      <v-icon icon="mdi-bookmark-multiple-outline" size="28" color="primary" />
      <div class="flex-grow-1">
        <h1 class="text-h4 lh-tight">My Collection</h1>
        <p class="text-body-2 text-medium-emphasis mt-n1">
          The cards you own. Add more from the
          <NuxtLink to="/cards" class="text-primary text-decoration-none">Cards</NuxtLink>
          page.
        </p>
      </div>
      <v-btn
        variant="tonal"
        rounded="lg"
        prepend-icon="mdi-refresh"
        :loading="refreshing"
        @click="refresh"
      >
        Refresh
      </v-btn>
    </div>

    <!-- Summary stats -->
    <v-row class="mb-2" dense>
      <v-col v-for="stat in stats" :key="stat.label" cols="6" sm="3">
        <v-card rounded="lg" variant="flat" class="stat-card pa-4 text-center">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-tabs v-model="tab" color="primary" class="mb-4">
      <v-tab value="type" prepend-icon="mdi-shape-outline">By card type</v-tab>
      <v-tab value="everything" prepend-icon="mdi-view-grid-outline">Everything</v-tab>
    </v-tabs>

    <v-card rounded="xl" variant="flat" class="content-card">
      <v-card-text class="pa-4 pa-sm-5">
        <v-window v-model="tab">
          <v-window-item value="type">
            <CardTypeList show="collection" />
          </v-window-item>
          <v-window-item value="everything">
            <CardEverythingList show="collection" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const collection = useCollectionStore();
const { error } = useSnackbar();
const refreshing = ref(false);

const tab = ref("type");

const stats = computed(() => [
  { label: "Total cards", value: collection.total },
  { label: "Heroes", value: collection.countByType.hero },
  { label: "Scenarios", value: collection.countByType.scenario },
  { label: "Encounter sets", value: collection.countByType.encounter },
]);

async function load(force = false) {
  try {
    await collection.fetch(force);
  } catch {
    error("Couldn't load your collection.");
  }
}

async function refresh() {
  refreshing.value = true;
  await load(true);
  refreshing.value = false;
}

// Load client-side (user-specific data shouldn't block SSR; the persisted
// cache means this is usually instant on repeat visits).
onMounted(load);
</script>

<style scoped>
.content-card {
  background: rgba(var(--v-theme-surface-light), 0.5) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.stat-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.stat-value {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
}
.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.6;
  margin-top: 0.3rem;
  font-weight: 600;
}
</style>
