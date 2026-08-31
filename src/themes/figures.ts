import type { FigureKind, Part } from './types'

const P = Math.PI

/** Four wheels + two trucks, generated rather than typed out. */
const skateUnders = (): Part[] =>
  [0.95, -0.95].flatMap((x): Part[] => [
    { kind: 'box', args: [0.16, 0.3, 0.55], pos: [x, -0.26, 0], tone: 'accent' },
    ...[0.34, -0.34].map(
      (z): Part => ({
        kind: 'cyl',
        args: [0.18, 0.18, 0.14, 18],
        pos: [x, -0.44, z],
        rot: [P / 2, 0, 0],
        tone: 'accent',
      }),
    ),
  ])

/** Six bolts around the vault door face. */
const vaultBolts = (): Part[] =>
  Array.from({ length: 6 }, (_, i): Part => {
    const a = (i / 6) * P * 2
    return {
      kind: 'cyl',
      args: [0.07, 0.07, 0.12, 12],
      pos: [Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0.22],
      rot: [P / 2, 0, 0],
      tone: 'accent',
    }
  })

/**
 * Every figure is plain data: a list of primitives with a home pose and a
 * colour role. One generic component (`Figure.tsx`) renders and animates all
 * of them, so adding a new brand is a matter of describing shapes, not
 * writing another component.
 */
export const FIGURES: Record<FigureKind, Part[]> = {
  // Drinks can — body, rims, label band, ring pull.
  can: [
    { kind: 'cyl', args: [0.55, 0.55, 1.7, 40], pos: [0, 0, 0], tone: 'word' },
    { kind: 'cyl', args: [0.5, 0.56, 0.13, 40], pos: [0, 0.9, 0], tone: 'accent' },
    { kind: 'cyl', args: [0.56, 0.5, 0.13, 40], pos: [0, -0.9, 0], tone: 'accent' },
    { kind: 'cyl', args: [0.575, 0.575, 0.46, 40], pos: [0, 0.06, 0], tone: 'accent' },
    { kind: 'torus', args: [0.13, 0.032, 10, 22], pos: [0, 1.0, 0.16], rot: [P / 2, 0, 0], tone: 'fg' },
  ],

  // Skate deck — plank with kicked nose and tail.
  deck: [
    { kind: 'box', args: [2.9, 0.13, 0.82], pos: [0, 0, 0], tone: 'word' },
    { kind: 'box', args: [0.62, 0.13, 0.78], pos: [1.66, 0.11, 0], rot: [0, 0, 0.36], tone: 'word' },
    { kind: 'box', args: [0.62, 0.13, 0.78], pos: [-1.66, 0.11, 0], rot: [0, 0, -0.36], tone: 'word' },
    { kind: 'box', args: [2.9, 0.025, 0.24], pos: [0, 0.08, 0], tone: 'accent' },
    ...skateUnders(),
  ],

  // Vault door — disc, rings, spoked handle.
  vault: [
    { kind: 'cyl', args: [1.12, 1.12, 0.36, 56], pos: [0, 0, 0], rot: [P / 2, 0, 0], tone: 'word' },
    { kind: 'torus', args: [1.16, 0.09, 14, 56], pos: [0, 0, 0.02], tone: 'accent' },
    { kind: 'torus', args: [0.7, 0.06, 12, 44], pos: [0, 0, 0.22], tone: 'accent' },
    { kind: 'box', args: [1.5, 0.11, 0.11], pos: [0, 0, 0.26], tone: 'accent' },
    { kind: 'box', args: [1.5, 0.11, 0.11], pos: [0, 0, 0.26], rot: [0, 0, P / 2], tone: 'accent' },
    { kind: 'sphere', args: [0.23, 22, 18], pos: [0, 0, 0.32], tone: 'word' },
    ...vaultBolts(),
  ],

  // Festival speaker stack — two cabinets, drivers, horn.
  speaker: [
    { kind: 'box', args: [1.45, 1.05, 0.95], pos: [0, -0.62, 0], tone: 'word' },
    { kind: 'box', args: [1.2, 0.85, 0.85], pos: [0, 0.38, 0], tone: 'word' },
    { kind: 'cyl', args: [0.34, 0.42, 0.2, 26], pos: [0, -0.62, 0.52], rot: [P / 2, 0, 0], tone: 'accent' },
    { kind: 'cyl', args: [0.18, 0.24, 0.16, 22], pos: [-0.27, 0.42, 0.47], rot: [P / 2, 0, 0], tone: 'accent' },
    { kind: 'cone', args: [0.28, 0.42, 22], pos: [0.28, 0.42, 0.55], rot: [-P / 2, 0, 0], tone: 'accent' },
    { kind: 'box', args: [1.3, 0.09, 0.75], pos: [0, 0.86, 0], tone: 'accent' },
    { kind: 'box', args: [1.55, 0.09, 1.05], pos: [0, -1.19, 0], tone: 'accent' },
  ],

  // Architectural massing study — offset slabs and a column.
  tower: [
    { kind: 'box', args: [1.7, 0.24, 1.6], pos: [0, -1.0, 0], tone: 'word' },
    { kind: 'box', args: [1.35, 0.3, 1.4], pos: [0.12, -0.62, -0.06], tone: 'word' },
    { kind: 'box', args: [1.55, 0.22, 1.05], pos: [-0.1, -0.24, 0.1], tone: 'word' },
    { kind: 'box', args: [1.05, 0.36, 1.35], pos: [0.14, 0.16, -0.04], tone: 'word' },
    { kind: 'box', args: [1.3, 0.26, 0.95], pos: [-0.08, 0.58, 0.12], tone: 'word' },
    { kind: 'box', args: [0.72, 0.52, 0.72], pos: [0.06, 1.06, 0], tone: 'word' },
    { kind: 'box', args: [0.11, 2.9, 0.11], pos: [0.86, 0.05, 0.82], tone: 'accent' },
    { kind: 'box', args: [0.11, 2.9, 0.11], pos: [-0.86, 0.05, -0.82], tone: 'accent' },
  ],
}
