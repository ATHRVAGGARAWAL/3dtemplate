import { useFont } from '@react-three/drei'
import { useMemo } from 'react'
import { FONT_URL } from '../theme'

export type LetterLayout = {
  char: string
  /** X of the glyph's optical centre, relative to the centred word. */
  x: number
  /** Offset that moves the glyph geometry back onto that centre. */
  pivot: number
  advance: number
  drawable: boolean
}

type FontData = {
  resolution: number
  glyphs: Record<string, { ha: number; x_min: number; x_max: number }>
}

/**
 * Lays out a word letter-by-letter using the typeface's own horizontal advance
 * metrics (`glyph.ha / resolution * size`) — the exact same formula
 * TextGeometry uses internally, so spacing matches a single Text3D exactly
 * while giving us an independently animatable object per character.
 */
export function useWordLayout(word: string, size = 1, tracking = 0) {
  const font = useFont(FONT_URL)

  return useMemo(() => {
    const data = font.data as unknown as FontData
    const scale = size / data.resolution
    const fallback = data.glyphs['?']

    let cursor = 0
    const letters: LetterLayout[] = []

    for (const char of word) {
      const glyph = data.glyphs[char] ?? fallback
      const advance = glyph.ha * scale + tracking
      const pivot = ((glyph.x_min + glyph.x_max) / 2) * scale
      letters.push({ char, x: cursor, pivot, advance, drawable: char.trim().length > 0 })
      cursor += advance
    }

    const width = cursor - tracking

    // Measure the real cap height off the typeface rather than guessing, so
    // every letter sits on a shared vertical centre line.
    let capHeight = size * 0.72
    try {
      let maxY = 0
      for (const shape of font.generateShapes('H', size)) {
        for (const point of shape.getPoints()) if (point.y > maxY) maxY = point.y
      }
      if (maxY > 0) capHeight = maxY
    } catch {
      /* keep the fallback ratio */
    }

    // Re-centre: shift every glyph so the word straddles the origin.
    for (const letter of letters) letter.x = letter.x + letter.pivot - width / 2

    return { letters, width, capHeight }
  }, [font, word, size, tracking])
}
