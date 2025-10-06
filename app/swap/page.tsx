'use client';

import React, { useState, useEffect } from 'react';
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

// ==================== CONTRACT SETUP ====================
const PAYPAYUSWAP_ADDRESS = "0x669f9b0D21c15a608c5309e0B964c165FB428962";
const PLATFORM_FEE = "0.00025";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const PAYPAYUSWAP_ABI = [
    {"inputs":[{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactBNBForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForBNB","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"}
];

const ERC20_ABI = [
    {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

const TOKEN_LIST: Token[] = [
    { symbol: "BNB", name: "BNB", address: WBNB, decimals: 18, logo: "https://tokens.pancakeswap.finance/images/symbol/bnb.png" },
    { symbol: "PAYU", name: "PayU Token", address: "0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144", decimals: 18, logo: "https://via.placeholder.com/32/7645D9/FFFFFF?text=PAYU" },
    { symbol: "CAKE", name: "PancakeSwap Token", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png" },
    { symbol: "BUSD", name: "Binance USD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png" },
    { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png" }
];

// ==================== STYLED COMPONENTS (DARK MODE ONLY) ====================
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

const Balance = styled.span`
    font-size: 14px;
    color: #B8ADD2;
    cursor: pointer;

    &:hover {
        color: #F4EEFF;
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
    const [contract, setContract] = useState<SwapContract | null>(null);
    
    const [fromToken, setFromToken] = useState<Token>(TOKEN_LIST[0]);
    const [toToken, setToToken] = useState<Token>(TOKEN_LIST[1]);
    const [fromAmount, setFromAmount] = useState<string>('');
    const [toAmount, setToAmount] = useState<string>('');
    const [fromBalance, setFromBalance] = useState<string>('0');
    const [toBalance, setToBalance] = useState<string>('0');
    
    const [loading, setLoading] = useState<boolean>(false);
    const [slippage, setSlippage] = useState<number>(0.5);
    const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
    const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from');
    const [showSlippageModal, setShowSlippageModal] = useState<boolean>(false);
    const [mevProtect, setMevProtect] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        if (account && fromToken) updateBalance(fromToken, setFromBalance);
    }, [account, fromToken]);

    useEffect(() => {
        if (account && toToken) updateBalance(toToken, setToBalance);
    }, [account, toToken]);

    useEffect(() => {
        if (fromAmount && fromToken && toToken && web3 && contract) {
            getQuote();
        } else {
            setToAmount('');
        }
    }, [fromAmount, fromToken, toToken, web3, contract]);

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
            
            if (chainId !== 56n && Number(chainId) !== 56) {
                alert('Please switch to BSC Mainnet!');
                return;
            }

            const contractInstance = new web3Instance.eth.Contract(
                PAYPAYUSWAP_ABI, 
                PAYPAYUSWAP_ADDRESS
            ) as unknown as SwapContract;

            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setContract(contractInstance);
        } catch (error: any) {
            setError('Failed to connect: ' + error.message);
        }
    };

    const updateBalance = async (
        token: Token, 
        setBalance: React.Dispatch<React.SetStateAction<string>>
    ) => {
        if (!web3 || !account) return;

        try {
            if (token.symbol === 'BNB') {
                const balance = await web3.eth.getBalance(account);
                setBalance(web3.utils.fromWei(balance, 'ether'));
            } else {
                const tokenContract = new web3.eth.Contract(
                    ERC20_ABI, 
                    token.address
                ) as unknown as ERC20Contract;
                const balance = await tokenContract.methods.balanceOf(account).call();
                setBalance(web3.utils.fromWei(balance as string, 'ether'));
            }
        } catch (error) {
            console.error('Balance error:', error);
            setBalance('0');
        }
    };

    const getQuote = async () => {
        if (!contract || !fromAmount || !web3) return;

        try {
            let path: string[];
            if (fromToken.symbol === 'BNB') {
                path = [WBNB, toToken.address];
            } else if (toToken.symbol === 'BNB') {
                path = [fromToken.address, WBNB];
            } else {
                path = [fromToken.address, toToken.address];
            }

            const amountIn = web3.utils.toWei(fromAmount, 'ether');
            const amounts = await contract.methods.getAmountsOut(amountIn, path).call();
            
            const output = web3.utils.fromWei((amounts as string[])[1], 'ether');
            setToAmount(parseFloat(output).toFixed(6));
        } catch (error) {
            console.error('Quote error:', error);
            setToAmount('0');
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
            if (token.symbol === toToken.symbol) setToToken(fromToken);
            setFromToken(token);
        } else {
            if (token.symbol === fromToken.symbol) setFromToken(toToken);
            setToToken(token);
        }
        setShowTokenModal(false);
    };

    const approveToken = async (tokenAddress: string, amount: string): Promise<boolean> => {
        if (!web3 || !account) return false;

        const tokenContract = new web3.eth.Contract(
            ERC20_ABI, 
            tokenAddress
        ) as unknown as ERC20Contract;
        
        const currentAllowance = await tokenContract.methods.allowance(account, PAYPAYUSWAP_ADDRESS).call();
        const amountInWei = web3.utils.toWei(amount, 'ether');
        
        if (BigInt(currentAllowance as string) >= BigInt(amountInWei)) return true;

        try {
            await tokenContract.methods.approve(PAYPAYUSWAP_ADDRESS, amountInWei).send({ from: account });
            return true;
        } catch (error) {
            throw new Error('Token approval failed');
        }
    };

    const executeSwap = async () => {
        if (!fromAmount || !toAmount || !contract || !web3 || !account) {
            setError('Please enter valid amounts');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const amountIn = web3.utils.toWei(fromAmount, 'ether');
            const expectedOutput = web3.utils.toWei(toAmount, 'ether');
            const minOutput = (BigInt(expectedOutput) * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000)).toString();
            const deadline = Math.floor(Date.now() / 1000) + 600;

            if (fromToken.symbol === 'BNB') {
                const totalBNB = web3.utils.toWei((parseFloat(fromAmount) + parseFloat(PLATFORM_FEE)).toString(), 'ether');
                await contract.methods.swapExactBNBForTokens(toToken.address, minOutput, deadline).send({ 
                    from: account, 
                    value: totalBNB, 
                    gas: 300000 
                });
            } else if (toToken.symbol === 'BNB') {
                await approveToken(fromToken.address, fromAmount);
                const fee = web3.utils.toWei(PLATFORM_FEE, 'ether');
                await contract.methods.swapExactTokensForBNB(fromToken.address, amountIn, minOutput, deadline).send({ 
                    from: account, 
                    value: fee, 
                    gas: 300000 
                });
            } else {
                await approveToken(fromToken.address, fromAmount);
                const fee = web3.utils.toWei(PLATFORM_FEE, 'ether');
                await contract.methods.swapExactTokensForTokens(fromToken.address, toToken.address, amountIn, minOutput, deadline).send({ 
                    from: account, 
                    value: fee, 
                    gas: 300000 
                });
            }

            setSuccess('Swap successful! 🎉');
            setFromAmount('');
            setToAmount('');
            updateBalance(fromToken, setFromBalance);
            updateBalance(toToken, setToBalance);
            
        } catch (error: any) {
            setError('Swap failed: ' + error.message);
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
                            <span>🔗 {account.slice(0, 6)}...{account.slice(-4)}</span>
                        </ConnectedWallet>

                        <TokenBox>
                            <TokenBoxHeader>
                                <Label>From</Label>
                                <Balance onClick={() => setFromAmount(fromBalance)}>
                                    Balance: {parseFloat(fromBalance).toFixed(4)}
                                </Balance>
                            </TokenBoxHeader>
                            <TokenInputRow>
                                <TokenInput
                                    type="number"
                                    placeholder="0.00"
                                    value={fromAmount}
                                    onChange={(e) => setFromAmount(e.target.value)}
                                />
                                <TokenSelectButton onClick={() => {
                                    setSelectingToken('from');
                                    setShowTokenModal(true);
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={fromToken.logo} alt={fromToken.symbol} />
                                        <span>{fromToken.symbol}</span>
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
                                <Label>To</Label>
                                <Balance>
                                    Balance: {parseFloat(toBalance).toFixed(4)}
                                </Balance>
                            </TokenBoxHeader>
                            <TokenInputRow>
                                <TokenInput
                                    type="number"
                                    placeholder="0.00"
                                    value={toAmount}
                                    disabled
                                />
                                <TokenSelectButton onClick={() => {
                                    setSelectingToken('to');
                                    setShowTokenModal(true);
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={toToken.logo} alt={toToken.symbol} />
                                        <span>{toToken.symbol}</span>
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

                        <MEVProtect onClick={() => setMevProtect(!mevProtect)}>
                            <input 
                                type="checkbox" 
                                checked={mevProtect} 
                                onChange={(e) => setMevProtect(e.target.checked)} 
                            />
                            <label>Enable MEV Protect</label>
                            <span>🛡️</span>
                        </MEVProtect>

                        <SwapButton onClick={executeSwap} disabled={!fromAmount || !toAmount || loading}>
                            {loading ? 'Swapping...' : 'Swap'}
                        </SwapButton>

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
                    {TOKEN_LIST.map((token) => (
                        <TokenListItem key={token.symbol} onClick={() => handleTokenSelect(token)}>
                            <img src={token.logo} alt={token.symbol} />
                            <TokenInfo>
                                <TokenSymbol>{token.symbol}</TokenSymbol>
                                <TokenName>{token.name}</TokenName>
                            </TokenInfo>
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
                        {[0.1, 0.5, 1, 5].map((value) => (
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