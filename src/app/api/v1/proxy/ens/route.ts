import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name || !name.endsWith('.eth')) {
    return NextResponse.json({ error: 'Invalid ENS name' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://api.ensideas.com/ens/resolve/${encodeURIComponent(name)}`)
    if (!res.ok) {
      return NextResponse.json({ error: 'ENS resolution failed' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'ENS resolution error' }, { status: 500 })
  }
}
