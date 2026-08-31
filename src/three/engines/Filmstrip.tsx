import { Center, Text3D } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { damp3, dampE } from 'maath/easing'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { hashSigned } from '../../lib/math'
import { accentColor, bgColor, pointer, scroll, wordColor } from '../../scroll/store'
import { FIGURES, FONT_URL, usePreset } from '../../themes'

/** World-space gap between stations. */
const SPACING = 13

/**
 * Depth layers. Because the camera translates sideways, perspective produces
 * the parallax for free: far things drift slowly, near things whip past. No
 * per-layer speed multiplier is needed, and faking one would look wrong.
 */
const LAYERS = [
  { z: -34, scale: 5.5, count: 14, opacity: 0.5 },
  { z: -16, scale: 2.4, count: 10, opacity: 0.8 },
  { z: 3.5, scale: 1.1, count: 7, opacity: 1 },
]

function Backdrop() {
  const { mood } = usePreset()
  const groups = useRef<Group[]>([])

  useFrame(() => {
    for (const g of groups.current) if (g) g.rotation.z += 0.0004
  })

  return (
    <>
      {LAYERS.map((layer, li) => (
        <group
          key={li}
          ref={(el) => {
            if (el) groups.current[li] = el
          }}
        >
          {Array.from({ length: layer.count }, (_, i) => {
            const seed = li * 31 + i * 7
            return (
              <mesh
                key={i}
                position={[
                  (i / layer.count) * SPACING * 5.5 + hashSigned(seed) * 4,
                  hashSigned(seed * 3.1) * 6,
                  layer.z + hashSigned(seed * 5.7) * 3,
                ]}
                rotation={[hashSigned(seed * 2.3) * 3, hashSigned(seed * 4.1) * 3, 0]}
                scale={layer.scale * (0.6 + Math.abs(hashSigned(seed * 6.3)) * 0.8) * mood.debris.scale}
              >
                {i % 3 === 0 ? (
                  <boxGeometry args={[1, 1, 1]} />
                ) : i % 3 === 1 ? (
                  <torusGeometry args={[0.5, 0.18, 10, 26]} />
                ) : (
                  <icosahedronGeometry args={[0.6, 0]} />
                )}
                <meshStandardMaterial
                  color={li === 2 ? accentColor : wordColor}
                  roughness={0.5}
                  metalness={0.2}
                  transparent
                  opacity={layer.opacity}
                />
              </mesh>
            )
          })}
        </group>
      ))}
    </>
  )
}

/** One stop on the strip: the section's word, with the brand figure beside it. */
function Station({ word, x, figure }: { word: string; x: number; figure: string }) {
  const group = useRef<Group>(null!)
  const parts = FIGURES[figure as keyof typeof FIGURES]

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    // Turn to meet the camera as it arrives, so each station reads face-on at
    // the moment you are level with it and obliquely on either side.
    const dx = state.camera.position.x - x
    dampE(g.rotation, [0, Math.atan2(dx, 9) * 0.55, 0], 0.4, dt)
  })

  return (
    <group ref={group} position={[x, 0, 0]}>
      <Center>
        <Text3D font={FONT_URL} size={1.5} height={0.3} curveSegments={5} bevelEnabled bevelSize={0.014} bevelThickness={0.02}>
          {word}
          <meshStandardMaterial color={wordColor} roughness={0.3} metalness={0.4} />
        </Text3D>
      </Center>

      <group position={[0, -2.4, -1.5]} scale={0.62}>
        {parts.map((part, i) => (
          <mesh key={i} position={part.pos} rotation={part.rot ?? [0, 0, 0]}>
            {part.kind === 'box' ? (
              <boxGeometry args={[part.args[0], part.args[1], part.args[2]]} />
            ) : part.kind === 'cyl' ? (
              <cylinderGeometry args={[part.args[0], part.args[1], part.args[2], part.args[3]]} />
            ) : part.kind === 'sphere' ? (
              <sphereGeometry args={[part.args[0], part.args[1], part.args[2]]} />
            ) : part.kind === 'torus' ? (
              <torusGeometry args={[part.args[0], part.args[1], part.args[2], part.args[3]]} />
            ) : (
              <coneGeometry args={[part.args[0], part.args[1], part.args[2]]} />
            )}
            <meshStandardMaterial
              color={part.tone === 'accent' ? accentColor : wordColor}
              roughness={0.42}
              metalness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Filmstrip engine. Vertical scroll is remapped to a sideways dolly: the page
 * becomes one continuous set you travel along rather than a stack of slides.
 */
export function FilmstripScene() {
  const preset = usePreset()
  const mood = preset.mood
  const scene = useThree((s) => s.scene)
  const stations = useMemo(
    () => preset.sections.map((s, i) => ({ word: s.word, x: i * SPACING })),
    [preset.sections],
  )
  const travel = (preset.sections.length - 1) * SPACING

  useFrame((state, dt) => {
    scene.background = bgColor
    const { camera } = state
    damp3(
      camera.position,
      [scroll.progress * travel + pointer.x * 0.7, pointer.y * 0.5, mood.distance + 1.4],
      0.4 * mood.damping,
      dt,
    )
    // Look slightly ahead of travel so the next station is already entering
    // frame — a dead-ahead camera makes the motion feel like a slideshow.
    camera.lookAt(scroll.progress * travel + 1.6, 0, 0)
  })

  return (
    <>
      <ambientLight intensity={mood.ambient} color={bgColor} />
      <directionalLight position={[6, 8, 10]} intensity={mood.key} />
      <pointLight position={[0, 0, 8]} intensity={mood.rim} distance={40} decay={2} color={accentColor} />
      <Backdrop />
      {stations.map((s) => (
        <Station key={s.x} word={s.word} x={s.x} figure={preset.figure} />
      ))}
    </>
  )
}
