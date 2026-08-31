import { Color, MeshStandardMaterial } from 'three'

export type TypeMaterial = {
  material: MeshStandardMaterial
  uniforms: {
    uGradient: { value: Color }
    uAccent: { value: Color }
    uTint: { value: number }
    uFresnel: { value: number }
    uFresnelPower: { value: number }
    uGradientScale: { value: number }
  }
}

/**
 * A MeshStandardMaterial with a gradient and a fresnel rim injected via
 * `onBeforeCompile`. Patching the stock shader rather than writing one from
 * scratch keeps three's lighting, tone mapping and environment reflections —
 * we only add on top of `outgoingLight`.
 *
 * One instance is shared by every letter, so the GPU compiles a single program
 * and there is a single set of uniforms to update each frame.
 */
export function createTypeMaterial(): TypeMaterial {
  const uniforms: TypeMaterial['uniforms'] = {
    /** Colour the bottom of each glyph is tinted toward. */
    uGradient: { value: new Color('#bccc32') },
    /** Rim-light colour. */
    uAccent: { value: new Color('#ff5b04') },
    /** How strongly the gradient is applied, 0→1. */
    uTint: { value: 0.42 },
    /** Rim-light strength — driven by scroll velocity at runtime. */
    uFresnel: { value: 0.16 },
    uFresnelPower: { value: 2.6 },
    uGradientScale: { value: 0.62 },
  }

  const material = new MeshStandardMaterial({
    roughness: 0.28,
    metalness: 0.22,
    envMapIntensity: 0.9,
  })

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocalPos;')
      // `transformed` is the local-space vertex, before any model matrix — so
      // the gradient is anchored to each glyph rather than to world space.
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocalPos = transformed;')

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vLocalPos;
        uniform vec3 uGradient;
        uniform vec3 uAccent;
        uniform float uTint;
        uniform float uFresnel;
        uniform float uFresnelPower;
        uniform float uGradientScale;`,
      )
      .replace(
        '#include <opaque_fragment>',
        `
        // normal and vViewPosition are both view-space by this point.
        float fres = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), uFresnelPower);
        float g = clamp(vLocalPos.y * uGradientScale + 0.5, 0.0, 1.0);
        outgoingLight *= mix(vec3(1.0), mix(uGradient, vec3(1.0), g), uTint);
        outgoingLight += uAccent * fres * uFresnel;
        #include <opaque_fragment>`,
      )
  }

  // Without a stable cache key three would treat this as a new program every
  // time the material is recompiled.
  material.customProgramCacheKey = () => 'pulp-type-v1'

  return { material, uniforms }
}
