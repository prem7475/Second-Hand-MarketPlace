import nodemailer from 'nodemailer'
import { User } from '../models/User.js'

let transport
let missingConfigurationReported = false

function getTransport() {
  const { SMTP_HOST: host, SMTP_USER: user } = process.env
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '')
  if (!host || !user || !pass) {
    if (!missingConfigurationReported) {
      console.warn(
        'Transaction emails are disabled; configure SMTP_HOST, SMTP_USER, and SMTP_PASS.',
      )
      missingConfigurationReported = true
    }
    return null
  }

  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 587)
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('SMTP_PORT must be a valid TCP port.')
    }
    transport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user, pass },
    })
  }
  return transport
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    return entities[character]
  })
}

export async function sendTransactionEmail(userId, notification) {
  const mailTransport = getTransport()
  if (!mailTransport) return
  const user = await User.findById(userId).select('email')
  if (!user?.email) throw new Error('The notification recipient has no email address.')

  const appUrl =
    process.env.CLIENT_URL || process.env.CLIENT_ORIGIN?.split(',')[0] || 'http://localhost:5173'
  const href =
    typeof notification.href === 'string' &&
    notification.href.startsWith('/') &&
    !notification.href.startsWith('//')
      ? new URL(notification.href, appUrl).toString()
      : undefined
  const title = String(notification.title || 'Marketplace update')
  const message = String(notification.message || '')
  const text = `${title}\n\n${message}${href ? `\n\nView details: ${href}` : ''}`
  const html = `<div style="font-family:Arial,sans-serif;color:#29372f;line-height:1.6"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>${href ? `<p><a href="${escapeHtml(href)}">View details</a></p>` : ''}<p style="color:#7b8179">Refind Marketplace</p></div>`

  await mailTransport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: `${title} | Refind`,
    text,
    html,
  })
}
