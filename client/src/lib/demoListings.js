import { examples } from '../../../shared/seed-data.mjs'

const demoListings = examples.map((item, index) => ({
  ...item,
  _id: (index + 1).toString(16).padStart(24, '0'),
  isDemo: true,
  seller: { _id: '000000000000000000000000', name: 'Refind Community', location: '' },
  status: 'active',
  createdAt: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(),
}))

export function getDemoListings(searchParams) {
  let items = demoListings
  if (
    !searchParams.has('category') &&
    !searchParams.has('condition') &&
    !searchParams.has('location') &&
    !searchParams.has('q') &&
    searchParams.get('limit') === '8' &&
    searchParams.get('sort') === 'newest'
  ) {
    items = [0, 8, 16, 24, 32, 40, 48, 1].map((index) => demoListings[index])
  }
  const category = searchParams.get('category')
  const condition = searchParams.get('condition')
  const location = searchParams.get('location')?.trim().toLowerCase()
  const query = searchParams.get('q')?.trim().toLowerCase()
  const minimum = Number(searchParams.get('minPrice'))
  const maximum = Number(searchParams.get('maxPrice'))

  if (category) items = items.filter((item) => item.category === category)
  if (condition) items = items.filter((item) => item.condition === condition)
  if (location) items = items.filter((item) => item.location.toLowerCase().includes(location))
  if (query) {
    items = items.filter((item) =>
      `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query),
    )
  }
  if (searchParams.has('minPrice') && Number.isFinite(minimum)) {
    items = items.filter((item) => item.price >= minimum)
  }
  if (searchParams.has('maxPrice') && Number.isFinite(maximum)) {
    items = items.filter((item) => item.price <= maximum)
  }

  const sort = searchParams.get('sort')
  if (sort === 'price-low') items = [...items].sort((a, b) => a.price - b.price)
  if (sort === 'price-high') items = [...items].sort((a, b) => b.price - a.price)
  if (!sort || sort === 'newest') items = [...items].reverse()

  const total = items.length
  const limit = Math.min(24, Math.max(1, Number(searchParams.get('limit')) || 12))
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pages = Math.ceil(total / limit)
  return {
    items: items.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total, pages },
  }
}

export function findDemoListing(id) {
  return demoListings.find((item) => item._id === id)
}
