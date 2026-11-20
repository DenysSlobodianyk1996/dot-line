<template>
  <!-- The privacy policy in one language (AR-15, PV-1). The in-app screen shows it in the interface
       language; the static store page (src/privacy-static.ts) shows it in English and Ukrainian. -->
  <section
    data-privacy-content
    :lang="locale"
    class="rounded-2xl border border-border bg-surface p-5 leading-relaxed text-ink"
  >
    <component :is="`h${headingLevel}`" class="text-2xl leading-tight font-extrabold">
      {{ t('privacy.title') }}
    </component>
    <p>{{ t('app.title') }}</p>
    <p data-privacy-updated class="mt-3 text-muted">
      {{ t('privacy.updated') }} <time :datetime="PRIVACY_UPDATED">{{ updated }}</time>
    </p>
    <!-- the same version in the web app and the Android app built from one commit (PV-5) -->
    <p data-privacy-version class="text-muted">{{ t('privacy.version') }} {{ APP_VERSION }}</p>

    <template v-for="key in SECTIONS" :key="key">
      <component :is="subheading" :class="SUBHEADING_CLASS">{{ t(`privacy.${key}Title`) }}</component>
      <p>{{ t(`privacy.${key}`) }}</p>
    </template>

    <component :is="subheading" :class="SUBHEADING_CLASS">{{ t('privacy.contactTitle') }}</component>
    <p>{{ t('privacy.contactIntro') }}</p>
    <ul class="list-disc pl-5">
      <li>
        {{ t('privacy.email') }}
        <a :href="`mailto:${CONTACT_EMAIL}`" :class="LINK_CLASS">{{ CONTACT_EMAIL }}</a>
      </li>
      <li>
        GitHub:
        <a :href="GITHUB_ISSUES_URL" :class="LINK_CLASS">{{ GITHUB_ISSUES_LABEL }}</a>
      </li>
    </ul>

    <component :is="subheading" :class="SUBHEADING_CLASS">
      {{ t('privacy.developerTitle') }}
    </component>
    <p data-privacy-author>{{ t('privacy.createdBy') }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { APP_VERSION, CONTACT_EMAIL, GITHUB_ISSUES_URL, PRIVACY_UPDATED } from '@/static'
import { formatPrivacyDate } from '@/utils'

const props = withDefaults(
  defineProps<{
    locale: 'en' | 'uk'
    // 1 for the page's only or first language; the static page's second language is a 2
    headingLevel?: 1 | 2
  }>(),
  { headingLevel: 1 },
)

// each policy section is a `<key>Title` heading and a `<key>` paragraph
const SECTIONS = ['noData', 'onDevice', 'noAds', 'children'] as const
const SUBHEADING_CLASS = 'mt-5 mb-1 text-lg font-bold text-ink-soft'
const LINK_CLASS = 'font-bold text-accent underline underline-offset-3 [overflow-wrap:anywhere]'
const GITHUB_ISSUES_LABEL = GITHUB_ISSUES_URL.replace(/^https:\/\//, '')

const { t: translate } = useI18n()
const t = (key: string) => translate(key, {}, { locale: props.locale })

const subheading = computed(() => `h${props.headingLevel + 1}`)
const updated = computed(() => formatPrivacyDate(PRIVACY_UPDATED, props.locale))
</script>
