import { randomUUID } from 'node:crypto'
import { sendTransactionEmail } from './email.js'

export function notifyUser(io, userId, notification) {
  if (!userId) return

  const payload = {
    id: randomUUID(),
    ...notification,
    createdAt: new Date().toISOString(),
  }
  io?.to(`user:${userId}`).emit('notification:new', payload)

  void sendTransactionEmail(userId, payload).catch((error) => {
    console.error(`Unable to send transaction email for account ${userId}:`, error)
  })
}
