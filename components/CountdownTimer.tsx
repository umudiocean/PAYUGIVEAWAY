'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer() {
  // Gerçek çekiliş tarihi: 1 saat önce başlamış olarak ayarla (33 gün 23 saat 59 dakika 59 saniye)
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 33) // 33 gün ekle
  targetDate.setHours(23, 59, 59, 0) // 23:59:59

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const targetTime = targetDate.getTime()
      const difference = targetTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    // İlk hesaplama
    calculateTimeLeft()

    // Her saniye güncelle
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 backdrop-blur-xl border border-pink-500/50 rounded-lg p-2 mx-auto max-w-xs relative overflow-hidden"
      style={{
        boxShadow: '0 0 15px rgba(255, 42, 109, 0.3), inset 0 0 15px rgba(255, 42, 109, 0.1)'
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <motion.h3 
        className="text-xs font-light text-center mb-2 text-pink-400 tracking-wider relative z-10"
        animate={{ 
          textShadow: [
            '0 0 5px rgba(255, 42, 109, 0.5)',
            '0 0 15px rgba(255, 42, 109, 0.8)',
            '0 0 5px rgba(255, 42, 109, 0.5)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        GIVEAWAY ENDS IN
      </motion.h3>
      
      <div className="grid grid-cols-4 gap-1 text-center relative z-10">
        <motion.div
          className="bg-black/40 rounded-md p-1 border border-white/10 relative overflow-hidden"
          animate={{ 
            scale: timeLeft.days > 0 ? [1, 1.05, 1] : 1,
            rotateY: timeLeft.days > 0 ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <motion.div 
            className="text-sm font-mono font-bold text-white"
            key={timeLeft.days}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {formatNumber(timeLeft.days)}
          </motion.div>
          <div className="text-[10px] text-white/60 uppercase tracking-wider">
            Days
          </div>
        </motion.div>

        <motion.div
          className="bg-black/40 rounded-md p-1 border border-white/10 relative overflow-hidden"
          animate={{ 
            scale: timeLeft.hours > 0 ? [1, 1.05, 1] : 1,
            rotateY: timeLeft.hours > 0 ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.1 }}
        >
          <motion.div 
            className="text-sm font-mono font-bold text-white"
            key={timeLeft.hours}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {formatNumber(timeLeft.hours)}
          </motion.div>
          <div className="text-[10px] text-white/60 uppercase tracking-wider">
            Hours
          </div>
        </motion.div>

        <motion.div
          className="bg-black/40 rounded-md p-1 border border-white/10 relative overflow-hidden"
          animate={{ 
            scale: timeLeft.minutes > 0 ? [1, 1.05, 1] : 1,
            rotateY: timeLeft.minutes > 0 ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
        >
          <motion.div 
            className="text-sm font-mono font-bold text-white"
            key={timeLeft.minutes}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {formatNumber(timeLeft.minutes)}
          </motion.div>
          <div className="text-[10px] text-white/60 uppercase tracking-wider">
            Min
          </div>
        </motion.div>

        <motion.div
          className="bg-black/40 rounded-md p-1 border border-white/10 relative overflow-hidden"
          animate={{ 
            scale: timeLeft.seconds > 0 ? [1, 1.05, 1] : 1,
            rotateY: timeLeft.seconds > 0 ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
        >
          <motion.div 
            className="text-sm font-mono font-bold text-white"
            key={timeLeft.seconds}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {formatNumber(timeLeft.seconds)}
          </motion.div>
          <div className="text-[10px] text-white/60 uppercase tracking-wider">
            Sec
          </div>
        </motion.div>
      </div>

      {/* Mini Progress bar */}
      <div className="mt-2">
        <div className="h-0.5 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
            initial={{ width: '100%' }}
            animate={{ 
              width: `${((timeLeft.days * 24 * 60 * 60 + timeLeft.hours * 60 * 60 + timeLeft.minutes * 60 + timeLeft.seconds) / (33 * 24 * 60 * 60 + 23 * 60 * 60 + 59 * 60 + 59)) * 100}%`
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ boxShadow: '0 0 5px currentColor' }}
          />
        </div>
      </div>

      {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center mt-4"
        >
          <div className="text-red-500 font-bold text-lg">
            ⏰ GIVEAWAY ENDED!
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
