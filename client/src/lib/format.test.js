import test from 'node:test'
import assert from 'node:assert/strict'
import { formatPrice, timeAgo } from './format.js'

test('formats prices in dollars without fractional digits', () => {
  assert.equal(formatPrice(125), '$125')
  assert.equal(formatPrice(0), '$0')
})

test('formats listing dates into useful relative labels', () => {
  assert.equal(timeAgo(new Date().toISOString()), 'Today')
  assert.equal(timeAgo(new Date(Date.now() - 86400000).toISOString()), 'Yesterday')
})
