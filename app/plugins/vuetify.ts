import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          dark: true,
          colors: {
            background: '#0f1117',
            surface: '#1e2129',
            'surface-bright': '#272b36',
            'surface-light': '#2e3340',
            'surface-variant': '#252830',
            'on-surface-variant': '#9ca3af',
            primary: '#dbf40c',
            'primary-darken-1': '#c5db0a',
            'primary-darken-2': '#b0c509',
            'on-primary': '#0f1117',
            'on-primary-darken-1': '#0f1117',
            'on-primary-darken-2': '#0f1117',
            secondary: '#6b7280',
            error: '#ef4444',
            info: '#9ca3af',
            success: '#22c55e',
            warning: '#c5db0a',
          }
        }
      }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
