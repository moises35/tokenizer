// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    'nuxt-primevue',
    '@nuxt/eslint'
  ],
  primevue: {
      /* Options */
  },
  css: [
    'primevue/resources/themes/aura-dark-green/theme.css',
    'primevue/resources/primevue.min.css',
    'primeicons/primeicons.css',
  ],
})
