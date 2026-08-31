import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber'
import { BlendFunction, type ChromaticAberrationEffect } from 'postprocessing'
import { useRef } from 'react'
import { clamp } from '../lib/math'
import { scroll } from '../scroll/store'
import { usePreset } from '../themes'

/**
 * Post stack. The chromatic aberration is the only animated part: its RGB
 * split scales with scroll velocity, so the page smears slightly when you
 * throw it and snaps clean the moment it settles.
 *
 * This requires an opaque canvas — see `Scene.tsx`, which paints the page
 * background into `scene.background`. Running these passes over a transparent
 * canvas would darken the "empty" pixels and reveal the vignette as a ring.
 */
export function Effects() {
  const aberration = useRef<ChromaticAberrationEffect>(null)
  const preset = usePreset()
  const mood = preset.mood

  useFrame((_, dt) => {
    const fx = aberration.current
    if (!fx) return
    const speed = clamp(Math.abs(scroll.velocity) * 0.014, 0, 1)
    const target = (0.0004 + speed * 0.0042) * mood.aberration
    // Manual lerp: the effect exposes a plain Vector2, not a damped property.
    const k = 1 - Math.exp(-9 * dt)
    fx.offset.x += (target - fx.offset.x) * k
    fx.offset.y += (target * 0.55 - fx.offset.y) * k
  })

  return (
    <EffectComposer key={preset.key} multisampling={0}>
      {/* The glyphs are cream (luminance ~0.87), so anything below ~0.95 blooms
          the whole letter body and the page goes milky. Only the fresnel rim,
          which pushes past 1.0, should ever glow. */}
      <Bloom
        mipmapBlur
        intensity={mood.bloomIntensity}
        luminanceThreshold={mood.bloomThreshold}
        luminanceSmoothing={0.12}
        radius={0.55}
      />
      <ChromaticAberration ref={aberration} radialModulation modulationOffset={0.35} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={mood.grain} />
      <Vignette offset={0.5} darkness={mood.vignette} eskil={false} />
    </EffectComposer>
  )
}
