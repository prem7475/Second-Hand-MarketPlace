import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { config } from './config.js'
import { User } from './models/User.js'
import { Listing } from './models/Listing.js'

const examples = [
  {
    title: 'Oak & cane lounge chair',
    description:
      'A lovely oak-framed chair with a woven cane seat. Gently used and ready for a cozy reading corner.',
    price: 145,
    category: 'Furniture',
    condition: 'Excellent',
    location: 'Portland, OR',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    title: 'Film camera, ready to shoot',
    description:
      'A compact 35mm film camera in great working condition. Includes a strap and a fresh battery.',
    price: 88,
    category: 'Electronics',
    condition: 'Good',
    location: 'Brooklyn, NY',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    title: 'Everyday linen overshirt',
    description:
      'Soft, breathable linen in a warm oat color. Worn a handful of times, no marks or damage.',
    price: 32,
    category: 'Fashion',
    condition: 'Like new',
    location: 'Austin, TX',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    title: 'Hand-thrown stoneware vase',
    description:
      'A one-of-a-kind ceramic vase in a soft sand glaze. A small handmade detail that looks lovely on a shelf.',
    price: 24,
    category: 'Home & Living',
    condition: 'Excellent',
    location: 'Seattle, WA',
    images: [
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    title: 'Weekend trail backpack',
    description:
      'A comfortable daypack with plenty of room for a weekend walk. Zippers and straps are all in great shape.',
    price: 54,
    category: 'Sports',
    condition: 'Good',
    location: 'Denver, CO',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    title: 'A small stack of modern classics',
    description:
      'Six much-loved novels in very good condition. Ready for another set of late-night page turns.',
    price: 18,
    category: 'Books',
    condition: 'Good',
    location: 'Chicago, IL',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    ],
  },
]

async function seed() {
  if (process.env.SEED_DEMO_DATA !== 'true') {
    throw new Error('Set SEED_DEMO_DATA=true to explicitly add the sample listings.')
  }
  if (config.isProduction && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error(
      'Demo data is disabled in production unless ALLOW_DEMO_SEED=true is explicitly set.',
    )
  }
  await mongoose.connect(config.mongoUri)
  const email = 'market-fixtures@refind.local'
  const seller = await User.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        email,
        name: 'Refind Community',
        passwordHash: randomBytes(48).toString('hex'),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
  for (const data of examples) {
    await Listing.updateOne(
      { seller: seller.id, title: data.title },
      { $setOnInsert: { ...data, seller: seller.id } },
      { upsert: true },
    )
  }
  console.log(`Added ${examples.length} sample listings for ${email}.`)
  await mongoose.disconnect()
}

seed().catch(async (error) => {
  console.error('Unable to seed sample listings:', error)
  await mongoose.disconnect().catch(() => {})
  process.exitCode = 1
})
