import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'
import { Color } from 'three'
import { clamp, smoothstep } from '../lib/math'
import { SECTIONS } from '../theme'
import { setLenis } from './controls'
import { accentColor, bgColor, emit, fgColor, pointer, scroll, wordColor } from './store'

type Rect = { top: number; height: number }

/**
 * Owns the single rAF loop for the page. Each frame it advances Lenis, then
 * derives which section is active and blends every themed colour toward the
 * next one over the final third of the section. Colours are written to CSS
 * custom properties (for HTML) *and* to shared THREE.Color instances (for the
 * 3D scene), so both stay in lockstep without React re-rendering.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // A scroll-driven page must always open at the top; the browser's default
    // scroll restoration would drop you mid-choreography on reload.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = new Lenis({
      lerp: reduced ? 1 : 0.085,
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      autoRaf: false,
    })
    setLenis(lenis)

    let rects: Rect[] = []
    const measure = () => {
      rects = Array.from(document.querySelectorAll<HTMLElement>('[data-section]')).map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top + window.scrollY, height: r.height }
      })
    }
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const root = document.documentElement
    const tmp = new Color()

    const update = () => {
      const vh = window.innerHeight
      const y = lenis.scroll
      const max = document.documentElement.scrollHeight - vh

      scroll.y = y
      scroll.velocity = lenis.velocity
      scroll.progress = max > 0 ? clamp(y / max) : 0

      if (!rects.length) return

      // The section under the viewport centre wins — resilient to sections of
      // differing heights, unlike slicing global progress into equal bands.
      const centre = y + vh * 0.5
      let i = 0
      while (i < rects.length - 1 && centre >= rects[i].top + rects[i].height) i++

      const rect = rects[i]
      const local = clamp((centre - rect.top) / Math.max(rect.height, 1))
      const next = Math.min(i + 1, SECTIONS.length - 1)
      const blend = next === i ? 0 : smoothstep(0.62, 1, local)

      scroll.local = local
      scroll.blend = blend

      const from = SECTIONS[i]
      const to = SECTIONS[next]
      bgColor.set(from.bg).lerp(tmp.set(to.bg), blend)
      fgColor.set(from.fg).lerp(tmp.set(to.fg), blend)
      wordColor.set(from.word3d).lerp(tmp.set(to.word3d), blend)
      accentColor.set(from.accent).lerp(tmp.set(to.accent), blend)

      root.style.setProperty('--bg', `#${bgColor.getHexString()}`)
      root.style.setProperty('--fg', `#${fgColor.getHexString()}`)
      root.style.setProperty('--accent', `#${accentColor.getHexString()}`)

      // Swap the 3D word halfway through the colour handoff so type and
      // background change together instead of fighting each other.
      const wordIndex = blend > 0.5 ? next : i
      const changed = wordIndex !== scroll.wordIndex || i !== scroll.index
      scroll.wordIndex = wordIndex
      scroll.index = i
      if (changed) emit()
    }

    let frame = requestAnimationFrame(function loop(time: number) {
      lenis.raf(time)
      update()
      frame = requestAnimationFrame(loop)
    })

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', onPointerMove)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return <>{children}</>
}
