import { AdaptiveDpr, Preload } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Effects } from './Effects'
import { Scene } from './Scene'

/**
 * The architectural core of the whole site: exactly ONE fixed, full-screen
 * WebGL canvas that never unmounts. Sections scroll as ordinary HTML on top of
 * it. Per-section canvases would mean multiple WebGL contexts, re-uploaded
 * geometry and a hitch at every boundary.
 */
export function StickyCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6.4], fov: 38, near: 0.1, far: 60 }}
      >
        <Suspense fallback={null}>
          <Scene />
          <Effects />
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated={false} />
      </Canvas>
    </div>
  )
}
