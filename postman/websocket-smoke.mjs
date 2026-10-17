import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { io } from 'socket.io-client'
import { fileURLToPath } from 'node:url'
import { Conversation } from '../server/src/models/Conversation.js'
import { Favorite } from '../server/src/models/Favorite.js'
import { Listing } from '../server/src/models/Listing.js'
import { Message } from '../server/src/models/Message.js'
import { User } from '../server/src/models/User.js'

dotenv.config({ path: fileURLToPath(new URL('../server/.env', import.meta.url)) })

const baseUrl = new URL(process.env.TEST_API_URL || 'http://localhost:8080')
const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/refind'
if (!['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname)) {
  throw new Error('This smoke test creates and removes test data; TEST_API_URL must be local.')
}
const testMongoHost = new URL(testMongoUri).hostname
if (!['localhost', '127.0.0.1', '[::1]'].includes(testMongoHost)) {
  throw new Error('This smoke test deletes test data; TEST_MONGODB_URI must use a local MongoDB.')
}

const testPrefix = `marketplace-test-${randomUUID()}`
const testAccounts = [
  { name: 'Smoke Test Seller', email: `${testPrefix}-seller@example.com` },
  { name: 'Smoke Test Buyer', email: `${testPrefix}-buyer@example.com` },
  { name: 'Smoke Test Outsider', email: `${testPrefix}-outsider@example.com` },
]
const password = `Smoke-${randomUUID()}-Password123`
const sockets = []

class ApiSession {
  cookies = new Map()
  csrfToken = ''

  async request(path, { method = 'GET', body } = {}) {
    const headers = { Accept: 'application/json' }
    if (this.cookies.size) {
      headers.Cookie = [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; ')
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['X-CSRF-Token'] = this.csrfToken

    const response = await fetch(new URL(path, baseUrl), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const setCookies =
      response.headers.getSetCookie?.() ??
      (response.headers.get('set-cookie') || '').split(/, (?=[^;,]+=)/).filter(Boolean)
    for (const setCookie of setCookies) {
      const pair = setCookie.split(';', 1)[0]
      const separator = pair.indexOf('=')
      if (separator > 0) this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1))
    }
    const payload = await response.json()
    if (payload.csrfToken) this.csrfToken = payload.csrfToken
    return { status: response.status, payload }
  }

  async register(account) {
    const csrf = await this.request('/api/auth/csrf')
    assert.equal(csrf.status, 200, 'CSRF bootstrap should succeed')
    const result = await this.request('/api/auth/register', {
      method: 'POST',
      body: { ...account, password },
    })
    assert.equal(result.status, 201, `Registration failed: ${JSON.stringify(result.payload)}`)
    assert.ok(this.cookies.get('session'), 'Registration should set an HTTP-only session cookie')
    return result.payload.user
  }
}

function connectSocket(sessionCookie) {
  const socket = io(baseUrl.origin, {
    ...(sessionCookie ? { extraHeaders: { Cookie: `session=${sessionCookie}` } } : {}),
    reconnection: false,
    timeout: 5000,
  })
  sockets.push(socket)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.disconnect()
      reject(new Error('Timed out while connecting to Socket.IO.'))
    }, 7000)
    socket.once('connect', () => {
      clearTimeout(timeout)
      resolve(socket)
    })
    socket.once('connect_error', (error) => {
      clearTimeout(timeout)
      socket.disconnect()
      reject(error)
    })
  })
}

function joinConversation(socket, conversationId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Conversation join acknowledgement timed out.')), 5000)
    socket.emit('conversation:join', conversationId, (result) => {
      clearTimeout(timeout)
      resolve(result)
    })
  })
}

async function removeTestData() {
  const users = await User.find({ email: { $in: testAccounts.map(({ email }) => email) } }).select(
    '_id',
  )
  const userIds = users.map(({ _id }) => _id)
  if (!userIds.length) return

  const listings = await Listing.find({ seller: { $in: userIds } }).select('_id')
  const listingIds = listings.map(({ _id }) => _id)
  const conversations = await Conversation.find({ members: { $in: userIds } }).select('_id')
  const conversationIds = conversations.map(({ _id }) => _id)

  await Message.deleteMany({ conversation: { $in: conversationIds } })
  await Conversation.deleteMany({ _id: { $in: conversationIds } })
  await Favorite.deleteMany({ listing: { $in: listingIds } })
  await Listing.deleteMany({ _id: { $in: listingIds } })
  await User.deleteMany({ _id: { $in: userIds } })
}

async function run() {
  const health = await fetch(new URL('/api/health', baseUrl))
  assert.equal(health.status, 200, 'API health endpoint should be available')
  await mongoose.connect(testMongoUri)

  try {
    const sellerSession = new ApiSession()
    const seller = await sellerSession.register(testAccounts[0])
    const buyerSession = new ApiSession()
    await buyerSession.register(testAccounts[1])
    const outsiderSession = new ApiSession()
    await outsiderSession.register(testAccounts[2])

    const created = await sellerSession.request('/api/listings', {
      method: 'POST',
      body: {
        title: 'Socket smoke-test table',
        description: 'Temporary listing created by the local WebSocket smoke test.',
        price: 25,
        category: 'Home & Living',
        condition: 'Good',
        location: 'Local test',
        images: [],
      },
    })
    assert.equal(created.status, 201, `Listing creation failed: ${JSON.stringify(created.payload)}`)
    const listingId = created.payload.item._id

    const started = await buyerSession.request('/api/conversations', {
      method: 'POST',
      body: { listingId },
    })
    assert.equal(started.status, 200, `Conversation creation failed: ${JSON.stringify(started.payload)}`)
    const conversationId = started.payload.conversation._id

    await assert.rejects(connectSocket(), /Authentication required/)
    console.log('PASS unauthenticated WebSocket connections are rejected')

    const outsider = await connectSocket(outsiderSession.cookies.get('session'))
    const outsiderJoin = await joinConversation(outsider, conversationId)
    assert.equal(outsiderJoin.ok, false, 'Non-members must not join a conversation room')
    console.log('PASS non-members cannot join conversation rooms')

    const sellerSocket = await connectSocket(sellerSession.cookies.get('session'))
    const buyerSocket = await connectSocket(buyerSession.cookies.get('session'))
    assert.equal((await joinConversation(sellerSocket, conversationId)).ok, true)
    assert.equal((await joinConversation(buyerSocket, conversationId)).ok, true)
    console.log('PASS authorized participants can connect and join their room')

    const incomingMessage = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('No message:new event arrived.')), 5000)
      sellerSocket.once('message:new', (message) => {
        clearTimeout(timeout)
        resolve(message)
      })
    })
    const acknowledgement = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Message acknowledgement timed out.')), 5000)
      buyerSocket.emit(
        'message:send',
        { conversationId, body: 'Is this item still available?' },
        (result) => {
          clearTimeout(timeout)
          resolve(result)
        },
      )
    })
    assert.equal(acknowledgement.ok, true, acknowledgement.error)
    const delivered = await incomingMessage
    assert.equal(delivered._id, acknowledgement.message._id)
    assert.equal(delivered.body, 'Is this item still available?')
    console.log('PASS sent messages are acknowledged and delivered to room participants')

    const history = await buyerSession.request(`/api/conversations/${conversationId}/messages`)
    assert.equal(history.status, 200)
    assert.ok(history.payload.items.some(({ _id }) => _id === acknowledgement.message._id))
    console.log('PASS messages persist and appear in REST conversation history')
    console.log('All local Socket.IO smoke checks passed.')
  } finally {
    for (const socket of sockets) socket.disconnect()
    await removeTestData()
    await mongoose.disconnect()
  }
}

run().catch((error) => {
  console.error('WebSocket smoke test failed:', error)
  process.exitCode = 1
})
