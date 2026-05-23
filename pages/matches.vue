<template>
  <v-container class="py-6 py-md-10" max-width="900">
    <div class="d-flex align-center ga-3 mb-6 flex-wrap">
      <v-icon icon="mdi-trophy-outline" size="28" color="primary" />
      <div class="flex-grow-1">
        <h1 class="text-h4 lh-tight">Match History</h1>
        <p class="text-body-2 text-medium-emphasis mt-n1">
          Every game you've logged, newest first.
        </p>
      </div>
      <v-btn
        variant="tonal"
        rounded="lg"
        icon="mdi-refresh"
        :loading="refreshing"
        @click="refresh"
      />
      <v-btn
        color="primary"
        rounded="lg"
        prepend-icon="mdi-plus"
        @click="formOpen = true"
      >
        New match
      </v-btn>
    </div>

    <!-- Summary -->
    <v-row v-if="matches.count" class="mb-4" dense>
      <v-col cols="4">
        <v-card rounded="lg" variant="flat" class="stat-card pa-4 text-center">
          <div class="stat-value">{{ matches.count }}</div>
          <div class="stat-label">Games</div>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card rounded="lg" variant="flat" class="stat-card pa-4 text-center">
          <div class="stat-value text-success">{{ matches.wins }}</div>
          <div class="stat-label">Wins</div>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card rounded="lg" variant="flat" class="stat-card pa-4 text-center">
          <div class="stat-value">{{ matches.winRate }}%</div>
          <div class="stat-label">Win rate</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- List -->
    <div v-if="matches.count" class="d-flex flex-column ga-3">
      <MatchCard
        v-for="match in matches.matches"
        :key="match.id"
        :match="match"
        :deleting="deletingId === match.id"
        @delete="onDelete"
        @edit="onEdit"
      />
    </div>

    <!-- Empty state -->
    <v-card v-else rounded="xl" variant="flat" class="empty-card text-center py-12">
      <v-icon icon="mdi-sword-cross" size="56" class="mb-4 text-disabled" />
      <h3 class="text-h6 mb-2">No matches yet</h3>
      <p class="text-body-2 text-medium-emphasis mb-5">
        Record your first game to start tracking your hero career.
      </p>
      <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus" @click="formOpen = true">
        Record a match
      </v-btn>
    </v-card>

    <MatchFormDialog v-model="formOpen" :saving="saving" @submit="onSubmit" />
    <MatchFormDialog v-model="editOpen" :saving="editSaving" :match="editMatch" @submit="onEditSubmit" />
  </v-container>
</template>

<script setup lang="ts">
import type { MatchInput, MatchRecord } from "~/types/cards";

const matches = useMatchesStore();
const { success, error } = useSnackbar();

const formOpen = ref(false);
const saving = ref(false);
const refreshing = ref(false);
const deletingId = ref<string | null>(null);
const editOpen = ref(false);
const editSaving = ref(false);
const editMatch = ref<MatchRecord | null>(null);

async function load(force = false) {
  try {
    await matches.fetch(force);
  } catch {
    error("Couldn't load your matches.");
  }
}

async function refresh() {
  refreshing.value = true;
  await load(true);
  refreshing.value = false;
}

// Load client-side so user-specific data doesn't block SSR.
onMounted(load);

async function onSubmit(input: MatchInput) {
  saving.value = true;
  try {
    await matches.add(input);
    success("Match recorded.");
    formOpen.value = false;
  } catch {
    error("Couldn't save the match.");
  } finally {
    saving.value = false;
  }
}

async function onDelete(id: string) {
  deletingId.value = id;
  try {
    await matches.remove(id);
    success("Match deleted.");
  } catch {
    error("Couldn't delete the match.");
  } finally {
    deletingId.value = null;
  }
}

function onEdit(match: MatchRecord) {
  editMatch.value = match;
  editOpen.value = true;
}

async function onEditSubmit(input: MatchInput) {
  if (!editMatch.value) return;
  editSaving.value = true;
  try {
    await matches.update(editMatch.value.id, input);
    success("Match updated.");
    editOpen.value = false;
  } catch {
    error("Couldn't update the match.");
  } finally {
    editSaving.value = false;
    editMatch.value = null;
  }
}
</script>

<style scoped>
.stat-card,
.empty-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.empty-card {
  background: rgba(var(--v-theme-surface-light), 0.5) !important;
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
