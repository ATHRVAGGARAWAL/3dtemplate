import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { clamp } from '../lib/math'
import { scrollTo } from '../scroll/controls'
import { useActiveSection } from '../scroll/store'
import { usePreset } from '../themes'

const THUMB_H = 54

/** Where each section starts, as a 0→1 fraction of total scrollable distance. */
function useSectionRatios() {
  const [ratios, setRatios] = useState<number[]>([])

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
      setRatios(
        max <= 0
          ? els.map((_, i) => i / Math.max(els.length - 1, 1))
          : els.map((el) => clamp((el.getBoundingClientRect().top + window.scrollY) / max)),
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return ratios
}

/**
 * Replaces the native scrollbar. The thumb follows Motion's `scrollYProgress`
 * through a spring, and the track is click- and drag-seekable — dragging hands
 * off to Lenis in `immediate` mode so the thumb tracks the cursor 1:1 instead
 * of easing behind it.
 */
export function ScrollRail() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackH, setTrackH] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const active = useActiveSection()
  const ratios = useSectionRatios()
  const SECTIONS = usePreset().sections

  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 260, damping: 40, mass: 0.35 })
  const y = useTransform(smooth, [0, 1], [0, Math.max(trackH - THUMB_H, 0)])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setTrackH(el.getBoundingClientRect().height))
    ro.observe(el)
    setTrackH(el.getBoundingClientRect().height)
    return () => ro.disconnect()
  }, [])

  const seek = (clientY: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const usable = Math.max(rect.height - THUMB_H, 1)
    const ratio = clamp((clientY - rect.top - THUMB_H / 2) / usable)
    const max = document.documentElement.scrollHeight - window.innerHeight
    scrollTo(ratio * max, { immediate: true })
  }

  const expanded = hovered || dragging

  return (
    <>
      {/* Mobile: the rail is too fiddly at phone width, so fall back to a
          hairline progress bar pinned to the top edge. */}
      <motion.div
        style={{ scaleX: smooth }}
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[2px] origin-left bg-current md:hidden"
      />

    <motion.div
      className="pointer-events-none fixed top-1/2 right-3 z-30 hidden h-[46svh] -translate-y-1/2 md:flex md:flex-col md:items-end md:gap-3"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="font-mono text-[10px] tracking-[0.18em] tabular-nums">
        {String(active + 1).padStart(2, '0')}
        <span className="opacity-40">/{String(SECTIONS.length).padStart(2, '0')}</span>
      </span>

      <div
        ref={trackRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragging(true)
          seek(e.clientY)
        }}
        onPointerMove={(e) => dragging && seek(e.clientY)}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId)
          setDragging(false)
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className="pointer-events-auto relative w-4 flex-1 cursor-grab touch-none active:cursor-grabbing"
        role="scrollbar"
        aria-controls="main"
        aria-orientation="vertical"
        aria-valuenow={Math.round(((active + 1) / SECTIONS.length) * 100)}
      >
        {/* hairline track */}
        <div className="absolute inset-y-0 right-[7px] w-px bg-current/25" />

        {/* one tick per section, click to jump */}
        {ratios.map((ratio, i) => (
          <button
            key={SECTIONS[i]?.id ?? i}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              scrollTo(`#${SECTIONS[i].id}`)
            }}
            style={{ top: `calc(${ratio * 100}% - 4px)` }}
            className="absolute right-0 flex h-2 w-4 items-center justify-end"
            aria-label={`Go to ${SECTIONS[i]?.word}`}
          >
            <motion.span
              className="block h-px bg-current"
              animate={{ width: i === active ? 14 : 7, opacity: i === active ? 1 : 0.4 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </button>
        ))}

        {/* thumb */}
        <motion.div
          style={{ y, height: THUMB_H }}
          animate={{ width: expanded ? 4 : 2 }}
          transition={{ duration: 0.2 }}
          className="absolute top-0 right-[6px] rounded-full bg-current"
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.25 }}
            className="font-mono text-[10px] tracking-[0.18em] uppercase"
          >
            {SECTIONS[active]?.word}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  )
}
