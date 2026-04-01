'use client'
import { useEffect, useRef } from 'react'

// SQL-specific glyphs — keywords, operators, and injection fragments
const SQL_CHARS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'NULL', 'DROP',
  'UNION', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'ON', 'AS',
  "'1'='1", "'admin'", '--', '/*', '*/', '@@', '%', '_',
  'SLEEP()', 'CAST()', 'EXEC', 'XP_', '0x', 'CHR(',
  '1=1', '1=2', ';--', "OR '", "' OR", 'INTO',
  'LIMIT', 'OFFSET', 'COUNT', 'GROUP', 'ORDER',
  'S', 'E', 'L', 'T', 'W', 'R', 'U', 'N', 'O',
  '*', '=', "'", ';', '(', ')', ',',
]

interface Drop {
  x: number
  y: number
  speed: number
  chars: string[]      // the column's current characters (trail)
  length: number       // how many chars in the trail
  opacity: number
}

export default function SQLMatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const FONT_SIZE = 13
    const FONT = `${FONT_SIZE}px "JetBrains Mono", monospace`

    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const cols = Math.floor(width / (FONT_SIZE * 5.5)) // wider columns for words
    const drops: Drop[] = []

    function makeChar() {
      return SQL_CHARS[Math.floor(Math.random() * SQL_CHARS.length)]
    }

    function initDrops() {
      drops.length = 0
      for (let i = 0; i < cols; i++) {
        const trailLen = Math.floor(Math.random() * 12) + 6
        drops.push({
          x: (i / cols) * width + Math.random() * (width / cols),
          y: Math.random() * -height,         // start above viewport
          speed: Math.random() * 1.2 + 0.4,
          chars: Array.from({ length: trailLen }, makeChar),
          length: trailLen,
          opacity: Math.random() * 0.3 + 0.08,
        })
      }
    }

    initDrops()

    let animId: number

    function draw() {
      // Fade the canvas — light mode bg with low alpha to create trails
      ctx.fillStyle = 'rgba(248, 249, 255, 0.18)'
      ctx.fillRect(0, 0, width, height)

      ctx.font = FONT
      ctx.textAlign = 'left'

      for (const drop of drops) {
        const charH = FONT_SIZE * 1.6

        for (let i = 0; i < drop.length; i++) {
          const charY = drop.y - i * charH
          if (charY < -charH || charY > height + charH) continue

          // Trail fades: head = darkest, tail = very faint
          const progress = i / drop.length   // 0 = head, 1 = tail
          const alpha = drop.opacity * (1 - progress * 0.92)

          if (i === 0) {
            // Bright head — #1d4ed8 (accent-dark)
            ctx.fillStyle = `rgba(29, 78, 216, ${Math.min(alpha * 2.5, 0.55)})`
          } else if (i < 3) {
            // Near-head — #2563eb
            ctx.fillStyle = `rgba(37, 99, 235, ${alpha * 1.5})`
          } else {
            // Tail — #93c5fd (light blue)
            ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`
          }

          ctx.fillText(drop.chars[i], drop.x, charY)

          // Randomly swap characters in the trail for flicker
          if (Math.random() < 0.015) {
            drop.chars[i] = makeChar()
          }
        }

        // Advance drop
        drop.y += drop.speed * FONT_SIZE * 0.38

        // Reset when fully below screen
        if (drop.y - drop.length * (FONT_SIZE * 1.6) > height) {
          drop.y = Math.random() * -100 - 60
          drop.x = Math.random() * width
          drop.speed = Math.random() * 1.2 + 0.4
          drop.length = Math.floor(Math.random() * 12) + 6
          drop.chars = Array.from({ length: drop.length }, makeChar)
          drop.opacity = Math.random() * 0.3 + 0.08
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    const ro = new ResizeObserver(() => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
      initDrops()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
