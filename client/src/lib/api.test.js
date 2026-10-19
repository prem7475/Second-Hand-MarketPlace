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

test('preserves error messages returned by API gateways', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })

  try {
    await assert.rejects(request('/auth/login'), (error) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.message, 'not found')
      assert.equal(error.status, 404)
      return true
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
