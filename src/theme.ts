export type SectionDef = {
  id: string
  /** The word rendered as extruded 3D type while this section is active. */
  word: string
  /** Page background for this section. */
  bg: string
  /** HTML foreground/text colour that stays legible on `bg`. */
  fg: string
  /** Colour of the extruded 3D word. */
  word3d: string
  /** Secondary pop colour used for rules, chips and floating debris. */
  accent: string
  kicker: string
  title: string
  body: string
  facts?: [string, string][]
}

/**
 * Section order defines the whole experience: the page background, the HTML
 * copy and the 3D word all key off this one array. Add a section here and the
 * scroll choreography picks it up with no other changes.
 */
export const SECTIONS: SectionDef[] = [
  {
    id: 'hero',
    word: 'PULP',
    bg: '#ff5b04',
    fg: '#17170a',
    word3d: '#e9ebd2',
    accent: '#bccc32',
    kicker: 'Sparkling / Zero sugar / Cold-pressed',
    title: 'Outdoor inside.',
    body: 'Cold-pressed citrus and wild hops in a can. Built for long days and short attention spans.',
  },
  {
    id: 'taste',
    word: 'FRESH',
    bg: '#bccc32',
    fg: '#17170a',
    word3d: '#ff5b04',
    accent: '#45530f',
    kicker: '01 — The taste',
    title: 'Bitter, bright, unreasonably crisp.',
    body: 'Whole-cone hops steeped cold for eighteen hours, then cut with pressed blood orange. No concentrate, no shortcuts, no aftertaste.',
    facts: [
      ['18h', 'cold steep'],
      ['3', 'hop varieties'],
      ['0', 'concentrate'],
    ],
  },
  {
    id: 'zero',
    word: 'ZERO',
    bg: '#e9ebd2',
    fg: '#17170a',
    word3d: '#ff5b04',
    accent: '#bccc32',
    kicker: '02 — Target zero',
    title: 'Everything you wanted. Nothing you did not.',
    body: 'We took the long way around so the label could stay short. Four zeros, one ingredient list you can read out loud.',
    facts: [
      ['0g', 'sugar'],
      ['0', 'calories'],
      ['0%', 'alcohol'],
      ['0', 'colouring'],
    ],
  },
  {
    id: 'punch',
    word: 'PUNCH',
    bg: '#45530f',
    fg: '#e9ebd2',
    word3d: '#bccc32',
    accent: '#ff5b04',
    kicker: '03 — Flower power',
    title: 'Hops do more than flavour.',
    body: 'Humulus lupulus carries xanthohumol and a stack of B-vitamins. We kept them in instead of boiling them off.',
    facts: [
      ['B3', 'niacin'],
      ['B6', 'pyridoxine'],
      ['B12', 'cobalamin'],
    ],
  },
  {
    id: 'drop',
    word: 'DROP',
    bg: '#ff5b04',
    fg: '#17170a',
    word3d: '#45530f',
    accent: '#e9ebd2',
    kicker: '04 — Leave no trace',
    title: 'Infinitely recyclable. Get one.',
    body: 'Aluminium, forever. The can in your hand can be back on a shelf in sixty days.',
  },
]

export const FONT_URL = '/fonts/helvetiker_bold.typeface.json'
