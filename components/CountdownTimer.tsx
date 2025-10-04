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
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 45,
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        } else {
          // Countdown finished
          return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }

        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 backdrop-blur-xl border border-pink-500/50 rounded-xl p-4 mx-auto max-w-md"
      style={{
        boxShadow: '0 0 20px rgba(255, 42, 109, 0.2), inset 0 0 20px rgba(255, 42, 109, 0.05)'
      }}
    >
      <h3 className="text-sm font-light text-center mb-4 text-pink-400 tracking-wider">
        GIVEAWAY ENDS IN
      </h3>
      
      <div className="grid grid-cols-4 gap-2 text-center">
        <motion.div
          className="bg-black/40 rounded-lg p-3 border border-white/10"
          animate={{ scale: timeLeft.days > 0 ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-2xl font-mono font-bold text-white">
            {formatNumber(timeLeft.days)}
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Days
          </div>
        </motion.div>

        <motion.div
          className="bg-black/40 rounded-lg p-3 border border-white/10"
          animate={{ scale: timeLeft.hours > 0 ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-2xl font-mono font-bold text-white">
            {formatNumber(timeLeft.hours)}
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Hours
          </div>
        </motion.div>

        <motion.div
          className="bg-black/40 rounded-lg p-3 border border-white/10"
          animate={{ scale: timeLeft.minutes > 0 ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-2xl font-mono font-bold text-white">
            {formatNumber(timeLeft.minutes)}
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Minutes
          </div>
        </motion.div>

        <motion.div
          className="bg-black/40 rounded-lg p-3 border border-white/10"
          animate={{ scale: timeLeft.seconds > 0 ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-2xl font-mono font-bold text-white">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-xs text-white/60 uppercase tracking-wider">
            Seconds
          </div>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-1 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
            initial={{ width: '100%' }}
            animate={{ 
              width: `${((timeLeft.days * 24 * 60 * 60 + timeLeft.hours * 60 * 60 + timeLeft.minutes * 60 + timeLeft.seconds) / (45 * 24 * 60 * 60 + 23 * 60 * 60 + 59 * 60 + 59)) * 100}%`
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ boxShadow: '0 0 10px currentColor' }}
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
