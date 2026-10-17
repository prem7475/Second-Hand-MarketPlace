import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    location: { type: String, trim: true, maxlength: 100, default: '' },
  },
  { timestamps: true },
)

userSchema.set('toJSON', {
  transform(_document, result) {
    delete result.passwordHash
    delete result.__v
    return result
  },
})

export const User = mongoose.model('User', userSchema)
