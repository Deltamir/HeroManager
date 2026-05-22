<template>
  <v-avatar
    :size="size"
    :rounded="rounded"
    :color="color"
    class="card-avatar"
  >
    <!-- Fallback is the always-visible base: an icon or the name's initial on
         the type colour. No card art ships yet, so this is the common path. -->
    <v-icon
      v-if="showIcon"
      :icon="cardTypeMeta[type].icon"
      :size="iconSize"
      color="white"
    />
    <span v-else class="card-avatar__initial text-white">{{ initial }}</span>

    <!-- Real art (if any) fades in over the fallback once it loads. On 404 it
         stays hidden, leaving the fallback in place — no broken-image flash. -->
    <v-img
      v-if="src"
      :src="src"
      :alt="name"
      cover
      class="card-avatar__img"
      :class="{ 'card-avatar__img--ready': loaded }"
      @load="loaded = true"
      @error="loaded = false"
    />
  </v-avatar>
</template>

<script setup lang="ts">
import type { CardType } from "~/types/cards";

const props = withDefaults(
  defineProps<{
    type: CardType;
    name: string;
    iconUrl?: string;
    imgUrl?: string;
    full?: boolean;
    size?: number | string;
    rounded?: string | number | boolean;
    showIcon?: boolean;
    // Override the fallback background colour (e.g. releases).
    color?: string;
  }>(),
  {
    size: 40,
    rounded: "circle",
    full: false,
    showIcon: false,
    iconUrl: undefined,
    imgUrl: undefined,
    color: undefined,
  },
);

const loaded = ref(false);
const src = computed(() => (props.full ? props.imgUrl : props.iconUrl));
const color = computed(() => props.color ?? cardTypeMeta[props.type].color);
const initial = computed(() => props.name?.charAt(0)?.toUpperCase() ?? "?");
const iconSize = computed(() => {
  const n = typeof props.size === "number" ? props.size : parseInt(props.size);
  return Math.round((Number.isFinite(n) ? n : 40) * 0.55);
});

watch(src, () => {
  loaded.value = false;
});
</script>

<style scoped>
.card-avatar__img {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.card-avatar__img--ready {
  opacity: 1;
}
.card-avatar__initial {
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 700;
  font-size: 1.1em;
  line-height: 1;
}
</style>
