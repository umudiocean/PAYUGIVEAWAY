import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations } from '@/lib/kv'
import { ADMIN_WALLET } from '@/lib/contract'

export async function GET(req: NextRequest) {
  try {
    const wallet = req.headers.get('x-wallet-address')
    
    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet address required' }, { status: 400 })
    }
    
    if (wallet.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 })
    }

    const registrations = await getAllRegistrations()
    
    // Sort by creation date (newest first)
    registrations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({ success: true, registrations })
  } catch (error) {
    console.error('Admin data fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch admin data' }, { status: 500 })
  }
}
