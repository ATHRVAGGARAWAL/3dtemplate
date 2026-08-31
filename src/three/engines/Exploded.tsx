import { Center, Text3D } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { useMemo, useRef } from 'react'
import { Vector3, type Group, type Mesh, type MeshStandardMaterial } from 'three'
import { smoothstep } from '../../lib/math'
import { accentColor, bgColor, pointer, scroll, wordColor } from '../../scroll/store'
import { FIGURES, FONT_URL, usePreset, type Part } from '../../themes'

const TONES = { word: wordColor, accent: accentColor, fg: bgColor, bg: bgColor }
const origin = new Vector3()

/** Screen-space position of each annotated part, written every frame. */
export type Anchor = { x: number; y: number; visible: boolean }
export const anchors: Anchor[] = []

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
 * One component of the assembly. Unlike the stage engine — where parts scatter
 * randomly — each part here slides along the axis it would actually come apart
 * on: its own offset from the assembly's centre. That is what makes it read as
 * a technical drawing rather than an explosion.
 */
function Piece({
  part,
  index,
  total,
  anchorIndex,
  damping,
}: {
  part: Part
  index: number
  total: number
  anchorIndex: number
  damping: number
}) {
  const group = useRef<Group>(null!)
  const mesh = useRef<Mesh>(null!)
  const world = useMemo(() => new Vector3(), [])

  // Direction this piece separates along. Pieces sitting dead centre would
  // have no direction, so they get pushed along +Y as a fallback.
  const axis = useMemo(() => {
    const v = new Vector3(...part.pos)
    return v.lengthSq() < 0.0001 ? new Vector3(0, 1, 0) : v.normalize()
  }, [part.pos])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return

    // Separation ramps up across the section, so each section shows the
    // assembly opening a little further than the last.
    // Kept deliberately tight: separation wide enough to read the assembly,
    // narrow enough that no piece leaves the frustum. Pieces that exit frame
    // take their annotation off-screen with them.
    const spread = smoothstep(0.05, 0.85, scroll.local) * (0.8 + scroll.index * 0.08)
    const distance = spread * (0.85 + (index / total) * 0.9)
    // Staggered by index: outer pieces lead, inner pieces follow.
    const smooth = (0.45 + (index / total) * 0.35) * damping

    damp3(
      g.position,
      [part.pos[0] + axis.x * distance, part.pos[1] + axis.y * distance, part.pos[2] + axis.z * distance],
      smooth,
      dt,
    )
    dampE(g.rotation, [part.rot?.[0] ?? 0, part.rot?.[1] ?? 0, part.rot?.[2] ?? 0], smooth, dt)

    const material = mesh.current?.material as MeshStandardMaterial | undefined
    if (material) material.color.copy(TONES[part.tone])

    // Project this piece to screen space so an HTML label can track it.
    if (anchorIndex >= 0) {
      g.getWorldPosition(world)
      world.project(state.camera)
      const slot = (anchors[anchorIndex] ??= { x: 0, y: 0, visible: false })
      slot.x = (world.x * 0.5 + 0.5) * state.size.width
      slot.y = (-world.y * 0.5 + 0.5) * state.size.height
      slot.visible = world.z < 1
    }
  })

  return (
    <group ref={group}>
      <mesh ref={mesh}>
        <Geometry part={part} />
        <meshStandardMaterial roughness={0.4} metalness={0.15} />
      </mesh>
    </group>
  )
}

/**
 * Exploded-view engine. The object never leaves the centre of frame; scroll
 * pulls it apart and turns it, and the copy is anchored to the pieces rather
 * than to the page.
 */
export function ExplodedScene() {
  const preset = usePreset()
  const parts = FIGURES[preset.figure]
  const mood = preset.mood
  const rig = useRef<Group>(null!)
  const label = useRef<Group>(null!)
  const scene = useThree((s) => s.scene)

  // One annotated piece per section, spread evenly through the assembly.
  const annotated = useMemo(() => {
    const map = new Map<number, number>()
    preset.sections.forEach((_, i) => {
      map.set(Math.floor((i / preset.sections.length) * parts.length), i)
    })
    return map
  }, [preset.sections, parts.length])

  useFrame((state, dt) => {
    scene.background = bgColor

    // A slow turntable: enough to read the assembly in three dimensions,
    // never enough to lose which face you were looking at.
    const g = rig.current
    if (g) {
      const yaw = scroll.progress * Math.PI * 1.15 + pointer.x * 0.28
      const pitch = 0.16 + Math.sin(scroll.progress * Math.PI) * 0.22 - pointer.y * 0.18
      dampE(g.rotation, [pitch, yaw, 0], 0.7 * mood.damping, dt)
    }

    const { camera } = state
    damp3(camera.position, [0, 0, mood.distance + 2.4], 0.6 * mood.damping, dt)
    camera.lookAt(origin)

    if (label.current) {
      damp(label.current.position, 'y', -2.5 - scroll.local * 0.3, 0.6, dt)
    }
  })

  return (
    <>
      <ambientLight intensity={mood.ambient} color={bgColor} />
      <directionalLight position={[5, 7, 6]} intensity={mood.key} />
      <directionalLight position={[-6, -3, -4]} intensity={mood.key * 0.35} color={accentColor} />

      <group ref={rig} scale={1.05}>
        {parts.map((part, i) => (
          <Piece
            key={`${preset.figure}-${i}`}
            part={part}
            index={i}
            total={parts.length}
            anchorIndex={annotated.get(i) ?? -1}
            damping={mood.damping}
          />
        ))}
      </group>

      {/* A part number, set in the 3D space rather than the DOM, so it turns
          with the drawing instead of floating over it. */}
      <group ref={label} position={[0, -2.5, 0]}>
        <Center>
          <Text3D font={FONT_URL} size={0.42} height={0.06} curveSegments={4}>
            {preset.sections[scroll.index]?.word ?? ''}
            <meshStandardMaterial color={accentColor} roughness={0.5} />
          </Text3D>
        </Center>
      </group>
    </>
  )
}
