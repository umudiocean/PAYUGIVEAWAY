'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';

// ==================== SMART CONTRACT ====================
const PAYPAYU_ROUTER = "0x669f9b0D21c15a608c5309e0B964c165FB428962";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const PLATFORM_FEE = "0.00025"; // 0.00025 BNB

// PayPayu Router ABI (minimal - sadece ihtiyacımız olanlar)
const PAYPAYU_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "tokenOut", "type": "address"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactBNBForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "tokenIn", "type": "address"},
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForBNB",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "tokenIn", "type": "address"},
            {"internalType": "address", "name": "tokenOut", "type": "address"},
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"}
        ],
        "name": "getAmountsOut",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    }
];

const ERC20_ABI = [
    {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];

// Token list
const TOKEN_LIST = [
    { symbol: "BNB", name: "BNB", address: WBNB, decimals: 18, logo: "https://tokens.pancakeswap.finance/images/symbol/bnb.png" },
    { symbol: "CAKE", name: "PancakeSwap", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png" },
    { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png" },
    { symbol: "BUSD", name: "Binance USD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png" },
    { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png" },
];


// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(139.73deg, rgb(8, 6, 22) 0%, rgb(15, 12, 35) 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const SwapCard = styled.div`
    background: #27262c;
    border-radius: 32px;
    width: 100%;
    max-width: 440px;
    padding: 24px;
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

const TokenInput = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    font-size: 24px;
    font-weight: 600;
    color: #F4EEFF;
    outline: none;
    width: 100%;
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
    color: #F4EEFF;
    img { width: 24px; height: 24px; border-radius: 50%; }
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
    margin-top: 16px;
`;

const FeeInfo = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: rgba(31, 199, 212, 0.1);
    border-radius: 12px;
    margin-top: 12px;
    font-size: 14px;
    color: #1FC7D4;
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
    font-size: 20px;
    color: #1FC7D4;
    margin: -16px auto;
    position: relative;
    z-index: 1;
`;

// ==================== MAIN COMPONENT ====================
export default function SwapPage() {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string>('');
    const [contract, setContract] = useState<any>(null);
    
    const [fromToken, setFromToken] = useState(TOKEN_LIST[0]);
    const [toToken, setToToken] = useState(TOKEN_LIST[1]);
    const [fromAmount, setFromAmount] = useState<string>('');
    const [toAmount, setToAmount] = useState<string>('');
    const [fromBalance, setFromBalance] = useState<string>('0');
    
    const [loading, setLoading] = useState<boolean>(false);
    const [slippage] = useState<number>(2);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // Connect wallet
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

            const contractInstance = new web3Instance.eth.Contract(PAYPAYU_ABI, PAYPAYU_ROUTER);

            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setContract(contractInstance);
        } catch (error: any) {
            setError('Failed to connect: ' + error.message);
        }
    };

    // Get balance
    const updateBalance = useCallback(async () => {
        if (!web3 || !account) return;

        try {
            if (fromToken.symbol === 'BNB') {
                const balance = await web3.eth.getBalance(account);
                setFromBalance(web3.utils.fromWei(balance, 'ether'));
            } else {
                const tokenContract = new web3.eth.Contract(ERC20_ABI, fromToken.address);
                const balance = await tokenContract.methods.balanceOf(account).call();
                setFromBalance(web3.utils.fromWei(String(balance), 'ether'));
            }
        } catch (error) {
            setFromBalance('0');
        }
    }, [web3, account, fromToken]);

    // Get quote
    const getQuote = useCallback(async () => {
        if (!contract || !fromAmount || !web3) return;

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
            const amounts = await contract.methods.getAmountsOut(amountIn, path).call();
            const output = web3.utils.fromWei((amounts as string[])[amounts.length - 1], 'ether');
            setToAmount(parseFloat(output).toFixed(6));
        } catch (error) {
            setToAmount('0');
        }
    }, [contract, fromAmount, web3, fromToken, toToken]);

    useEffect(() => {
        if (account) updateBalance();
    }, [account, fromToken, updateBalance]);

    useEffect(() => {
        if (fromAmount && contract) {
            const debounce = setTimeout(getQuote, 500);
            return () => clearTimeout(debounce);
        } else {
            setToAmount('');
        }
    }, [fromAmount, contract, getQuote]);

    // Execute swap
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
            const deadline = Math.floor(Date.now() / 1000) + 1200;
            
            if (fromToken.symbol === 'BNB') {
                // BNB → Token
                const totalValue = (parseFloat(fromAmount) + parseFloat(PLATFORM_FEE)).toString();
                const totalValueWei = web3.utils.toWei(totalValue, 'ether');

                await contract.methods.swapExactBNBForTokens(
                    toToken.address,
                    minOutput,
                    deadline
                ).send({
                    from: account,
                    value: totalValueWei
                });
                
            } else if (toToken.symbol === 'BNB') {
                // Token → BNB
                const tokenContract = new web3.eth.Contract(ERC20_ABI, fromToken.address);
                const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call();

                if (BigInt(String(allowance)) < BigInt(amountIn)) {
                    setSuccess('Approving token...');
                    await tokenContract.methods.approve(
                        PAYPAYU_ROUTER,
                        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
                    ).send({ from: account });
                }

                setSuccess('Swapping...');
                const feeWei = web3.utils.toWei(PLATFORM_FEE, 'ether');

                await contract.methods.swapExactTokensForBNB(
                    fromToken.address,
                    amountIn,
                    minOutput,
                    deadline
                ).send({
                    from: account,
                    value: feeWei
                });
                
            } else {
                // Token → Token
                const tokenContract = new web3.eth.Contract(ERC20_ABI, fromToken.address);
                const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call();

                if (BigInt(String(allowance)) < BigInt(amountIn)) {
                    setSuccess('Approving token...');
                    await tokenContract.methods.approve(
                        PAYPAYU_ROUTER,
                        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
                    ).send({ from: account });
                }

                setSuccess('Swapping...');
                const feeWei = web3.utils.toWei(PLATFORM_FEE, 'ether');

                await contract.methods.swapExactTokensForTokens(
                    fromToken.address,
                    toToken.address,
                    amountIn,
                    minOutput,
                    deadline
                ).send({
                    from: account,
                    value: feeWei
                });
            }

            setSuccess('Swap successful! 🎉');
            setFromAmount('');
            setToAmount('');
            
            setTimeout(() => updateBalance(), 3000);

        } catch (error: any) {
            console.error('Swap error:', error);
            if (error.message.includes('User denied')) {
                setError('Transaction rejected by user');
            } else {
                setError('Swap failed: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSwitch = () => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
        setFromAmount(toAmount);
        setToAmount('');
    };

        return (
        <Container>
                <SwapCard>
                <SwapHeader>
                    <SwapTitle>Swap</SwapTitle>
                </SwapHeader>

                {!account ? (
                    <WalletButton onClick={connectWallet}>
                        Connect Wallet
                    </WalletButton>
                ) : (
                    <>
                        <ConnectedWallet>
                            🟠 {account.slice(0, 6)}...{account.slice(-4)}
                            <span>Balance: {parseFloat(fromBalance).toFixed(4)} {fromToken.symbol}</span>
                        </ConnectedWallet>

                <TokenBox>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: '#B8ADD2', fontSize: '14px' }}>From</span>
                                <button
                                    style={{ background: 'none', border: 'none', color: '#1FC7D4', cursor: 'pointer', fontSize: '14px' }}
                                    onClick={() => setFromAmount((parseFloat(fromBalance) * 0.99).toFixed(6))}
                                >
                                    MAX
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TokenInput
                                type="number"
                                placeholder="0.00"
                                        value={fromAmount}
                                        onChange={(e) => setFromAmount(e.target.value)}
                                    />
                                <TokenSelectButton>
                                    <img src={fromToken.logo} alt={fromToken.symbol} />
                                    <span>{fromToken.symbol}</span>
                                </TokenSelectButton>
                            </div>
                </TokenBox>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ArrowButton onClick={handleSwitch}>⇅</ArrowButton>
                        </div>

                <TokenBox>
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ color: '#B8ADD2', fontSize: '14px' }}>To</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TokenInput
                                        type="number"
                                        placeholder="0.00"
                                        value={toAmount}
                                        disabled
                                    />
                                <TokenSelectButton>
                                    <img src={toToken.logo} alt={toToken.symbol} />
                                    <span>{toToken.symbol}</span>
                                </TokenSelectButton>
                            </div>
                </TokenBox>

                {fromAmount && toAmount && (
                                <FeeInfo>
                                <span>💰 Platform Fee: {PLATFORM_FEE} BNB</span>
                                <span>Per swap</span>
                                </FeeInfo>
                        )}

                        <SwapButton onClick={executeSwap} disabled={!fromAmount || !toAmount || loading}>
                            {loading ? 'Swapping...' : 'Swap'}
                        </SwapButton>

                        {error && <ErrorText>{error}</ErrorText>}
                        {success && <SuccessText>{success}</SuccessText>}
                    </>
                )}
            </SwapCard>
        </Container>
    );
}