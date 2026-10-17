import mongoose from 'mongoose'
import { config } from './config.js'
import { seedDemoData } from './seed-demo-data.js'

async function seed() {
  await mongoose.connect(config.mongoUri)
  try {
    await seedDemoData()
  } finally {
    await mongoose.disconnect()
  }
}

seed().catch(async (error) => {
  console.error('Unable to seed sample listings:', error)
  await mongoose.disconnect().catch(() => {})
  process.exitCode = 1
})
