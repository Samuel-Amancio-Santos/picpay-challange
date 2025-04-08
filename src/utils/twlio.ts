import { env } from '@/env'
import { Twilio } from 'twilio'

const accountSid = env.ACCOUNT_SID
const authToken = env.AUTH_TOKEN
const client = new Twilio(accountSid, authToken)

export async function sendNotification(fromCpf: string, toPhone: string) {
  const message = await client.messages.create({
    from: env.TWILIO_PHONE_NUMBER,
    to: env.PAYEE_PHONE_NUMBER,
    body: `${toPhone} received a new transaction from ${
      '***' + fromCpf.slice(3, fromCpf.length - 2) + '**'
    }`,
  })

  console.log(`Message sent: ${message.sid}`)
}
