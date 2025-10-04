'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function WelcomeAnimation({ onComplete }: { onComplete: () => void }) {
  const [counter, setCounter] = useState(0)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => {
        if (prev >= 456) {
          clearInterval(interval)
          setShowText(true)
          setTimeout(onComplete, 2000)
          return 456
        }
        return prev + Math.floor(Math.random() * 30) + 10
      })
    }, 50)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark-bg flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Neon Shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 squid-circle border-neon-pink"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            boxShadow: '0 0 20px #FF2A6D, 0 0 40px #FF2A6D'
          }}
        />
        
        <motion.div
          className="absolute top-1/3 right-1/4 squid-triangle border-neon-teal"
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 6, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            boxShadow: '0 0 20px #2BB673, 0 0 40px #2BB673'
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 left-1/3 squid-square border-neon-purple"
          animate={{ 
            rotate: 180,
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            boxShadow: '0 0 20px #6A00FF, 0 0 40px #6A00FF'
          }}
        />

        {/* Particle Effects */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-2 bg-neon-pink rounded-full"
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.5, 0.5, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            boxShadow: '0 0 10px #FF2A6D'
          }}
        />

        <motion.div
          className="absolute top-1/3 left-1/2 w-1 h-1 bg-neon-teal rounded-full"
          animate={{
            x: [0, -80, 80, 0],
            y: [0, 80, -80, 0],
            scale: [1, 2, 0.3, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{
            boxShadow: '0 0 8px #2BB673'
          }}
        />
      </div>

      <div className="text-center space-y-8 px-4 relative z-10">
        {/* Counter Display */}
        <motion.div
          className="relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-8xl sm:text-9xl md:text-[12rem] font-neon font-black text-neon-pink neon-text"
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 10px #FF2A6D',
                '0 0 20px #FF2A6D, 0 0 30px #FF2A6D',
                '0 0 10px #FF2A6D'
              ]
            }}
            transition={{ 
              scale: { duration: 0.5, repeat: Infinity },
              textShadow: { duration: 1, repeat: Infinity }
            }}
          >
            {counter}
          </motion.h1>
          
          {/* Counter Glow Effect */}
          <div 
            className="absolute inset-0 text-8xl sm:text-9xl md:text-[12rem] font-neon font-black text-neon-pink opacity-30 blur-sm"
            style={{ filter: 'blur(8px)' }}
          >
            {counter}
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showText ? 1 : 0.5, y: 0 }}
          className="space-y-4"
        >
          <motion.p
            className="text-xl sm:text-2xl md:text-3xl text-neon-teal font-neon"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              textShadow: [
                '0 0 5px #2BB673',
                '0 0 15px #2BB673, 0 0 25px #2BB673',
                '0 0 5px #2BB673'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Giveaway...
          </motion.p>

          {showText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <motion.p
                className="text-lg text-white/80 font-neon"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Preparing your entry...
              </motion.p>
              
              <div className="flex justify-center space-x-4">
                <motion.div
                  className="w-2 h-2 bg-neon-pink rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-neon-teal rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-neon-purple rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
