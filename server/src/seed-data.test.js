import test from 'node:test'
import assert from 'node:assert/strict'
import { examples } from '../../shared/seed-data.mjs'
import { listingSchema, validate } from './lib/validation.js'

const categories = [
  'Furniture',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Sports',
  'Books',
  'Other',
]

test('demo catalog contains eight complete, valid listings in every category', () => {
  assert.equal(examples.length, 56)
  assert.equal(new Set(examples.map((item) => item.title)).size, examples.length)

  for (const category of categories) {
    const categoryListings = examples.filter((item) => item.category === category)
    assert.equal(categoryListings.length, 8, `${category} should have eight demo listings`)
    for (const item of categoryListings) {
      assert.equal(validate(listingSchema, item).success, true, item.title)
      assert.ok(item.images.length > 0, `${item.title} should have an image`)
      assert.ok(
        item.images.every((image) => image.startsWith('https://images.unsplash.com/')),
        `${item.title} should have HTTPS image URLs`,
      )
    }
  }
})

test('demo listings use romanized Hindi titles, Indian locations, and rupee-scale prices', () => {
  const IndianRegions = [
    'Assam',
    'Chandigarh',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Meghalaya',
    'Punjab',
    'Rajasthan',
    'Tamil Nadu',
    'Telangana',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
  ]

  for (const item of examples) {
    assert.match(item.title, /^[\x20-\x7E]+$/, `${item.title} should use Latin letters`)
    assert.ok(
      IndianRegions.some((region) => item.location.endsWith(region)),
      item.location,
    )
    assert.ok(item.price >= 250, `${item.title} should have a realistic rupee price`)
  }
})
