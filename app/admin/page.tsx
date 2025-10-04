'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ADMIN_WALLET } from '@/lib/contract'

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address?.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
      setIsAdmin(true)
      loadData()
    } else {
      setIsAdmin(false)
      setLoading(false)
    }
  }, [isConnected, address])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin', {
        headers: { 'x-wallet-address': address! },
      })
      const data = await res.json()
      if (data.success) {
        setRegistrations(data.registrations)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Wallet', 'Ticket', 'Email', 'Telegram', 'X', 'Instagram', 'Date']
    const rows = registrations.map(r => [
      r.wallet,
      r.ticket,
      r.email || 'N/A',
      r.tasks.telegram ? 'Yes' : 'No',
      r.tasks.x ? 'Yes' : 'No',
      r.tasks.instagram ? 'Yes' : 'No',
      new Date(r.createdAt).toLocaleString(),
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payu-giveaway-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-neon font-bold text-white"
            animate={{ 
              textShadow: [
                '0 0 10px #FF2A6D',
                '0 0 20px #FF2A6D, 0 0 30px #FF2A6D',
                '0 0 10px #FF2A6D'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Admin Panel
          </motion.h1>
          <ConnectButton />
        </motion.div>
      </div>
    )
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
          <p className="text-white text-xl font-neon">Loading admin data...</p>
        </motion.div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🚫
          </motion.div>
          <p className="text-neon-error text-xl md:text-2xl font-neon font-bold">
            Access Denied
          </p>
          <p className="text-dark-text">
            Only admin wallet can access this panel
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Neon Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-neon-pink opacity-5 rounded-full"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        <motion.div
          className="absolute top-1/3 right-1/4 w-24 h-24 border border-neon-teal opacity-5"
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-neon font-bold text-white"
            animate={{ 
              textShadow: [
                '0 0 10px #FF2A6D',
                '0 0 20px #FF2A6D, 0 0 30px #FF2A6D',
                '0 0 10px #FF2A6D'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Admin Dashboard
          </motion.h1>
          <ConnectButton showBalance={false} />
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="glass-card neon-border rounded-xl p-6 hover-lift"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-dark-text text-sm md:text-base mb-2">Total Participants</h3>
            <motion.p
              className="text-3xl md:text-4xl font-bold text-neon-pink"
              animate={{ 
                textShadow: [
                  '0 0 10px #FF2A6D',
                  '0 0 20px #FF2A6D',
                  '0 0 10px #FF2A6D'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {registrations.length}
            </motion.p>
          </motion.div>

          <motion.div
            className="glass-card neon-border-teal rounded-xl p-6 hover-lift"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-dark-text text-sm md:text-base mb-2">With Email</h3>
            <motion.p
              className="text-3xl md:text-4xl font-bold text-neon-teal"
              animate={{ 
                textShadow: [
                  '0 0 10px #2BB673',
                  '0 0 20px #2BB673',
                  '0 0 10px #2BB673'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {registrations.filter(r => r.email).length}
            </motion.p>
          </motion.div>

          <motion.div
            className="glass-card border-2 border-neon-gold rounded-xl p-6 hover-lift sm:col-span-2 lg:col-span-1"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-dark-text text-sm md:text-base mb-2">All Tasks Complete</h3>
            <motion.p
              className="text-3xl md:text-4xl font-bold text-neon-gold"
              animate={{ 
                textShadow: [
                  '0 0 10px #FFD700',
                  '0 0 20px #FFD700',
                  '0 0 10px #FFD700'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {registrations.filter(r => r.tasks.telegram && r.tasks.x && r.tasks.instagram).length}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Export Button */}
        <motion.button
          onClick={exportCSV}
          className="w-full sm:w-auto mb-6 glass-card neon-border-gold px-6 py-3 rounded-xl text-neon-gold font-neon font-bold hover-lift"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          📊 Export CSV
        </motion.button>

        {/* Registrations Table */}
        <motion.div
          className="glass-card rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-neon-pink/20">
                <tr>
                  <th className="px-4 py-3 text-left text-white text-sm md:text-base font-neon">Wallet</th>
                  <th className="px-4 py-3 text-left text-white text-sm md:text-base font-neon">Ticket</th>
                  <th className="px-4 py-3 text-left text-white text-sm md:text-base font-neon">Email</th>
                  <th className="px-4 py-3 text-center text-white text-sm md:text-base font-neon">Tasks</th>
                  <th className="px-4 py-3 text-left text-white text-sm md:text-base font-neon">Date</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, i) => (
                  <motion.tr
                    key={i}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                  >
                    <td className="px-4 py-3 text-white text-sm font-mono">
                      {reg.wallet.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-white text-sm font-mono">
                      {reg.ticket}
                    </td>
                    <td className="px-4 py-3 text-white text-sm truncate max-w-[120px]">
                      {reg.email || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <div className="flex justify-center space-x-2">
                        <span className={`text-lg ${reg.tasks.telegram ? 'text-neon-success' : 'text-gray-500'}`}>
                          {reg.tasks.telegram ? '✅' : '❌'}
                        </span>
                        <span className={`text-lg ${reg.tasks.x ? 'text-neon-success' : 'text-gray-500'}`}>
                          {reg.tasks.x ? '✅' : '❌'}
                        </span>
                        <span className={`text-lg ${reg.tasks.instagram ? 'text-neon-success' : 'text-gray-500'}`}>
                          {reg.tasks.instagram ? '✅' : '❌'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white text-sm whitespace-nowrap">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Empty State */}
        {registrations.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📊
            </motion.div>
            <p className="text-dark-text text-lg">
              No registrations found yet
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
