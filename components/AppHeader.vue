<template>
  <v-app-bar :elevation="0" scroll-behavior="elevate" class="glass-bar">
    <template #prepend>
      <!-- Hamburger visible on md and below only; lg+ uses header nav -->
      <v-app-bar-nav-icon
        class="hidden-lg-and-up"
        @click.stop="drawer = !drawer"
      />
    </template>

    <v-app-bar-title>
      <NuxtLink
        to="/"
        class="text-decoration-none text-high-emphasis d-flex align-center ga-2"
      >
        <span class="brand-shield" aria-hidden="true">
          <svg width="26" height="30" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="hm-left"><rect width="13" height="30" /></clipPath>
              <clipPath id="hm-right"><rect x="13" width="13" height="30" /></clipPath>
            </defs>
            <path d="M13 1L25 5.5V16C25 23 19.5 27.5 13 29.5C6.5 27.5 1 23 1 16V5.5Z" fill="white"/>
            <path d="M13 3L23.5 7V16C23.5 22.5 18.5 26.5 13 28.5C7.5 26.5 2.5 22.5 2.5 16V7Z" fill="#1C3B9E" clip-path="url(#hm-left)"/>
            <path d="M13 3L23.5 7V16C23.5 22.5 18.5 26.5 13 28.5C7.5 26.5 2.5 22.5 2.5 16V7Z" fill="#CF2F35" clip-path="url(#hm-right)"/>
            <text x="13" y="20.5" text-anchor="middle" fill="white" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12.5">H</text>
          </svg>
        </span>
        <span class="brand-text">
          HERO<span class="brand-accent">MANAGER</span>
        </span>
      </NuxtLink>
    </v-app-bar-title>

    <template #append>
      <!-- Header nav visible on lg+ only; md and below use the drawer -->
      <div class="hidden-md-and-down">
        <v-menu v-for="item in items" :key="item.title">
          <template #activator="{ props }">
            <v-btn
              v-if="item.items"
              v-bind="props"
              append-icon="mdi-chevron-down"
            >
              {{ item.title }}
            </v-btn>
            <v-btn v-else v-bind="props" @click="navigateTo(item.to)">
              {{ item.title }}
            </v-btn>
          </template>

          <v-list v-if="item.items">
            <menu-item
              v-for="subItem in item.items"
              :key="subItem.title"
              :item="subItem"
            />
          </v-list>
        </v-menu>
      </div>

      <v-divider vertical />

      <v-tooltip
        :text="theme.global.current.value.dark ? 'Light mode' : 'Dark mode'"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            :icon="themeIcon"
            @click="toggleTheme"
          />
        </template>
      </v-tooltip>

      <AccountItem />
    </template>
  </v-app-bar>

  <!-- Drawer only rendered on md and below; not shown at all on lg+ -->
  <v-navigation-drawer v-if="!lgAndUp" v-model="drawer" location="left">
    <v-list nav>
      <template v-for="item in items" :key="item.title">
        <!-- Direct link item -->
        <v-list-item
          v-if="!item.items"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="route.path === item.to"
          color="primary"
          @click="navigateTo(item.to)"
        />
        <!-- Collapsible group -->
        <v-list-group v-else :value="item.title">
          <template #activator="{ props: activatorProps }">
            <v-list-item
              v-bind="activatorProps"
              :prepend-icon="item.icon"
              :title="item.title"
            />
          </template>
          <nav-item
            v-for="subItem in item.items"
            :key="subItem.title"
            :item="subItem"
          />
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const theme = useTheme();
const store = usePreferencesStore();
const { lgAndUp } = useDisplay();
const route = useRoute();

theme.change(store.theme);

// Start closed; user opens it via the hamburger on md and below
const drawer = ref(false);

// Close the drawer after any navigation
watch(
  () => route.path,
  () => {
    drawer.value = false;
  },
);

interface NavItem {
  title: string;
  icon: string;
  to?: string;
  items?: NavItem[];
}

const items = useState<NavItem[]>("appHeaderItems", () => [
  {
    title: "Cards",
    to: "/cards",
    icon: "mdi-cards-outline",
  },
  {
    title: "Collection",
    to: "/collection",
    icon: "mdi-bookmark-multiple-outline",
  },
  {
    title: "Matches",
    to: "/matches",
    icon: "mdi-trophy-outline",
  },
]);

const themeIcon = computed(() =>
  theme.global.current.value.dark ? "mdi-weather-night" : "mdi-weather-sunny",
);
function toggleTheme() {
  store.theme = theme.global.current.value.dark ? "light" : "dark";
  theme.change(store.theme);
}
</script>

<style scoped>
.brand-shield {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.brand-text {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
}

.brand-accent {
  color: rgb(var(--v-theme-primary));
}
</style>
