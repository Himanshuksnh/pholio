/**
 * Ambient page background.
 *
 * Pure CSS: two wide radial washes, a masked technical grid and a vignette.
 * Fixed and non-interactive so it never affects layout or scroll performance.
 */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />

      {/* Primary electric wash, anchored to the top of the page. */}
      <div
        className="animate-drift absolute -top-[28rem] left-1/2 h-[46rem] w-[92rem] max-w-[160vw] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(74,115,255,0.17) 0%, rgba(74,115,255,0.06) 38%, transparent 68%)',
        }}
      />

      {/* Cool counter-wash on the right keeps large areas from going flat. */}
      <div
        className="absolute top-1/3 -right-[24rem] h-[42rem] w-[52rem] max-w-[130vw]"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(157,182,255,0.09) 0%, transparent 66%)',
        }}
      />

      {/* Faint structural grid, faded towards the edges. */}
      <div className="bg-grid-fade absolute inset-x-0 top-0 h-[52rem]" />

      {/* Vignette that keeps long-form content readable at the edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% 0%, transparent 40%, rgba(5,7,11,0.65) 100%)',
        }}
      />
    </div>
  )
}
