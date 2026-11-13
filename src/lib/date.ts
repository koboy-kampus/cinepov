/** Formats a date like "Fri, 13 Nov" (English, day before month). */
export function formatShowDate(date: Date): string {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', options).format(date)
  return `${part({ weekday: 'short' })}, ${part({ day: 'numeric' })} ${part({ month: 'short' })}`
}
