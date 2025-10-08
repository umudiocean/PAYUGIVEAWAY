'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useConnect, useBalance, useReadContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import styled from 'styled-components'
import { fetchTokenPrices, TokenPrice, fetchAllTokensWithPrices, PancakeSwapToken, fetchPancakeSwapRealPrices } from '@/lib/priceApi'

// Type definitions
interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logo: string;
    balance?: string;
}

interface ContractMethod {
    call: () => Promise<any>;
    send: (options: { from: string; value?: string; gas?: number }) => Promise<any>;
}

interface ERC20Contract {
    methods: {
        balanceOf: (address: string) => ContractMethod;
        allowance: (owner: string, spender: string) => ContractMethod;
        approve: (spender: string, amount: string) => ContractMethod;
    };
}

interface SwapContract {
    methods: {
        getAmountsOut: (amountIn: string, path: string[]) => ContractMethod;
        swapExactBNBForTokens: (tokenOut: string, amountOutMin: string, deadline: number) => ContractMethod;
        swapExactTokensForBNB: (tokenIn: string, amountIn: string, amountOutMin: string, deadline: number) => ContractMethod;
        swapExactTokensForTokens: (tokenIn: string, tokenOut: string, amountIn: string, amountOutMin: string, deadline: number) => ContractMethod;
    };
}

// Styled Components
const SwapContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(139.73deg, #08061e 0%, #0f0c23 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

const SwapCard = styled.div`
    background: #27262c;
    border-radius: 32px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
    padding: 24px;
    max-width: 440px;
    width: 100%;
`

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`

const Label = styled.span`
    color: #b8add2;
    font-size: 14px;
    font-weight: 500;
`

const WalletAddress = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: #b8add2;
    font-size: 12px;
`

const WalletIcon = styled.div`
    width: 12px;
    height: 12px;
    background: #ff8c00;
    border-radius: 2px;
`

const QuickButtons = styled.div`
    display: flex;
    gap: 4px;
`

const QuickButton = styled.button<{ isMax?: boolean }>`
    background: transparent;
    border: none;
    color: ${props => props.isMax ? '#1FC7D4' : '#1FC7D4'};
    font-size: 10px;
    font-weight: ${props => props.isMax ? 'bold' : 'normal'};
    padding: 2px 6px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        color: #53DEE9;
    }
`

const TokenBox = styled.div<{ hasGradient?: boolean }>`
    background: #353444;
    border-radius: 24px;
    padding: 16px;
    border: ${props => props.hasGradient ? '2px solid' : 'none'};
    border-image: ${props => props.hasGradient ? 'linear-gradient(90deg, #7645d9 0%, #5121b1 100%) 1' : 'none'};
    margin-bottom: 12px;
`

const TokenRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const TokenInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
`

const TokenLogo = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
`

const TokenDetails = styled.div`
    display: flex;
    flex-direction: column;
`

const TokenSymbol = styled.div`
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
`

const TokenChain = styled.div`
    color: #6e6e82;
    font-size: 10px;
`

const AmountInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`

const Amount = styled.div`
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
`

const USDValue = styled.div`
    color: #6e6e82;
    font-size: 12px;
    margin-top: 2px;
`

const ArrowContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: 12px 0;
`

const ArrowButton = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #27262c;
    border: 4px solid #27262c;
    color: #1FC7D4;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        transform: rotate(180deg);
    }
`

const SlippageRow = styled.div`
    background: #353444;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`

const SlippageValue = styled.div`
    color: #1FC7D4;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
`

const SwapButton = styled.button`
    width: 100%;
    height: 56px;
    background: linear-gradient(90deg, #1FC7D4 0%, #53DEE9 100%);
    border: none;
    border-radius: 16px;
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0px 4px 12px rgba(31, 199, 212, 0.4);
    transition: all 0.2s;
    margin-bottom: 12px;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 6px 16px rgba(31, 199, 212, 0.5);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`

const ConversionRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    color: #b8add2;
    font-size: 14px;
`

const RefreshIcon = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid #1FC7D4;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
`

const MEVRow = styled.div`
    background: #353444;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
`

const MEVLabel = styled.div`
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    text-decoration: underline;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
`

const ToggleSwitch = styled.div<{ active: boolean }>`
    width: 40px;
    height: 20px;
    background: ${props => props.active ? '#1FC7D4' : '#453A5C'};
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    
    &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: ${props => props.active ? '22px' : '2px'};
        transition: all 0.2s;
    }
`

const WalletButton = styled.button`
    width: 100%;
    height: 56px;
    background: linear-gradient(90deg, #1FC7D4 0%, #53DEE9 100%);
    border: none;
    border-radius: 16px;
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0px 4px 12px rgba(31, 199, 212, 0.4);
    transition: all 0.2s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 6px 16px rgba(31, 199, 212, 0.5);
    }
`

// Token Modal Component
const TokenModal = styled.div<{ show: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: ${props => props.show ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const TokenModalContent = styled.div`
    background: #27262c;
    border-radius: 24px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
`

const TokenSearch = styled.input`
    width: 100%;
    background: #353444;
    border: none;
    border-radius: 12px;
    padding: 12px 16px;
    color: #ffffff;
    font-size: 16px;
    margin-bottom: 16px;
    
    &::placeholder {
        color: #6e6e82;
    }
`

const TokenList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const TokenItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
        background: #353444;
    }
`

const TokenLogoImg = styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    
    &:hover {
        transform: scale(1.1);
        transition: transform 0.2s;
    }
`

const TokenInfoModal = styled.div`
    flex: 1;
`

const TokenSymbolModal = styled.div`
    color: #ffffff;
    font-weight: 600;
    font-size: 16px;
`

const TokenNameModal = styled.div`
    color: #6e6e82;
    font-size: 12px;
`

const TokenPriceModal = styled.div`
    color: #1FC7D4;
    font-size: 11px;
    margin-top: 2px;
`

// Slippage Modal Components
const SlippageModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`

const SlippageModalContent = styled.div`
    background: #27262c;
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    position: relative;
`

const SlippageModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`

const SlippageModalTitle = styled.h2`
    color: #ffffff;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
`

const SlippageCloseButton = styled.button`
    background: none;
    border: none;
    color: #ffffff;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
`

const SlippageOptions = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`

const SlippageOptionButton = styled.button<{ $active?: boolean }>`
    background: ${props => (props.$active ? '#1FC7D4' : '#353444')};
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 15px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: ${props => (props.$active ? '#53DEE9' : '#3e3e42')};
    }
`

const CustomSlippageInputContainer = styled.div`
    display: flex;
    align-items: center;
    background: #353444;
    border-radius: 8px;
    padding: 8px 12px;
    margin-top: 10px;
`

const CustomSlippageInput = styled.input`
    background: none;
    border: none;
    color: #ffffff;
    font-size: 16px;
    width: 100%;
    outline: none;
    padding: 0;
    margin-right: 8px;

    &::placeholder {
        color: #6e6e82;
    }
`

const PercentageLabel = styled.span`
    color: #ffffff;
    font-size: 16px;
`

const CloseButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #6e6e82;
    font-size: 24px;
    cursor: pointer;
`

// Main Component
export default function SwapPage() {
    const { address: account, isConnected, isConnecting } = useAccount()
    const { connect, connectors } = useConnect()
    
    // BNB balance
    const { data: bnbBalance } = useBalance({
        address: account,
    })
    
    // Token balances for popular tokens
    const { data: cakeBalance } = useReadContract({
        address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE token address
        abi: [{
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }],
        functionName: 'balanceOf',
        args: account ? [account] : undefined,
        query: {
            enabled: !!account,
        },
    })

    const { data: payuBalance } = useReadContract({
        address: '0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144', // PAYU token address
        abi: [{
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }],
        functionName: 'balanceOf',
        args: account ? [account] : undefined,
        query: {
            enabled: !!account,
        },
    })
    
    // Token prices state
    const [tokenPrices, setTokenPrices] = useState<{ [key: string]: TokenPrice }>({})
    const [pricesLoading, setPricesLoading] = useState(false)
    
    // All PancakeSwap tokens state
    const [allPancakeTokens, setAllPancakeTokens] = useState<PancakeSwapToken[]>([])
    const [tokensLoading, setTokensLoading] = useState(false)
    const [fromAmount, setFromAmount] = useState('')
    const [toAmount, setToAmount] = useState('')
    const [slippage, setSlippage] = useState(0.5)
    const [mevProtect, setMevProtect] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showTokenModal, setShowTokenModal] = useState(false)
    const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from')
    const [searchTerm, setSearchTerm] = useState('')

    const [fromToken, setFromToken] = useState({
        symbol: 'BNB',
        name: 'BNB',
        address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        decimals: 18,
        logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/logo.png',
        balance: '0.0'
    })

    const [toToken, setToToken] = useState({
        symbol: 'CAKE',
        name: 'PancakeSwap Token',
        address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        decimals: 18,
        logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82/logo.png',
        balance: '0.0'
    })

    const popularTokens = [
        {
            symbol: 'BNB',
            name: 'BNB',
            address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'PAYU',
            name: 'PAYU Token',
            address: '0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144',
            decimals: 12, // PAYU token 12 decimal kullanıyor
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'CAKE',
            name: 'PancakeSwap Token',
            address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'USDT',
            name: 'Tether USD',
            address: '0x55d398326f99059fF775485246999027B3197955',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x55d398326f99059fF775485246999027B3197955/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'USDC',
            name: 'USD Coin',
            address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'ETH',
            name: 'Ethereum Token',
            address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x2170Ed0880ac9A755fd29B2688956BD959F933F8/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'BTCB',
            name: 'Bitcoin BEP2',
            address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'ADA',
            name: 'Cardano Token',
            address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'DOT',
            name: 'Polkadot Token',
            address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'LINK',
            name: 'ChainLink Token',
            address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
            decimals: 12, // 12 decimal kullanıyoruz
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD/logo.png',
            balance: '0.0'
        }
    ]

    const [customTokens, setCustomTokens] = useState<any[]>([])
    const [isAddingCustomToken, setIsAddingCustomToken] = useState(false)
    const [customTokenAddress, setCustomTokenAddress] = useState('')
    const [customTokenLoading, setCustomTokenLoading] = useState(false)
    
    // Slippage modal states
    const [showSlippageModal, setShowSlippageModal] = useState(false)
    const [customSlippageInput, setCustomSlippageInput] = useState('0.5')

    // Gerçek fiyat kontrolü - fallback ile
    const getRealPrice = (symbol: string): number => {
        // Önce gerçek API'den gelen fiyatları kullan
        if (tokenPrices[symbol]?.price) {
            return tokenPrices[symbol].price
        }
        
        // API'ler çalışmıyorsa fallback fiyatlar - PancakeSwap ile aynı
        const fallbackPrices: { [key: string]: number } = {
            'BNB': 1285, // PancakeSwap'ta 0.009074 BNB = ~$11.66 USD
            'CAKE': 2.1,
            'USDT': 1.0,
            'USDC': 1.0,
            'ETH': 3500,
            'BTCB': 95000,
            'ADA': 0.45,
            'DOT': 7.2,
            'LINK': 14.5,
            'PAYU': 0.0000001
        }
        return fallbackPrices[symbol] || 0
    }

    // Combine PancakeSwap tokens with popular tokens and custom tokens
    const pancakeTokens = allPancakeTokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        decimals: 12, // Tüm tokenlar için 12 decimal kullanıyoruz
        logo: token.logoURI || `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/${token.address}/logo.png`,
        balance: '0.0' // Will be updated when wallet connects
    }))

    const allTokens = [...popularTokens, ...pancakeTokens, ...customTokens]

    // Update BNB balance when wallet connects
    useEffect(() => {
        if (bnbBalance && fromToken.symbol === 'BNB') {
            setFromToken(prev => ({
                ...prev,
                balance: parseFloat(bnbBalance.formatted).toFixed(6)
            }))
        }
    }, [bnbBalance, fromToken.symbol])

    // Update CAKE balance when wallet connects
    useEffect(() => {
        if (cakeBalance !== undefined && fromToken.symbol === 'CAKE') {
            setFromToken(prev => ({
                ...prev,
                balance: (parseFloat(cakeBalance.toString()) / (10 ** 12)).toFixed(6) // 12 decimal
            }))
        }
    }, [cakeBalance, fromToken.symbol])

    // Update PAYU balance when wallet connects
    useEffect(() => {
        if (payuBalance !== undefined && fromToken.symbol === 'PAYU') {
            setFromToken(prev => ({
                ...prev,
                balance: (parseFloat(payuBalance.toString()) / (10 ** 12)).toFixed(6) // 12 decimal
            }))
        }
    }, [payuBalance, fromToken.symbol])

    // Fetch all tokens and prices on component mount
    useEffect(() => {
        const fetchAllData = async () => {
            setTokensLoading(true)
            setPricesLoading(true)
            
            try {
                // Tüm tokenları ve fiyatlarını çek
                const { tokens, prices } = await fetchAllTokensWithPrices()
                
                setAllPancakeTokens(tokens)
                setTokenPrices(prices)
                
                console.log(`Loaded ${tokens.length} tokens from PancakeSwap`)
            } catch (error) {
                console.error('Failed to fetch tokens and prices:', error)
                
                // Fallback: sadece temel tokenları çek
                const basicTokens = ['BNB', 'CAKE', 'USDT', 'USDC', 'ETH', 'BTCB', 'ADA', 'DOT', 'LINK', 'PAYU']
                const prices = await fetchTokenPrices(basicTokens)
                setTokenPrices(prices)
            } finally {
                setTokensLoading(false)
                setPricesLoading(false)
            }
        }

        fetchAllData()
        
        // Her 30 saniyede bir tokenları ve fiyatları güncelle
        const interval = setInterval(fetchAllData, 30000)
        
        return () => clearInterval(interval)
    }, [])

    // Fiyat güncellendiğinde yeniden hesapla
    useEffect(() => {
        if (fromAmount && tokenPrices[fromToken.symbol] && tokenPrices[toToken.symbol]) {
            calculateToAmount(fromAmount)
        }
    }, [tokenPrices, fromToken.symbol, toToken.symbol])

    const handleQuickAmount = (percentage: number) => {
        const balance = parseFloat(fromToken.balance || '0')
        const amount = (balance * percentage).toFixed(6)
        setFromAmount(amount)
        calculateToAmount(amount)
    }

    const calculateToAmount = async (amount: string) => {
        if (!amount || parseFloat(amount) <= 0) {
            setToAmount('')
            return
        }
        
        try {
            // PancakeSwap'dan gerçek fiyat çek
            const realPrices = await fetchPancakeSwapRealPrices(fromToken.symbol, toToken.symbol)
            
            if (realPrices) {
                // PancakeSwap'ın gerçek exchange rate'ini kullan
                const toAmount = (parseFloat(amount) * realPrices.amount).toFixed(6)
                setToAmount(toAmount)
            } else {
                // Fallback: Gerçek fiyatlarla hesaplama
                const fromPrice = getRealPrice(fromToken.symbol)
                const toPrice = getRealPrice(toToken.symbol)
                
                if (fromPrice && toPrice) {
                    // USD bazında hesapla
                    const fromUSDValue = parseFloat(amount) * fromPrice
                    const toAmount = (fromUSDValue / toPrice).toFixed(6)
                    setToAmount(toAmount)
                } else {
                    // Fiyatlar yoksa 0 göster
                    setToAmount('0')
                }
            }
        } catch (error) {
            console.error('Error calculating amount:', error)
            setToAmount('')
        }
    }

    const handleFromAmountChange = (value: string) => {
        setFromAmount(value)
        calculateToAmount(value)
    }

    const handleTokenSelect = (token: any) => {
        if (selectingToken === 'from') {
            // Update balance based on token type
            if (token.symbol === 'BNB' && bnbBalance) {
                token.balance = parseFloat(bnbBalance.formatted).toFixed(6)
            } else if (token.symbol === 'CAKE' && cakeBalance !== undefined) {
                token.balance = (parseFloat(cakeBalance.toString()) / (10 ** 12)).toFixed(6) // 12 decimal
            } else if (token.symbol === 'PAYU' && payuBalance !== undefined) {
                token.balance = (parseFloat(payuBalance.toString()) / (10 ** 12)).toFixed(6) // 12 decimal
            } else {
                // For other tokens, show 0.0 balance
                token.balance = '0.0'
            }
            setFromToken(token)
            // Yeniden hesapla
            if (fromAmount) {
                calculateToAmount(fromAmount)
            }
        } else {
            // Update balance for 'to' token as well
            if (token.symbol === 'BNB' && bnbBalance) {
                token.balance = parseFloat(bnbBalance.formatted).toFixed(6)
            } else if (token.symbol === 'CAKE' && cakeBalance !== undefined) {
                token.balance = (parseFloat(cakeBalance.toString()) / (10 ** 12)).toFixed(6) // 12 decimal
            } else if (token.symbol === 'PAYU' && payuBalance !== undefined) {
                token.balance = (parseFloat(payuBalance.toString()) / (10 ** 12)).toFixed(6) // 12 decimal
            } else {
                token.balance = '0.0'
            }
            setToToken(token)
            // Yeniden hesapla
            if (fromAmount) {
                calculateToAmount(fromAmount)
            }
        }
        setShowTokenModal(false)
        setSearchTerm('')
    }

    const addCustomToken = async () => {
        if (!customTokenAddress || customTokenAddress.length !== 42) {
            alert('Please enter a valid contract address (42 characters)')
            return
        }
        
        if (!customTokenAddress.startsWith('0x')) {
            alert('Contract address must start with 0x')
            return
        }
        
        if (!/^0x[a-fA-F0-9]{40}$/.test(customTokenAddress)) {
            alert('Invalid contract address format')
            return
        }

        setCustomTokenLoading(true)
        
        try {
            // Web3.js ile token bilgilerini çek
            const Web3 = (await import('web3')).default
            const web3 = new Web3(window.ethereum)
            
            // ERC20 ABI
            const erc20ABI = [
                {
                    "constant": true,
                    "inputs": [],
                    "name": "name",
                    "outputs": [{"name": "", "type": "string"}],
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [{"name": "", "type": "string"}],
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [{"name": "", "type": "uint8"}],
                    "type": "function"
                }
            ]
            
            const contract = new web3.eth.Contract(erc20ABI, customTokenAddress)
            
            // Contract'ın geçerli olup olmadığını kontrol et
            const code = await web3.eth.getCode(customTokenAddress)
            if (code === '0x') {
                throw new Error('No contract found at this address')
            }
            
            const [name, symbol, decimals] = await Promise.all([
                contract.methods.name().call().catch(() => 'Unknown Token'),
                contract.methods.symbol().call().catch(() => 'UNKNOWN'),
                contract.methods.decimals().call().catch(() => '18')
            ])
            
            const newToken = {
                symbol: symbol as string,
                name: name as string,
                address: customTokenAddress,
                decimals: 12, // Tüm custom tokenlar için 12 decimal
                logo: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/${customTokenAddress}/logo.png`,
                balance: '0.0'
            }
            
            // Duplicate kontrolü
            const exists = allTokens.some(token => token.address.toLowerCase() === customTokenAddress.toLowerCase())
            if (exists) {
                alert('This token is already in the list')
                return
            }
            
            setCustomTokens(prev => [...prev, newToken])
            setCustomTokenAddress('')
            setIsAddingCustomToken(false)
            alert(`Token ${symbol} (${name}) added successfully!`)
            
        } catch (error: any) {
            console.error('Error adding custom token:', error)
            let errorMessage = 'Error adding token. Please check the contract address.'
            
            if (error.message.includes('No contract found')) {
                errorMessage = 'No contract found at this address. Please check the contract address.'
            } else if (error.message.includes('User denied')) {
                errorMessage = 'Transaction was cancelled by user.'
            } else if (error.message.includes('Invalid address')) {
                errorMessage = 'Invalid contract address format.'
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection.'
            }
            
            alert(errorMessage)
        } finally {
            setCustomTokenLoading(false)
        }
    }

    const filteredTokens = allTokens.filter(token => 
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSwap = async () => {
        if (!fromAmount || !toAmount || !account) {
            alert('Please enter valid amounts and connect wallet')
            return
        }

        setLoading(true)
        
        try {
            // PancakeSwap Router V2 contract address
            const ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
            
            // PancakeSwap Router ABI
            const ROUTER_ABI = [
                {
                    "inputs": [
                        {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
                        {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
                        {"internalType": "address[]", "name": "path", "type": "address[]"},
                        {"internalType": "address", "name": "to", "type": "address"},
                        {"internalType": "uint256", "name": "deadline", "type": "uint256"}
                    ],
                    "name": "swapExactTokensForTokens",
                    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
                        {"internalType": "address[]", "name": "path", "type": "address[]"},
                        {"internalType": "address", "name": "to", "type": "address"},
                        {"internalType": "uint256", "name": "deadline", "type": "uint256"}
                    ],
                    "name": "swapExactBNBForTokens",
                    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
                        {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
                        {"internalType": "address[]", "name": "path", "type": "address[]"},
                        {"internalType": "address", "name": "to", "type": "address"},
                        {"internalType": "uint256", "name": "deadline", "type": "uint256"}
                    ],
                    "name": "swapExactTokensForBNB",
                    "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
                    "stateMutability": "payable",
                    "type": "function"
                }
            ]

            // Web3 instance oluştur
            const Web3 = (await import('web3')).default
            const web3 = new Web3(window.ethereum)
            
            // Contract instance
            const routerContract = new web3.eth.Contract(ROUTER_ABI, ROUTER_ADDRESS)
            
            // Path oluştur
            let path: string[]
            if (fromToken.symbol === 'BNB') {
                path = ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', toToken.address] // WBNB -> TOKEN
            } else if (toToken.symbol === 'BNB') {
                path = [fromToken.address, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'] // TOKEN -> WBNB
            } else {
                path = [fromToken.address, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', toToken.address] // TOKEN -> WBNB -> TOKEN
            }

            // Amount hesapla - gerçek decimal kullan
            const fromDecimals = fromToken.decimals || 18
            const toDecimals = toToken.decimals || 18
            
            // Gerçek decimal ile amount hesapla - Web3.js uyumlu
            const amountIn = web3.utils.toWei(fromAmount, 'ether')
            const amountOutMin = web3.utils.toWei((parseFloat(toAmount) * (1 - slippage / 100)).toString(), 'ether')
            const deadline = Math.floor(Date.now() / 1000) + 600 // 10 dakika

            let tx

            if (fromToken.symbol === 'BNB') {
                // BNB -> Token swap
                tx = await routerContract.methods.swapExactBNBForTokens(
                    amountOutMin,
                    path,
                    account,
                    deadline
                ).send({
                    from: account,
                    value: amountIn,
                    gas: '300000'
                })
            } else if (toToken.symbol === 'BNB') {
                // Token -> BNB swap
                // Önce approve et
                const tokenContract = new web3.eth.Contract([
                    {
                        "constant": false,
                        "inputs": [
                            {"name": "_spender", "type": "address"},
                            {"name": "_value", "type": "uint256"}
                        ],
                        "name": "approve",
                        "outputs": [{"name": "", "type": "bool"}],
                        "type": "function"
                    }
                ], fromToken.address)
                
                await tokenContract.methods.approve(ROUTER_ADDRESS, amountIn).send({ from: account })
                
                tx = await routerContract.methods.swapExactTokensForBNB(
                    amountIn,
                    amountOutMin,
                    path,
                    account,
                    deadline
                ).send({
                    from: account,
                    gas: '300000'
                })
            } else {
                // Token -> Token swap
                // Önce approve et
                const tokenContract = new web3.eth.Contract([
                    {
                        "constant": false,
                        "inputs": [
                            {"name": "_spender", "type": "address"},
                            {"name": "_value", "type": "uint256"}
                        ],
                        "name": "approve",
                        "outputs": [{"name": "", "type": "bool"}],
                        "type": "function"
                    }
                ], fromToken.address)
                
                await tokenContract.methods.approve(ROUTER_ADDRESS, amountIn).send({ from: account })
                
                tx = await routerContract.methods.swapExactTokensForTokens(
                    amountIn,
                    amountOutMin,
                    path,
                    account,
                    deadline
                ).send({
                    from: account,
                    gas: '300000'
                })
            }

            alert(`Swap successful! Transaction: ${tx.transactionHash}`)
            
            // Amounts'ları temizle
            setFromAmount('')
            setToAmount('')
            
            // Balances'ları güncelle
            if (fromToken.symbol === 'BNB' && bnbBalance) {
                setFromToken(prev => ({
                    ...prev,
                    balance: parseFloat(bnbBalance.formatted).toFixed(6)
                }))
            }

        } catch (error: any) {
            console.error('Swap error:', error)
            
            let errorMessage = 'Swap failed. Please try again.'
            
            if (error.message.includes('User denied')) {
                errorMessage = 'Transaction was cancelled by user.'
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for this transaction.'
            } else if (error.message.includes('slippage')) {
                errorMessage = 'Price moved too much. Try increasing slippage tolerance.'
            } else if (error.message.includes('gas')) {
                errorMessage = 'Transaction failed due to gas issues.'
            }
            
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (!account || !isConnected) {
        return (
            <SwapContainer>
                <SwapCard>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '20px' }}>
                        <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Connect Your Wallet</h2>
                        <ConnectButton />
                        {isConnecting && (
                            <p style={{ color: '#1FC7D4', fontSize: '14px' }}>Connecting...</p>
                        )}
                        <p style={{ color: '#b8add2', fontSize: '12px', textAlign: 'center', maxWidth: '300px' }}>
                            Connect your wallet to start swapping tokens on BNB Smart Chain
                        </p>
                    </div>
                </SwapCard>
            </SwapContainer>
        )
    }

    return (
        <SwapContainer>
            <SwapCard>
                {/* From Section */}
                <HeaderRow>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Label>From:</Label>
                        <WalletAddress>
                            <WalletIcon />
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </WalletAddress>
                    </div>
                    <QuickButtons>
                        <QuickButton onClick={() => handleQuickAmount(0.25)}>25%</QuickButton>
                        <QuickButton onClick={() => handleQuickAmount(0.5)}>50%</QuickButton>
                        <QuickButton isMax onClick={() => {
                            const maxAmount = fromToken.balance || '0'
                            setFromAmount(maxAmount)
                            calculateToAmount(maxAmount)
                        }}>MAX</QuickButton>
                    </QuickButtons>
                </HeaderRow>

                <TokenBox>
                    <TokenRow>
                        <TokenInfo onClick={() => {
                            setSelectingToken('from')
                            setShowTokenModal(true)
                        }}>
                            <TokenLogoImg 
                                src={fromToken.logo} 
                                alt={fromToken.symbol}
                                onError={(e) => {
                                    e.currentTarget.src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png`
                                }}
                            />
                            <TokenDetails>
                                <TokenSymbol>
                                    {fromToken.symbol}
                                    <span style={{ color: '#6e6e82' }}>▼</span>
                                </TokenSymbol>
                                <TokenChain>BNB Chain</TokenChain>
                            </TokenDetails>
                        </TokenInfo>
                        <AmountInfo>
                            <input
                                type="number"
                                value={fromAmount}
                                onChange={(e) => handleFromAmountChange(e.target.value)}
                                placeholder="0.00"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    textAlign: 'right',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                            <USDValue>
                                ~${(parseFloat(fromAmount || '0') * getRealPrice(fromToken.symbol)).toFixed(2)} USD
                                {pricesLoading && <span style={{ color: '#1FC7D4', fontSize: '10px', marginLeft: '4px' }}>🔄</span>}
                            </USDValue>
                        </AmountInfo>
                    </TokenRow>
                </TokenBox>

                {/* Arrow */}
                <ArrowContainer>
                    <ArrowButton onClick={() => {
                        // Swap tokens logic
                        const tempFrom = fromToken
                        const tempFromAmount = fromAmount
                        const tempToAmount = toAmount
                        
                        setFromToken(toToken)
                        setToToken(tempFrom)
                        setFromAmount(tempToAmount)
                        setToAmount(tempFromAmount)
                    }}>
                        ↓
                    </ArrowButton>
                </ArrowContainer>

                {/* To Section */}
                <HeaderRow>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Label>To:</Label>
                        <WalletAddress>
                            <WalletIcon />
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </WalletAddress>
                    </div>
                    <div style={{ color: '#6e6e82', fontSize: '14px' }}>⚙️</div>
                </HeaderRow>

                <TokenBox>
                    <TokenRow>
                        <TokenInfo onClick={() => {
                            setSelectingToken('to')
                            setShowTokenModal(true)
                        }}>
                            <TokenLogoImg 
                                src={toToken.logo} 
                                alt={toToken.symbol}
                                onError={(e) => {
                                    e.currentTarget.src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png`
                                }}
                            />
                            <TokenDetails>
                                <TokenSymbol>
                                    {toToken.symbol}
                                    <span style={{ color: '#6e6e82' }}>▼</span>
                                </TokenSymbol>
                                <TokenChain>BNB Chain</TokenChain>
                            </TokenDetails>
                        </TokenInfo>
                        <AmountInfo>
                            <Amount>{toAmount || '0.00'}</Amount>
                            <USDValue>
                                ~${(parseFloat(toAmount || '0') * getRealPrice(toToken.symbol)).toFixed(2)} USD
                                {pricesLoading && <span style={{ color: '#1FC7D4', fontSize: '10px', marginLeft: '4px' }}>🔄</span>}
                            </USDValue>
                        </AmountInfo>
                    </TokenRow>
                </TokenBox>

                {/* Slippage */}
                <SlippageRow>
                    <Label>Slippage Tolerance</Label>
                    <SlippageValue onClick={() => setShowSlippageModal(true)}>
                        Auto: {slippage}% ✏️
                    </SlippageValue>
                </SlippageRow>

                {/* Swap Button */}
                <SwapButton onClick={handleSwap} disabled={loading}>
                    {loading ? 'Swapping...' : 'Swap'}
                </SwapButton>

                {/* Conversion Rate */}
                {fromAmount && toAmount && (
                    <ConversionRow>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <RefreshIcon />
                            1 {fromToken.symbol} ↔ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                        </div>
                        <div style={{ color: '#6e6e82' }}>
                            Fee 0.00000998 BNB ▼
                        </div>
                    </ConversionRow>
                )}

                {/* MEV Protect */}
                <MEVRow>
                    <MEVLabel onClick={() => setMevProtect(!mevProtect)}>
                        🛡️ Enable MEV Protect
                    </MEVLabel>
                    <ToggleSwitch 
                        active={mevProtect} 
                        onClick={() => setMevProtect(!mevProtect)}
                    />
                </MEVRow>
            </SwapCard>

            {/* Token Selection Modal */}
            <TokenModal show={showTokenModal}>
                <TokenModalContent>
                    <CloseButton onClick={() => setShowTokenModal(false)}>×</CloseButton>
                    <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>
                        Select {selectingToken === 'from' ? 'From' : 'To'} Token
                        {tokensLoading && <span style={{ color: '#1FC7D4', fontSize: '12px', marginLeft: '8px' }}>🔄 Loading...</span>}
                    </h3>
                    <TokenSearch
                        placeholder="Search name or paste address"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            if (e.target.value.length === 42 && e.target.value.startsWith('0x')) {
                                setIsAddingCustomToken(true)
                                setCustomTokenAddress(e.target.value)
                            } else {
                                setIsAddingCustomToken(false)
                            }
                        }}
                    />
                    
                    {isAddingCustomToken && (
                        <div style={{ 
                            background: '#353444', 
                            borderRadius: '12px', 
                            padding: '12px', 
                            marginBottom: '16px',
                            border: '1px solid #1FC7D4'
                        }}>
                            <div style={{ color: '#1FC7D4', fontSize: '14px', marginBottom: '8px' }}>
                                Add Custom Token
                            </div>
                            <div style={{ color: '#b8add2', fontSize: '12px', marginBottom: '8px' }}>
                                Contract: {customTokenAddress}
                            </div>
                            <button
                                onClick={addCustomToken}
                                disabled={customTokenLoading}
                                style={{
                                    background: '#1FC7D4',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontSize: '12px',
                                    cursor: customTokenLoading ? 'not-allowed' : 'pointer',
                                    opacity: customTokenLoading ? 0.5 : 1
                                }}
                            >
                                {customTokenLoading ? 'Adding...' : 'Add Token'}
                            </button>
                        </div>
                    )}
                    
                    <TokenList>
                        {tokensLoading ? (
                            <div style={{ 
                                textAlign: 'center', 
                                color: '#1FC7D4', 
                                padding: '20px',
                                fontSize: '14px'
                            }}>
                                🔄 Loading PancakeSwap tokens...
                            </div>
                        ) : (
                            <>
                                <div style={{ 
                                    color: '#6e6e82', 
                                    fontSize: '12px', 
                                    marginBottom: '10px',
                                    textAlign: 'center'
                                }}>
                                    {filteredTokens.length} tokens available • 🥞 PancakeSwap
                                </div>
                                {filteredTokens.map((token, index) => (
                                    <TokenItem key={`${token.address}-${index}`} onClick={() => handleTokenSelect(token)}>
                                        <TokenLogoImg 
                                            src={token.logo} 
                                            alt={token.symbol}
                                            onError={(e) => {
                                                e.currentTarget.src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png`
                                            }}
                                        />
                                        <TokenInfoModal>
                                            <TokenSymbolModal>{token.symbol}</TokenSymbolModal>
                                            <TokenNameModal>{token.name}</TokenNameModal>
                                            <TokenPriceModal>
                                                ${getRealPrice(token.symbol).toFixed(4)} 
                                                {tokenPrices[token.symbol]?.change24h ? 
                                                    (tokenPrices[token.symbol].change24h > 0 ? ' ↗' : ' ↘') : ''}
                                                <span style={{ color: '#1FC7D4', fontSize: '10px', marginLeft: '4px' }}>
                                                    🥞
                                                </span>
                                            </TokenPriceModal>
                                        </TokenInfoModal>
                                    </TokenItem>
                                ))}
                            </>
                        )}
                    </TokenList>
                </TokenModalContent>
            </TokenModal>

            {/* Slippage Setting Modal */}
            {showSlippageModal && (
                <SlippageModalOverlay onClick={() => setShowSlippageModal(false)}>
                    <SlippageModalContent onClick={e => e.stopPropagation()}>
                        <SlippageModalHeader>
                            <SlippageModalTitle>Slippage Setting</SlippageModalTitle>
                            <SlippageCloseButton onClick={() => setShowSlippageModal(false)}>
                                ×
                            </SlippageCloseButton>
                        </SlippageModalHeader>
                        <SlippageOptions>
                            <SlippageOptionButton
                                $active={slippage === 0.5}
                                onClick={() => {
                                    setSlippage(0.5)
                                    setCustomSlippageInput('0.5')
                                    setShowSlippageModal(false)
                                }}
                            >
                                Auto
                            </SlippageOptionButton>
                            {['0.1', '0.5', '1.0'].map(option => (
                                <SlippageOptionButton
                                    key={option}
                                    $active={slippage === parseFloat(option)}
                                    onClick={() => {
                                        setSlippage(parseFloat(option))
                                        setCustomSlippageInput(option)
                                        setShowSlippageModal(false)
                                    }}
                                >
                                    {option}%
                                </SlippageOptionButton>
                            ))}
                        </SlippageOptions>
                        <CustomSlippageInputContainer>
                            <CustomSlippageInput
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Custom slippage"
                                value={customSlippageInput}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setCustomSlippageInput(value)
                                    if (value && !isNaN(parseFloat(value))) {
                                        setSlippage(parseFloat(value))
                                    }
                                }}
                            />
                            <PercentageLabel>%</PercentageLabel>
                        </CustomSlippageInputContainer>
                    </SlippageModalContent>
                </SlippageModalOverlay>
            )}
        </SwapContainer>
    )
}