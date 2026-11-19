// The privacy policy's "Updated" date in each language (AR-15), spelled out here rather than with
// Intl, so the static page built in Node and the app print exactly the same words.

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
// genitive, as in "19 листопада 2026 року"
const UK_MONTHS = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
]

/** A YYYY-MM-DD date as the policy prints it, e.g. "19 November 2026" or "19 листопада 2026 року". */
export function formatPrivacyDate(iso: string, lang: 'en' | 'uk'): string {
  const [year, month, day] = iso.split('-').map(Number)
  const index = (month ?? 1) - 1
  return lang === 'en'
    ? `${day} ${EN_MONTHS[index]} ${year}`
    : `${day} ${UK_MONTHS[index]} ${year} року`
}
