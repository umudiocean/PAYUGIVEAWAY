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
    shape: 'circle',
    symbol: '◯',
    color: '#FF2A6D',
    description: 'Join our community'
  },
  { 
    id: 'x', 
    name: 'Follow on X', 
    url: 'https://x.com/payu_coin', 
    shape: 'triangle',
    symbol: '△',
    color: '#FFFFFF',
    description: 'Stay updated with news'
  },
  { 
    id: 'instagram', 
    name: 'Follow Instagram', 
    url: 'https://www.instagram.com/payu.coin/', 
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
    // Step by step reveal
    const timer = setTimeout(() => {
      setRevealedSteps([0]) // İlk görev hemen açılır
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Update task states based on completion
    const newStates: Record<string, TaskState> = {}
    TASKS.forEach((task, index) => {
      if (completedTasks.includes(task.id)) {
        newStates[task.id] = 'completed'
        // Sonraki görevi aç
        if (index < TASKS.length - 1) {
          setTimeout(() => {
            setRevealedSteps(prev => [...prev, index + 1])
            setTaskStates(prev => ({ ...prev, [TASKS[index + 1].id]: 'active' }))
          }, 1500)
        }
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
      <div className={`flex justify-center mb-3 ${isRevealed ? 'step-reveal active' : 'step-reveal'}`}>
        {task.shape === 'circle' && (
          <div 
            className={`w-16 h-16 rounded-full border-2 border-pink-500 bg-pink-500/20 flex items-center justify-center ${
              state === 'active' ? 'shape-birth animate-pulse' : ''
            }`}
            style={{
              boxShadow: state === 'completed' 
                ? '0 0 50px rgba(43, 182, 115, 1), inset 0 0 30px rgba(43, 182, 115, 0.3)'
                : '0 0 30px #FF2A6D, inset 0 0 20px rgba(255, 42, 109, 0.3)'
            }}
          >
            {state === 'completed' ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl text-green-400"
              >
                ✅
              </motion.span>
            ) : state === 'locked' ? (
              <span className="text-xl text-gray-400">🔒</span>
            ) : (
              <motion.span 
                className="text-2xl text-white font-bold"
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
                {task.symbol}
              </motion.span>
            )}
          </div>
        )}
        
        {task.shape === 'triangle' && (
          <div 
            className={`w-16 h-16 border-2 border-white bg-white/20 flex items-center justify-center ${
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
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl text-green-400"
              >
                ✅
              </motion.span>
            ) : state === 'locked' ? (
              <span className="text-3xl text-gray-400">🔒</span>
            ) : (
              <motion.span 
                className="text-4xl text-white font-bold"
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
            className={`w-16 h-16 border-2 border-yellow-500 bg-yellow-500/20 flex items-center justify-center ${
              state === 'active' ? 'golden-gate animate-pulse' : ''
            }`}
            style={{
              boxShadow: state === 'completed' 
                ? '0 0 50px rgba(43, 182, 115, 1), inset 0 0 30px rgba(43, 182, 115, 0.3)'
                : '0 0 30px #FFD700, inset 0 0 20px rgba(255, 215, 0, 0.3)'
            }}
          >
            {state === 'completed' ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl text-green-400"
              >
                ✅
              </motion.span>
            ) : state === 'locked' ? (
              <span className="text-3xl text-gray-400">🔒</span>
            ) : (
              <motion.span 
                className="text-4xl text-white font-bold"
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
    <div className={`min-h-screen bg-black pb-8 relative overflow-hidden ${glitchMode ? 'glitch-transition' : ''}`}>
      {/* Particle System */}
      <ParticleSystem 
        trigger={particleTrigger}
        onComplete={() => setParticleTrigger(false)}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b-2 border-pink-500">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.h1 
            className="text-2xl md:text-3xl font-bold text-white"
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
        {/* Slim & Elegant Ticket Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto bg-black/60 backdrop-blur-xl border border-pink-500/50 rounded-xl p-6 text-center relative overflow-hidden"
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
            className="text-sm font-light mb-4 text-pink-400 tracking-wider"
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
            className="bg-black/40 rounded-lg p-4 mb-4 border border-white/10"
          >
            <motion.p 
              className="text-2xl md:text-3xl font-mono font-bold text-white tracking-wider break-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {registration.ticket}
            </motion.p>
          </motion.div>
          
          <div className="space-y-1 text-white/60 text-xs">
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
          className="max-w-md mx-auto bg-black/60 backdrop-blur-xl border border-pink-500/50 rounded-lg p-4"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-light text-pink-400 tracking-wider">MISSION PROGRESS</h3>
            <span className="text-sm font-bold text-yellow-400">
              {completedTasks.length}/3
            </span>
          </div>
          
          <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${(completedTasks.length / 3) * 100}%` }}
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
          className="max-w-4xl mx-auto bg-black/60 backdrop-blur-xl border border-pink-500/50 rounded-xl p-6"
        >
          <h2 className="text-lg font-light text-center mb-6 text-pink-400 tracking-wider">
            COMPLETE MISSIONS TO ENTER
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TASKS.map((task, index) => {
              const state = taskStates[task.id]
              const isRevealed = revealedSteps.includes(index)

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: isRevealed ? 1 : 0,
                    y: isRevealed ? 0 : 50
                  }}
                  transition={{ 
                    delay: index * 0.5,
                    duration: 0.8
                  }}
                  className="relative"
                >
                  <motion.button
                    onClick={() => handleTaskClick(task.id, task.url)}
                    disabled={state === 'locked' || state === 'completed'}
                    className={`w-full rounded-lg p-4 text-center space-y-3 transition-all duration-300 backdrop-blur-xl ${
                      state === 'completed' 
                        ? 'bg-green-500/10 border border-green-500/50' 
                        : state === 'locked' 
                          ? 'bg-gray-500/10 border border-gray-500/50 opacity-50' 
                          : 'bg-pink-500/10 border border-pink-500/50 hover:bg-pink-500/20'
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
                    {/* Cinematic Shape */}
                    {getShapeComponent(task, state, index)}

                    {/* Task Info */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        {task.name}
                      </h3>
                      <p className="text-xs text-white/60">
                        {task.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="pt-1">
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