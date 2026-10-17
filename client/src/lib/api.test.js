import test from 'node:test'
import assert from 'node:assert/strict'
import { ApiError, request, requireItems } from './api.js'

test('requires an items array in list responses', () => {
  const items = [{ _id: 'listing-1' }]
  assert.equal(requireItems({ items }), items)
})

test('rejects list responses without an items array', () => {
  assert.throws(() => requireItems({}), {
    name: 'TypeError',
    message: 'The server returned an invalid response: expected an items array.',
  })
  assert.throws(() => requireItems({ items: null }), TypeError)
})

test('reports HTML API responses as deployment configuration errors', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    new Response('<!doctype html><html></html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    })

  try {
    await assert.rejects(request('/listings'), (error) => {
      assert.ok(error instanceof ApiError)
      assert.match(error.message, /non-JSON response/)
      assert.equal(error.status, 200)
      return true
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
