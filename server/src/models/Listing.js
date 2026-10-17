import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
    price: { type: Number, required: true, min: 0, max: 100000000 },
    category: {
      type: String,
      enum: ['Furniture', 'Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Other'],
      required: true,
    },
    condition: { type: String, enum: ['Like new', 'Excellent', 'Good', 'Fair'], required: true },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    images: [{ type: String, maxlength: 2048 }],
    status: { type: String, enum: ['active', 'sold'], default: 'active', index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
)

listingSchema.index({ category: 1, status: 1, createdAt: -1 })
listingSchema.index({ price: 1, status: 1 })
listingSchema.index({ title: 'text', description: 'text' })

export const Listing = mongoose.model('Listing', listingSchema)
