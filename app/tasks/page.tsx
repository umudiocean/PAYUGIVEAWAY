'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ParticleSystem } from '@/components/ParticleSystem'
import { CountdownTimer } from '@/components/CountdownTimer'

const TASKS = [
  { 
    id: 'telegram', 
    name: 'Join Telegram', 
    url: 'https://t.me/payu_coin', 
    shape: 'circle',
    symbol: '◯',
    color: '#FF2A6D',
    description: 'Join our community'
  },
  { 
    id: 'x', 
    name: 'Retweet and Follow on X', 
    url: 'https://x.com/payu_coin/status/1974549463634178327', 
    shape: 'triangle',
    symbol: '△',
    color: '#FFFFFF',
    description: 'Stay updated with news'
  },
  { 
    id: 'instagram', 
    name: 'Add to Story on Instagram', 
    url: 'https://www.instagram.com/reel/DPZgFLFEWCg/?igsh=MTAwZHlsZzVoejIzZg==', 
    shape: 'square',
    symbol: '⬜',
    color: '#FFD700',
    description: 'Follow our journey'
  },
]

type TaskState = 'locked' | 'active' | 'completed'

export default function TasksPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [registration, setRegistration] = useState<any>(null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [particleTrigger, setParticleTrigger] = useState(false)
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({
    telegram: 'active',
    x: 'locked',
    instagram: 'locked'
  })
  const [revealedSteps, setRevealedSteps] = useState<number[]>([])
  const [glitchMode, setGlitchMode] = useState(false)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }
    loadRegistration()
  }, [isConnected, address])

  useEffect(() => {
    // Step by step reveal - show all completed tasks immediately
    const timer = setTimeout(() => {
      const completedIndexes = TASKS.map((_, index) => index).filter(index => {
        const task = TASKS[index]
        return completedTasks.includes(task.id)
      })
      
      // Show first task and all completed tasks
      setRevealedSteps([0, ...completedIndexes])
    }, 1000)
    return () => clearTimeout(timer)
  }, [completedTasks])

  useEffect(() => {
    // Update task states based on completion
    const newStates: Record<string, TaskState> = {}
    TASKS.forEach((task, index) => {
      if (completedTasks.includes(task.id)) {
        newStates[task.id] = 'completed'
        // Sonraki görevi aç
        if (index < TASKS.length - 1 && !completedTasks.includes(TASKS[index + 1].id)) {
          setTimeout(() => {
            setRevealedSteps(prev => [...prev, index + 1])
            newStates[TASKS[index + 1].id] = 'active'
          }, 1500)
        }
      } else if (index === 0 || (index > 0 && completedTasks.includes(TASKS[index - 1].id))) {
        newStates[task.id] = 'active'
      } else {
        newStates[task.id] = 'locked'
      }
    })
    setTaskStates(newStates)
  }, [completedTasks])

  const loadRegistration = async () => {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: address }),
    })
    const data = await res.json()
    if (data.registration) {
      setRegistration(data.registration)
      const completed = Object.entries(data.registration.tasks)
        .filter(([_, done]) => done)
        .map(([task]) => task)
      setCompletedTasks(completed)
      if (data.registration.email) {
        setShowSuccessModal(true)
      }
    } else {
      router.push('/')
    }
  }

  const handleTaskClick = async (taskId: string, url: string) => {
    const taskIndex = TASKS.findIndex(t => t.id === taskId)
    const currentState = taskStates[taskId]
    
    if (currentState === 'locked' || currentState === 'completed') return
    
    // Glitch effect
    setGlitchMode(true)
    setTimeout(() => setGlitchMode(false), 300)
    
    // Open link
    window.open(url, '_blank')
    
    // Simulate completion after delay
    setTimeout(async () => {
      // Trigger particle effect
      setParticleTrigger(true)
      
      // Update completion
      await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, platform: taskId, url }),
      })
      
      setCompletedTasks(prev => [...prev, taskId])
      
      // Check if all tasks completed
      if (completedTasks.length + 1 === 3) {
        setTimeout(() => setShowEmailModal(true), 2000)
      }
    }, 2000)
  }

  const handleEmailSubmit = async () => {
    if (!email) return
    
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: address, email }),
    })
    
    setShowEmailModal(false)
    setShowSuccessModal(true)
    loadRegistration()
  }

  const getProgressColor = () => {
    const progress = completedTasks.length / 3
    if (progress === 0) return 'from-pink-500 to-pink-600'
    if (progress <= 0.33) return 'from-pink-500 to-white'
    if (progress <= 0.66) return 'from-white to-yellow-400'
    return 'from-yellow-400 to-yellow-500'
  }

  const getShapeComponent = (task: typeof TASKS[0], state: TaskState, index: number) => {
    const isRevealed = revealedSteps.includes(index)
    
    return (
          <div className="flex justify-center mb-1 sm:mb-3">
        {task.shape === 'circle' && (
          <div 
            className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full border-2 border-pink-500 bg-pink-500/20 flex items-center justify-center ${
              state === 'active' ? 'shape-birth animate-pulse' : ''
            }`}
            style={{
              boxShadow: state === 'completed' 
                ? '0 0 50px rgba(43, 182, 115, 1), inset 0 0 30px rgba(43, 182, 115, 0.3)'
                : '0 0 30px #FF2A6D, inset 0 0 20px rgba(255, 42, 109, 0.3)'
            }}
          >
            {state === 'completed' ? (
              <motion.div 
                className="text-lg sm:text-2xl text-green-400 font-bold"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{textShadow: '0 0 20px #2BB673'}}
              >
                {task.symbol}
              </motion.div>
            ) : state === 'locked' ? (
              <span className="text-lg sm:text-xl text-gray-400">🔒</span>
            ) : (
              <div className="relative">
                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-white/80 bg-transparent flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-full border border-white/60 bg-transparent flex items-center justify-center">
                    <motion.span 
                      className="text-xs sm:text-sm text-white font-bold"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{textShadow: '0 0 20px #FF2A6D'}}
                    >
                      ◯
                    </motion.span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {task.shape === 'triangle' && (
          <div 
            className={`w-10 h-10 sm:w-16 sm:h-16 border-2 border-white bg-white/20 flex items-center justify-center ${
              state === 'active' ? 'shape-birth animate-pulse' : ''
            }`}
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              boxShadow: state === 'completed' 
                ? '0 0 50px rgba(43, 182, 115, 1), inset 0 0 30px rgba(43, 182, 115, 0.3)'
                : '0 0 30px #FFFFFF, inset 0 0 20px rgba(255, 255, 255, 0.3)'
            }}
          >
            {state === 'completed' ? (
              <motion.div 
                className="text-lg sm:text-2xl text-green-400 font-bold"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{textShadow: '0 0 20px #2BB673'}}
              >
                {task.symbol}
              </motion.div>
            ) : state === 'locked' ? (
              <span className="text-lg sm:text-xl text-gray-400">🔒</span>
            ) : (
              <motion.span 
                className="text-lg sm:text-2xl text-white font-bold"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{textShadow: '0 0 20px #FFFFFF'}}
              >
                {task.symbol}
              </motion.span>
            )}
          </div>
        )}
        
        {task.shape === 'square' && (
          <div 
            className={`w-10 h-10 sm:w-16 sm:h-16 border-2 border-yellow-500 bg-yellow-500/20 flex items-center justify-center ${
              state === 'active' ? 'golden-gate animate-pulse' : ''
            }`}
            style={{
              boxShadow: state === 'completed' 
                ? '0 0 50px rgba(43, 182, 115, 1), inset 0 0 30px rgba(43, 182, 115, 0.3)'
                : '0 0 30px #FFD700, inset 0 0 20px rgba(255, 215, 0, 0.3)'
            }}
          >
            {state === 'completed' ? (
              <motion.div 
                className="text-lg sm:text-2xl text-green-400 font-bold"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{textShadow: '0 0 20px #2BB673'}}
              >
                {task.symbol}
              </motion.div>
            ) : state === 'locked' ? (
              <span className="text-lg sm:text-xl text-gray-400">🔒</span>
            ) : (
              <motion.span 
                className="text-lg sm:text-2xl text-white font-bold"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{textShadow: '0 0 20px #FFD700'}}
              >
                {task.symbol}
              </motion.span>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-pink-500 rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl font-bold">Loading your ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-black pb-8 relative overflow-x-hidden ${glitchMode ? 'glitch-transition' : ''}`}>
      {/* Squid Game Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large Squid Game Symbols */}
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 border-4 border-pink-500 opacity-20 rounded-full"
          animate={{ 
            rotate: 360,
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity },
            opacity: { duration: 3, repeat: Infinity }
          }}
        />
        
        <motion.div
          className="absolute top-40 right-32 w-32 h-32 border-4 border-white opacity-25"
          animate={{ 
            rotate: -360,
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.4, 0.15]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 3.5, repeat: Infinity },
            opacity: { duration: 2.5, repeat: Infinity }
          }}
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        />
        
        <motion.div
          className="absolute bottom-40 left-40 w-24 h-24 border-4 border-yellow-500 opacity-20"
          animate={{ 
            rotate: 180,
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity },
            opacity: { duration: 4, repeat: Infinity }
          }}
        />

        {/* Floating Squid Game Icons */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-pink-500 text-4xl opacity-30"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ◯
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-1/4 text-white text-4xl opacity-25"
          animate={{
            y: [0, -25, 0],
            rotate: [0, -15, 15, 0],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        >
          △
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 right-1/3 text-yellow-500 text-4xl opacity-30"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 20, -20, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 2 }}
        >
          ⬜
        </motion.div>

        {/* Neon Grid Lines */}
        <motion.div
          className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-20"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scaleX: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-15"
          animate={{
            opacity: [0.05, 0.25, 0.05],
            scaleY: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
        />

        {/* Squid Game Mask Icons */}
        <motion.div
          className="absolute top-1/6 right-1/6 text-6xl opacity-10"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity }
          }}
        >
          🎭
        </motion.div>

        <motion.div
          className="absolute bottom-1/6 left-1/6 text-5xl opacity-15"
          animate={{
            rotate: [0, -360],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            scale: { duration: 7, repeat: Infinity, delay: 2 }
          }}
        >
          🦑
        </motion.div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Particle System */}
      <ParticleSystem 
        trigger={particleTrigger}
        onComplete={() => setParticleTrigger(false)}
      />

      {/* Connect Button Only */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-end">
          <ConnectButton showBalance={false} chainStatus="none" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 mt-2 sm:mt-8 space-y-1 sm:space-y-6 relative z-10">
        {/* Countdown Timer */}
        <CountdownTimer />

        {/* Slim & Elegant Ticket Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto bg-black/60 backdrop-blur-xl border border-pink-500/50 rounded-xl p-2 sm:p-4 text-center relative overflow-hidden"
          style={{
            boxShadow: '0 0 20px rgba(255, 42, 109, 0.2), inset 0 0 20px rgba(255, 42, 109, 0.05)',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(20,20,20,0.8) 100%)'
          }}
        >
          {/* Background neon waves */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-pink-500 via-purple-500 to-yellow-500 animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          {/* Ticket icon */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-3 right-3 text-yellow-400"
            style={{textShadow: '0 0 10px rgba(255, 215, 0, 0.8)'}}
          >
            🎟️
          </motion.div>
          
          <motion.h2 
            className="text-sm font-light mb-2 text-pink-400 tracking-wider"
            animate={{ 
              textShadow: [
                '0 0 5px rgba(255, 42, 109, 0.5)',
                '0 0 10px rgba(255, 42, 109, 0.8)',
                '0 0 5px rgba(255, 42, 109, 0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            YOUR RAFFLE TICKET
          </motion.h2>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300,
              delay: 0.5
            }}
            className="bg-black/40 rounded-lg p-2 sm:p-3 mb-2 border border-white/10 relative group cursor-pointer hover:border-pink-500/50 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(registration.ticket)
              // Show copy feedback
              const element = document.querySelector('.copy-feedback')
              if (element) {
                element.classList.add('animate-pulse')
                setTimeout(() => element.classList.remove('animate-pulse'), 1000)
              }
            }}
          >
            <motion.p 
              className="text-lg md:text-2xl font-mono font-bold text-white tracking-wider break-all select-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {registration.ticket}
            </motion.p>
            
            {/* Copy icon */}
            <motion.div 
              className="absolute top-2 right-2 text-white/50 text-sm opacity-0 group-hover:opacity-100 transition-opacity copy-feedback"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
            >
              📋
            </motion.div>
            
            {/* Copy tooltip */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Click to copy
            </div>
          </motion.div>
          
          <div className="space-y-0.5 text-white/60 text-xs">
            <p className="text-green-400">✅ 250M PAYU received</p>
            <p className="text-white/50">Registered: {new Date(registration.createdAt).toLocaleString()}</p>
            <motion.p 
              className="text-yellow-400 italic font-light"
              animate={{ 
                textShadow: [
                  '0 0 5px rgba(255, 215, 0, 0.3)',
                  '0 0 10px rgba(255, 215, 0, 0.6)',
                  '0 0 5px rgba(255, 215, 0, 0.3)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Keep this ticket safe!
            </motion.p>
          </div>
        </motion.div>

        {/* Slim Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto bg-black/60 backdrop-blur-xl border border-pink-500/50 rounded-lg p-2 sm:p-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-light text-pink-400 tracking-wider">MISSION PROGRESS</h3>
            <span className="text-sm font-bold text-yellow-400">
              {Math.min(completedTasks.length, 3)}/3
            </span>
          </div>
          
          <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${(Math.min(completedTasks.length, 3) / 3) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                boxShadow: '0 0 10px currentColor'
              }}
            />
          </div>
        </motion.div>

        {/* Compact Cinematic Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-black/60 backdrop-blur-xl border-2 border-pink-500 rounded-xl p-2 sm:p-6"
        >
          <h2 className="text-sm sm:text-lg font-light text-center mb-3 sm:mb-6 text-pink-400 tracking-wider">
            COMPLETE MISSIONS TO ENTER
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
            {TASKS.map((task, index) => {
              const state = taskStates[task.id]
              const isRevealed = revealedSteps.includes(index)

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ 
                    opacity: 1,
                    y: 0
                  }}
                  transition={{ 
                    delay: index * 0.2,
                    duration: 0.6
                  }}
                  className="relative"
                >
                  <motion.button
                    onClick={() => handleTaskClick(task.id, task.url)}
                    disabled={state === 'locked' || state === 'completed'}
                    className={`w-full rounded-lg p-2 sm:p-4 text-center space-y-1 sm:space-y-3 transition-all duration-300 backdrop-blur-xl ${
                      state === 'completed' 
                        ? 'bg-transparent border-2 border-green-500' 
                        : state === 'locked' 
                          ? 'bg-transparent border-2 border-gray-500 opacity-50' 
                          : 'bg-transparent border-2 border-pink-500 hover:border-pink-400'
                    }`}
                    style={{
                      background: 'transparent',
                      boxShadow: state === 'completed'
                        ? '0 0 20px rgba(43, 182, 115, 0.8)'
                        : state === 'locked'
                          ? '0 0 15px rgba(100, 100, 100, 0.5)'
                          : '0 0 20px rgba(255, 42, 109, 0.6)'
                    }}
                    whileHover={state === 'active' ? { 
                      scale: 1.05,
                      y: -5,
                      boxShadow: '0 0 30px rgba(255, 42, 109, 1)'
                    } : {}}
                    whileTap={state === 'active' ? { scale: 0.95 } : {}}
                  >
                    {/* Cinematic Shape */}
                    {getShapeComponent(task, state, index)}

                    {/* Task Info */}
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-bold text-white break-words">
                        {task.name}
                      </h3>
                      <p className="text-xs text-white/60">
                        {task.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="pt-0.5">
                      {state === 'completed' ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-green-400 font-bold text-xs"
                        >
                          ✓ COMPLETED
                        </motion.span>
                      ) : state === 'locked' ? (
                        <span className="text-gray-500 font-bold text-xs">
                          🔒 LOCKED
                        </span>
                      ) : (
                        <span className="text-pink-400 font-bold hover:text-white transition-colors text-xs">
                          CLICK TO COMPLETE
                        </span>
                      )}
                    </div>
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/90 backdrop-blur-md border-2 border-green-500 p-8 rounded-2xl max-w-md w-full text-center"
              style={{
                boxShadow: '0 0 50px rgba(43, 182, 115, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-4 text-white">
                CONGRATULATIONS!
              </h2>
              
              <p className="text-white mb-6">
                All missions completed! Enter your email to finalize your entry:
              </p>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border-2 border-pink-500 text-white placeholder-white/50 focus:outline-none focus:border-green-500 transition-colors"
                autoFocus
              />
              
              <motion.button
                onClick={handleEmailSubmit}
                disabled={!email}
                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-green-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                SUBMIT ENTRY
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black/90 backdrop-blur-md border-2 border-yellow-500 p-8 rounded-2xl max-w-md w-full text-center slot-machine-text"
              style={{
                boxShadow: '0 0 50px rgba(255, 215, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🎫
              </motion.div>
              
              <h2 className="text-4xl font-bold mb-4 text-yellow-400">
                YOU'RE IN!
              </h2>
              
              <p className="text-xl font-mono text-white mb-2 break-all">
                {registration.ticket}
              </p>
              
              <p className="text-white/80 mb-4 break-words">
                {registration.email}
              </p>
              
              <p className="text-green-400 font-bold text-lg">
                Good luck! 🍀
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}