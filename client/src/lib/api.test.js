import test from 'node:test'
import assert from 'node:assert/strict'
import { requireItems } from './api.js'

test('requires an items array in list responses', () => {
  const items = [{ _id: 'listing-1' }]
  assert.equal(requireItems({ items }), items)
})

test('rejects list responses without an items array', () => {
  assert.throws(
    () => requireItems({}),
    {
      name: 'TypeError',
      message: 'The server returned an invalid response: expected an items array.',
    },
  )
  assert.throws(() => requireItems({ items: null }), TypeError)
})
