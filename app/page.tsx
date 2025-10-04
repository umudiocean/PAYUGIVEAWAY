'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WelcomeAnimation } from '@/components/WelcomeAnimation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI, REGISTRATION_FEE } from '@/lib/contract'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [showAnimation, setShowAnimation] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const router = useRouter()
  const { address, isConnected } = useAccount()
  
  const { data: hash, writeContract } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConnected && address && !isRegistering && !hash && !walletConnected) {
      setWalletConnected(true)
      setTimeout(() => {
        handleRegister()
      }, 1000)
    }
  }, [isConnected, address])

  useEffect(() => {
    if (isSuccess && hash) {
      router.push('/tasks')
    }
  }, [isSuccess, hash])

  const handleRegister = async () => {
    setIsRegistering(true)
    
    try {
      const checkRes = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address }),
      })
      const checkData = await checkRes.json()
      
      if (checkData.registered) {
        router.push('/tasks')
        return
      }

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'register',
        value: BigInt(REGISTRATION_FEE),
      })
    } catch (error) {
      console.error('Registration error:', error)
      setIsRegistering(false)
    }
  }

  if (showAnimation) {
    return <WelcomeAnimation onComplete={() => setShowAnimation(false)} />
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Squid Game Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Squid Game Circle - Top Left */}
        <motion.div
          className="absolute top-10 left-10 w-24 h-24 border-4 border-neon-pink opacity-30 rounded-full"
          animate={{ 
            rotate: 360,
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            boxShadow: '0 0 30px rgba(255, 42, 109, 0.5)'
          }}
        />
        
        {/* Squid Game Triangle - Top Right */}
        <motion.div
          className="absolute top-16 right-16 w-20 h-20 border-4 border-neon-teal opacity-25"
          animate={{ 
            rotate: -360,
            scale: [1, 1.4, 1],
            opacity: [0.25, 0.5, 0.25]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            boxShadow: '0 0 25px rgba(43, 182, 115, 0.4)'
          }}
        />
        
        {/* Squid Game Square - Bottom Left */}
        <motion.div
          className="absolute bottom-20 left-20 w-16 h-16 border-4 border-neon-purple opacity-20"
          animate={{ 
            rotate: 180,
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            boxShadow: '0 0 20px rgba(106, 0, 255, 0.3)'
          }}
        />
        
        {/* Small Floating Circles */}
        <motion.div
          className="absolute top-1/3 left-1/6 w-8 h-8 border-2 border-neon-gold opacity-40 rounded-full"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)'
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-6 h-6 border-2 border-neon-pink opacity-35 rounded-full"
          animate={{
            y: [0, -25, 0],
            x: [0, -15, 0],
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            boxShadow: '0 0 12px rgba(255, 42, 109, 0.5)'
          }}
        />
        
        {/* Floating Triangles */}
        <motion.div
          className="absolute top-2/3 left-1/4 w-10 h-10 border-2 border-neon-teal opacity-30"
          animate={{
            y: [0, -20, 0],
            x: [0, 25, 0],
            scale: [1, 1.4, 1],
            rotate: [0, 120, 240, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            boxShadow: '0 0 18px rgba(43, 182, 115, 0.4)'
          }}
        />
        
        {/* Floating Squares */}
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-12 h-12 border-2 border-neon-purple opacity-25"
          animate={{
            y: [0, -35, 0],
            x: [0, -20, 0],
            scale: [1, 1.6, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            boxShadow: '0 0 16px rgba(106, 0, 255, 0.3)'
          }}
        />
        
        {/* Tiny Sparkles */}
        <motion.div
          className="absolute top-1/5 right-1/5 w-3 h-3 bg-neon-gold opacity-60 rounded-full"
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
          }}
        />
        
        <motion.div
          className="absolute bottom-1/5 left-1/5 w-2 h-2 bg-neon-pink opacity-70 rounded-full"
          animate={{
            scale: [0, 1.8, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{
            boxShadow: '0 0 8px rgba(255, 42, 109, 0.9)'
          }}
        />
        
        <motion.div
          className="absolute top-1/2 right-1/8 w-4 h-4 bg-neon-teal opacity-50 rounded-full"
          animate={{
            scale: [0, 1.2, 0],
            opacity: [0, 0.8, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{
            boxShadow: '0 0 12px rgba(43, 182, 115, 0.7)'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl w-full glass-card neon-border rounded-2xl p-6 md:p-8 relative mx-auto"
      >
        <div className="text-center space-y-6">
          {/* Giveaway Banner */}
          <motion.div
            className="w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src="/giveaway-banner.png"
                alt="PAYU Giveaway Banner"
                className="w-full h-auto rounded-xl shadow-2xl transition-all duration-300 hover:shadow-neon-pink/30"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 42, 109, 0.3))'
                }}
              />
              
              {/* Glow Effect Overlay */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 42, 109, 0.3)',
                    '0 0 40px rgba(255, 42, 109, 0.5)',
                    '0 0 20px rgba(255, 42, 109, 0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Floating Particles */}
              <motion.div
                className="absolute top-4 right-4 w-2 h-2 bg-neon-pink rounded-full opacity-60"
                animate={{
                  y: [0, -10, 0],
                  x: [0, 5, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="absolute bottom-6 left-6 w-1 h-1 bg-neon-gold rounded-full opacity-40"
                animate={{
                  y: [0, -8, 0],
                  x: [0, -3, 0],
                  scale: [1, 1.5, 1]
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              />
              <motion.div
                className="absolute top-1/2 left-4 w-1.5 h-1.5 bg-neon-teal rounded-full opacity-50"
                animate={{
                  y: [0, -12, 0],
                  x: [0, 8, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Connect Button */}
          <div className="pt-4">
            {!isConnected ? (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.3, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                  >
                    <motion.button
                      onClick={openConnectModal}
                      className="neon-button text-lg md:text-xl py-4 md:py-5 px-8 md:px-10 rounded-xl hover-lift relative overflow-hidden w-full"
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        boxShadow: [
                          '0 0 25px rgba(255, 42, 109, 0.6)',
                          '0 0 50px rgba(255, 42, 109, 1)',
                          '0 0 25px rgba(255, 42, 109, 0.6)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <motion.span
                          className="relative z-10 font-bold text-white"
                          animate={{ 
                            textShadow: [
                              '0 0 15px rgba(255, 255, 255, 1)',
                              '0 0 30px rgba(255, 255, 255, 1.2)',
                              '0 0 15px rgba(255, 255, 255, 1)'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          JOIN THE GIVEAWAY
                        </motion.span>
                        
                        <motion.span
                          className="relative z-10 text-sm md:text-base font-medium text-white opacity-95"
                          animate={{ 
                            textShadow: [
                              '0 0 8px rgba(255, 255, 255, 0.8)',
                              '0 0 16px rgba(255, 255, 255, 1)',
                              '0 0 8px rgba(255, 255, 255, 0.8)'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        >
                          CONNECT WALLET
                        </motion.span>
                      </div>
                      
                      {/* Button Glow Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                      />
                      
                      {/* Multiple Pulse Rings */}
                      <motion.div
                        className="absolute inset-0 border-2 border-neon-pink rounded-xl"
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.4, 0.1, 0.4]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      />
                      
                      <motion.div
                        className="absolute inset-0 border border-neon-gold rounded-xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.05, 0.3]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                      />
                      
                      <motion.div
                        className="absolute inset-0 border border-neon-teal rounded-xl"
                        animate={{
                          scale: [1, 1.25, 1],
                          opacity: [0.2, 0.02, 0.2]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      />
                      
                      {/* Enhanced Corner Sparkles */}
                      <motion.div
                        className="absolute top-2 right-2 w-3 h-3 bg-neon-gold rounded-full"
                        animate={{
                          scale: [0, 1.5, 0],
                          opacity: [0, 1, 0],
                          rotate: [0, 360]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      />
                      
                      <motion.div
                        className="absolute bottom-2 left-2 w-2 h-2 bg-neon-teal rounded-full"
                        animate={{
                          scale: [0, 1.8, 0],
                          opacity: [0, 1, 0],
                          rotate: [0, -360]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                      />
                      
                      <motion.div
                        className="absolute top-2 left-2 w-2 h-2 bg-neon-purple rounded-full"
                        animate={{
                          scale: [0, 1.3, 0],
                          opacity: [0, 0.8, 0],
                          rotate: [0, 180]
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}
                      />
                      
                      <motion.div
                        className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-neon-pink rounded-full"
                        animate={{
                          scale: [0, 1.6, 0],
                          opacity: [0, 0.9, 0],
                          rotate: [0, -180]
                        }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: 0.4 }}
                      />
                      
                      {/* Floating Particles Inside Button */}
                      <motion.div
                        className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full"
                        animate={{
                          y: [0, -15, 0],
                          x: [0, 10, 0],
                          scale: [0, 1, 0],
                          opacity: [0, 0.6, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                      />
                      
                      <motion.div
                        className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-neon-gold rounded-full"
                        animate={{
                          y: [0, -20, 0],
                          x: [0, -8, 0],
                          scale: [0, 1.2, 0],
                          opacity: [0, 0.7, 0]
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
                      />
                      
                      <motion.div
                        className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-neon-teal rounded-full"
                        animate={{
                          y: [0, -12, 0],
                          x: [0, 15, 0],
                          scale: [0, 1.4, 0],
                          opacity: [0, 0.5, 0]
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: 1.4 }}
                      />
                      
                      {/* Inner Glow */}
                      <motion.div
                        className="absolute inset-2 bg-gradient-to-br from-neon-pink/10 to-transparent rounded-lg"
                        animate={{
                          opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </motion.button>
                  </motion.div>
                )}
              </ConnectButton.Custom>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Wallet Connected Animation */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-3 text-neon-teal"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-2xl"
                  >
                    ✅
                  </motion.div>
                  <span className="text-lg md:text-xl font-neon">
                    Wallet Connected!
                  </span>
                </motion.div>

                {/* Registration Status */}
                <motion.div
                  className="text-lg md:text-xl font-neon"
                  animate={{ 
                    color: ['#FF2A6D', '#2BB673', '#FF2A6D']
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {isConfirming ? 'Registering on blockchain...' : 
                   isSuccess ? 'Registration successful! Redirecting...' :
                   'Processing registration...'}
                </motion.div>

                {/* Loading Animation */}
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-neon-pink rounded-full"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  )
}
