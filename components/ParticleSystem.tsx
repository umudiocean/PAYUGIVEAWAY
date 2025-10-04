'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  delay: number
}

interface ParticleSystemProps {
  trigger: boolean
  colors?: string[]
  count?: number
  onComplete?: () => void
}

export function ParticleSystem({ 
  trigger, 
  colors = ['#FF2A6D', '#2BB673', '#6A00FF', '#FFD700'], 
  count = 15,
  onComplete 
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger) {
      const newParticles: Particle[] = []
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.5
        })
      }
      
      setParticles(newParticles)
      
      // Clean up particles after animation
      setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 2000)
    }
  }, [trigger, colors, count, onComplete])

  if (!trigger || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full opacity-80"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            animation: `particle-float 2s ease-out ${particle.delay}s forwards`,
            boxShadow: `0 0 10px ${particle.color}`
          }}
        />
      ))}
    </div>
  )
}
