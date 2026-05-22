<template>
  <v-snackbar
    v-model="state.show"
    :color="state.color"
    location="bottom right"
    timeout="3500"
    rounded="lg"
  >
    <div class="d-flex align-center ga-2">
      <v-icon :icon="icon" size="20" />
      <span>{{ state.message }}</span>
    </div>
    <template #actions>
      <v-btn variant="text" icon="mdi-close" size="small" @click="state.show = false" />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
const { state } = useSnackbar();

const icon = computed(
  () =>
    ({
      success: "mdi-check-circle-outline",
      error: "mdi-alert-circle-outline",
      info: "mdi-information-outline",
      warning: "mdi-alert-outline",
    })[state.value.color],
);
</script>
