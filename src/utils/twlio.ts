import { env } from '@/env'
import { Twilio } from 'twilio'

const accountSid = env.ACCOUNT_SID
const authToken = env.AUTH_TOKEN
const client = new Twilio(accountSid, authToken)

export async function sendNotification(from: string) {
  if (!from) {
    throw new Error()
  }
  const message = await client.messages.create({
    from: env.TWILIO_PHONE_NUMBER, // Certifique-se de definir isso no seu .env
    to: env.PAYEE_PHONE_NUMBER,
    body: `You received a new transaction from ${
      '***' + from.slice(3, from.length - 2) + '**'
    }`,
  })

  console.log(`Message sent: ${message.sid}`)
}
