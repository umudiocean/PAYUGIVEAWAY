import { NextRequest, NextResponse } from 'next/server'
import { saveEmail } from '@/lib/kv'

export async function POST(req: NextRequest) {
  try {
    const { wallet, email } = await req.json()
    
    if (!wallet || !email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 })
    }

    const registration = await saveEmail(wallet, email)
    
    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error('Email save error:', error)
    return NextResponse.json({ success: false, error: 'Failed to save email' }, { status: 500 })
  }
}
