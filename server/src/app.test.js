import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'

process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-thirty-two-characters'
const { createApp } = await import('./app.js')

test('CSRF bootstrap GETs do not consume the auth write-request rate limit', async (t) => {
  const server = http.createServer(createApp())
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(
    () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      }),
  )

  const address = server.address()
  const url = `http://127.0.0.1:${address.port}/api/auth/csrf`
  for (let request = 0; request < 31; request += 1) {
    const response = await fetch(url)
    assert.equal(response.status, 200)
    await response.body.cancel()
  }
})
