import { motion } from 'motion/react'
import { Reveal } from '../ui/Reveal'
import type { SectionDef } from '../theme'

/**
 * Copy is deliberately pinned to the top and bottom edges: the middle band of
 * every section is left empty so the fixed 3D word shows through it.
 */
export function Section({ def, index, total }: { def: SectionDef; index: number; total: number }) {
  const isFirst = index === 0
  const isLast = index === total - 1

  return (
    <section
      id={def.id}
      data-section
      className="relative flex min-h-[100svh] flex-col justify-between px-6 py-20 md:px-12 md:py-20"
    >
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-70">{def.kicker}</p>
      </Reveal>

      <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-12 md:gap-6">
        <Reveal delay={80} className="md:col-span-6">
          <h2
            className={`font-display font-black tracking-[-0.035em] text-balance ${
              isFirst
                ? 'text-[clamp(2.1rem,5.2vw,4.25rem)] leading-[0.92]'
                : 'text-[clamp(1.7rem,3.6vw,3.1rem)] leading-[0.95]'
            }`}
          >
            {def.title}
          </h2>
        </Reveal>

        <Reveal delay={180} className="md:col-span-4 md:col-start-9">
          <p className="max-w-sm font-mono text-sm leading-relaxed opacity-80">{def.body}</p>

          {def.facts && (
            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-t border-current/25 pt-5">
              {def.facts.map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl font-black tracking-[-0.02em]" style={{ color: 'var(--accent)' }}>
                    {value}
                  </dt>
                  <dd className="mt-0.5 font-mono text-[10px] tracking-[0.16em] uppercase opacity-65">{label}</dd>
                </div>
              ))}
            </dl>
          )}

          {isLast && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="mt-8 rounded-full border border-current px-6 py-2.5 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors hover:bg-current hover:text-[var(--bg)]"
            >
              Get a case →
            </motion.button>
          )}

          {isFirst && (
            <p className="mt-8 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">
              <motion.span
                className="inline-block h-4 w-px origin-top bg-current"
                animate={{ scaleY: [0.2, 1, 0.2], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              Scroll
            </p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
