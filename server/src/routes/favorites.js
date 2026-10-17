import { Router } from 'express'
import mongoose from 'mongoose'
import { Favorite } from '../models/Favorite.js'
import { Listing } from '../models/Listing.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler, HttpError } from '../lib/errors.js'

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
    await Favorite.updateOne(
      { user: req.user.id, listing: listing.id },
      { $setOnInsert: { user: req.user.id, listing: listing.id } },
      { upsert: true },
    )
    res.status(201).json({ message: 'Saved to your favorites.' })
  }),
)

router.delete(
  '/:listingId',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.listingId))
      throw new HttpError(400, 'The requested listing id is not valid.')
    await Favorite.deleteOne({ user: req.user.id, listing: req.params.listingId })
    res.json({ message: 'Removed from your favorites.' })
  }),
)

export default router
