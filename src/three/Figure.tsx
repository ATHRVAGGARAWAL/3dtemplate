import { useFrame } from '@react-three/fiber'
import { damp3, dampE } from 'maath/easing'
import { useMemo, useRef } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { hashSigned } from '../lib/math'
import { accentColor, bgColor, fgColor, scroll, wordColor } from '../scroll/store'
import { FIGURES, usePreset, type Part, type Tone } from '../themes'

const TONES = { word: wordColor, accent: accentColor, fg: fgColor, bg: bgColor }

function Geometry({ part }: { part: Part }) {
  const a = part.args
  switch (part.kind) {
    case 'box':
      return <boxGeometry args={[a[0], a[1], a[2]]} />
    case 'cyl':
      return <cylinderGeometry args={[a[0], a[1], a[2], a[3]]} />
    case 'sphere':
      return <sphereGeometry args={[a[0], a[1], a[2]]} />
    case 'torus':
      return <torusGeometry args={[a[0], a[1], a[2], a[3]]} />
    default:
      return <coneGeometry args={[a[0], a[1], a[2]]} />
  }
}

/**
 * One primitive of the figure. Each part damps between an exploded pose and
 * its home pose, staggered by index — so the object assembles itself as a
 * section settles and comes apart again as you leave.
 */
function FigurePart({ part, index, seed, damping }: { part: Part; index: number; seed: number; damping: number }) {
  const group = useRef<Group>(null!)
  const mesh = useRef<Mesh>(null!)

  const rand = useMemo(
    () => ({
      x: hashSigned(seed * 3.7),
      y: hashSigned(seed * 9.1),
      z: hashSigned(seed * 5.9),
      rx: hashSigned(seed * 12.3),
      ry: hashSigned(seed * 15.1),
    }),
    [seed],
  )

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return

    // Assembled through the middle of a section, apart at the seams.
    const settle = Math.min(scroll.local / 0.28, (1 - scroll.local) / 0.28, 1)
    const apart = 1 - Math.max(settle, 0)
    const smooth = (0.4 + index * 0.03) * damping

    damp3(
      g.position,
      [
        part.pos[0] + rand.x * apart * 2.2,
        part.pos[1] + rand.y * apart * 1.8,
        part.pos[2] + rand.z * apart * 1.6,
      ],
      smooth,
      dt,
    )
    dampE(
      g.rotation,
      [
        (part.rot?.[0] ?? 0) + rand.rx * apart * 1.4,
        (part.rot?.[1] ?? 0) + rand.ry * apart * 1.4,
        part.rot?.[2] ?? 0,
      ],
      smooth,
      dt,
    )

    const material = mesh.current?.material as MeshStandardMaterial | undefined
    if (material) material.color.copy(TONES[part.tone as Tone])
  })

  return (
    <group ref={group}>
      <mesh ref={mesh}>
        <Geometry part={part} />
        <meshStandardMaterial roughness={0.35} metalness={0.25} />
      </mesh>
    </group>
  )
}

/**
 * The brand's hero object. Built entirely from primitives described as data in
 * `themes/figures.ts`, so a new brand needs a shape list, not a new component.
 */
export function Figure() {
  const preset = usePreset()
  const root = useRef<Group>(null!)
  const parts = FIGURES[preset.figure]
  const { figurePosition, figureScale, damping } = preset.mood

  useFrame((state, dt) => {
    const g = root.current
    if (!g) return
    const t = state.clock.elapsedTime
    // Slow idle turn plus a scroll-driven quarter rotation per section.
    dampE(
      g.rotation,
      [Math.sin(t * 0.25) * 0.12, t * 0.16 + scroll.progress * Math.PI * 1.4, Math.cos(t * 0.2) * 0.06],
      0.6 * damping,
      dt,
    )
    damp3(g.position, [figurePosition[0], figurePosition[1] + Math.sin(t * 0.5) * 0.09, figurePosition[2]], 0.6, dt)
  })

  return (
    <group ref={root} scale={figureScale}>
      {parts.map((part, i) => (
        <FigurePart key={`${preset.figure}-${i}`} part={part} index={i} seed={i * 13 + 3} damping={damping} />
      ))}
    </group>
  )
}
