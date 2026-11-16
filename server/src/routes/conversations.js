import { Router } from 'express'
import mongoose from 'mongoose'
import { Conversation } from '../models/Conversation.js'
import { Listing } from '../models/Listing.js'
import { Message } from '../models/Message.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler, HttpError } from '../lib/errors.js'
import { notifyUser } from '../lib/notifications.js'
import { messageSchema, validate } from '../lib/validation.js'

const router = Router()
router.use(authenticate)

function validId(value) {
  if (!mongoose.isValidObjectId(value)) throw new HttpError(400, 'The requested id is not valid.')
}

async function createMessage(conversationId, user, body, io) {
  const conversation = await Conversation.findOne({ _id: conversationId, members: user.id })
  if (!conversation) throw new HttpError(404, 'This conversation could not be found.')
  const message = await Message.create({ conversation: conversation.id, sender: user.id, body })
  conversation.lastMessage = body
  conversation.lastMessageAt = message.createdAt
  await conversation.save()
  await message.populate('sender', 'name')
  notifyUser(io, user.id, {
    title: 'Message sent',
    message: 'Your message was sent.',
    href: `/inbox/${conversation.id}`,
  })
  conversation.members
    .filter((member) => member.toString() !== user.id)
    .forEach((member) =>
      notifyUser(io, member, {
        title: 'New message',
        message: `${user.name} sent you a message.`,
        href: `/inbox/${conversation.id}`,
      }),
    )
  return { conversation, message }
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await Conversation.find({ members: req.user.id })
      .sort({ lastMessageAt: -1 })
      .populate('members', 'name location')
      .populate('listing', 'title images price status')
    res.json({ items })
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const listingId = req.body?.listingId
    validId(listingId)
    const listing = await Listing.findById(listingId).populate('seller', 'name')
    if (!listing || listing.status !== 'active')
      throw new HttpError(404, 'This active listing could not be found.')
    if (listing.seller.id === req.user.id)
      throw new HttpError(400, 'You cannot start a conversation with yourself.')
    const members = [req.user.id, listing.seller.id].sort()
    const participantsKey = members.join(':')
    const result = await Conversation.findOneAndUpdate(
      { listing: listing.id, participantsKey },
      { $setOnInsert: { listing: listing.id, members, participantsKey } },
      { new: true, upsert: true, setDefaultsOnInsert: true, includeResultMetadata: true },
    )
    const conversation = result.value
    await conversation.populate('members', 'name location')
    await conversation.populate('listing', 'title images price status')
    notifyUser(req.app.get('io'), req.user.id, {
      title: 'Conversation ready',
      message: `You can now message the seller about ${listing.title}.`,
      href: `/inbox/${conversation.id}`,
    })
    if (!result.lastErrorObject.updatedExisting) {
      notifyUser(req.app.get('io'), listing.seller.id, {
        title: 'New conversation',
        message: `${req.user.name} is interested in ${listing.title}.`,
        href: `/inbox/${conversation.id}`,
      })
    }
    res.status(200).json({ conversation })
  }),
)

router.get(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    validId(req.params.id)
    const conversation = await Conversation.findOne({ _id: req.params.id, members: req.user.id })
    if (!conversation) throw new HttpError(404, 'This conversation could not be found.')
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 30))
    const messages = await Message.find({ conversation: conversation.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name')
    res.json({ items: messages.reverse(), page, limit })
  }),
)

router.post(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    validId(req.params.id)
    const parsed = validate(messageSchema, req.body)
    if (!parsed.success)
      return res.status(400).json({
        message: 'Please enter a message of up to 2,000 characters.',
        errors: parsed.errors,
      })
    const io = req.app.get('io')
    const { conversation, message } = await createMessage(
      req.params.id,
      req.user,
      parsed.data.body,
      io,
    )
    io?.to(conversation.id).emit('message:new', message)
    res.status(201).json({ message })
  }),
)

export { createMessage }
export default router
