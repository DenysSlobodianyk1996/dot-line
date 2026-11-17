import { useI18n } from 'vue-i18n'
import { isComputerPlayer } from '@/models'

/**
 * The one place that turns a stored player name into the name shown on screen (ADR-0001):
 * the computer player's internal name becomes "Комп’ютер" / "Computer" in the current language
 * (CM-12); a person's name is shown as typed. Follows the language toggle.
 */
export function useDisplayName() {
  const { t } = useI18n()
  return function displayName(name: string | null | undefined): string {
    return isComputerPlayer(name) ? t('players.computer') : (name ?? '')
  }
}
