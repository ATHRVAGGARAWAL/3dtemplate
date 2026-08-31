import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import { useMemo, useRef } from 'react'
import type { Group, MeshStandardMaterial } from 'three'
import { hashSigned } from '../lib/math'
import { accentColor, scroll } from '../scroll/store'
import { usePreset } from '../themes'

type Shape = 'torus' | 'box' | 'capsule' | 'icosa'

function Geometry({ kind }: { kind: Shape }) {
  switch (kind) {
    case 'torus':
      return <torusGeometry args={[0.42, 0.17, 12, 40]} />
    case 'box':
      return <boxGeometry args={[0.6, 0.6, 0.6]} />
    case 'capsule':
      return <capsuleGeometry args={[0.22, 0.5, 6, 16]} />
    default:
      return <icosahedronGeometry args={[0.45, 0]} />
  }
}

/**
 * Chunky primitives drifting behind the type. They read as depth cues — without
 * them the word floats in a void and the parallax has nothing to play against.
 */
export function Debris() {
  const root = useRef<Group>(null!)
  const materials = useRef<MeshStandardMaterial[]>([])
  const { debris } = usePreset().mood

  const items = useMemo(
    () =>
      Array.from({ length: debris.count }, (_, i) => ({
        kind: debris.kinds[i % debris.kinds.length] as Shape,
        position: [hashSigned(i * 9.1) * 7, hashSigned(i * 4.3) * 3.4, -3 - Math.abs(hashSigned(i * 6.7)) * 4] as [
          number,
          number,
          number,
        ],
        rotation: [hashSigned(i * 2.9) * 3, hashSigned(i * 8.2) * 3, 0] as [number, number, number],
        scale: (0.7 + Math.abs(hashSigned(i * 3.7)) * 0.8) * debris.scale,
      })),
    [debris],
  )

  useFrame((_, dt) => {
    if (root.current) {
      // Drift opposite the scroll for a cheap parallax layer.
      damp3(root.current.position, [0, scroll.progress * 4.5, 0], 0.7, dt)
    }
    for (const material of materials.current) material?.color.copy(accentColor)
  })

  return (
    <group ref={root}>
      {items.map((item, i) => (
        <Float key={i} speed={1.1} rotationIntensity={0.7} floatIntensity={1.1}>
          <mesh position={item.position} rotation={item.rotation} scale={item.scale}>
            <Geometry kind={item.kind} />
            <meshStandardMaterial
              ref={(m) => {
                if (m) materials.current[i] = m
              }}
              roughness={0.35}
              metalness={0.15}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
