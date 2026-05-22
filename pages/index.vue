<template>
  <div class="home">
    <!-- Hero -->
    <section class="home-hero">
      <div class="hero-glow" />
      <v-container class="hero-container py-0">
        <v-row justify="center">
          <v-col cols="12" sm="10" md="8" class="text-center">
            <p class="hero-eyebrow">Your Champion's Command Center</p>
            <h1 class="hero-heading">
              Command Your Collection.<br />
              <span class="accent-text">Dominate Every Battle.</span>
            </h1>
            <p class="hero-body">
              Track your hero card collection, record every match against every
              villain, and analyze your performance — everything a serious
              superhero card game player needs, all in one place.
            </p>
            <div class="hero-actions">
              <v-btn
                color="primary"
                size="large"
                rounded="lg"
                prepend-icon="mdi-shield-account"
                to="/login"
              >
                Start Your Journey
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                rounded="lg"
                prepend-icon="mdi-cards-outline"
                to="/cards"
              >
                Browse Cards
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features -->
    <section class="home-features">
      <v-container>
        <h2 class="section-title text-center mb-8">
          Everything You Need to Play at Your Best
        </h2>
        <v-row>
          <v-col
            v-for="feat in features"
            :key="feat.title"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card class="feat-card h-100" rounded="xl" variant="flat">
              <v-card-text class="pa-6">
                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="56"
                  rounded="lg"
                  class="mb-5"
                >
                  <v-icon :icon="feat.icon" size="28" />
                </v-avatar>
                <h3 class="text-h6 font-weight-bold mb-2">{{ feat.title }}</h3>
                <p class="text-body-2 text-medium-emphasis">
                  {{ feat.description }}
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Stats -->
    <section class="home-stats">
      <v-container>
        <v-row justify="center" class="text-center">
          <v-col v-for="stat in stats" :key="stat.label" cols="6" md="3">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA -->
    <section class="home-cta">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="10" md="7" class="text-center">
            <h2 class="section-title mb-4">Ready to Become a Legend?</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Join other hero players managing their decks and battles with Hero
              Manager. Sign in with GitHub or Twitch — no password needed.
            </p>
            <v-btn
              color="primary"
              size="x-large"
              rounded="lg"
              to="/login"
              prepend-icon="mdi-login-variant"
            >
              Sign In Now
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ auth: false });

const features = [
  {
    icon: "mdi-cards-outline",
    title: "Collection Manager",
    description:
      "Catalog every card you own — heroes, aspects, villain sets, and campaigns. Know exactly what you have and what you're still hunting.",
  },
  {
    icon: "mdi-trophy-outline",
    title: "Battle Tracker",
    description:
      "Log every match: which heroes you played, which villains you faced, the difficulty, and the outcome. Build a complete battle log.",
  },
  {
    icon: "mdi-chart-bar",
    title: "Performance Analytics",
    description:
      "Discover win rates by hero, aspect, and villain. Spot your strongest builds and toughest matchups at a glance.",
  },
];

const stats = [
  { value: "200+", label: "Heroes & Aspects" },
  { value: "50+", label: "Villain Sets" },
  { value: "10k+", label: "Possible Deck Combos" },
  { value: "1", label: "App to Manage Them All" },
];
</script>

<style scoped>
.home {
  overflow-x: hidden;
}

/* ── Hero ─────────────────────────────────────── */
.home-hero {
  position: relative;
  padding: 80px 0 64px;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 55% at 50% 0%,
    rgba(229, 57, 53, 0.11) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.hero-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 1rem;
}

.hero-heading {
  font-family: "Barlow Condensed", sans-serif !important;
  font-size: clamp(2.8rem, 7vw, 4.5rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0.01em;
  margin-bottom: 1.5rem;
}

.accent-text {
  color: rgb(var(--v-theme-primary));
}

.hero-body {
  font-size: 1.05rem;
  opacity: 0.72;
  max-width: 560px;
  margin: 0 auto 2.5rem;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ── Features ─────────────────────────────────── */
.home-features {
  padding: 64px 0;
}

.section-title {
  font-family: "Barlow Condensed", sans-serif !important;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.feat-card {
  background: rgba(var(--v-theme-surface-light), 0.5) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.feat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2) !important;
}

/* ── Stats ────────────────────────────────────── */
.home-stats {
  padding: 52px 0;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.07);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.07);
}

.stat-value {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.55;
  margin-top: 0.4rem;
  font-weight: 600;
}

/* ── CTA ──────────────────────────────────────── */
.home-cta {
  padding: 80px 0;
}
</style>
