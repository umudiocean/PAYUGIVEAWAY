import { kv } from '@vercel/kv'

export interface Registration {
  wallet: string
  txHash: string
  index: number
  seed: string
  ticket: string
  timestamp: number
  email?: string
  tasks: {
    telegram: boolean
    x: boolean
    instagram: boolean
  }
  taskClicks: Array<{
    platform: string
    url: string
    timestamp: number
  }>
  createdAt: string
}

// Check if wallet is registered
export async function isWalletRegistered(wallet: string): Promise<boolean> {
  const exists = await kv.exists(`registration:${wallet.toLowerCase()}`)
  return exists === 1
}

// Save registration
export async function saveRegistration(data: Omit<Registration, 'createdAt' | 'tasks' | 'taskClicks' | 'email'>) {
  const wallet = data.wallet.toLowerCase()
  const registration: Registration = {
    ...data,
    tasks: { telegram: false, x: false, instagram: false },
    taskClicks: [],
    createdAt: new Date().toISOString(),
  }
  await kv.set(`registration:${wallet}`, registration)
  await kv.sadd('all_registrations', wallet)
  return registration
}

// Get registration
export async function getRegistration(wallet: string): Promise<Registration | null> {
  return await kv.get(`registration:${wallet.toLowerCase()}`)
}

// Update task completion
export async function completeTask(wallet: string, platform: 'telegram' | 'x' | 'instagram', url: string) {
  const registration = await getRegistration(wallet)
  if (!registration) return null

  registration.tasks[platform] = true
  registration.taskClicks.push({
    platform,
    url,
    timestamp: Date.now(),
  })

  await kv.set(`registration:${wallet.toLowerCase()}`, registration)
  return registration
}

// Save email
export async function saveEmail(wallet: string, email: string) {
  const registration = await getRegistration(wallet)
  if (!registration) return null

  registration.email = email
  await kv.set(`registration:${wallet.toLowerCase()}`, registration)
  return registration
}

// Get all registrations (admin)
export async function getAllRegistrations(): Promise<Registration[]> {
  const wallets = await kv.smembers('all_registrations')
  const registrations = await Promise.all(
    wallets.map(wallet => getRegistration(wallet as string))
  )
  return registrations.filter(Boolean) as Registration[]
}
