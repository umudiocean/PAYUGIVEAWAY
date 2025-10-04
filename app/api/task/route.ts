import { NextRequest, NextResponse } from 'next/server'
import { completeTask } from '@/lib/kv'

export async function POST(req: NextRequest) {
  try {
    const { wallet, platform, url } = await req.json()
    
    if (!wallet || !platform || !url) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    if (!['telegram', 'x', 'instagram'].includes(platform)) {
      return NextResponse.json({ success: false, error: 'Invalid platform' }, { status: 400 })
    }

    const registration = await completeTask(wallet, platform as 'telegram' | 'x' | 'instagram', url)
    
    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error('Task completion error:', error)
    return NextResponse.json({ success: false, error: 'Failed to complete task' }, { status: 500 })
  }
}
