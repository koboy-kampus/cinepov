/**
 * The cinema and studio shown in the app (header, ticket, etc.).
 * Change the names here and they update everywhere.
 */
export const VENUE = {
  cinema: 'Layar',
  /** Indonesian cinemas call their halls "Studio". */
  studio: 'Studio 3',
} as const

/** "Layar · Studio 3" */
export const VENUE_LABEL = `${VENUE.cinema} · ${VENUE.studio}`
