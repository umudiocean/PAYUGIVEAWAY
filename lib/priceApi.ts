// Price API for real-time token prices
export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

export interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

// Token mapping for CoinGecko API
export const TOKEN_MAPPING: { [key: string]: string } = {
  'BNB': 'binancecoin',
  'CAKE': 'pancakeswap-token',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'ETH': 'ethereum',
  'BTCB': 'bitcoin',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'PAYU': 'payu' // Bu token için CoinGecko'da ID olmayabilir, fallback gerekebilir
};

export async function fetchTokenPrices(tokens: string[]): Promise<{ [key: string]: TokenPrice }> {
  try {
    // Önce PancakeSwap API'sini dene
    const pancakeSwapPrices = await fetchPancakeSwapPrices(tokens);
    if (Object.keys(pancakeSwapPrices).length > 0) {
      return pancakeSwapPrices;
    }

    // PancakeSwap başarısız olursa CoinGecko'yu dene
    const coinIds = tokens.map(token => TOKEN_MAPPING[token]).filter(Boolean);
    
    if (coinIds.length === 0) {
      return {};
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const data: CoinGeckoPrice = await response.json();
    
    // Sonuçları token symbol'lerine göre map et
    const result: { [key: string]: TokenPrice } = {};
    
    Object.entries(TOKEN_MAPPING).forEach(([symbol, coinId]) => {
      if (data[coinId]) {
        result[symbol] = {
          symbol,
          price: data[coinId].usd,
          change24h: data[coinId].usd_24h_change || 0
        };
      }
    });

    return result;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    
    // Fallback prices (güncel yaklaşık değerler)
    const fallbackPrices: { [key: string]: TokenPrice } = {
      'BNB': { symbol: 'BNB', price: 1276, change24h: 0 },
      'CAKE': { symbol: 'CAKE', price: 3.6, change24h: 0 },
      'USDT': { symbol: 'USDT', price: 1.0, change24h: 0 },
      'USDC': { symbol: 'USDC', price: 1.0, change24h: 0 },
      'ETH': { symbol: 'ETH', price: 3500, change24h: 0 },
      'BTCB': { symbol: 'BTCB', price: 95000, change24h: 0 },
      'ADA': { symbol: 'ADA', price: 0.45, change24h: 0 },
      'DOT': { symbol: 'DOT', price: 7.2, change24h: 0 },
      'LINK': { symbol: 'LINK', price: 14.5, change24h: 0 },
      'PAYU': { symbol: 'PAYU', price: 0.000001, change24h: 0 }
    };

    // Sadece istenen tokenların fallback fiyatlarını döndür
    const filteredFallback: { [key: string]: TokenPrice } = {};
    tokens.forEach(token => {
      if (fallbackPrices[token]) {
        filteredFallback[token] = fallbackPrices[token];
      }
    });

    return filteredFallback;
  }
}

// PancakeSwap API'sinden fiyat çek
async function fetchPancakeSwapPrices(tokens: string[]): Promise<{ [key: string]: TokenPrice }> {
  try {
    // BSC token address'lerine göre map
    const tokenAddresses: { [key: string]: string } = {
      'BNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      'CAKE': '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      'USDT': '0x55d398326f99059fF775485246999027B3197955',
      'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      'ETH': '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      'BTCB': '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      'ADA': '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
      'DOT': '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
      'LINK': '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
      'PAYU': '0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144'
    };

    // PancakeSwap'ın yeni API endpoint'i
    const addresses = tokens.map(token => tokenAddresses[token]).filter(Boolean);
    
    if (addresses.length === 0) {
      return {};
    }

    // PancakeSwap V2 API - token fiyatları
    const response = await fetch(`https://api.pancakeswap.info/api/v2/tokens/${addresses.join(',')}`);
    
    if (!response.ok) {
      // Eski API'yi dene
      return await fetchPancakeSwapLegacyPrices(tokens);
    }

    const data = await response.json();
    const result: { [key: string]: TokenPrice } = {};

    // API'den gelen token verilerini işle
    if (data.data && typeof data.data === 'object') {
      Object.entries(tokenAddresses).forEach(([symbol, address]) => {
        const tokenData = data.data[address.toLowerCase()];
        if (tokenData && tokenData.price) {
          result[symbol] = {
            symbol,
            price: parseFloat(tokenData.price),
            change24h: tokenData.price_BNB ? 0 : 0
          };
        }
      });
    }

    return result;
  } catch (error) {
    console.error('PancakeSwap API error:', error);
    // Fallback olarak eski API'yi dene
    return await fetchPancakeSwapLegacyPrices(tokens);
  }
}

// PancakeSwap'ın eski API'sini kullan (fallback)
async function fetchPancakeSwapLegacyPrices(tokens: string[]): Promise<{ [key: string]: TokenPrice }> {
  try {
    const response = await fetch('https://api.pancakeswap.info/api/v2/tokens');
    
    if (!response.ok) {
      throw new Error('PancakeSwap Legacy API failed');
    }

    const data = await response.json();
    const result: { [key: string]: TokenPrice } = {};

    const tokenAddresses: { [key: string]: string } = {
      'BNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      'CAKE': '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      'USDT': '0x55d398326f99059fF775485246999027B3197955',
      'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      'ETH': '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      'BTCB': '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      'ADA': '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
      'DOT': '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
      'LINK': '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
      'PAYU': '0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144'
    };

    if (data.data && typeof data.data === 'object') {
      Object.entries(tokenAddresses).forEach(([symbol, address]) => {
        const tokenData = data.data[address.toLowerCase()];
        if (tokenData && tokenData.price) {
          result[symbol] = {
            symbol,
            price: parseFloat(tokenData.price),
            change24h: 0
          };
        }
      });
    }

    return result;
  } catch (error) {
    console.error('PancakeSwap Legacy API error:', error);
    return {};
  }
}

// Belirli bir token için fiyat çek
export async function fetchTokenPrice(tokenSymbol: string): Promise<TokenPrice | null> {
  const prices = await fetchTokenPrices([tokenSymbol]);
  return prices[tokenSymbol] || null;
}
