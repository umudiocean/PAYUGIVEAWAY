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
      {/* Background Neon Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-neon-pink opacity-20 rounded-full"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            boxShadow: '0 0 50px rgba(255, 42, 109, 0.3)'
          }}
        />
        
        <motion.div
          className="absolute top-1/3 right-1/4 w-24 h-24 border border-neon-teal opacity-20"
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            boxShadow: '0 0 40px rgba(43, 182, 115, 0.3)'
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-20 h-20 border border-neon-purple opacity-20"
          animate={{ 
            rotate: 180,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            boxShadow: '0 0 30px rgba(106, 0, 255, 0.3)'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full glass-card neon-border rounded-2xl p-8 md:p-12 relative"
      >
        <div className="text-center space-y-8">
          {/* Main Title */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl font-neon font-black text-white leading-tight"
            animate={{ 
              textShadow: [
                '0 0 10px #FF2A6D',
                '0 0 20px #FF2A6D, 0 0 30px #FF2A6D',
                '0 0 10px #FF2A6D'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            WELCOME TO THE BIG{' '}
            <span className="text-neon-pink neon-text">PAYU GIVEAWAY</span>!
          </motion.h1>

          {/* Description */}
          <div className="space-y-4 text-lg md:text-xl text-dark-text">
            <motion.p
              className="font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Win your chance right now:
            </motion.p>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="flex items-center justify-center gap-2">
                <span className="text-neon-teal">🔗</span>
                Connect your wallet → instantly receive{' '}
                <span className="font-bold text-neon-gold neon-text">250M PAYU</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="text-neon-pink">✅</span>
                Complete social tasks → get your exclusive raffle ticket
              </p>
            </motion.div>
          </div>

          {/* Prizes Section */}
          <motion.div
            className="glass-card neon-border-teal rounded-xl p-6 md:p-8 space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-neon-gold neon-text">
              Grand Prizes:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base md:text-lg">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ x: 10 }}
              >
                <span className="text-2xl">📱</span>
                <span>1 lucky winner → <span className="text-neon-pink font-bold">iPhone 17 (256GB)</span></span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ x: 10 }}
              >
                <span className="text-2xl">🎮</span>
                <span>3 lucky winners → <span className="text-neon-teal font-bold">PlayStation 5</span></span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ x: 10 }}
              >
                <span className="text-2xl">🎧</span>
                <span>5 lucky winners → <span className="text-neon-purple font-bold">AirPods 4</span></span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ x: 10 }}
              >
                <span className="text-2xl">💰</span>
                <span>1000 lucky winners → <span className="text-neon-gold font-bold">2.5B PAYU</span></span>
              </motion.div>
            </div>
          </motion.div>

          {/* Connect Button */}
          <div className="pt-8">
            {!isConnected ? (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <motion.button
                    onClick={openConnectModal}
                    className="neon-button text-xl md:text-2xl py-4 md:py-6 px-8 md:px-12 rounded-xl hover-lift"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    JOIN THE GIVEAWAY
                  </motion.button>
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

          {/* Footer Info */}
          <motion.p
            className="text-sm text-dark-text pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Registration fee: 0.00098 BNB | BSC Network Only
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
