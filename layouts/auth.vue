<template>
  <div class="auth-layout">
    <!-- Left branding panel — visible lg+ only -->
    <div class="auth-brand hidden-md-and-down">
      <div class="auth-brand__decor-top" />
      <div class="auth-brand__decor-bottom" />
      <div class="auth-brand__content">
        <NuxtLink to="/" class="text-decoration-none d-flex align-center ga-3 mb-4">
          <svg width="42" height="48" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="al-left"><rect width="13" height="30" /></clipPath>
              <clipPath id="al-right"><rect x="13" width="13" height="30" /></clipPath>
            </defs>
            <path d="M13 1L25 5.5V16C25 23 19.5 27.5 13 29.5C6.5 27.5 1 23 1 16V5.5Z" fill="white"/>
            <path d="M13 3L23.5 7V16C23.5 22.5 18.5 26.5 13 28.5C7.5 26.5 2.5 22.5 2.5 16V7Z" fill="rgba(255,255,255,0.25)" clip-path="url(#al-left)"/>
            <path d="M13 3L23.5 7V16C23.5 22.5 18.5 26.5 13 28.5C7.5 26.5 2.5 22.5 2.5 16V7Z" fill="rgba(255,255,255,0.45)" clip-path="url(#al-right)"/>
            <text x="13" y="20.5" text-anchor="middle" fill="white" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12.5">H</text>
          </svg>
          <div class="auth-brand-name text-white">
            HERO<span style="opacity: 0.7">MANAGER</span>
          </div>
        </NuxtLink>
        <p class="text-white mt-2" style="opacity: 0.65; max-width: 260px; font-size: 0.95rem; line-height: 1.65">
          Track your collection, log every battle, and master every scenario — your hero journey starts here.
        </p>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="auth-form">
      <!-- Inline logo for mobile/tablet -->
      <div class="hidden-lg-and-up mb-8 d-flex align-center ga-2">
        <svg width="28" height="32" viewBox="0 0 26 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="am-left"><rect width="13" height="30" /></clipPath>
            <clipPath id="am-right"><rect x="13" width="13" height="30" /></clipPath>
          </defs>
          <path d="M13 1L25 5.5V16C25 23 19.5 27.5 13 29.5C6.5 27.5 1 23 1 16V5.5Z" fill="white"/>
          <path d="M13 3L23.5 7V16C23.5 22.5 18.5 26.5 13 28.5C7.5 26.5 2.5 22.5 2.5 16V7Z" fill="#1C3B9E" clip-path="url(#am-left)"/>
          <path d="M13 3L23.5 7V16C23.5 22.5 18.5 26.5 13 28.5C7.5 26.5 2.5 22.5 2.5 16V7Z" fill="#CF2F35" clip-path="url(#am-right)"/>
          <text x="13" y="20.5" text-anchor="middle" fill="white" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12.5">H</text>
        </svg>
        <span class="auth-brand-name">
          HERO<span style="color: rgb(var(--v-theme-primary))">MANAGER</span>
        </span>
      </div>

      <slot />

      <div class="text-caption text-medium-emphasis text-center mt-8">
        <NuxtLink to="/terms-of-service" class="text-medium-emphasis text-decoration-none">Terms of Service</NuxtLink>
        &nbsp;·&nbsp;
        <NuxtLink to="/privacy-policy" class="text-medium-emphasis text-decoration-none">Privacy Policy</NuxtLink>
        <div class="mt-1">© {{ new Date().getFullYear() }} Hero Manager</div>
      </div>
    </div>
    <AppSnackbar />
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100dvh;
  background: rgb(var(--v-theme-background));
}

.auth-brand-name {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
  text-decoration: none;
}

/* ─── Left branding panel ─────────────────────────────────────────────────── */

.auth-brand {
  width: 42%;
  flex-shrink: 0;
  min-height: 100dvh;
  background: linear-gradient(
    145deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Decorative blobs */
.auth-brand__decor-top {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  top: -100px;
  right: -100px;
  pointer-events: none;
}

.auth-brand__decor-bottom {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  bottom: -60px;
  left: -60px;
  pointer-events: none;
}

.auth-brand__content {
  position: relative;
  z-index: 1;
  padding: 2rem;
}

/* ─── Right form panel ────────────────────────────────────────────────────── */

.auth-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 100dvh;
  background: rgb(var(--v-theme-surface));
}
</style>
