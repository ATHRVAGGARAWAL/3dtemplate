import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { PRESETS, PRESET_KEYS, setPreset, usePresetKey } from '../themes'
import { EASE } from './Reveal'

/**
 * Template affordance rather than site chrome: swaps the whole brand — palette,
 * copy, 3D word, figure and post-processing mood — without a reload. Delete
 * this component and pass `?theme=<key>` if you are shipping a single brand.
 */
export function PresetSwitcher() {
  const active = usePresetKey()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2">
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="flex flex-col gap-1 rounded-2xl border border-current/20 bg-[var(--bg)] p-1.5"
          >
            {PRESET_KEYS.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setPreset(key)}
                  className="relative flex w-48 items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left font-mono text-[10px] tracking-[0.14em] uppercase"
                >
                  {key === active && (
                    <motion.span
                      layoutId="preset-active"
                      className="absolute inset-0 rounded-xl border border-current/40"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  {/* Swatch reads straight off the preset so it can never drift. */}
                  <span className="relative flex shrink-0 overflow-hidden rounded-full border border-current/25">
                    {[PRESETS[key].sections[0].bg, PRESETS[key].sections[0].word3d, PRESETS[key].sections[0].accent].map(
                      (c) => (
                        <span key={c} style={{ background: c }} className="block h-3.5 w-2.5" />
                      ),
                    )}
                  </span>
                  <span className="relative" style={{ opacity: key === active ? 1 : 0.55 }}>
                    {PRESETS[key].label}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        className="rounded-full border border-current/30 bg-[var(--bg)] px-3.5 py-2 font-mono text-[10px] tracking-[0.16em] uppercase"
      >
        {open ? 'Close' : `Theme — ${PRESETS[active].brand}`}
      </motion.button>
    </div>
  )
}
