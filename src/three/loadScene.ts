/**
 * One shared loader for the lazy 3D chunk. Calling it early (when a seat is
 * selected, or Continue is hovered/focused) starts the download in the
 * background, so the scene is usually ready by the time Continue is pressed.
 * The browser caches the module, so calling it again costs nothing.
 */
let pending: Promise<typeof import('./TheaterScene')> | null = null

export function loadTheaterScene() {
  pending ??= import('./TheaterScene')
  return pending
}
