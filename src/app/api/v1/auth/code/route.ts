import { NextResponse } from 'next/server'

import { getUserByPhone, updateUserCode } from 'src/app/api/_data/data.-service'

import { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const { phone }: { phone: string } = await req.json()
    if (!phone) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing phone number in request body'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const user: IAccount | undefined = await getUserByPhone(phone)
    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that phone number' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Generar y guardar código en la bdd
    const code: number = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
    updateUserCode(user.id, code)

    // TODO: enviar codigo a whatsapp

    const resultSend = true
    const data: { phone: string; sent: boolean } = {
      phone,
      sent: resultSend
    }

    return NextResponse.json(data)
  } catch (ex) {
    console.error(ex)
    return new NextResponse(JSON.stringify({ error: 'Error in authentication' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
