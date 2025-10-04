import { NextRequest, NextResponse } from 'next/server'
import { saveRegistration } from '@/lib/kv'
import { generateTicket } from '@/lib/contract'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { wallet, txHash, index, seed, timestamp } = body

    if (!wallet || !txHash || index === undefined || !seed || !timestamp) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const ticket = generateTicket(seed)
    
    const registration = await saveRegistration({
      wallet: wallet.toLowerCase(),
      txHash,
      index,
      seed,
      ticket,
      timestamp,
    })

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save registration' }, { status: 500 })
  }
}
