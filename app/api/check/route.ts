import { NextRequest, NextResponse } from 'next/server'
import { getRegistration, isWalletRegistered } from '@/lib/kv'

export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json()
    
    if (!wallet) {
      return NextResponse.json({ registered: false, registration: null })
    }

    const registered = await isWalletRegistered(wallet)
    const registration = registered ? await getRegistration(wallet) : null
    
    return NextResponse.json({ registered, registration })
  } catch (error) {
    console.error('Check registration error:', error)
    return NextResponse.json({ registered: false, registration: null })
  }
}
