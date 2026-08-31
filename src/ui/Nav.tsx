import { motion } from 'motion/react'
import { scrollTo } from '../scroll/controls'
import { useActiveSection } from '../scroll/store'
import { usePreset } from '../themes'
import { EASE } from './Reveal'

export function Nav() {
  const active = useActiveSection()
  const preset = usePreset()
  const SECTIONS = preset.sections

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-12"
    >
      <motion.button
        type="button"
        onClick={() => scrollTo(0)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        className="pointer-events-auto font-display text-lg font-black tracking-[-0.03em] uppercase"
      >
        {preset.brand}
        <sup className="ml-0.5 align-super text-[0.6em]">®</sup>
      </motion.button>

      <nav className="pointer-events-auto hidden items-center gap-1 md:flex">
        {SECTIONS.map((section, i) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(`#${section.id}`)}
            aria-current={i === active ? 'true' : undefined}
            className="relative rounded-full px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase"
          >
            {/* A single pill that physically slides between items. */}
            {i === active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-full border border-current/60"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <motion.span
              className="relative block"
              animate={{ opacity: i === active ? 1 : 0.45 }}
              transition={{ duration: 0.3 }}
            >
              {section.word}
            </motion.span>
          </button>
        ))}
      </nav>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="pointer-events-auto rounded-full border border-current px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase"
      >
        Buy
      </motion.button>
    </motion.header>
  )
}
