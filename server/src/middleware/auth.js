import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { config } from '../config.js'
import { HttpError, asyncHandler } from '../lib/errors.js'

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.session
  if (!token) throw new HttpError(401, 'Please sign in to continue.')

  let payload
  try {
    payload = jwt.verify(token, config.jwtSecret, {
      issuer: 'refind-marketplace',
      audience: 'refind-client',
    })
  } catch {
    throw new HttpError(401, 'Your session is invalid or has expired. Please sign in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw new HttpError(401, 'Your account is no longer available.')
  req.user = user
  next()
})

export function requireCsrf(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  const cookieToken = req.cookies?.csrf
  const headerToken = req.get('x-csrf-token')
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new HttpError(403, 'Request verification failed. Refresh and try again.'))
  }
  next()
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You do not have permission to perform this action.'))
    }
    next()
  }
}
