<template>
  <!-- the setup screen's footer: Privacy and Contact, nothing else (FT-1..FT-4) -->
  <footer data-app-footer class="mx-auto mt-6 max-w-130 border-t border-border pt-1">
    <nav class="flex flex-wrap justify-center gap-x-5 gap-y-1">
      <!-- the full file name: Capacitor serves the app's index.html for a bare folder path (FT-4) -->
      <a data-footer-privacy :href="privacyHref" :class="LINK_CLASS">{{ t('footer.privacy') }}</a>
      <a data-footer-contact :href="contactHref" :class="LINK_CLASS">{{ t('footer.contact') }}</a>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CONTACT_EMAIL, CONTACT_SUBJECT, PRIVACY_PAGE } from '@/static'

const { t } = useI18n()

// 44 px tall tap targets below sm (FT-3)
const LINK_CLASS =
  'inline-flex min-h-11 items-center px-1 text-sm font-bold text-muted underline underline-offset-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent sm:min-h-10'

// base-relative, so it works under /dots-and-boxes/ on Pages and at / in the Android app
const privacyHref = `${import.meta.env.BASE_URL}${PRIVACY_PAGE}`
const contactHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`
</script>
