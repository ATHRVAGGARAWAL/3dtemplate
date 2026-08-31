import { useFont } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { BufferAttribute, Mesh, NormalBlending, Points, ShaderMaterial, Vector3 } from 'three'
import { MeshSurfaceSampler, TextGeometry } from 'three-stdlib'
import { clamp, smoothstep } from '../../lib/math'
import { accentColor, bgColor, pointer, scroll, wordColor } from '../../scroll/store'
import { FONT_URL, usePreset } from '../../themes'

const COUNT = 30000

const vertexShader = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aSeed;
  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uScatter;
  varying float vSeed;

  void main() {
    vSeed = aSeed;

    // Points arc outward through the midpoint of the morph instead of sliding
    // in straight lines — the bulge is what makes it read as a swarm.
    vec3 pos = mix(aStart, aEnd, uMix);
    float arc = sin(uMix * 3.14159);
    vec3 outward = normalize(pos + 0.001) * arc * uScatter * (0.4 + aSeed);
    pos += outward;

    // Perpetual drift so the field never looks frozen when scrolling stops.
    pos.x += sin(uTime * 0.5 + aSeed * 12.0) * 0.06;
    pos.y += cos(uTime * 0.43 + aSeed * 9.0) * 0.06;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 + aSeed * 0.8) * (14.0 / -mv.z);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;

  void main() {
    // Round the square point sprite off, and fade its edge.
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d);
    if (r > 0.25) discard;
    float alpha = smoothstep(0.25, 0.04, r) * 0.85;
    gl_FragColor = vec4(mix(uColorA, uColorB, vSeed), alpha);
  }
`

/**
 * Samples COUNT points off the surface of each word's extruded geometry, so
 * the field genuinely takes the shape of the letterforms rather than
 * approximating them with a parametric stand-in.
 */
function useWordClouds(words: string[]) {
  const font = useFont(FONT_URL)

  return useMemo(() => {
    const position = new Vector3()

    return words.map((word) => {
      const geometry = new TextGeometry(word, {
        font: font as never,
        size: 1.5,
        height: 0.45,
        curveSegments: 5,
        bevelEnabled: false,
      })
      geometry.center()

      const sampler = new MeshSurfaceSampler(new Mesh(geometry)).build()
      const array = new Float32Array(COUNT * 3)
      for (let i = 0; i < COUNT; i++) {
        sampler.sample(position)
        array.set([position.x, position.y, position.z], i * 3)
      }
      geometry.dispose()
      return array
    })
  }, [font, words])
}

/**
 * Particle engine. One field of 30,000 points is the entire scene — there are
 * no discrete objects to swap, so the page never cuts. Scroll scrubs a
 * continuous morph between word silhouettes.
 */
export function ParticleScene() {
  const preset = usePreset()
  const mood = preset.mood
  const scene = useThree((s) => s.scene)
  const points = useRef<Points>(null!)
  const material = useRef<ShaderMaterial>(null!)
  const segment = useRef(-1)

  const words = useMemo(() => preset.sections.map((s) => s.word), [preset.sections])
  const clouds = useWordClouds(words)

  const { positions, seeds } = useMemo(
    () => ({
      positions: new Float32Array(COUNT * 3),
      seeds: Float32Array.from({ length: COUNT }, () => Math.random()),
    }),
    [],
  )

  const uniforms = useMemo(
    () => ({
      uMix: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 2.4 },
      uScatter: { value: 1.6 },
      uColorA: { value: wordColor },
      uColorB: { value: accentColor },
    }),
    [],
  )

  // Seed both morph targets before the first frame so nothing pops in.
  useLayoutEffect(() => {
    const geometry = points.current?.geometry
    if (!geometry || !clouds.length) return
    geometry.setAttribute('aStart', new BufferAttribute(clouds[0], 3))
    geometry.setAttribute('aEnd', new BufferAttribute(clouds[Math.min(1, clouds.length - 1)], 3))
    segment.current = 0
  }, [clouds])

  useFrame((state, dt) => {
    scene.background = bgColor
    const geometry = points.current?.geometry
    if (!geometry || !clouds.length) return

    // Continuous across the whole document rather than per-section, so there
    // is no discrete swap anywhere in the scroll.
    const f = clamp(scroll.progress) * (clouds.length - 1)
    const i = Math.min(Math.floor(f), clouds.length - 2)

    if (i !== segment.current) {
      geometry.setAttribute('aStart', new BufferAttribute(clouds[i], 3))
      geometry.setAttribute('aEnd', new BufferAttribute(clouds[i + 1], 3))
      segment.current = i
    }

    uniforms.uMix.value = smoothstep(0, 1, f - i)
    uniforms.uTime.value = state.clock.elapsedTime
    // Scrolling hard throws the swarm apart; it gathers when you stop.
    uniforms.uScatter.value += (1.4 + clamp(Math.abs(scroll.velocity) * 0.03, 0, 1) * 4 - uniforms.uScatter.value) * (1 - Math.exp(-4 * dt))

    const g = points.current
    g.rotation.y += (pointer.x * 0.35 - g.rotation.y) * (1 - Math.exp(-2.5 * dt))
    g.rotation.x += (-pointer.y * 0.2 - g.rotation.x) * (1 - Math.exp(-2.5 * dt))

    const { camera } = state
    camera.position.set(0, 0, mood.distance - 0.4)
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <ambientLight intensity={mood.ambient * 0.6} color={bgColor} />
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={NormalBlending}
        />
      </points>
    </>
  )
}
