export type SectionDef = {
  id: string
  /** The word rendered as extruded 3D type while this section is active. */
  word: string
  bg: string
  /** HTML foreground; must stay legible on `bg`. */
  fg: string
  /** Colour of the extruded 3D word. */
  word3d: string
  /** Secondary pop colour: stat figures, rim light, floating debris. */
  accent: string
  kicker: string
  title: string
  body: string
  facts?: [string, string][]
}

/**
 * Everything that makes one preset *feel* different from another beyond its
 * palette. Without this, five colour schemes would all move identically and
 * the set would read as one site recoloured five times.
 */
export type Mood = {
  /** Surface of the 3D type. Matte for streetwear, mirror for fintech. */
  roughness: number
  metalness: number
  envIntensity: number
  /** Strength of the gradient injected into the glyphs, 0→1. */
  tint: number
  /** Base rim-light strength, and how hard scroll velocity drives it. */
  fresnel: number
  fresnelVelocity: number
  fresnelPower: number

  /**
   * Bloom threshold is per-preset by necessity: it must sit above the glyph
   * luminance or the whole letter body glows. Dark presets can afford a low
   * threshold; light ones cannot.
   */
  bloomIntensity: number
  bloomThreshold: number
  grain: number
  vignette: number
  /** Scroll-velocity-driven RGB split. */
  aberration: number

  /** Multiplier on every damping smoothTime. >1 is slower and heavier. */
  damping: number
  /** Constant z-roll on the word stack, in radians. */
  tilt: number
  /** Camera distance. */
  distance: number

  ambient: number
  key: number
  rim: number

  debris: {
    count: number
    scale: number
    kinds: ('torus' | 'box' | 'capsule' | 'icosa')[]
  }

  /** Where the figure sits relative to the word, and how big. */
  figurePosition: [number, number, number]
  figureScale: number

}

export type Preset = {
  key: string
  /** Shown in the preset switcher. */
  label: string
  brand: string
  tagline: string
  sections: SectionDef[]
  mood: Mood
  /** Procedural hero object built from primitives — see `figures.ts`. */
  figure: FigureKind
}

export type FigureKind = 'can' | 'deck' | 'vault' | 'speaker' | 'tower'

/** Which live, scroll-blended colour a part should take. */
export type Tone = 'word' | 'accent' | 'fg' | 'bg'

export type Part = {
  kind: 'box' | 'cyl' | 'sphere' | 'torus' | 'cone'
  args: number[]
  pos: [number, number, number]
  rot?: [number, number, number]
  tone: Tone
}
