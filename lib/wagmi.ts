import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { bsc } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Payu Giveaway',
  projectId: 'c1814df663b82b65bb5927ad59566843',
  chains: [bsc],
  ssr: true,
})
