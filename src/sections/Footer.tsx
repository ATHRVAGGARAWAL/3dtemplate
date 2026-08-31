import { usePreset } from '../themes'

export function Footer() {
  const preset = usePreset()
  return (
    <footer className="relative z-10 border-t border-current/20 px-6 py-10 md:px-12">
      <div className="flex flex-col gap-4 font-mono text-[10px] tracking-[0.16em] uppercase opacity-65 md:flex-row md:items-center md:justify-between">
        <p>
          {preset.brand}® — {preset.tagline}
        </p>
        <p>React Three Fiber · Lenis · Motion</p>
      </div>
    </footer>
  )
}
