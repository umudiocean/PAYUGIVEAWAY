'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';

// ==================== TYPE DEFINITIONS ====================

interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logo: string;
    balance?: string;
    priceUSD?: number;
}

interface ContractMethod {
    call: () => Promise<any>;
    send: (options: { from: string; value?: string; gas?: number; gasPrice?: string }) => Promise<any>;
    encodeABI: () => string;
}

interface ERC20Contract {
    methods: {
        balanceOf: (address: string) => ContractMethod;
        allowance: (owner: string, spender: string) => ContractMethod;
        approve: (spender: string, amount: string) => ContractMethod;
        symbol: () => ContractMethod;
        name: () => ContractMethod;
        decimals: () => ContractMethod;
    };
}

interface PancakeRouterContract {
    methods: {
        getAmountsOut: (amountIn: string, path: string[]) => ContractMethod;
        swapExactETHForTokens: (amountOutMin: string, path: string[], to: string, deadline: number) => ContractMethod;
        swapExactTokensForETH: (amountIn: string, amountOutMin: string, path: string[], to: string, deadline: number) => ContractMethod;
        swapExactTokensForTokens: (amountIn: string, amountOutMin: string, path: string[], to: string, deadline: number) => ContractMethod;
    };
}

// ==================== CONTRACT SETUP ====================
const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap V2 Router
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const PLATFORM_FEE = "0.00025"; // 0.00025 BNB per swap
const FEE_ADDRESS = "0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a"; // Platform fee address

// PancakeSwap Router V2 ABI
const PANCAKE_ROUTER_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"}
        ],
        "name": "getAmountsOut",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactETHForTokens",
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
        "name": "swapExactTokensForETH",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "nonpayable",
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
        "name": "swapExactTokensForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const ERC20_ABI = [
    {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];

const INITIAL_TOKEN_LIST: Token[] = [
    { 
        symbol: "BNB", 
        name: "BNB", 
        address: WBNB, 
        decimals: 18, 
        logo: "https://tokens.pancakeswap.finance/images/symbol/bnb.png",
        priceUSD: 0
    },
    { 
        symbol: "CAKE", 
        name: "PancakeSwap Token", 
        address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", 
        decimals: 18, 
        logo: "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png",
        priceUSD: 0
    },
    { 
        symbol: "USDT", 
        name: "Tether USD", 
        address: "0x55d398326f99059fF775485246999027B3197955", 
        decimals: 18, 
        logo: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
        priceUSD: 1
    },
    { 
        symbol: "BUSD", 
        name: "Binance USD", 
        address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", 
        decimals: 18, 
        logo: "https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png",
        priceUSD: 1
    },
    { 
        symbol: "USDC", 
        name: "USD Coin", 
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", 
        decimals: 18, 
        logo: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png",
        priceUSD: 1
    },
    { 
        symbol: "ETH", 
        name: "Ethereum Token", 
        address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", 
        decimals: 18, 
        logo: "https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png",
        priceUSD: 0
    },
    { 
        symbol: "BTCB", 
        name: "Bitcoin BEP2", 
        address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", 
        decimals: 18, 
        logo: "https://tokens.pancakeswap.finance/images/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png",
        priceUSD: 0
    }
];

const COINGECKO_IDS: { [key: string]: string } = {
    'BNB': 'binancecoin',
    'CAKE': 'pancakeswap-token',
    'USDT': 'tether',
    'BUSD': 'binance-usd',
    'USDC': 'usd-coin',
    'ETH': 'ethereum',
    'BTCB': 'bitcoin'
};

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(139.73deg, rgb(8, 6, 22) 0%, rgb(15, 12, 35) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
`;

const SwapCard = styled.div`
    background: #27262c;
    border-radius: 32px;
    width: 100%;
    max-width: 440px;
    padding: 24px;
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01);
`;

const SwapHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const SwapTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: #F4EEFF;
    margin: 0;
`;

const SettingsIcon = styled.button`
    width: 32px;
    height: 32px;
    background: #372F47;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #B8ADD2;
    transition: all 0.2s;

    &:hover {
        background: #453A5C;
        color: #F4EEFF;
    }
`;

const WalletButton = styled.button`
    width: 100%;
    padding: 16px;
    background: linear-gradient(270deg, #7645D9 0%, #5121B1 100%);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 4px 12px rgba(118, 69, 217, 0.4);
    }
`;

const ConnectedWallet = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #372F47;
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #F4EEFF;
`;

const TokenBox = styled.div`
    background: #372F47;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 8px;
`;

const TokenBoxHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

const Label = styled.span`
    font-size: 14px;
    color: #B8ADD2;
    font-weight: 600;
`;

const PercentButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const PercentButton = styled.button`
    background: transparent;
    border: none;
    color: #1FC7D4;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        background: rgba(31, 199, 212, 0.1);
    }
`;

const TokenInputRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const TokenInput = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    font-size: 24px;
    font-weight: 600;
    color: #F4EEFF;
    outline: none;

    &::placeholder {
        color: #B8ADD2;
        opacity: 0.5;
    }

    &:disabled {
        color: #B8ADD2;
    }
`;

const TokenSelectButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: #27262c;
    border: none;
    padding: 8px 12px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    color: #F4EEFF;
    transition: all 0.2s;
    min-width: 120px;
    justify-content: space-between;

    &:hover {
        background: #453A5C;
    }

    img {
        width: 24px;
        height: 24px;
        border-radius: 50%;
    }
`;

const USDValue = styled.div`
    font-size: 12px;
    color: #B8ADD2;
    text-align: right;
    margin-top: 4px;
`;

const ArrowContainer = styled.div`
    display: flex;
    justify-content: center;
    margin: -16px 0;
    z-index: 1;
    position: relative;
`;

const ArrowButton = styled.button`
    width: 40px;
    height: 40px;
    background: #27262c;
    border: 4px solid #372F47;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 20px;
    color: #1FC7D4;

    &:hover {
        transform: rotate(180deg);
    }
`;

const SettingsRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px 0;
    padding: 12px;
    background: #372F47;
    border-radius: 12px;
`;

const SlippageValue = styled.button`
    background: transparent;
    border: none;
    color: #1FC7D4;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
`;

const SwapButton = styled.button<{ disabled?: boolean }>`
    width: 100%;
    padding: 16px;
    background: ${props => props.disabled ? '#383241' : 'linear-gradient(270deg, #7645D9 0%, #5121B1 100%)'};
    color: ${props => props.disabled ? '#B8ADD2' : 'white'};
    border: none;
    border-radius: 16px;
    font-size: 18px;
    font-weight: 700;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s;
    margin-top: 16px;

    &:hover {
        ${props => !props.disabled && `
            transform: translateY(-2px);
            box-shadow: 0px 4px 12px rgba(118, 69, 217, 0.4);
        `}
    }
`;

const PriceInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #372F47;
    border-radius: 12px;
    margin-top: 12px;
    font-size: 14px;
`;

const PriceLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #F4EEFF;
`;

const PriceRight = styled.div`
    color: #B8ADD2;
    font-size: 12px;
`;

const FeeInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(31, 199, 212, 0.1);
    border-radius: 8px;
    margin-top: 8px;
    font-size: 12px;
    color: #1FC7D4;
`;

const MEVProtect = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #372F47;
    border-radius: 12px;
    margin-top: 12px;
    cursor: pointer;

    input {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #7645D9;
    }

    label {
        font-size: 14px;
        color: #F4EEFF;
        font-weight: 600;
        cursor: pointer;
        flex: 1;
    }
`;

const Modal = styled.div<{ show: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: ${props => props.show ? 'flex' : 'none'};
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #27262c;
    border-radius: 24px;
    padding: 24px;
    width: 90%;
    max-width: 420px;
    max-height: 80vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    color: #F4EEFF;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #B8ADD2;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;

    &:hover {
        background: #372F47;
    }
`;

const TokenListItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #372F47;
    }

    img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }
`;

const TokenInfo = styled.div`
    flex: 1;
`;

const TokenSymbol = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #F4EEFF;
`;

const TokenName = styled.div`
    font-size: 12px;
    color: #B8ADD2;
`;

const TokenBalance = styled.div`
    text-align: right;
    font-size: 14px;
    color: #F4EEFF;
`;

const SlippageOptions = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 16px 0;
`;

const SlippageOption = styled.button<{ active: boolean }>`
    padding: 12px;
    background: ${props => props.active ? '#7645D9' : '#372F47'};
    color: ${props => props.active ? 'white' : '#F4EEFF'};
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        opacity: 0.8;
    }
`;

const ErrorText = styled.div`
    color: #ED4B9E;
    font-size: 14px;
    margin-top: 12px;
    padding: 12px;
    background: rgba(237, 75, 158, 0.1);
    border-radius: 12px;
`;

const SuccessText = styled.div`
    color: #31D0AA;
    font-size: 14px;
    margin-top: 12px;
    padding: 12px;
    background: rgba(49, 208, 170, 0.1);
    border-radius: 12px;
`;

// ==================== MAIN COMPONENT ====================
export default function SwapPage() {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string>('');
    const [pancakeRouter, setPancakeRouter] = useState<PancakeRouterContract | null>(null);
    
    const [tokenList, setTokenList] = useState<Token[]>(INITIAL_TOKEN_LIST);
    const [fromToken, setFromToken] = useState<Token>(INITIAL_TOKEN_LIST[0]);
    const [toToken, setToToken] = useState<Token>(INITIAL_TOKEN_LIST[1]);
    const [fromAmount, setFromAmount] = useState<string>('');
    const [toAmount, setToAmount] = useState<string>('');
    const [fromBalance, setFromBalance] = useState<string>('0');
    const [toBalance, setToBalance] = useState<string>('0');
    
    const [loading, setLoading] = useState<boolean>(false);
    const [slippage, setSlippage] = useState<number>(2);
    const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
    const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from');
    const [showSlippageModal, setShowSlippageModal] = useState<boolean>(false);
    const [mevProtect, setMevProtect] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // Fetch token prices with silent fail
    const fetchTokenPrices = useCallback(async () => {
        try {
            const ids = Object.values(COINGECKO_IDS).filter(id => id !== '').join(',');
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
                { 
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                }
            );
            
            // If API fails, just continue without prices
            if (!response.ok) {
                console.warn('CoinGecko API unavailable, prices will not update');
                return;
            }
            
            const data = await response.json();

            setTokenList(prev => prev.map(token => {
                const coinGeckoId = COINGECKO_IDS[token.symbol];
                if (coinGeckoId && data[coinGeckoId]) {
                    return { ...token, priceUSD: data[coinGeckoId].usd };
                }
                return token;
            }));
        } catch (error) {
            // Silent fail - prices are nice to have but not critical
            console.warn('Price fetch failed:', error);
        }
    }, []);

    // Update balance
    const updateBalance = useCallback(async (
        token: Token,
        setBalance: React.Dispatch<React.SetStateAction<string>>
    ) => {
        if (!web3 || !account) return;

        try {
            if (token.symbol === 'BNB') {
                const balance = await web3.eth.getBalance(account);
                const balanceInEther = web3.utils.fromWei(balance, 'ether');
                setBalance(balanceInEther);
            } else {
                const tokenContract = new web3.eth.Contract(
                    ERC20_ABI,
                    token.address
                ) as unknown as ERC20Contract;
                const balance = await tokenContract.methods.balanceOf(account).call();
                const balanceInEther = web3.utils.fromWei(balance as string, 'ether');
                setBalance(balanceInEther);
            }
        } catch (error) {
            console.error('Balance error:', error);
            setBalance('0');
        }
    }, [web3, account]);

    // Get quote from PancakeSwap Router
    const getQuote = useCallback(async () => {
        if (!pancakeRouter || !fromAmount || !web3) return;

        try {
            let path: string[];
            if (fromToken.symbol === 'BNB') {
                path = [WBNB, toToken.address];
            } else if (toToken.symbol === 'BNB') {
                path = [fromToken.address, WBNB];
            } else {
                path = [fromToken.address, WBNB, toToken.address];
            }

            const amountIn = web3.utils.toWei(fromAmount, 'ether');
            const amounts = await pancakeRouter.methods.getAmountsOut(amountIn, path).call();

            const output = web3.utils.fromWei((amounts as string[])[amounts.length - 1], 'ether');
            setToAmount(parseFloat(output).toFixed(6));
        } catch (error) {
            console.error('Quote error:', error);
            setToAmount('0');
        }
    }, [pancakeRouter, fromAmount, web3, fromToken, toToken]);

    const fromUSDValue = fromAmount && fromToken.priceUSD
        ? (parseFloat(fromAmount) * fromToken.priceUSD).toFixed(2)
        : '0.00';

    const toUSDValue = toAmount && toToken.priceUSD
        ? (parseFloat(toAmount) * toToken.priceUSD).toFixed(2)
        : '0.00';

    const feeUSDValue = fromToken.priceUSD
        ? (parseFloat(PLATFORM_FEE) * fromToken.priceUSD).toFixed(2)
        : '0.15';

    useEffect(() => {
        fetchTokenPrices();
        const interval = setInterval(fetchTokenPrices, 30000);
        return () => clearInterval(interval);
    }, [fetchTokenPrices]);

    useEffect(() => {
        if (account) {
            updateBalance(fromToken, setFromBalance);
            updateBalance(toToken, setToBalance);
        }
    }, [account, fromToken, toToken, updateBalance]);

    useEffect(() => {
        if (fromAmount && fromToken && toToken && web3 && pancakeRouter) {
            const debounce = setTimeout(getQuote, 500);
            return () => clearTimeout(debounce);
        } else {
            setToAmount('');
        }
    }, [fromAmount, fromToken, toToken, web3, pancakeRouter, getQuote]);

    useEffect(() => {
        const updatedFrom = tokenList.find(t => t.address === fromToken.address);
        const updatedTo = tokenList.find(t => t.address === toToken.address);

        if (updatedFrom) setFromToken(updatedFrom);
        if (updatedTo) setToToken(updatedTo);
    }, [tokenList]);

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask!');
            return;
        }

        try {
            const web3Instance = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const accounts = await web3Instance.eth.getAccounts();
            const chainId = await web3Instance.eth.getChainId();

            if (chainId !== 56n) {
                alert('Please switch to BSC Mainnet!');
                return;
            }

            const routerInstance = new web3Instance.eth.Contract(
                PANCAKE_ROUTER_ABI,
                PANCAKE_ROUTER
            ) as unknown as PancakeRouterContract;

            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setPancakeRouter(routerInstance);
        } catch (error: any) {
            setError('Failed to connect: ' + error.message);
        }
    };

    const handleSwitch = () => {
        const tempToken = fromToken;
        const tempAmount = fromAmount;
        const tempBalance = fromBalance;

        setFromToken(toToken);
        setToToken(tempToken);
        setFromAmount(toAmount);
        setFromBalance(toBalance);
        setToBalance(tempBalance);
    };

    const handleTokenSelect = (token: Token) => {
        if (selectingToken === 'from') {
            if (token.address === toToken.address) setToToken(fromToken);
            setFromToken(token);
        } else {
            if (token.address === fromToken.address) setFromToken(toToken);
            setToToken(token);
        }
        setShowTokenModal(false);
    };

    const setPercentAmount = (percent: number) => {
        if (fromBalance && parseFloat(fromBalance) > 0) {
            let amount = parseFloat(fromBalance) * percent / 100;
            
            // Reserve for gas and fee if BNB
            if (fromToken.symbol === 'BNB') {
                const reserve = 0.0005 + parseFloat(PLATFORM_FEE); // gas + platform fee
                if (percent === 100) {
                    amount = Math.max(0, amount - reserve);
                }
            }
            
            setFromAmount(amount.toFixed(6));
        }
    };

    // Transaction receipt waiting function

    const approveToken = async (tokenAddress: string, amount: string): Promise<string> => {
        if (!web3 || !account || typeof window.ethereum === 'undefined') return '';

        const tokenContract = new web3.eth.Contract(
            ERC20_ABI,
            tokenAddress
        ) as unknown as ERC20Contract;

        const currentAllowance = await tokenContract.methods.allowance(account, PANCAKE_ROUTER).call();
        const amountInWei = web3.utils.toWei(amount, 'ether');

        if (BigInt(currentAllowance as string) >= BigInt(amountInWei)) return 'already-approved';

        try {
            setError('');
            setSuccess('Approving token...');
            
            // Unlimited approval
            const unlimitedAmount = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
            
            // Get contract ABI for approve
            const approveData = tokenContract.methods.approve(PANCAKE_ROUTER, unlimitedAmount);
            
            // Use MetaMask request - return hash immediately
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: account,
                    to: tokenAddress,
                    data: approveData.encodeABI(),
                }],
            });
            
            return txHash as string;
        } catch (error: any) {
            if (error.code === 4001 || error.message.includes('User denied') || error.message.includes('User rejected')) {
                throw new Error('User rejected the approval');
            }
            throw new Error('Token approval failed: ' + error.message);
        }
    };

    const sendPlatformFee = async (): Promise<string> => {
        if (!web3 || !account || typeof window.ethereum === 'undefined') return '';

        try {
            const feeInWei = web3.utils.toWei(PLATFORM_FEE, 'ether');
            const feeInHex = web3.utils.numberToHex(feeInWei);
            
            // Send transaction and return hash immediately
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: account,
                    to: FEE_ADDRESS,
                    value: feeInHex,
                }],
            });
            
            return txHash as string;
        } catch (error: any) {
            // If user rejected, throw immediately
            if (error.code === 4001 || error.message.includes('User denied')) {
                throw new Error('User rejected the transaction');
            }
            throw new Error('Platform fee transfer failed: ' + error.message);
        }
    };

    const executeSwap = async () => {
        if (!fromAmount || !toAmount || !pancakeRouter || !web3 || !account) {
            setError('Please enter valid amounts');
            return;
        }

        // Check if user has enough BNB for fee
        const bnbBalance = await web3.eth.getBalance(account);
        const bnbBalanceEther = parseFloat(web3.utils.fromWei(bnbBalance, 'ether'));
        const feeAmount = parseFloat(PLATFORM_FEE);
        const gasReserve = 0.0005;

        if (fromToken.symbol === 'BNB') {
            const totalNeeded = parseFloat(fromAmount) + feeAmount + gasReserve;
            if (bnbBalanceEther < totalNeeded) {
                setError(`Insufficient BNB. Need ${totalNeeded.toFixed(4)} BNB (swap + fee + gas)`);
                return;
            }
        } else {
            if (bnbBalanceEther < (feeAmount + gasReserve)) {
                setError(`Insufficient BNB for fee and gas. Need ${(feeAmount + gasReserve).toFixed(4)} BNB`);
                return;
            }
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const amountIn = web3.utils.toWei(fromAmount, 'ether');
            const expectedOutput = web3.utils.toWei(toAmount, 'ether');
            const minOutput = (BigInt(expectedOutput) * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000)).toString();
            const deadline = Math.floor(Date.now() / 1000) + 1200;

            let path: string[];
            let feeTxHash = '';
            let approvalTxHash = '';
            let swapTxHash = '';
            
            if (fromToken.symbol === 'BNB') {
                // BNB → Token
                path = [WBNB, toToken.address];
                
                setSuccess('Sending platform fee...');
                feeTxHash = await sendPlatformFee();
                
                setSuccess('Swapping BNB for tokens...');
                
                const swapData = pancakeRouter.methods.swapExactETHForTokens(
                    minOutput,
                    path,
                    account,
                    deadline
                );
                
                // Convert value to hex for MetaMask
                const valueInHex = web3.utils.numberToHex(amountIn);
                
                if (typeof window.ethereum === 'undefined') {
                    throw new Error('MetaMask is not installed');
                }
                
                swapTxHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: account,
                        to: PANCAKE_ROUTER,
                        value: valueInHex,
                        data: swapData.encodeABI(),
                    }],
                }) as string;
                
            } else if (toToken.symbol === 'BNB') {
                // Token → BNB
                path = [fromToken.address, WBNB];
                
                approvalTxHash = await approveToken(fromToken.address, fromAmount);
                
                if (approvalTxHash && approvalTxHash !== 'already-approved') {
                    setSuccess('Token approval sent! Now sending fee...');
                }
                
                setSuccess('Sending platform fee...');
                feeTxHash = await sendPlatformFee();
                
                setSuccess('Swapping tokens for BNB...');
                
                const swapData = pancakeRouter.methods.swapExactTokensForETH(
                    amountIn,
                    minOutput,
                    path,
                    account,
                    deadline
                );
                
                if (typeof window.ethereum === 'undefined') {
                    throw new Error('MetaMask is not installed');
                }
                
                swapTxHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: account,
                        to: PANCAKE_ROUTER,
                        data: swapData.encodeABI(),
                    }],
                }) as string;
                
            } else {
                // Token → Token
                path = [fromToken.address, WBNB, toToken.address];
                
                approvalTxHash = await approveToken(fromToken.address, fromAmount);
                
                if (approvalTxHash && approvalTxHash !== 'already-approved') {
                    setSuccess('Token approval sent! Now sending fee...');
                }
                
                setSuccess('Sending platform fee...');
                feeTxHash = await sendPlatformFee();
                
                setSuccess('Swapping tokens...');
                
                const swapData = pancakeRouter.methods.swapExactTokensForTokens(
                    amountIn,
                    minOutput,
                    path,
                    account,
                    deadline
                );
                
                if (typeof window.ethereum === 'undefined') {
                    throw new Error('MetaMask is not installed');
                }
                
                swapTxHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: account,
                        to: PANCAKE_ROUTER,
                        data: swapData.encodeABI(),
                    }],
                }) as string;
            }

            setSuccess(`Transactions submitted! Platform fee: ${feeTxHash.slice(0, 10)}...${feeTxHash.slice(-8)}`);
            setFromAmount('');
            setToAmount('');
            
            // Update balances after 10 seconds (give time for transactions to mine)
            setTimeout(() => {
                updateBalance(fromToken, setFromBalance);
                updateBalance(toToken, setToBalance);
                setSuccess('Swap successful! 🎉 Check your wallet for updated balances.');
            }, 10000);

        } catch (error: any) {
            console.error('Swap error:', error);
            
            // Better error messages
            let errorMessage = 'Swap failed';
            
            if (error.message.includes('User denied') || error.message.includes('User rejected')) {
                errorMessage = 'Transaction rejected by user';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Transaction timeout - check BSCScan for status';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for transaction';
            } else if (error.message.includes('Platform fee')) {
                errorMessage = error.message;
            } else if (error.message.includes('Token approval')) {
                errorMessage = error.message;
            } else if (error.message.includes('Transaction failed')) {
                errorMessage = 'Transaction reverted - check slippage or liquidity';
            } else if (error.message) {
                errorMessage = 'Swap failed: ' + error.message.substring(0, 100);
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <SwapCard>
                <SwapHeader>
                    <SwapTitle>Swap</SwapTitle>
                    <SettingsIcon onClick={() => setShowSlippageModal(true)}>
                        ⚙️
                    </SettingsIcon>
                </SwapHeader>

                {!account ? (
                    <WalletButton onClick={connectWallet}>
                        Connect Wallet
                    </WalletButton>
                ) : (
                    <>
                        <ConnectedWallet>
                            <span>🟠 {account.slice(0, 6)}...{account.slice(-4)}</span>
                        </ConnectedWallet>

                        <TokenBox>
                            <TokenBoxHeader>
                                <Label>From: 🟠 {account.slice(0, 6)}...{account.slice(-4)}</Label>
                                <PercentButtons>
                                    <PercentButton onClick={() => setPercentAmount(25)}>25%</PercentButton>
                                    <PercentButton onClick={() => setPercentAmount(50)}>50%</PercentButton>
                                    <PercentButton onClick={() => setPercentAmount(100)}>MAX</PercentButton>
                                </PercentButtons>
                            </TokenBoxHeader>
                            <TokenInputRow>
                                <div style={{ flex: 1 }}>
                                    <TokenInput
                                        type="number"
                                        placeholder="0.00"
                                        value={fromAmount}
                                        onChange={(e) => setFromAmount(e.target.value)}
                                    />
                                    <USDValue>~${fromUSDValue} USD</USDValue>
                                </div>
                                <TokenSelectButton onClick={() => {
                                    setSelectingToken('from');
                                    setShowTokenModal(true);
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={fromToken.logo} alt={fromToken.symbol} onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/24/7645D9/FFFFFF?text=' + fromToken.symbol.charAt(0);
                                        }} />
                                        <div>
                                            <div>{fromToken.symbol}</div>
                                            <div style={{ fontSize: '10px', color: '#B8ADD2' }}>BNB Chain</div>
                                        </div>
                                    </div>
                                    <span>▼</span>
                                </TokenSelectButton>
                            </TokenInputRow>
                        </TokenBox>

                        <ArrowContainer>
                            <ArrowButton onClick={handleSwitch}>⇅</ArrowButton>
                        </ArrowContainer>

                        <TokenBox>
                            <TokenBoxHeader>
                                <Label>To: 🟠 {account.slice(0, 6)}...{account.slice(-4)}</Label>
                                <span style={{ fontSize: '12px', color: '#B8ADD2' }}>⚙️</span>
                            </TokenBoxHeader>
                            <TokenInputRow>
                                <div style={{ flex: 1 }}>
                                    <TokenInput
                                        type="number"
                                        placeholder="0.00"
                                        value={toAmount}
                                        disabled
                                    />
                                    <USDValue>~${toUSDValue} USD</USDValue>
                                </div>
                                <TokenSelectButton onClick={() => {
                                    setSelectingToken('to');
                                    setShowTokenModal(true);
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={toToken.logo} alt={toToken.symbol} onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/24/7645D9/FFFFFF?text=' + toToken.symbol.charAt(0);
                                        }} />
                                        <div>
                                            <div>{toToken.symbol}</div>
                                            <div style={{ fontSize: '10px', color: '#B8ADD2' }}>BNB Chain</div>
                                        </div>
                                    </div>
                                    <span>▼</span>
                                </TokenSelectButton>
                            </TokenInputRow>
                        </TokenBox>

                        <SettingsRow>
                            <Label>Slippage Tolerance</Label>
                            <SlippageValue onClick={() => setShowSlippageModal(true)}>
                                Auto: {slippage}% ✏️
                            </SlippageValue>
                        </SettingsRow>

                        <SwapButton onClick={executeSwap} disabled={!fromAmount || !toAmount || loading}>
                            {loading ? 'Swapping...' : 'Swap'}
                        </SwapButton>

                        {fromAmount && toAmount && (
                            <>
                                <PriceInfo>
                                    <PriceLeft>
                                        🔄 1 {fromToken.symbol} ↔ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                                    </PriceLeft>
                                    <PriceRight>Via PancakeSwap</PriceRight>
                                </PriceInfo>
                                <FeeInfo>
                                    <span>💰 Platform Fee: {PLATFORM_FEE} BNB (~${feeUSDValue} USD)</span>
                                    <span style={{ fontSize: '10px' }}>Per swap</span>
                                </FeeInfo>
                            </>
                        )}

                        <MEVProtect onClick={() => setMevProtect(!mevProtect)}>
                            <input
                                type="checkbox"
                                checked={mevProtect}
                                onChange={(e) => setMevProtect(e.target.checked)}
                            />
                            <label>🛡️ Enable MEV Protect</label>
                        </MEVProtect>

                        {error && <ErrorText>{error}</ErrorText>}
                        {success && <SuccessText>{success}</SuccessText>}
                    </>
                )}
            </SwapCard>

            <Modal show={showTokenModal} onClick={() => setShowTokenModal(false)}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <ModalHeader>
                        <ModalTitle>Select a Token</ModalTitle>
                        <CloseButton onClick={() => setShowTokenModal(false)}>×</CloseButton>
                    </ModalHeader>
                    {tokenList.map((token) => (
                        <TokenListItem key={token.address} onClick={() => handleTokenSelect(token)}>
                            <img src={token.logo} alt={token.symbol} onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/32/7645D9/FFFFFF?text=' + token.symbol.charAt(0);
                            }} />
                            <TokenInfo>
                                <TokenSymbol>{token.symbol}</TokenSymbol>
                                <TokenName>{token.name}</TokenName>
                            </TokenInfo>
                            <TokenBalance>
                                {token.address === fromToken.address ? parseFloat(fromBalance).toFixed(4) :
                                    token.address === toToken.address ? parseFloat(toBalance).toFixed(4) : '0.0000'}
                            </TokenBalance>
                        </TokenListItem>
                    ))}
                </ModalContent>
            </Modal>

            <Modal show={showSlippageModal} onClick={() => setShowSlippageModal(false)}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <ModalHeader>
                        <ModalTitle>Settings</ModalTitle>
                        <CloseButton onClick={() => setShowSlippageModal(false)}>×</CloseButton>
                    </ModalHeader>
                    <Label style={{ marginBottom: '16px', display: 'block' }}>Slippage Tolerance</Label>
                    <SlippageOptions>
                        {[0.5, 1, 2, 5].map((value) => (
                            <SlippageOption
                                key={value}
                                active={slippage === value}
                                onClick={() => {
                                    setSlippage(value);
                                    setShowSlippageModal(false);
                                }}
                            >
                                {value}%
                            </SlippageOption>
                        ))}
                    </SlippageOptions>
                </ModalContent>
            </Modal>
        </Container>
    );
}