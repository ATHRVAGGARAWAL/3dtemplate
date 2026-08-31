import type { Preset } from './types'

/**
 * Dark preset — the one case where a low bloom threshold is safe, because
 * almost nothing in frame is bright. That is what lets the rim light carry.
 */
export const vault: Preset = {
  engine: 'filmstrip',
  key: 'vault',
  label: 'Vault — fintech',
  brand: 'Vault',
  tagline: 'Money at thought speed',
  figure: 'vault',
  mood: {
    roughness: 0.12, metalness: 0.88, envIntensity: 1.5,
    tint: 0.5, fresnel: 0.42, fresnelVelocity: 1.6, fresnelPower: 2.1,
    bloomIntensity: 0.95, bloomThreshold: 0.62, grain: 0.06, vignette: 0.42, aberration: 1.3,
    damping: 1.15, tilt: 0, distance: 6.6,
    ambient: 0.5, key: 1.6, rim: 90,
    debris: { count: 7, scale: 0.8, kinds: ['icosa', 'torus', 'capsule'] },
    figurePosition: [2.6, -0.1, -2.3], figureScale: 1.05,
  },
  sections: [
    { id: 'hero', word: 'VAULT', bg: '#08080f', fg: '#e6e6f2', word3d: '#6c4cff', accent: '#22e5c8',
      kicker: 'Custody / Settlement / Proof', title: 'Money that moves at the speed of thought.',
      body: 'Self-custody without the seed phrase anxiety. Keys split across three devices, recoverable by people you already trust.' },
    { id: 'yield', word: 'YIELD', bg: '#6c4cff', fg: '#e6e6f2', word3d: '#22e5c8', accent: '#e6e6f2',
      kicker: '01 — Returns', title: 'Interest that is not a marketing number.',
      body: 'Rates come from overcollateralised lending against liquid assets only. When the rate drops, we say so on the same screen you deposit from.',
      facts: [['4.8%', 'current apy'], ['0', 'lockup days'], ['150%', 'min collateral']] },
    { id: 'proof', word: 'PROOF', bg: '#0e1230', fg: '#e6e6f2', word3d: '#22e5c8', accent: '#6c4cff',
      kicker: '02 — Reserves', title: 'Solvency you can check yourself.',
      body: 'A Merkle proof of every balance, republished hourly. Your leaf is in the app. Verify it against the root without asking us for anything.',
      facts: [['1h', 'proof cadence'], ['1:1', 'reserve ratio'], ['0', 'rehypothecation']] },
    { id: 'flow', word: 'FLOW', bg: '#22e5c8', fg: '#08080f', word3d: '#08080f', accent: '#6c4cff',
      kicker: '03 — Settlement', title: 'Finality in under two seconds.',
      body: 'Payments settle on-chain but clear against our float first, so the person on the other end sees the money before the block does.',
      facts: [['1.4s', 'median clear'], ['0.1%', 'fee'], ['24/7', 'settlement']] },
    { id: 'send', word: 'SEND', bg: '#08080f', fg: '#e6e6f2', word3d: '#6c4cff', accent: '#22e5c8',
      kicker: '04 — Get started', title: 'Open an account in ninety seconds.',
      body: 'No minimum, no waitlist, no call with a relationship manager. Move a dollar first and see if you like it.' },
  ],
}
