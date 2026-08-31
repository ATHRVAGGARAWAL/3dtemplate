import { MotionConfig } from 'motion/react'
import { Footer } from './sections/Footer'
import { Section } from './sections/Section'
import { SmoothScroll } from './scroll/SmoothScroll'
import { usePreset } from './themes'
import { StickyCanvas } from './three/StickyCanvas'
import { Nav } from './ui/Nav'
import { PresetSwitcher } from './ui/PresetSwitcher'
import { ScrollRail } from './ui/ScrollRail'

export default function App() {
  const sections = usePreset().sections

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
      <StickyCanvas />
      <Nav />
      <ScrollRail />
      <PresetSwitcher />

      <main id="main" className="relative z-10">
        {sections.map((section, i) => (
          <Section key={section.id} def={section} index={i} total={sections.length} />
        ))}
      </main>

      <Footer />
      </SmoothScroll>
    </MotionConfig>
  )
}
