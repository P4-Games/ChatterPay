import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://li.quest/v1/chains?chainTypes=EVM,SVM')
    if (!res.ok) {
      return NextResponse.json({ error: 'LiFi chains fetch failed' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'LiFi chains error' }, { status: 500 })
  }
}
