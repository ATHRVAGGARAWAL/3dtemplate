export const clamp = (v: number, min = 0, max = 1) => (v < min ? min : v > max ? max : v)

/** Hermite ease between two edges — the standard GLSL smoothstep. */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Deterministic pseudo-random in [0,1) so letter scatter is stable across reloads. */
export function hashRandom(seed: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Deterministic pseudo-random in [-1,1). */
export const hashSigned = (seed: number) => hashRandom(seed) * 2 - 1
