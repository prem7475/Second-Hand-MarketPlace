import { Router } from 'express'
import mongoose from 'mongoose'
import { Listing } from '../models/Listing.js'
import { Favorite } from '../models/Favorite.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler, HttpError } from '../lib/errors.js'
import { listingQuerySchema, listingSchema, validate } from '../lib/validation.js'

const router = Router()

function validId(value) {
  if (!mongoose.isValidObjectId(value)) throw new HttpError(400, 'The requested id is not valid.')
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = validate(listingQuerySchema, req.query)
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: 'Please check the listing filters.', errors: parsed.errors })
    const {
      page,
      limit,
      status,
      category,
      condition,
      location,
      q,
      minPrice,
      maxPrice,
      sort: sortName,
    } = parsed.data
    const filter = { status }
    if (category) filter.category = category
    if (condition) filter.condition = condition
    if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' }
    if (q) filter.$text = { $search: q }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {}
      if (minPrice !== undefined) filter.price.$gte = minPrice
      if (maxPrice !== undefined) filter.price.$lte = maxPrice
    }
    const sortOptions = {
      newest: { createdAt: -1 },
      'price-low': { price: 1, createdAt: -1 },
      'price-high': { price: -1, createdAt: -1 },
    }
    const sort = sortOptions[sortName]
    const [items, total] = await Promise.all([
      Listing.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('seller', 'name location'),
      Listing.countDocuments(filter),
    ])
    res.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  }),
)

router.get(
  '/mine',
  authenticate,
  asyncHandler(async (req, res) => {
    const items = await Listing.find({ seller: req.user.id }).sort({ updatedAt: -1 })
    res.json({ items })
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    validId(req.params.id)
    const item = await Listing.findById(req.params.id).populate('seller', 'name location createdAt')
    if (!item) throw new HttpError(404, 'This listing could not be found.')
    res.json({ item })
  }),
)

router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const parsed = validate(listingSchema, req.body)
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: 'Please check the listing fields.', errors: parsed.errors })
    const item = await Listing.create({ ...parsed.data, seller: req.user.id })
    await item.populate('seller', 'name location')
    res.status(201).json({ item })
  }),
)

router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    validId(req.params.id)
    const parsed = validate(listingSchema.partial(), req.body)
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: 'Please check the listing fields.', errors: parsed.errors })
    const item = await Listing.findById(req.params.id)
    if (!item) throw new HttpError(404, 'This listing could not be found.')
    if (item.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new HttpError(403, 'You can only edit your own listings.')
    }
    Object.assign(item, parsed.data)
    await item.save()
    await item.populate('seller', 'name location')
    res.json({ item })
  }),
)

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    validId(req.params.id)
    const item = await Listing.findById(req.params.id)
    if (!item) throw new HttpError(404, 'This listing could not be found.')
    if (item.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new HttpError(403, 'You can only remove your own listings.')
    }
    await Promise.all([item.deleteOne(), Favorite.deleteMany({ listing: item.id })])
    res.json({ message: 'Listing removed.' })
  }),
)

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default router
