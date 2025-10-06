'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import styled from 'styled-components'

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
    const { address: account } = useAccount()
    const { connect, connectors } = useConnect()
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
        balance: '1.2345'
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
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/logo.png',
            balance: '1.2345'
        },
        {
            symbol: 'PAYU',
            name: 'PAYU Token',
            address: '0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'CAKE',
            name: 'PancakeSwap Token',
            address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'USDT',
            name: 'Tether USD',
            address: '0x55d398326f99059fF775485246999027B3197955',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x55d398326f99059fF775485246999027B3197955/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'USDC',
            name: 'USD Coin',
            address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'ETH',
            name: 'Ethereum Token',
            address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x2170Ed0880ac9A755fd29B2688956BD959F933F8/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'BTCB',
            name: 'Bitcoin BEP2',
            address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'ADA',
            name: 'Cardano Token',
            address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'DOT',
            name: 'Polkadot Token',
            address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402/logo.png',
            balance: '0.0'
        },
        {
            symbol: 'LINK',
            name: 'ChainLink Token',
            address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
            decimals: 18,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD/logo.png',
            balance: '0.0'
        }
    ]

    const [customTokens, setCustomTokens] = useState<any[]>([])
    const [isAddingCustomToken, setIsAddingCustomToken] = useState(false)
    const [customTokenAddress, setCustomTokenAddress] = useState('')
    const [customTokenLoading, setCustomTokenLoading] = useState(false)

    const allTokens = [...popularTokens, ...customTokens]

    const handleQuickAmount = (percentage: number) => {
        const balance = parseFloat(fromToken.balance || '0')
        const amount = (balance * percentage).toFixed(6)
        setFromAmount(amount)
        calculateToAmount(amount)
    }

    const calculateToAmount = (amount: string) => {
        if (!amount || parseFloat(amount) <= 0) {
            setToAmount('')
            return
        }
        
        // Mock calculation - gerçekte API'den gelecek
        const mockRate = 0.0029625 // 1 CAKE = 0.0029625 BNB
        const calculated = (parseFloat(amount) / mockRate).toFixed(6)
        setToAmount(calculated)
    }

    const handleFromAmountChange = (value: string) => {
        setFromAmount(value)
        calculateToAmount(value)
    }

    const handleTokenSelect = (token: any) => {
        if (selectingToken === 'from') {
            setFromToken(token)
        } else {
            setToToken(token)
        }
        setShowTokenModal(false)
        setSearchTerm('')
    }

    const addCustomToken = async () => {
        if (!customTokenAddress || customTokenAddress.length !== 42) {
            alert('Please enter a valid contract address (42 characters)')
            return
        }

        setCustomTokenLoading(true)
        
        try {
            // Web3.js ile token bilgilerini çek
            const Web3 = require('web3')
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
            
            const [name, symbol, decimals] = await Promise.all([
                contract.methods.name().call(),
                contract.methods.symbol().call(),
                contract.methods.decimals().call()
            ])
            
            const newToken = {
                symbol: symbol,
                name: name,
                address: customTokenAddress,
                decimals: parseInt(decimals),
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
            
        } catch (error) {
            console.error('Error adding custom token:', error)
            alert('Error adding token. Please check the contract address.')
        } finally {
            setCustomTokenLoading(false)
        }
    }

    const filteredTokens = allTokens.filter(token => 
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSwap = () => {
        setLoading(true)
        // Swap logic here
        setTimeout(() => {
            setLoading(false)
        }, 2000)
    }

    if (!account) {
        return (
            <SwapContainer>
                <SwapCard>
                    <WalletButton onClick={() => {
                        const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask')
                        if (metaMaskConnector) {
                            connect({ connector: metaMaskConnector })
                        }
                    }}>
                        Connect Wallet
                    </WalletButton>
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
                        <QuickButton isMax onClick={() => setFromAmount(fromToken.balance || '0')}>MAX</QuickButton>
                    </QuickButtons>
                </HeaderRow>

                <TokenBox hasGradient>
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
                            <USDValue>~{(parseFloat(fromAmount || '0') * 1200).toFixed(2)} USD</USDValue>
                        </AmountInfo>
                    </TokenRow>
                </TokenBox>

                {/* Arrow */}
                <ArrowContainer>
                    <ArrowButton onClick={() => {
                        // Swap tokens logic
                        const temp = fromToken
                        // setFromToken(toToken)
                        // setToToken(temp)
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
                            <USDValue>~{(parseFloat(toAmount || '0') * 3.5).toFixed(2)} USD</USDValue>
                        </AmountInfo>
                    </TokenRow>
                </TokenBox>

                {/* Slippage */}
                <SlippageRow>
                    <Label>Slippage Tolerance</Label>
                    <SlippageValue>
                        Auto: {slippage}% ✏️
                    </SlippageValue>
                </SlippageRow>

                {/* Swap Button */}
                <SwapButton onClick={handleSwap} disabled={loading}>
                    {loading ? 'Swapping...' : 'Swap'}
                </SwapButton>

                {/* Conversion Rate */}
                <ConversionRow>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <RefreshIcon />
                        1 CAKE ↔ 0.0029625 BNB
                    </div>
                    <div style={{ color: '#6e6e82' }}>
                        Fee 0.00000998 BNB ▼
                    </div>
                </ConversionRow>

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
                        {filteredTokens.map((token, index) => (
                            <TokenItem key={index} onClick={() => handleTokenSelect(token)}>
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
                                </TokenInfoModal>
                            </TokenItem>
                        ))}
                    </TokenList>
                </TokenModalContent>
            </TokenModal>
        </SwapContainer>
    )
}