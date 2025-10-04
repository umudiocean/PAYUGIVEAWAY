'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ParticleSystem } from '@/components/ParticleSystem'

const TASKS = [
  { 
    id: 'telegram', 
    name: 'Join Telegram', 
    url: 'https://t.me/payu_coin', 
    icon: '📱',
    shape: 'circle',
    color: '#FF2A6D',
    description: 'Join our community',
    symbol: '◯',
    gradient: 'from-pink-500 to-red-500'
  },
  { 
    id: 'x', 
    name: 'Follow on X', 
    url: 'https://x.com/payu_coin', 
    icon: '🐦',
    shape: 'triangle',
    color: '#2BB673',
    description: 'Stay updated with news',
    symbol: '△',
    gradient: 'from-teal-500 to-green-500'
  },
  { 
    id: 'instagram', 
    name: 'Follow Instagram', 
    url: 'https://www.instagram.com/payu.coin/', 
    icon: '📸',
    shape: 'square',
    color: '#6A00FF',
    description: 'Follow our journey',
    symbol: '⬜',
    gradient: 'from-purple-500 to-indigo-500'
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
  const [animatingTask, setAnimatingTask] = useState<string | null>(null)
  const [particleTrigger, setParticleTrigger] = useState(false)
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({
    telegram: 'active',
    x: 'locked',
    instagram: 'locked'
  })

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }
    loadRegistration()
  }, [isConnected, address])

  useEffect(() => {
    // Update task states based on completion
    const newStates: Record<string, TaskState> = {}
    TASKS.forEach((task, index) => {
      if (completedTasks.includes(task.id)) {
        newStates[task.id] = 'completed'
      } else if (index === 0 || completedTasks.includes(TASKS[index - 1].id)) {
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
    
    setAnimatingTask(taskId)
    
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
      setAnimatingTask(null)
      
      // Check if all tasks completed
      if (completedTasks.length + 1 === 3) {
        setTimeout(() => setShowEmailModal(true), 1500)
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

  const getCardClass = (taskId: string) => {
    const state = taskStates[taskId]
    switch (state) {
      case 'locked':
        return 'squid-card-locked'
      case 'active':
        return 'squid-card-active'
      case 'completed':
        return 'squid-card-completed'
      default:
        return 'squid-card'
    }
  }

  const getShapeClass = (shape: string) => {
    switch (shape) {
      case 'circle':
        return 'squid-shape-circle'
      case 'triangle':
        return 'squid-shape-triangle'
      case 'square':
        return 'squid-shape-square'
      default:
        return 'squid-shape-circle'
    }
  }

  const getShapeComponent = (task: typeof TASKS[0], state: TaskState) => {
    const shapeClass = getShapeClass(task.shape)
    
    return (
      <div className={shapeClass}>
        {state === 'completed' ? (
          <>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl z-10 relative text-green-400"
            >
              ✅
            </motion.span>
            <div className="check-burst" />
          </>
        ) : state === 'locked' ? (
          <span className="text-2xl text-gray-400">🔒</span>
        ) : (
          <motion.span 
            className="text-3xl text-white font-bold squid-font"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              textShadow: `0 0 20px ${task.color}, 0 0 40px ${task.color}`
            }}
          >
            {task.symbol}
          </motion.span>
        )}
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-neon-pink rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl squid-font">Loading your ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-8 particle-bg relative overflow-hidden">
      {/* Background Squid Game Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Background Shapes */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 border-4 border-neon-pink opacity-20 rounded-full"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity },
            opacity: { duration: 3, repeat: Infinity }
          }}
        />
        
        <motion.div
          className="absolute top-32 right-32 w-24 h-24 border-4 border-neon-teal opacity-25"
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.5, 0.25]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 3.5, repeat: Infinity },
            opacity: { duration: 2.5, repeat: Infinity }
          }}
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        />
        
        <motion.div
          className="absolute bottom-40 left-40 w-20 h-20 border-4 border-neon-purple opacity-20"
          animate={{ 
            rotate: 180,
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4.5, repeat: Infinity },
            opacity: { duration: 3.5, repeat: Infinity }
          }}
        />
        
        {/* Floating Neon Lines */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-1 h-32 bg-gradient-to-b from-neon-pink to-transparent"
          animate={{
            y: [0, -50, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-1 h-24 bg-gradient-to-b from-neon-teal to-transparent"
          animate={{
            y: [0, -30, 0],
            opacity: [0.4, 0.9, 0.4]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Particle System */}
      <ParticleSystem 
        trigger={particleTrigger}
        onComplete={() => setParticleTrigger(false)}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b-2 border-neon-pink">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.h1 
            className="text-2xl md:text-3xl font-bold squid-font squid-text-glow"
            animate={{ 
              textShadow: [
                '0 0 10px rgba(255, 42, 109, 0.8)',
                '0 0 20px rgba(255, 42, 109, 1)',
                '0 0 10px rgba(255, 42, 109, 0.8)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SQUID GAME - PAYU GIVEAWAY
          </motion.h1>
          <ConnectButton showBalance={false} chainStatus="none" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8 relative z-10">
        {/* Ticket Display */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="squid-card rounded-2xl p-8 text-center squid-glow"
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold squid-font squid-text-glow mb-6"
            animate={{ 
              textShadow: [
                '0 0 15px rgba(255, 215, 0, 0.8)',
                '0 0 25px rgba(255, 215, 0, 1)',
                '0 0 15px rgba(255, 215, 0, 0.8)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            YOUR RAFFLE TICKET
          </motion.h2>
          
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-dark-card rounded-xl p-6 mb-4 squid-glow"
          >
            <p className="text-4xl md:text-5xl font-mono font-bold text-white tracking-wider break-all squid-font">
              {registration.ticket}
            </p>
          </motion.div>
          
          <div className="space-y-2 text-white/80">
            <p className="text-lg">✅ 250M PAYU received</p>
            <p className="text-sm">Registered: {new Date(registration.createdAt).toLocaleString()}</p>
            <p className="text-sm squid-font">Keep this ticket safe!</p>
          </div>
        </motion.div>

        {/* Advanced Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="squid-card rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold squid-font squid-text-glow">MISSION PROGRESS</h3>
            <span className="text-lg font-bold text-neon-gold">
              {completedTasks.length}/3
            </span>
          </div>
          
          <div className="neon-progress-advanced">
            <motion.div 
              className="neon-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(completedTasks.length / 3) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Advanced Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="squid-card rounded-2xl p-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center squid-font squid-text-glow mb-8">
            COMPLETE MISSIONS TO ENTER
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TASKS.map((task, index) => {
              const state = taskStates[task.id]
              const isAnimating = animatingTask === task.id

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isAnimating ? 1.1 : 1
                  }}
                  transition={{ 
                    delay: index * 0.2,
                    scale: { duration: 0.3 }
                  }}
                  className="relative particle-container"
                >
                  <motion.button
                    onClick={() => handleTaskClick(task.id, task.url)}
                    disabled={state === 'locked' || state === 'completed'}
                    className={`w-full rounded-xl p-6 text-center space-y-4 transition-all duration-300 backdrop-blur-md ${
                      state === 'completed' 
                        ? 'bg-green-500/20 border-2 border-green-500' 
                        : state === 'locked' 
                          ? 'bg-gray-500/20 border-2 border-gray-500 opacity-50' 
                          : 'bg-pink-500/20 border-2 border-pink-500 hover:bg-pink-500/30'
                    }`}
                    style={{
                      background: state === 'completed' 
                        ? 'rgba(43, 182, 115, 0.2)' 
                        : state === 'locked' 
                          ? 'rgba(100, 100, 100, 0.2)' 
                          : 'rgba(255, 42, 109, 0.2)',
                      boxShadow: state === 'completed'
                        ? '0 0 30px rgba(43, 182, 115, 0.7), inset 0 0 20px rgba(43, 182, 115, 0.1)'
                        : state === 'locked'
                          ? '0 0 20px rgba(100, 100, 100, 0.3)'
                          : '0 0 30px rgba(255, 42, 109, 0.5), inset 0 0 20px rgba(255, 42, 109, 0.1)'
                    }}
                    whileHover={state === 'active' ? { 
                      scale: 1.05,
                      y: -5,
                      boxShadow: '0 0 40px rgba(255, 42, 109, 0.8), inset 0 0 20px rgba(255, 42, 109, 0.2)'
                    } : {}}
                    whileTap={state === 'active' ? { scale: 0.95 } : {}}
                  >
                    {/* Shape Icon */}
                    <div className="flex justify-center mb-4">
                      {task.shape === 'circle' && (
                        <div className="w-20 h-20 rounded-full border-4 border-pink-500 bg-pink-500/20 flex items-center justify-center animate-pulse" style={{boxShadow: '0 0 30px #FF2A6D, inset 0 0 20px rgba(255, 42, 109, 0.3)'}}>
                          {state === 'completed' ? (
                            <span className="text-3xl text-green-400">✅</span>
                          ) : state === 'locked' ? (
                            <span className="text-2xl text-gray-400">🔒</span>
                          ) : (
                            <span className="text-3xl text-white font-bold" style={{textShadow: '0 0 20px #FF2A6D'}}>◯</span>
                          )}
                        </div>
                      )}
                      {task.shape === 'triangle' && (
                        <div className="w-20 h-20 border-4 border-teal-500 bg-teal-500/20 flex items-center justify-center animate-pulse" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', boxShadow: '0 0 30px #2BB673, inset 0 0 20px rgba(43, 182, 115, 0.3)'}}>
                          {state === 'completed' ? (
                            <span className="text-3xl text-green-400">✅</span>
                          ) : state === 'locked' ? (
                            <span className="text-2xl text-gray-400">🔒</span>
                          ) : (
                            <span className="text-3xl text-white font-bold" style={{textShadow: '0 0 20px #2BB673'}}>△</span>
                          )}
                        </div>
                      )}
                      {task.shape === 'square' && (
                        <div className="w-20 h-20 border-4 border-purple-500 bg-purple-500/20 flex items-center justify-center animate-pulse" style={{boxShadow: '0 0 30px #6A00FF, inset 0 0 20px rgba(106, 0, 255, 0.3)'}}>
                          {state === 'completed' ? (
                            <span className="text-3xl text-green-400">✅</span>
                          ) : state === 'locked' ? (
                            <span className="text-2xl text-gray-400">🔒</span>
                          ) : (
                            <span className="text-3xl text-white font-bold" style={{textShadow: '0 0 20px #6A00FF'}}>⬜</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Task Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold squid-font text-white">
                        {task.name}
                      </h3>
                      <p className="text-sm text-white/70">
                        {task.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="pt-2">
                      {state === 'completed' ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-neon-teal font-bold squid-font"
                        >
                          ✓ COMPLETED
                        </motion.span>
                      ) : state === 'locked' ? (
                        <span className="text-gray-500 font-bold squid-font">
                          🔒 LOCKED
                        </span>
                      ) : isAnimating ? (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="text-neon-pink font-bold squid-font"
                        >
                          ⚡ PROCESSING...
                        </motion.div>
                      ) : (
                        <span className="text-neon-pink font-bold squid-font hover:text-white transition-colors">
                          CLICK TO COMPLETE
                        </span>
                      )}
                    </div>

                    {/* Animated Border for Active State */}
                    {state === 'active' && (
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-transparent"
                        animate={{
                          borderColor: [
                            'rgba(255, 42, 109, 0)',
                            'rgba(255, 42, 109, 0.8)',
                            'rgba(255, 42, 109, 0)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
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
              className="squid-card p-8 rounded-2xl max-w-md w-full text-center squid-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              
              <h2 className="text-3xl font-bold squid-font squid-text-glow mb-4">
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
                className="w-full px-4 py-3 rounded-xl bg-dark-card border-2 border-neon-pink text-white placeholder-white/50 focus:outline-none focus:border-neon-teal transition-colors"
                autoFocus
              />
              
              <motion.button
                onClick={handleEmailSubmit}
                disabled={!email}
                className="w-full mt-4 neon-button disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="squid-card p-8 rounded-2xl max-w-md w-full text-center squid-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🎫
              </motion.div>
              
              <h2 className="text-4xl font-bold squid-font squid-text-glow mb-4">
                YOU'RE IN!
              </h2>
              
              <p className="text-xl font-mono text-white mb-2 break-all">
                {registration.ticket}
              </p>
              
              <p className="text-white/80 mb-4 break-words">
                {registration.email}
              </p>
              
              <p className="text-neon-teal font-bold squid-font text-lg">
                Good luck! 🍀
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}