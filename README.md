# PULP — 3D scroll site

A scroll-driven marketing page: bold pop colour blocks, extruded 3D type that
swaps word-by-word as you scroll, and a custom scrollbar. Reverse-engineered
from the architecture behind [active-hop.com](https://www.active-hop.com/en).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## The three ideas that make it work

**1. One canvas, pinned.** `src/three/StickyCanvas.tsx` mounts exactly one
`<Canvas>` at `position: fixed; inset: 0` that never unmounts. Sections scroll
as ordinary HTML on top of it. Per-section canvases would mean multiple WebGL
contexts, re-uploaded geometry, and a hitch at every boundary.

**2. Scroll is a clock, not a transform.** `src/scroll/SmoothScroll.tsx` owns
the single rAF loop: it advances Lenis, works out which section holds the
viewport centre, and writes to a plain mutable object (`src/scroll/store.ts`).
`useFrame` reads that object 60×/sec. Nothing about it goes through React
state — only the *discrete* "which section is active" value is published, via
`useSyncExternalStore`.

**3. Nothing is set from scroll directly.** Every 3D property is *damped
toward* a scroll-derived target (`maath/easing`). That is what makes the type
feel weighted instead of glued to the scrollbar.

Scroll velocity is a second signal on top of position: it drives the fresnel
rim on the type and the RGB split in post, so the page smears when you throw
it and snaps clean the moment it settles.

```
scroll position ──► store (mutable)  ──► useFrame ──► damp toward target
                └─► CSS custom props ──► HTML colours
```

## Layout

| Path | Role |
|---|---|
| `src/theme.ts` | **Start here.** Sections, words, colours, copy. |
| `src/scroll/SmoothScroll.tsx` | rAF loop, section detection, colour blending |
| `src/scroll/store.ts` | Per-frame state + live `THREE.Color`s |
| `src/scroll/controls.ts` | `scrollTo()` for nav + scrollbar |
| `src/three/useWordLayout.ts` | Per-letter layout from typeface metrics |
| `src/three/Word3D.tsx` | Extruded letters, stagger, word swapping |
| `src/three/Scene.tsx` | Lights, reflection probe, camera, page background |
| `src/three/typeMaterial.ts` | Gradient + fresnel injected into MeshStandardMaterial |
| `src/three/Effects.tsx` | Bloom / chromatic aberration / grain / vignette |
| `src/ui/ScrollRail.tsx` | Custom draggable scrollbar (Motion) |

## Customising

Everything content-facing lives in `src/theme.ts`. Add an entry to `SECTIONS`
and the background, the copy, the 3D word, the nav and the scrollbar ticks all
pick it up — no other file changes.

```ts
{
  id: 'new',
  word: 'BOLD',        // rendered as extruded 3D type
  bg: '#ff5b04',       // page background
  fg: '#17170a',       // HTML text (must stay legible on bg)
  word3d: '#e9ebd2',   // colour of the 3D word
  accent: '#bccc32',   // stat figures + floating debris
  kicker: '05 — Section', title: '…', body: '…',
}
```

**Swapping the typeface.** `public/fonts/*.typeface.json` is a three.js
"typeface" font. Convert any OTF/TTF at
[gero3.github.io/facetype.js](https://gero3.github.io/facetype.js/), drop it in
`public/fonts/`, and point `FONT_URL` at it. Letter spacing comes from the
font's own `glyph.ha / resolution` advance metrics, so kerning stays correct
for any font you use.

## The shader

`typeMaterial.ts` patches three's stock `MeshStandardMaterial` through
`onBeforeCompile` rather than writing a shader from scratch — that keeps the
lighting, tone mapping and environment reflections, and only adds a vertical
gradient and a fresnel rim on top of `outgoingLight`. One material instance is
shared by every letter, so there is a single program and one set of uniforms.

Two things to know if you retune it:

- **Bloom threshold is load-bearing.** The glyphs are cream (luminance ~0.87).
  Anything below ~0.95 blooms the whole letter body and the page turns milky —
  which kills the flat colour fields the whole look depends on. Only the
  fresnel rim, which pushes past 1.0, should ever glow.
- **The canvas is opaque.** `Scene.tsx` assigns the live background colour to
  `scene.background`, so post passes have real pixels to work on. Running
  vignette or grain over a transparent canvas darkens the empty pixels and
  reveals the vignette as a ring. The `--bg` custom property is now only a
  pre-WebGL fallback.

## Notes

- **Scrollbar.** The native scrollbar is hidden in `src/index.css`; scrolling
  itself is untouched. `ScrollRail` is click- and drag-seekable and falls back
  to a top progress bar under `md`.
- **Reduced motion.** Lenis smoothing is disabled and Motion animations are
  skipped when `prefers-reduced-motion` is set.
- **Bundle size.** ~371 kB gzipped, almost entirely `three`. Code-split the
  canvas behind `React.lazy` if first paint matters more than first frame.
- **First `npm run dev` is slow** — Vite pre-bundles `three` and `drei` (a few
  thousand modules) and shaders compile cold. Subsequent loads are instant.
