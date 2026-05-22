// https://nuxt.com/docs/api/configuration/nuxt-config
//
// Note: there is no `@sidebase/nuxt-auth` module here anymore — Better Auth
// doesn't need a Nuxt module. The server side is wired via the Nitro catch-all
// at server/api/auth/[...all].ts and the client via lib/auth-client.ts. The
// `auth: { globalAppMiddleware: true, baseURL: … }` block that used to live
// here is replaced by middleware/auth.global.ts.
//
// Likewise, `runtimeConfig` no longer needs the GitHub/Twitch client IDs — the
// Better Auth handler reads them directly from process.env in lib/auth.ts.
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Hero Manager",
      meta: [
        {
          name: "description",
          content:
            "Track your hero card collection, record match history, and analyze performance — the ultimate companion for superhero card game players.",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      ],
    },
  },
  modules: [
    "vuetify-nuxt-module",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxt/eslint",
    "@vee-validate/nuxt",
  ],
  vite: {
    vue: {},
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit", "yup"],
    },
    server: {
      // Polling needed inside DevContainer (Docker volume on Linux doesn't
      // emit inotify events reliably from a host bind mount).
      watch: {
        usePolling: true,
      },
    },
  },
  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      theme: {
        defaultTheme: "dark",
        themes: {
          light: {
            dark: false,
            colors: {
              background: "#EEF2FA",
              surface: "#FFFFFF",
              "surface-bright": "#FFFFFF",
              "surface-light": "#F0F5FD",
              "surface-variant": "#DCE6FA",
              "on-surface-variant": "#3A4A6B",
              primary: "#C62828",
              "primary-darken-1": "#B71C1C",
              secondary: "#1565C0",
              error: "#DC2626",
              info: "#2563EB",
              success: "#059669",
              warning: "#D97706",
            },
          },
          dark: {
            dark: true,
            colors: {
              background: "#06091A",
              surface: "#0C1228",
              "surface-bright": "#14213F",
              "surface-light": "#0F1834",
              "surface-variant": "#172040",
              "on-surface-variant": "#94A3B8",
              primary: "#E53935",
              "primary-darken-1": "#C62828",
              secondary: "#3D6FE8",
              error: "#F87171",
              info: "#60A5FA",
              success: "#34D399",
              warning: "#FBBF24",
            },
          },
        },
      },
    },
  },
});
