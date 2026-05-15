'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export function Confetti() {
  const fired = useRef(false)
  
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    
    const duration = 3000
    const end = Date.now() + duration
    
    const colors = ['#00f0ff', '#00ff88', '#ffb800', '#ff3366', '#a855f7']
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    
    frame()
  }, [])
  
  return null
}
