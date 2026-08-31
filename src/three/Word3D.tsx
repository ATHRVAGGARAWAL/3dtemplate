import { Text3D } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { clamp, hashSigned } from '../lib/math'
import { accentColor, pointer, scroll, useActiveWord, wordColor } from '../scroll/store'
import { FONT_URL, SECTIONS } from '../theme'
import { createTypeMaterial, type TypeMaterial } from './typeMaterial'
import { useWordLayout } from './useWordLayout'

const SIZE = 1

type LetterProps = {
  char: string
  homeX: number
  pivot: number
  capHeight: number
  index: number
  active: boolean
  seed: number
  shared: TypeMaterial
}

/**
 * One extruded character. Nothing here is set directly from scroll position —
 * every property is *damped toward* a scroll-derived target, which is what
 * makes the type feel weighted instead of glued to the scrollbar.
 */
function Letter({ char, homeX, pivot, capHeight, index, active, seed, shared }: LetterProps) {
  const group = useRef<Group>(null!)

  // Stable per-letter scatter direction, so the "break apart" pose is the same
  // on every reload instead of shimmering between renders.
  const rand = useMemo(
    () => ({
      x: hashSigned(seed * 3.1),
      y: hashSigned(seed * 7.7),
      z: hashSigned(seed * 5.3),
      rx: hashSigned(seed * 11.9),
      ry: hashSigned(seed * 13.7),
      rz: hashSigned(seed * 17.3),
      phase: hashSigned(seed * 23.1) * Math.PI,
    }),
    [seed],
  )

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return

    // Later letters carry a longer smoothTime, which cascades them into place.
    const smooth = active ? 0.34 + index * 0.055 : 0.26 + index * 0.03

    if (active) {
      const t = state.clock.elapsedTime
      const float = Math.sin(t * 0.9 + rand.phase) * 0.045
      // Fast scrolling splays the letters apart along Z, then they settle.
      const splay = clamp(scroll.velocity * 0.018, -1, 1) * rand.z * 0.9

      damp3(g.position, [homeX, float, splay], smooth, dt)
      dampE(g.rotation, [float * 0.35, splay * 0.5, rand.rz * 0.03], smooth, dt)
      damp3(g.scale, 1, smooth, dt)
    } else {
      damp3(g.position, [homeX * 2.4 + rand.x * 2, rand.y * 3.4, -7.5], smooth, dt)
      dampE(g.rotation, [rand.rx * 2.4, rand.ry * 3, rand.rz * 1.8], smooth, dt)
      damp3(g.scale, 0.0001, smooth, dt)
    }

    // Skip submitting draw calls for words that have fully collapsed.
    g.visible = g.scale.x > 0.004
  })

  return (
    <group ref={group}>
      <Text3D
        font={FONT_URL}
        size={SIZE}
        height={0.24}
        curveSegments={6}
        bevelEnabled
        bevelThickness={0.018}
        bevelSize={0.014}
        bevelOffset={0}
        bevelSegments={3}
        position={[-pivot, -capHeight / 2, 0]}
      >
        {char}
        <primitive object={shared.material} attach="material" />
      </Text3D>
    </group>
  )
}

function Word({
  word,
  index,
  active,
  shared,
}: {
  word: string
  index: number
  active: boolean
  shared: TypeMaterial
}) {
  const { letters, width, capHeight } = useWordLayout(word, SIZE, 0.02)
  const viewport = useThree((state) => state.viewport)

  // Fit the word to the viewport so it reads the same on a phone and a 5K display.
  const fit = Math.min((viewport.width * 0.78) / width, viewport.height * 0.38)

  return (
    <group scale={fit}>
      {letters.map((letter, i) =>
        letter.drawable ? (
          <Letter
            key={`${word}-${i}`}
            char={letter.char}
            homeX={letter.x}
            pivot={letter.pivot}
            capHeight={capHeight}
            index={i}
            active={active}
            seed={index * 31 + i * 7 + 1}
            shared={shared}
          />
        ) : null,
      )}
    </group>
  )
}

/**
 * All words are mounted at once and simply scaled to nothing when inactive.
 * Building the extruded geometry is the expensive part, so we pay it up front
 * rather than hitching the scroll with a mid-flight geometry build.
 */
export function WordStack() {
  const root = useRef<Group>(null!)
  const activeWord = useActiveWord()

  const shared = useMemo(() => createTypeMaterial(), [])
  useEffect(() => () => shared.material.dispose(), [shared])

  useFrame((_, dt) => {
    const g = root.current
    if (!g) return

    // Colours ride the same blended values the HTML uses, so type and page
    // never disagree mid-transition.
    shared.material.color.copy(wordColor)
    shared.uniforms.uGradient.value.copy(accentColor)
    shared.uniforms.uAccent.value.copy(accentColor)
    // Scrolling hard lights the rim, which the bloom pass then picks up.
    const speed = clamp(Math.abs(scroll.velocity) * 0.02, 0, 1)
    damp(shared.uniforms.uFresnel, 'value', 0.16 + speed * 0.85, 0.25, dt)
    // A little scroll-driven yaw plus pointer parallax gives the type volume.
    const yaw = (scroll.local - 0.5) * 0.5 + pointer.x * 0.22
    const pitch = -pointer.y * 0.14
    dampE(g.rotation, [pitch, yaw, 0], 0.5, dt)
    // Sit slightly above centre so the word clears the copy pinned to the
    // bottom of every section.
    damp(g.position, 'y', 0.35, 0.5, dt)
    damp(g.position, 'z', scroll.blend * -0.9, 0.5, dt)
  })

  return (
    <group ref={root}>
      {SECTIONS.map((section, i) => (
        <Word key={section.id} word={section.word} index={i} active={i === activeWord} shared={shared} />
      ))}
    </group>
  )
}
