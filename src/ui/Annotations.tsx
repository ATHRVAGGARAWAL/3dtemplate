import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { anchors } from '../three/engines/Exploded'
import { useActiveSection } from '../scroll/store'
import { usePreset } from '../themes'

/**
 * HTML labels pinned to projected 3D points, with a leader line drawn back to
 * the piece. Written straight to the DOM on rAF rather than through React —
 * these move every frame and re-rendering would be pointless work.
 *
 * This is the part that makes the exploded engine read as a technical drawing
 * rather than just an object coming apart.
 */
export function Annotations() {
  const preset = usePreset()
  const active = useActiveSection()
  const boxes = useRef<(HTMLDivElement | null)[]>([])
  const lines = useRef<(SVGLineElement | null)[]>([])

  useEffect(() => {
    let frame = requestAnimationFrame(function loop() {
      preset.sections.forEach((_, i) => {
        const anchor = anchors[i]
        const box = boxes.current[i]
        const line = lines.current[i]
        if (!anchor || !box) return

        // Alternate which side the label sits on so adjacent ones do not stack.
        const dx = i % 2 === 0 ? 104 : -104
        // Clamp into the viewport: a piece near the edge of frame would
        // otherwise push its label off-screen entirely.
        const pad = 90
        const lx = Math.min(Math.max(anchor.x + dx, pad), window.innerWidth - pad)
        const ly = Math.min(Math.max(anchor.y, pad), window.innerHeight - pad)

        const on = anchor.visible && i === active
        box.style.opacity = on ? '1' : '0'
        box.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -50%)`

        if (line) {
          line.setAttribute('x1', String(anchor.x))
          line.setAttribute('y1', String(anchor.y))
          line.setAttribute('x2', String(lx - Math.sign(dx) * 46))
          line.setAttribute('y2', String(ly))
          line.style.opacity = on ? '0.55' : '0'
        }
      })
      frame = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(frame)
  }, [preset.sections, active])

  return (
    <div className="pointer-events-none fixed inset-0 z-20" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full">
        {preset.sections.map((section, i) => (
          <line
            key={section.id}
            ref={(el) => {
              lines.current[i] = el
            }}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
            style={{ opacity: 0, transition: 'opacity 400ms' }}
          />
        ))}
      </svg>

      {preset.sections.map((section, i) => (
        <motion.div
          key={section.id}
          ref={(el) => {
            boxes.current[i] = el
          }}
          className="absolute top-0 left-0 whitespace-nowrap font-mono text-[10px] tracking-[0.16em] uppercase"
          style={{ opacity: 0, transition: 'opacity 500ms' }}
        >
          <span className="border border-current/35 px-2 py-1" style={{ color: 'var(--accent)' }}>
            {String(i + 1).padStart(2, '0')} — {section.word}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
