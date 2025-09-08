import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Dynamically import supabase to avoid build-time issues
    const { supabase } = await import('@/lib/supabase/client')

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id!)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, addresses, preferences } = body

    // Dynamically import supabase to avoid build-time issues
    const { supabase } = await import('@/lib/supabase/client')

    // Update user profile
    const { error } = await supabase
      .from('user_profiles')
      .update({
        name,
        phone,
        addresses: addresses || [],
        preferences: preferences || {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id!)

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
