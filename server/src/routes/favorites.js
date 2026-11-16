import { Router } from 'express'
import mongoose from 'mongoose'
import { Favorite } from '../models/Favorite.js'
import { Listing } from '../models/Listing.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler, HttpError } from '../lib/errors.js'
import { notifyUser } from '../lib/notifications.js'

const router = Router()
router.use(authenticate)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({ path: 'listing', populate: { path: 'seller', select: 'name location' } })
    res.json({
      items: favorites.filter((favorite) => favorite.listing).map((favorite) => favorite.listing),
    })
  }),
)

router.post(
  '/:listingId',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.listingId))
      throw new HttpError(400, 'The requested listing id is not valid.')
    const listing = await Listing.findOne({ _id: req.params.listingId, status: 'active' })
    if (!listing) throw new HttpError(404, 'This active listing could not be found.')
    const result = await Favorite.updateOne(
      { user: req.user.id, listing: listing.id },
      { $setOnInsert: { user: req.user.id, listing: listing.id } },
      { upsert: true },
    )
    if (result.upsertedCount) {
      const io = req.app.get('io')
      notifyUser(io, req.user.id, {
        title: 'Saved to favorites',
        message: `${listing.title} was added to your saved finds.`,
        href: '/saved',
      })
      if (listing.seller.toString() !== req.user.id) {
        notifyUser(io, listing.seller, {
          title: 'New favorite',
          message: `Someone saved your listing: ${listing.title}.`,
          href: `/listing/${listing.id}`,
        })
      }
    }
    res.status(201).json({ message: 'Saved to your favorites.' })
  }),
)

router.delete(
  '/:listingId',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.listingId))
      throw new HttpError(400, 'The requested listing id is not valid.')
    const result = await Favorite.deleteOne({ user: req.user.id, listing: req.params.listingId })
    if (result.deletedCount) {
      const listing = await Listing.findById(req.params.listingId).select('title')
      notifyUser(req.app.get('io'), req.user.id, {
        title: 'Removed from favorites',
        message: listing
          ? `${listing.title} was removed from your saved finds.`
          : 'The listing was removed from your saved finds.',
        href: '/saved',
      })
    }
    res.json({ message: 'Removed from your favorites.' })
  }),
)

export default router
