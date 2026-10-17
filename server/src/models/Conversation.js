import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    participantsKey: { type: String, required: true },
    lastMessage: { type: String, maxlength: 2000, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

conversationSchema.index({ members: 1, lastMessageAt: -1 })
conversationSchema.index({ listing: 1, participantsKey: 1 }, { unique: true })

export const Conversation = mongoose.model('Conversation', conversationSchema)
