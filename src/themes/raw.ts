import type { Preset } from './types'

/** Matte, high-contrast, snappy. Nothing here should look expensive. */
export const raw: Preset = {
  engine: 'exploded',
  key: 'raw',
  label: 'Raw — skate',
  brand: 'Raw',
  tagline: 'Built to get destroyed',
  figure: 'deck',
  mood: {
    roughness: 0.66, metalness: 0.04, envIntensity: 0.35,
    tint: 0.3, fresnel: 0.1, fresnelVelocity: 0.5, fresnelPower: 3.4,
    bloomIntensity: 0.22, bloomThreshold: 0.98, grain: 0.28, vignette: 0.3, aberration: 1.5,
    // Snappier damping: streetwear should feel like it snaps, not floats.
    damping: 0.62, tilt: -0.05, distance: 6.1,
    ambient: 0.85, key: 3.2, rim: 26,
    debris: { count: 5, scale: 1.15, kinds: ['box', 'icosa', 'box'] },
    figurePosition: [2.3, 0.35, -2.4], figureScale: 0.95,
  },
  sections: [
    { id: 'hero', word: 'RAW', bg: '#0b0b0a', fg: '#edede4', word3d: '#c6ff00', accent: '#ff3b1f',
      kicker: 'Decks / Trucks / Nothing else', title: 'Built to get destroyed.',
      body: 'Seven-ply hard rock maple. No graphics that survive a week. If it still looks new, you are not using it.' },
    { id: 'grind', word: 'GRIND', bg: '#c6ff00', fg: '#0b0b0a', word3d: '#0b0b0a', accent: '#ff3b1f',
      kicker: '01 — The deck', title: 'Pressed one at a time. Ridden into the ground.',
      body: 'Cold-pressed for nine hours in single moulds, so the concave is the same on the last board as the first.',
      facts: [['7', 'ply maple'], ['9h', 'cold press'], ['1', 'board per mould']] },
    { id: 'send', word: 'SEND', bg: '#ff3b1f', fg: '#edede4', word3d: '#edede4', accent: '#c6ff00',
      kicker: '02 — The trucks', title: 'Cast, not forged. Heavy on purpose.',
      body: 'A truck that never bends teaches you nothing. Ours give a little, then hold. You will know the difference on the first drop.',
      facts: [['149', 'mm axle'], ['52°', 'kingpin'], ['A5', 'alloy']] },
    { id: 'deck', word: 'DECK', bg: '#edede4', fg: '#0b0b0a', word3d: '#0b0b0a', accent: '#ff3b1f',
      kicker: '03 — The wheels', title: 'Hard enough to slide. Soft enough to land.',
      body: 'Ninety-nine A. Slides clean on polished concrete, still survives the walk home over bad pavement.',
      facts: [['99a', 'durometer'], ['54', 'mm'], ['0', 'flat spots']] },
    { id: 'crew', word: 'CREW', bg: '#0b0b0a', fg: '#edede4', word3d: '#c6ff00', accent: '#edede4',
      kicker: '04 — The team', title: 'No pros. Just people who go out.',
      body: 'We do not pay anyone to skate. We just make the boards and show up on Sunday. Come find us.' },
  ],
}
