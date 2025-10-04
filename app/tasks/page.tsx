'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const TASKS = [
  { 
    id: 'telegram', 
    name: 'Join Telegram', 
    url: 'https://t.me/payu_coin', 
    icon: '📱',
    symbol: '◯',
    color: 'neon-pink'
  },
  { 
    id: 'x', 
    name: 'Follow on X', 
    url: 'https://x.com/payu_coin', 
    icon: '🐦',
    symbol: '△',
    color: 'neon-teal'
  },
  { 
    id: 'instagram', 
    name: 'Follow Instagram', 
    url: 'https://www.instagram.com/payu.coin/', 
    icon: '📸',
    symbol: '⬜',
    color: 'neon-purple'
  },
]

export default function TasksPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [registration, setRegistration] = useState<any>(null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }
    loadRegistration()
  }, [isConnected, address])

  const loadRegistration = async () => {
    try {
      setLoading(true)
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
    } catch (error) {
      console.error('Error loading registration:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskClick = async (taskId: string, url: string) => {
    if (completedTasks.includes(taskId)) return

    // Open in new tab
    window.open(url, '_blank')

    // Add to completed tasks with animation delay
    setTimeout(async () => {
      try {
        await fetch('/api/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: address, platform: taskId, url }),
        })
        
        setCompletedTasks([...completedTasks, taskId])
        
        // Show email modal if all tasks completed
        if (completedTasks.length + 1 === 3) {
          setTimeout(() => setShowEmailModal(true), 1000)
        }
      } catch (error) {
        console.error('Error completing task:', error)
      }
    }, 1000)
  }

  const handleEmailSubmit = async () => {
    if (!email) return
    
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, email }),
      })
      
      setShowEmailModal(false)
      setShowSuccessModal(true)
      loadRegistration()
    } catch (error) {
      console.error('Error saving email:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white text-xl font-neon">Loading your ticket...</p>
        </motion.div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <p className="text-white text-xl sm:text-2xl">No registration found. Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-8 relative overflow-hidden">
      {/* Background Neon Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-24 h-24 border border-neon-pink opacity-10 rounded-full"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        <motion.div
          className="absolute top-1/3 right-1/4 w-20 h-20 border border-neon-teal opacity-10"
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-16 h-16 border border-neon-purple opacity-10"
          animate={{ 
            rotate: 180,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 glass-card backdrop-blur-md border-b border-neon-pink">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <motion.h1
            className="text-xl sm:text-2xl md:text-3xl font-neon font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Payu Giveaway
          </motion.h1>
          <div className="scale-90 sm:scale-100">
            <ConnectButton showBalance={false} chainStatus="none" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        {/* Ticket Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border-gold rounded-2xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="text-center space-y-4">
            <motion.h2
              className="text-xl md:text-2xl font-bold text-neon-gold neon-text"
              animate={{ 
                textShadow: [
                  '0 0 10px #FFD700',
                  '0 0 20px #FFD700, 0 0 30px #FFD700',
                  '0 0 10px #FFD700'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎟️ YOUR RAFFLE TICKET
            </motion.h2>
            
            <motion.div
              className="slot-text text-neon-gold"
              key={registration.ticket}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {registration.ticket}
            </motion.div>
            
            <p className="text-sm md:text-base text-dark-text">Keep this ticket safe!</p>
            
            <div className="pt-4 space-y-2 text-xs md:text-sm text-dark-text">
              <div className="flex items-center justify-center gap-2">
                <span className="text-neon-teal">✓</span>
                <span>250M PAYU received</span>
              </div>
              <p className="break-words">
                Registered: {new Date(registration.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card neon-border rounded-2xl p-6 md:p-8"
        >
          <motion.h2
            className="text-xl md:text-3xl font-bold text-white text-center mb-8 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Complete Tasks to Enter
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TASKS.map((task, index) => {
              const isCompleted = completedTasks.includes(task.id)
              const isLocked = index > 0 && !completedTasks.includes(TASKS[index - 1].id)
              
              return (
                <motion.button
                  key={task.id}
                  onClick={() => !isLocked && !isCompleted && handleTaskClick(task.id, task.url)}
                  disabled={isLocked || isCompleted}
                  className={`
                    relative p-6 md:p-8 rounded-xl border-2 text-center space-y-4 transition-all touch-manipulation min-h-[180px] group
                    ${isCompleted 
                      ? 'glass-card border-neon-success bg-green-900/20 cursor-default' 
                      : isLocked 
                        ? 'glass-card border-gray-600 opacity-50 cursor-not-allowed'
                        : `glass-card border-${task.color} hover:border-opacity-80 cursor-pointer hover-lift`
                    }
                  `}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={!isLocked && !isCompleted ? { scale: 1.05 } : {}}
                  whileTap={!isLocked && !isCompleted ? { scale: 0.95 } : {}}
                >
                  {/* Squid Game Symbol */}
                  <motion.div
                    className={`text-4xl md:text-5xl font-bold ${
                      isCompleted ? 'text-neon-success' : 
                      isLocked ? 'text-gray-500' : 
                      `text-${task.color}`
                    }`}
                    animate={!isLocked && !isCompleted ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isCompleted ? '✅' : isLocked ? '🔒' : task.symbol}
                  </motion.div>

                  {/* Task Icon */}
                  <div className="text-3xl md:text-4xl">
                    {task.icon}
                  </div>

                  <h3 className="text-base md:text-xl font-bold text-white">
                    {task.name}
                  </h3>

                  <motion.p
                    className={`text-sm md:text-base ${
                      isCompleted ? 'text-neon-success' :
                      isLocked ? 'text-gray-500' :
                      'text-dark-text'
                    }`}
                    animate={isCompleted ? {
                      color: ['#3BD671', '#2BB673', '#3BD671']
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {isCompleted ? 'COMPLETED' : 
                     isLocked ? 'LOCKED' : 
                     'Click to Complete'}
                  </motion.p>

                  {/* Neon Glow Effect */}
                  {!isLocked && !isCompleted && (
                    <motion.div
                      className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 bg-gradient-to-br from-${task.color} to-transparent`}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Progress Bar */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-dark-text">Progress</span>
              <span className="text-sm font-neon text-neon-pink">
                {completedTasks.length}/3
              </span>
            </div>
            <div className="neon-progress h-3 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-neon-pink to-neon-teal"
                initial={{ width: 0 }}
                animate={{ width: `${(completedTasks.length / 3) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  boxShadow: '0 0 10px currentColor'
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card neon-border-gold p-8 rounded-2xl max-w-md w-full my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-neon-gold text-center mb-4 neon-text"
                animate={{ 
                  textShadow: [
                    '0 0 10px #FFD700',
                    '0 0 20px #FFD700, 0 0 30px #FFD700',
                    '0 0 10px #FFD700'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎉 Congratulations!
              </motion.h2>
              
              <p className="text-white text-center mb-6">
                All tasks completed! Please enter your email:
              </p>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-4 rounded-xl bg-dark-card border border-neon-pink text-white placeholder-dark-text focus:outline-none focus:border-opacity-80 focus:shadow-lg focus:shadow-neon-pink/20"
                autoFocus
              />
              
              <motion.button
                onClick={handleEmailSubmit}
                disabled={!email}
                className="w-full mt-6 neon-button disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card border-2 border-neon-success p-8 rounded-2xl max-w-md w-full text-center"
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-neon-success mb-4 neon-text"
                animate={{ 
                  textShadow: [
                    '0 0 10px #3BD671',
                    '0 0 20px #3BD671, 0 0 30px #3BD671',
                    '0 0 10px #3BD671'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✅ YOU'RE IN!
              </motion.h2>
              
              <motion.p
                className="text-xl md:text-2xl text-white mb-2 font-neon break-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Ticket: {registration.ticket}
              </motion.p>
              
              <motion.p
                className="text-white/90 text-sm md:text-base break-words"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Email: {registration.email}
              </motion.p>
              
              <motion.p
                className="text-white/80 mt-4 text-base md:text-lg font-neon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Good luck! 🍀
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
