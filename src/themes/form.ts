import type { Preset } from './types'

/**
 * The quiet one. Slow damping, soft light, almost no post — proof the engine
 * can do restraint as well as noise. Bloom threshold is near 1 because the
 * palette is light and nothing should glow.
 */
export const form: Preset = {
  engine: 'exploded',
  key: 'form',
  label: 'Form — architecture',
  brand: 'Form',
  tagline: 'The space between things',
  figure: 'tower',
  mood: {
    roughness: 0.78, metalness: 0.0, envIntensity: 0.5,
    tint: 0.26, fresnel: 0.07, fresnelVelocity: 0.25, fresnelPower: 3.8,
    bloomIntensity: 0.12, bloomThreshold: 0.99, grain: 0.07, vignette: 0.1, aberration: 0.35,
    // Everything eases about twice as slowly: the whole preset reads calmer.
    damping: 1.9, tilt: 0, distance: 7,
    ambient: 1.5, key: 1.5, rim: 18,
    debris: { count: 3, scale: 1.3, kinds: ['box', 'box', 'icosa'] },
    figurePosition: [2.5, -0.2, -2.6], figureScale: 0.9,
  },
  sections: [
    { id: 'hero', word: 'FORM', bg: '#e8e4dc', fg: '#1a1a18', word3d: '#9a968c', accent: '#b4552d',
      kicker: 'Practice / Est. 2011 / Lisbon & Oslo', title: 'We build the space between things.',
      body: 'Twenty-two built projects, mostly small, mostly public. We are interested in what a building does when nobody is looking at it.' },
    { id: 'mass', word: 'MASS', bg: '#9a968c', fg: '#e8e4dc', word3d: '#e8e4dc', accent: '#b4552d',
      kicker: '01 — Approach', title: 'Weight is a material decision.',
      body: 'We work in load-bearing masonry where we can. It is slower, it costs more up front, and it will outlive every one of us.',
      facts: [['22', 'built'], ['2011', 'founded'], ['9', 'people']] },
    { id: 'void', word: 'VOID', bg: '#1a1a18', fg: '#e8e4dc', word3d: '#e8e4dc', accent: '#b4552d',
      kicker: '02 — Negative space', title: 'What we leave out does the work.',
      body: 'A courtyard is not what is left over after the rooms. It is the first thing we draw, and everything else arranges itself around it.',
      facts: [['1:3', 'built to open'], ['0', 'corridors'], ['4m', 'min ceiling']] },
    { id: 'light', word: 'LIGHT', bg: '#e8e4dc', fg: '#1a1a18', word3d: '#9a968c', accent: '#b4552d',
      kicker: '03 — Daylight', title: 'North light, or none at all.',
      body: 'Every habitable room gets daylight from two directions. It is the single constraint we have never broken, on any project, for any budget.',
      facts: [['2', 'light sources'], ['0', 'north-only rooms'], ['62%', 'glazing ratio']] },
    { id: 'site', word: 'SITE', bg: '#d6d2c8', fg: '#1a1a18', word3d: '#1a1a18', accent: '#b4552d',
      kicker: '04 — Working together', title: 'We take four projects a year.',
      body: 'That is the number where the two of us can still be on site every week. If the timing does not work, we will tell you honestly.' },
  ],
}
