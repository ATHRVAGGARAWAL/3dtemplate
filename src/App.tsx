import { MotionConfig } from 'motion/react'
import { Footer } from './sections/Footer'
import { Section } from './sections/Section'
import { SmoothScroll } from './scroll/SmoothScroll'
import { SECTIONS } from './theme'
import { StickyCanvas } from './three/StickyCanvas'
import { Nav } from './ui/Nav'
import { ScrollRail } from './ui/ScrollRail'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
      <StickyCanvas />
      <Nav />
      <ScrollRail />

      <main id="main" className="relative z-10">
        {SECTIONS.map((section, i) => (
          <Section key={section.id} def={section} index={i} total={SECTIONS.length} />
        ))}
      </main>

      <Footer />
      </SmoothScroll>
    </MotionConfig>
  )
}
