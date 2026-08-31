import { pulp } from './pulp'
import type { Preset } from './types'

export * from './types'
export { FIGURES } from './figures'

export const FONT_URL = '/fonts/helvetiker_bold.typeface.json'

/** The brand. Everything content-facing lives in `pulp.ts`. */
export const PRESET: Preset = pulp

/**
 * Kept as a hook rather than a bare import so the scene, HTML and UI all read
 * the brand through one accessor — swapping in a different preset file, or
 * reintroducing a registry, stays a one-file change.
 */
export const usePreset = (): Preset => PRESET

/** Non-React readers: the scroll loop and `useFrame`. */
export const getPreset = (): Preset => PRESET
