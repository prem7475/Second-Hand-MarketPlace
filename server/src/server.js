import http from 'node:http'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { createApp } from './app.js'
import { config } from './config.js'
import { User } from './models/User.js'
import { Conversation } from './models/Conversation.js'
import { messageSchema, validate } from './lib/validation.js'
import { createMessage } from './routes/conversations.js'
import { seedDemoData } from './seed-demo-data.js'

function readCookie(cookieHeader, name) {
  const entry = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined
}

const app = createApp()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: config.clientOrigins,
    credentials: true,
  },
})
app.set('io', io)

io.use(async (socket, next) => {
  try {
    const token = readCookie(socket.handshake.headers.cookie, 'session')
    if (!token) return next(new Error('Authentication required.'))
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: 'refind-marketplace',
      audience: 'refind-client',
    })
    const user = await User.findById(payload.sub)
    if (!user) return next(new Error('Authentication required.'))
    socket.data.user = user
    next()
  } catch {
    next(new Error('Authentication required.'))
  }
})

io.on('connection', (socket) => {
  let lastMessageAt = 0

  socket.on('conversation:join', async (conversationId, acknowledge = () => {}) => {
    try {
      if (typeof conversationId !== 'string' || !mongoose.isValidObjectId(conversationId)) {
        return acknowledge({ ok: false, error: 'This conversation could not be found.' })
      }
      const conversation = await Conversation.exists({
        _id: conversationId,
        members: socket.data.user.id,
      })
      if (!conversation)
        return acknowledge({ ok: false, error: 'This conversation could not be found.' })
      socket.join(conversationId)
      acknowledge({ ok: true })
    } catch (error) {
      console.error('Unable to authorize conversation socket room:', error)
      acknowledge({ ok: false, error: 'This conversation could not be joined.' })
    }
  })

  socket.on('message:send', async ({ conversationId, body } = {}, acknowledge = () => {}) => {
    try {
      const now = Date.now()
      if (now - lastMessageAt < 500)
        return acknowledge({ ok: false, error: 'Please wait before sending another message.' })
      if (typeof conversationId !== 'string' || !mongoose.isValidObjectId(conversationId)) {
        return acknowledge({ ok: false, error: 'This conversation could not be found.' })
      }
      const parsed = validate(messageSchema, { body })
      if (!parsed.success)
        return acknowledge({ ok: false, error: 'Enter a message of up to 2,000 characters.' })
      const { conversation, message } = await createMessage(
        conversationId,
        socket.data.user,
        parsed.data.body,
      )
      lastMessageAt = now
      io.to(conversation.id).emit('message:new', message)
      acknowledge({ ok: true, message })
    } catch (error) {
      acknowledge({ ok: false, error: error.status ? error.message : 'Message could not be sent.' })
      if (!error.status) console.error(error)
    }
  })
})

async function start() {
  await mongoose.connect(config.mongoUri)
  if (process.env.SEED_DEMO_DATA === 'true') await seedDemoData()
  server.listen(config.port, () => {
    console.log(`Refind API listening on port ${config.port}`)
  })
}

start().catch((error) => {
  console.error('Unable to start Refind API:', error)
  process.exitCode = 1
})

async function shutdown() {
  io.close()
  await mongoose.disconnect()
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
