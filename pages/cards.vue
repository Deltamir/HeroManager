<template>
  <v-container class="py-6 py-md-10" max-width="1100">
    <div class="d-flex align-center ga-3 mb-6">
      <v-icon icon="mdi-cards-outline" size="28" color="primary" />
      <div class="flex-grow-1">
        <h1 class="text-h4 lh-tight">Cards</h1>
        <p class="text-body-2 text-medium-emphasis mt-n1">
          Browse every hero, scenario and encounter set, then add what you own.
        </p>
      </div>
    </div>

    <v-tabs v-model="tab" color="primary" class="mb-4">
      <v-tab value="release" prepend-icon="mdi-package-variant-closed">By release</v-tab>
      <v-tab value="type" prepend-icon="mdi-shape-outline">By card type</v-tab>
      <v-tab value="everything" prepend-icon="mdi-view-grid-outline">Everything</v-tab>
    </v-tabs>

    <v-card rounded="xl" variant="flat" class="content-card">
      <v-card-text class="pa-4 pa-sm-5">
        <v-window v-model="tab">
          <v-window-item value="release">
            <CardReleaseGrid />
          </v-window-item>
          <v-window-item value="type">
            <CardTypeList show="cards" />
          </v-window-item>
          <v-window-item value="everything">
            <CardEverythingList show="cards" />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ auth: false });

const tab = ref("release");

// Browsing is public. Attempt to load the collection so ownership badges
// render when signed in; a 401 (signed out) is expected and ignored.
const collection = useCollectionStore();

onMounted(() => {
  collection.fetch().catch(() => {});
});
</script>

<style scoped>
.content-card {
  background: rgba(var(--v-theme-surface-light), 0.5) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
