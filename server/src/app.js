import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './config.js'
import { requireCsrf } from './middleware/auth.js'
import { HttpError } from './lib/errors.js'
import authRoutes from './routes/auth.js'
import listingRoutes from './routes/listings.js'
import favoriteRoutes from './routes/favorites.js'
import conversationRoutes from './routes/conversations.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', config.isProduction ? 1 : false)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'img-src': ["'self'", 'data:', 'https://images.unsplash.com'],
        },
      },
    }),
  )
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || config.clientOrigins.includes(origin)) return callback(null, true)
        callback(new HttpError(403, 'This origin is not allowed to access the API.'))
      },
    }),
  )
  app.use(express.json({ limit: '64kb' }))
  app.use(cookieParser())
  app.use(requireCsrf)
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 30,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  )

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'refind-api' })
  })
  app.use('/api/auth', authRoutes)
  app.use('/api/listings', listingRoutes)
  app.use('/api/favorites', favoriteRoutes)
  app.use('/api/conversations', conversationRoutes)
  app.use((_req, _res, next) =>
    next(new HttpError(404, 'The requested endpoint could not be found.')),
  )
  app.use((error, _req, res, _next) => {
    const status = error.status || (error.name === 'ValidationError' ? 400 : 500)
    if (status >= 500) console.error(error)
    res.status(status).json({
      message: status >= 500 ? 'Something went wrong. Please try again.' : error.message,
    })
  })

  return app
}
