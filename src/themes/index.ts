import { useSyncExternalStore } from 'react'
import { form } from './form'
import { pulp } from './pulp'
import { raw } from './raw'
import { riot } from './riot'
import { vault } from './vault'
import type { Preset } from './types'

export * from './types'
export { FIGURES } from './figures'

export const FONT_URL = '/fonts/helvetiker_bold.typeface.json'

export const PRESETS = { pulp, raw, vault, riot, form } as const
export type PresetKey = keyof typeof PRESETS
export const PRESET_KEYS = Object.keys(PRESETS) as PresetKey[]

function fromUrl(): PresetKey {
  if (typeof window === 'undefined') return 'pulp'
  const q = new URLSearchParams(window.location.search).get('theme')
  return q && q in PRESETS ? (q as PresetKey) : 'pulp'
}

let activeKey: PresetKey = fromUrl()

const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}

const getKey = () => activeKey

/** Read the active preset outside React (scroll loop, useFrame). */
export const getPreset = (): Preset => PRESETS[activeKey]

export function setPreset(key: PresetKey) {
  if (key === activeKey) return
  activeKey = key
  // Keep the URL shareable without a navigation.
  const url = new URL(window.location.href)
  url.searchParams.set('theme', key)
  window.history.replaceState({}, '', url)
  listeners.forEach((fn) => fn())
}

export const usePresetKey = () => useSyncExternalStore(subscribe, getKey, getKey)
export const usePreset = (): Preset => PRESETS[usePresetKey()]

/** Subscribe from non-React code (the scroll loop needs to remeasure). */
export const onPresetChange = subscribe
