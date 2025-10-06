'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

// ==================== CONTRACT SETUP ====================
const PAYPAYUSWAP_ADDRESS = "0x669f9b0D21c15a608c5309e0B964c165FB428962"
const PLATFORM_FEE = "0.00025"
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"

const PAYPAYUSWAP_ABI = [
    {"inputs":[{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactBNBForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForBNB","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}
]

const ERC20_ABI = [
    {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
]

const TOKEN_LIST = [
    { symbol: "BNB", name: "BNB", address: WBNB, decimals: 18, logo: "https://tokens.pancakeswap.finance/images/symbol/bnb.png" },
    { symbol: "PAYU", name: "PayU Token", address: "0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144", decimals: 18, logo: "https://via.placeholder.com/32/7645D9/FFFFFF?text=PAYU" },
    { symbol: "CAKE", name: "PancakeSwap Token", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png" },
    { symbol: "BUSD", name: "Binance USD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png" },
    { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png" }
]

export default function SwapPage() {
    const { address, isConnected } = useAccount()
    const [web3, setWeb3] = useState(null)
    const [contract, setContract] = useState(null)
    
    const [fromToken, setFromToken] = useState(TOKEN_LIST[0])
    const [toToken, setToToken] = useState(TOKEN_LIST[1])
    const [fromAmount, setFromAmount] = useState('')
    const [toAmount, setToAmount] = useState('')
    const [fromBalance, setFromBalance] = useState('0')
    const [toBalance, setToBalance] = useState('0')
    
    const [loading, setLoading] = useState(false)
    const [slippage, setSlippage] = useState(0.5)
    const [showTokenModal, setShowTokenModal] = useState(false)
    const [selectingToken, setSelectingToken] = useState('from')
    const [showSlippageModal, setShowSlippageModal] = useState(false)
    const [mevProtect, setMevProtect] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (isConnected && window.ethereum) {
            initializeWeb3()
        }
    }, [isConnected])

    useEffect(() => {
        if (address && fromToken) updateBalance(fromToken, setFromBalance)
    }, [address, fromToken])

    useEffect(() => {
        if (address && toToken) updateBalance(toToken, setToBalance)
    }, [address, toToken])

    useEffect(() => {
        if (fromAmount && fromToken && toToken) {
            getQuote()
        } else {
            setToAmount('')
        }
    }, [fromAmount, fromToken, toToken])

    const initializeWeb3 = async () => {
        try {
            const Web3 = (await import('web3')).default
            const web3Instance = new Web3(window.ethereum)
            const contractInstance = new web3Instance.eth.Contract(PAYPAYUSWAP_ABI, PAYPAYUSWAP_ADDRESS)
            
            setWeb3(web3Instance)
            setContract(contractInstance)
        } catch (error) {
            console.error('Web3 initialization error:', error)
        }
    }

    const updateBalance = async (token, setBalance) => {
        if (!web3 || !address) return

        try {
            if (token.symbol === 'BNB') {
                const balance = await web3.eth.getBalance(address)
                setBalance(web3.utils.fromWei(balance, 'ether'))
            } else {
                const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address)
                const balance = await tokenContract.methods.balanceOf(address).call()
                setBalance(web3.utils.fromWei(balance, 'ether'))
            }
        } catch (error) {
            console.error('Balance error:', error)
            setBalance('0')
        }
    }

    const getQuote = async () => {
        if (!contract || !fromAmount) return

        try {
            let path
            if (fromToken.symbol === 'BNB') {
                path = [WBNB, toToken.address]
            } else if (toToken.symbol === 'BNB') {
                path = [fromToken.address, WBNB]
            } else {
                path = [fromToken.address, toToken.address]
            }

            const amountIn = web3.utils.toWei(fromAmount, 'ether')
            const amounts = await contract.methods.getAmountsOut(amountIn, path).call()
            
            const output = web3.utils.fromWei(amounts[1], 'ether')
            setToAmount(parseFloat(output).toFixed(6))
        } catch (error) {
            console.error('Quote error:', error)
            setToAmount('0')
        }
    }

    const handleSwitch = () => {
        const tempToken = fromToken
        const tempAmount = fromAmount
        const tempBalance = fromBalance
        
        setFromToken(toToken)
        setToToken(tempToken)
        setFromAmount(toAmount)
        setFromBalance(toBalance)
        setToBalance(tempBalance)
    }

    const handleTokenSelect = (token) => {
        if (selectingToken === 'from') {
            if (token.symbol === toToken.symbol) setToToken(fromToken)
            setFromToken(token)
        } else {
            if (token.symbol === fromToken.symbol) setFromToken(toToken)
            setToToken(token)
        }
        setShowTokenModal(false)
    }

    const approveToken = async (tokenAddress, amount) => {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress)
        
        const currentAllowance = await tokenContract.methods.allowance(address, PAYPAYUSWAP_ADDRESS).call()
        const amountInWei = web3.utils.toWei(amount, 'ether')
        
        if (BigInt(currentAllowance) >= BigInt(amountInWei)) return true

        try {
            await tokenContract.methods.approve(PAYPAYUSWAP_ADDRESS, amountInWei).send({ from: address })
            return true
        } catch (error) {
            throw new Error('Token approval failed')
        }
    }

    const executeSwap = async () => {
        if (!fromAmount || !toAmount || !contract) {
            setError('Please enter valid amounts')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const amountIn = web3.utils.toWei(fromAmount, 'ether')
            const expectedOutput = web3.utils.toWei(toAmount, 'ether')
            const minOutput = (BigInt(expectedOutput) * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000)).toString()
            const deadline = Math.floor(Date.now() / 1000) + 600

            let tx

            if (fromToken.symbol === 'BNB') {
                const totalBNB = web3.utils.toWei((parseFloat(fromAmount) + parseFloat(PLATFORM_FEE)).toString(), 'ether')
                tx = await contract.methods.swapExactBNBForTokens(toToken.address, minOutput, deadline).send({ from: address, value: totalBNB, gas: 300000 })
            } else if (toToken.symbol === 'BNB') {
                await approveToken(fromToken.address, fromAmount)
                const fee = web3.utils.toWei(PLATFORM_FEE, 'ether')
                tx = await contract.methods.swapExactTokensForBNB(fromToken.address, amountIn, minOutput, deadline).send({ from: address, value: fee, gas: 300000 })
            } else {
                await approveToken(fromToken.address, fromAmount)
                const fee = web3.utils.toWei(PLATFORM_FEE, 'ether')
                tx = await contract.methods.swapExactTokensForTokens(fromToken.address, toToken.address, amountIn, minOutput, deadline).send({ from: address, value: fee, gas: 300000 })
            }

            setSuccess('Swap successful! 🎉')
            setFromAmount('')
            setToAmount('')
            updateBalance(fromToken, setFromBalance)
            updateBalance(toToken, setToBalance)
            
        } catch (error) {
            setError('Swap failed: ' + error.message)
        } finally {
            setLoading(false)
        }
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
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md w-full glass-card neon-border rounded-2xl p-6 relative mx-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <motion.h1
                        className="text-2xl font-bold text-white"
                        animate={{
                            textShadow: [
                                '0 0 20px rgba(255, 255, 255, 0.8)',
                                '0 0 40px rgba(255, 255, 255, 1)',
                                '0 0 20px rgba(255, 255, 255, 0.8)'
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        PAYU SWAP
                    </motion.h1>
                    <motion.button
                        onClick={() => setShowSlippageModal(true)}
                        className="w-8 h-8 bg-neon-purple/20 border border-neon-purple/50 rounded-lg flex items-center justify-center text-neon-purple hover:bg-neon-purple/30 transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        ⚙️
                    </motion.button>
                </div>

                {!isConnected ? (
                    <div className="space-y-4">
                        <ConnectButton.Custom>
                            {({ openConnectModal }) => (
                                <motion.button
                                    onClick={openConnectModal}
                                    className="w-full neon-button text-lg py-4 px-6 rounded-xl hover-lift relative overflow-hidden"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="relative z-10 font-bold">Connect Wallet</span>
                                </motion.button>
                            )}
                        </ConnectButton.Custom>
                    </div>
                ) : (
                    <>
                        {/* Connected Wallet */}
                        <motion.div
                            className="flex items-center justify-center gap-3 text-neon-teal mb-6 p-3 bg-neon-teal/10 rounded-xl border border-neon-teal/30"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="text-xl"
                            >
                                ✅
                            </motion.div>
                            <span className="font-neon">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                        </motion.div>

                        {/* From Token */}
                        <div className="bg-neon-purple/10 border border-neon-purple/30 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-neon-purple">From</span>
                                <button
                                    onClick={() => setFromAmount(fromBalance)}
                                    className="text-sm text-neon-purple hover:text-white transition-colors"
                                >
                                    Balance: {parseFloat(fromBalance).toFixed(4)}
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={fromAmount}
                                    onChange={(e) => setFromAmount(e.target.value)}
                                    className="flex-1 bg-transparent text-xl font-bold text-white outline-none placeholder-neon-purple/50"
                                />
                                <button
                                    onClick={() => {
                                        setSelectingToken('from')
                                        setShowTokenModal(true)
                                    }}
                                    className="flex items-center gap-2 bg-neon-purple/20 border border-neon-purple/50 rounded-lg px-3 py-2 hover:bg-neon-purple/30 transition-all"
                                >
                                    <img src={fromToken.logo} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
                                    <span className="font-bold text-white">{fromToken.symbol}</span>
                                    <span className="text-neon-purple">▼</span>
                                </button>
                            </div>
                        </div>

                        {/* Switch Button */}
                        <div className="flex justify-center -my-2 relative z-10">
                            <motion.button
                                onClick={handleSwitch}
                                className="w-10 h-10 bg-dark-bg border-2 border-neon-teal rounded-xl flex items-center justify-center text-neon-teal hover:bg-neon-teal/20 transition-all"
                                whileHover={{ rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                ⇅
                            </motion.button>
                        </div>

                        {/* To Token */}
                        <div className="bg-neon-teal/10 border border-neon-teal/30 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-neon-teal">To</span>
                                <span className="text-sm text-neon-teal">
                                    Balance: {parseFloat(toBalance).toFixed(4)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={toAmount}
                                    disabled
                                    className="flex-1 bg-transparent text-xl font-bold text-white outline-none placeholder-neon-teal/50"
                                />
                                <button
                                    onClick={() => {
                                        setSelectingToken('to')
                                        setShowTokenModal(true)
                                    }}
                                    className="flex items-center gap-2 bg-neon-teal/20 border border-neon-teal/50 rounded-lg px-3 py-2 hover:bg-neon-teal/30 transition-all"
                                >
                                    <img src={toToken.logo} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
                                    <span className="font-bold text-white">{toToken.symbol}</span>
                                    <span className="text-neon-teal">▼</span>
                                </button>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="flex justify-between items-center mb-4 p-3 bg-neon-gold/10 border border-neon-gold/30 rounded-xl">
                            <span className="text-sm font-medium text-neon-gold">Slippage Tolerance</span>
                            <button
                                onClick={() => setShowSlippageModal(true)}
                                className="text-sm text-neon-gold hover:text-white transition-colors"
                            >
                                Auto: {slippage}% ✏️
                            </button>
                        </div>

                        {/* MEV Protect */}
                        <div className="flex items-center gap-3 mb-6 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-xl cursor-pointer hover:bg-neon-pink/20 transition-all">
                            <input
                                type="checkbox"
                                checked={mevProtect}
                                onChange={(e) => setMevProtect(e.target.checked)}
                                className="w-5 h-5 accent-neon-pink"
                            />
                            <label className="text-sm font-medium text-neon-pink cursor-pointer flex-1">
                                Enable MEV Protect
                            </label>
                            <span className="text-neon-pink">🛡️</span>
                        </div>

                        {/* Swap Button */}
                        <motion.button
                            onClick={executeSwap}
                            disabled={!fromAmount || !toAmount || loading}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                                !fromAmount || !toAmount || loading
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'neon-button hover-lift'
                            }`}
                            whileHover={!fromAmount || !toAmount || loading ? {} : { scale: 1.05, y: -2 }}
                            whileTap={!fromAmount || !toAmount || loading ? {} : { scale: 0.95 }}
                        >
                            {loading ? 'Swapping...' : 'Swap'}
                        </motion.button>

                        {/* Error/Success Messages */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-sm"
                            >
                                {success}
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>

            {/* Token Selection Modal */}
            {showTokenModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowTokenModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-dark-bg border border-neon-pink/50 rounded-2xl p-6 w-full max-w-md max-h-80 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Select a Token</h3>
                            <button
                                onClick={() => setShowTokenModal(false)}
                                className="text-neon-pink hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        {TOKEN_LIST.map((token) => (
                            <motion.div
                                key={token.symbol}
                                onClick={() => handleTokenSelect(token)}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-neon-purple/20 cursor-pointer transition-all"
                                whileHover={{ scale: 1.02 }}
                            >
                                <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                                <div className="flex-1">
                                    <div className="font-bold text-white">{token.symbol}</div>
                                    <div className="text-sm text-neon-purple">{token.name}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}

            {/* Slippage Settings Modal */}
            {showSlippageModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowSlippageModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-dark-bg border border-neon-gold/50 rounded-2xl p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Settings</h3>
                            <button
                                onClick={() => setShowSlippageModal(false)}
                                className="text-neon-gold hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-neon-gold mb-3">
                                Slippage Tolerance
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[0.1, 0.5, 1, 5].map((value) => (
                                    <motion.button
                                        key={value}
                                        onClick={() => {
                                            setSlippage(value)
                                            setShowSlippageModal(false)
                                        }}
                                        className={`p-3 rounded-xl font-bold transition-all ${
                                            slippage === value
                                                ? 'bg-neon-gold text-dark-bg'
                                                : 'bg-neon-gold/20 text-neon-gold hover:bg-neon-gold/30'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {value}%
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}
