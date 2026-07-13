/**
 * Static grain layer for atmospheric depth.
 * The primary grain lives on body::after in globals.css.
 * This component is a named slot for layout composition.
 */
export function GrainOverlay() {
  return <div className="pointer-events-none fixed inset-0 z-[9998]" aria-hidden />
}
