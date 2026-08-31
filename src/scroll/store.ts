import { useSyncExternalStore } from 'react'
import { Color } from 'three'
import { SECTIONS } from '../theme'

/**
 * Per-frame scroll state lives in a plain mutable object rather than React
 * state. `useFrame` reads it 60+ times a second; routing that through React
 * would re-render the tree every frame. Only the *discrete* values (which
 * section is active) are published to React, via `subscribe` below.
 */
export const scroll = {
  /** Smoothed scroll offset in px, straight from Lenis. */
  y: 0,
  /** 0→1 across the entire document. */
  progress: 0,
  /** px/frame, signed. Useful for velocity-reactive effects. */
  velocity: 0,
  /** Index of the section currently under the viewport centre. */
  index: 0,
  /** 0→1 progress *within* the active section. */
  local: 0,
  /** 0→1 handoff weight toward the next section, used for colour blending. */
  blend: 0,
  /** Index of the 3D word being displayed (flips mid-handoff). */
  wordIndex: 0,
}

/**
 * Normalised cursor position in [-1,1]. Sourced from a window listener rather
 * than R3F's `state.pointer`, because the canvas is `pointer-events: none` and
 * therefore never sees a pointermove of its own.
 */
export const pointer = { x: 0, y: 0 }

/** Live blended colours, mutated in place each frame and read by the 3D scene. */
export const bgColor = new Color(SECTIONS[0].bg)
export const fgColor = new Color(SECTIONS[0].fg)
export const wordColor = new Color(SECTIONS[0].word3d)
export const accentColor = new Color(SECTIONS[0].accent)

const listeners = new Set<() => void>()
export const emit = () => listeners.forEach((fn) => fn())

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}

const getIndex = () => scroll.index
const getWordIndex = () => scroll.wordIndex

/** Re-renders only when the active section changes. */
export const useActiveSection = () => useSyncExternalStore(subscribe, getIndex, getIndex)

/** Re-renders only when the displayed 3D word changes. */
export const useActiveWord = () => useSyncExternalStore(subscribe, getWordIndex, getWordIndex)
