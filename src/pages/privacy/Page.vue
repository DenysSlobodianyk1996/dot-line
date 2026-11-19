<template>
  <!-- the in-app privacy screen (PV-2): the policy in the interface language, then a way back -->
  <div data-privacy-screen class="mx-auto flex max-w-2xl flex-col gap-4">
    <PrivacyContent :locale="currentLocale" />
    <BaseButton
      data-privacy-back
      color="secondary"
      type="button"
      class="min-h-11 w-full sm:min-h-0 sm:w-auto sm:self-start"
      @click="back"
    >
      {{ t('privacy.back') }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BaseButton from '@/shared/components/BaseButton.vue'
import PrivacyContent from '@/shared/components/PrivacyContent.vue'

const { t, locale } = useI18n()
const router = useRouter()

const currentLocale = computed(() => (locale.value === 'uk' ? 'uk' : 'en'))

// back to where the player came from (the setup screen), or to the game on a direct visit (PV-3)
function back() {
  if (window.history.state?.back) router.back()
  else void router.push('/game')
}
</script>
