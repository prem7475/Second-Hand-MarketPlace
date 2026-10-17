import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { config } from './config.js'
import { User } from './models/User.js'
import { Listing } from './models/Listing.js'
import { examples } from './seed-data.js'

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
      { $set: { ...data, seller: seller.id } },
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
