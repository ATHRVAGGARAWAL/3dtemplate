import { Environment, Lightformer } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import { useRef } from 'react'
import type { AmbientLight, PointLight } from 'three'
import { accentColor, bgColor, pointer, scroll } from '../scroll/store'
import { Debris } from './Debris'
import { WordStack } from './Word3D'

export function Scene() {
  const ambient = useRef<AmbientLight>(null!)
  const rim = useRef<PointLight>(null!)

  useFrame((state, dt) => {
    // Tint the fill light with the live page background so the type looks like
    // it genuinely sits inside each coloured room rather than on top of it.
    if (ambient.current) ambient.current.color.copy(bgColor)
    if (rim.current) rim.current.color.copy(accentColor)

    const { camera } = state
    damp3(
      camera.position,
      [pointer.x * 0.45, 0.25 + pointer.y * 0.3, 6.4 - Math.sin(scroll.progress * Math.PI) * 0.9],
      0.55,
      dt,
    )
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={1.35} />
      <directionalLight position={[4, 6, 6]} intensity={2.1} />
      <pointLight ref={rim} position={[-5, -2.5, 3]} intensity={45} distance={20} decay={2} />

      {/* Rendered once (frames={1}) — a static reflection probe built from
          geometry, so there is no HDR download and no per-frame cost. */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.4} position={[0, 4, -6]} scale={[12, 12, 1]} />
        <Lightformer intensity={1.4} position={[-6, 1, -2]} rotation-y={Math.PI / 2} scale={[8, 8, 1]} />
        <Lightformer intensity={1.1} position={[6, -2, 2]} rotation-y={-Math.PI / 2} scale={[8, 8, 1]} />
      </Environment>

      <Debris />
      <WordStack />
    </>
  )
}
