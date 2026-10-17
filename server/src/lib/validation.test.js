import test from 'node:test'
import assert from 'node:assert/strict'
import {
  listingQuerySchema,
  listingSchema,
  loginSchema,
  messageSchema,
  registerSchema,
  validate,
} from './validation.js'

test('registration trims and normalizes email and rejects weak passwords', () => {
  const valid = validate(registerSchema, {
    name: '  Sam  ',
    email: ' SAM@EXAMPLE.COM ',
    password: 'password123',
  })
  assert.equal(valid.success, true)
  assert.equal(valid.data.name, 'Sam')
  assert.equal(valid.data.email, 'sam@example.com')
  assert.equal(validate(registerSchema, { name: 'S', email: 'bad', password: 'x' }).success, false)
  assert.equal(
    validate(registerSchema, { name: 'Sam', email: 'sam@example.com', password: '😀'.repeat(19) })
      .success,
    false,
  )
})

test('login validates credentials without exposing raw parser errors', () => {
  assert.equal(
    validate(loginSchema, { email: 'person@example.com', password: 'secret' }).success,
    true,
  )
  const invalid = validate(loginSchema, { email: 'not-an-email', password: '' })
  assert.equal(invalid.success, false)
  assert.ok(
    invalid.errors.every(
      (error) => typeof error.field === 'string' && typeof error.message === 'string',
    ),
  )
})

test('listing validates required fields, enums, price, and safe image URLs', () => {
  const listing = {
    title: 'Vintage chair',
    description: 'A comfortable chair in good condition.',
    price: 45,
    category: 'Furniture',
    condition: 'Good',
    location: 'Portland',
    images: ['https://images.unsplash.com/photo-123'],
  }
  const valid = validate(listingSchema, listing)
  assert.equal(valid.success, true)
  assert.equal(valid.data.price, 45)
  assert.equal(validate(listingSchema, { ...listing, price: '45' }).success, false)
  assert.equal(
    validate(listingSchema, { ...listing, images: ['javascript:alert(1)'] }).success,
    false,
  )
  assert.equal(validate(listingSchema, { ...listing, price: -1 }).success, false)
})

test('listing query validation applies defaults and rejects invalid filters', () => {
  const defaults = validate(listingQuerySchema, {})
  assert.equal(defaults.success, true)
  assert.deepEqual(defaults.data, { sort: 'newest', page: 1, limit: 12, status: 'active' })
  assert.equal(validate(listingQuerySchema, { category: 'Vehicles' }).success, false)
  assert.equal(validate(listingQuerySchema, { minPrice: '90', maxPrice: '20' }).success, false)
  assert.equal(validate(listingQuerySchema, { page: '10001' }).success, false)
  assert.equal(validate(listingQuerySchema, { typo: 'ignored' }).success, false)
})

test('message validation rejects blank and overlong content', () => {
  assert.equal(
    validate(messageSchema, { body: ' Is this available? ' }).data.body,
    'Is this available?',
  )
  assert.equal(validate(messageSchema, { body: '   ' }).success, false)
  assert.equal(validate(messageSchema, { body: 'x'.repeat(2001) }).success, false)
})
