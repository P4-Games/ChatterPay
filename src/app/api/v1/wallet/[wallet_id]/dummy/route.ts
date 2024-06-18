import { NextResponse } from 'next/server'

// ----------------------------------------------------------------------

// dummy demo endpooint
export async function GET(req: any, res: any) {
  try {
    const data: any = {
      result: 'dummy'
    }
    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error getting dummy' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
