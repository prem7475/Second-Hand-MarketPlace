import test from 'node:test'
import assert from 'node:assert/strict'
import { getDemoListings, findDemoListing } from './demoListings.js'

const categories = [
  'Furniture',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Sports',
  'Books',
  'Other',
]

test('provides eight image-backed demo listings for every category', () => {
  for (const category of categories) {
    const result = getDemoListings(new URLSearchParams(`category=${encodeURIComponent(category)}`))
    assert.equal(result.items.length, 8, `${category} should show eight items`)
    assert.equal(result.pagination.total, 8)
    assert.ok(result.items.every((item) => item.isDemo && item.images.length > 0))
  }
})

test('demo catalog supports search and resolves item details', () => {
  const result = getDemoListings(new URLSearchParams('q=chai'))
  assert.ok(result.items.some((item) => item.title.toLowerCase().includes('chai')))
  assert.ok(findDemoListing(result.items[0]._id))
})

test('homepage features sample items from across categories', () => {
  const result = getDemoListings(new URLSearchParams('limit=8&sort=newest'))
  assert.equal(result.items.length, 8)
  assert.equal(new Set(result.items.map((item) => item.category)).size, 7)
})
