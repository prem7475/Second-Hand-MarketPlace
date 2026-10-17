import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'
import { User } from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { config } from '../config.js'
import { asyncHandler, HttpError } from '../lib/errors.js'
import { loginSchema, registerSchema, validate } from '../lib/validation.js'

const router = Router()
const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}
const csrfCookieOptions = {
  httpOnly: false,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: cookieOptions.maxAge,
}

function makeCsrfToken(res) {
  const token = randomBytes(32).toString('hex')
  res.cookie('csrf', token, csrfCookieOptions)
  return token
}

function createSession(user, res) {
  const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: '7d',
    issuer: 'refind-marketplace',
    audience: 'refind-client',
  })
  res.cookie('session', token, cookieOptions)
}

router.get('/csrf', (_req, res) => {
  res.json({ csrfToken: makeCsrfToken(res) })
})

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = validate(registerSchema, req.body)
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: 'Please check the form fields.', errors: parsed.errors })

    const exists = await User.exists({ email: parsed.data.email })
    if (exists) throw new HttpError(409, 'An account with this email already exists.')

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    })
    createSession(user, res)
    res.status(201).json({ user, csrfToken: makeCsrfToken(res) })
  }),
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = validate(loginSchema, req.body)
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: 'Please check your email and password.', errors: parsed.errors })

    const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash')
    const passwordMatches = user && (await bcrypt.compare(parsed.data.password, user.passwordHash))
    if (!passwordMatches) throw new HttpError(401, 'Email or password is incorrect.')

    createSession(user, res)
    res.json({ user, csrfToken: makeCsrfToken(res) })
  }),
)

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('session', { ...cookieOptions, maxAge: undefined })
  res.json({ message: 'You have been signed out.' })
})

router.patch(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    const location = typeof req.body?.location === 'string' ? req.body.location.trim() : ''
    if (name.length < 2 || name.length > 60 || location.length > 100) {
      throw new HttpError(
        400,
        'Name must be 2–60 characters and location must be 100 characters or fewer.',
      )
    }
    req.user.name = name
    req.user.location = location
    await req.user.save()
    res.json({ user: req.user })
  }),
)

export default router
