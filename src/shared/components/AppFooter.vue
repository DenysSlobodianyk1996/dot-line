<template>
  <!-- the setup screen's footer: Privacy and Contact, nothing else, pinned to the bottom below
       the scrolling screen (FT-1..FT-4, MB-11) -->
  <footer data-app-footer class="mx-auto mt-2 w-full max-w-130 border-t border-border pt-1">
    <nav class="flex flex-wrap justify-center gap-x-5 gap-y-1">
      <!-- the in-app privacy screen: offline, in the Android app, with a way back (FT-4, PV-2) -->
      <RouterLink data-footer-privacy :to="{ name: 'privacy' }" :class="LINK_CLASS">
        {{ t('footer.privacy') }}
      </RouterLink>
      <a data-footer-contact :href="contactHref" :class="LINK_CLASS">{{ t('footer.contact') }}</a>
    </nav>
    <!-- the same version on the web and in the Android app: the latest release (FT-5) -->
    <p data-footer-version class="text-center text-xs text-muted">
      {{ t('footer.version', { version: APP_VERSION }) }}
    </p>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { APP_VERSION, CONTACT_EMAIL, CONTACT_SUBJECT } from '@/static'

const { t } = useI18n()

// 44 px tall tap targets below sm (FT-3)
const LINK_CLASS =
  'inline-flex min-h-11 items-center px-1 text-sm font-bold text-muted underline underline-offset-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent sm:min-h-10'

const contactHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`
</script>
