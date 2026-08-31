import type Lenis from 'lenis'

/**
 * Kept in its own module so `SmoothScroll.tsx` only ever exports a component.
 * Mixing a component and a plain function in one file breaks React Fast
 * Refresh, forcing a full page reload (and a 3D re-init) on every edit.
 */
let instance: Lenis | null = null

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis
}

/** Programmatic scrolling, e.g. from nav links or the custom scrollbar. */
export const scrollTo = (target: string | number, opts?: { immediate?: boolean; duration?: number }) =>
  instance?.scrollTo(target, {
    duration: opts?.duration ?? 1.4,
    immediate: opts?.immediate ?? false,
    lock: opts?.immediate ?? false,
  })
