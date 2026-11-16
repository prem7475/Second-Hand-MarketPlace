import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext.jsx'
import { request } from '../lib/api.js'

const socketOrigin =
  import.meta.env?.VITE_SOCKET_URL || import.meta.env?.VITE_API_URL || window.location.origin

function NotificationToast({ notification, onDismiss }) {
  const { id, title, message, href } = notification
  const content = (
    <>
      <strong>{title}</strong>
      <span>{message}</span>
    </>
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(id), 6000)
    return () => window.clearTimeout(timeout)
  }, [id, onDismiss])

  return (
    <article className="notification-toast" role="status">
      {href ? (
        <Link className="notification-copy" to={href} onClick={() => onDismiss(id)}>
          {content}
        </Link>
      ) : (
        <div className="notification-copy">{content}</div>
      )}
      <button
        className="notification-dismiss"
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </article>
  )
}

export default function NotificationCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const nextId = useRef(0)
  const dismiss = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  useEffect(() => {
    setNotifications([])
    if (!user) return undefined

    let active = true
    const socket = io(socketOrigin, {
      auth(callback) {
        request('/auth/socket-token', { method: 'POST', body: {} })
          .then(({ token }) => {
            if (active) callback({ token })
          })
          .catch((error) => {
            if (!active) return
            console.error('Unable to authenticate live notifications:', error)
            callback({})
          })
      },
      transports: ['websocket', 'polling'],
    })

    socket.on('notification:new', (notification) => {
      if (!active || typeof notification?.title !== 'string') return
      const id = `notification-${nextId.current++}`
      const safeHref =
        typeof notification.href === 'string' &&
        notification.href.startsWith('/') &&
        !notification.href.startsWith('//')
          ? notification.href
          : undefined
      setNotifications((current) => [
        ...current,
        {
          id,
          title: notification.title,
          message: typeof notification.message === 'string' ? notification.message : '',
          href: safeHref,
        },
      ])
    })
    socket.on('connect_error', (error) => {
      if (active) console.error('Live notifications are unavailable:', error.message)
    })

    return () => {
      active = false
      socket.disconnect()
    }
  }, [user])

  if (!user) return null

  return (
    <div className="notification-stack" aria-live="polite" aria-relevant="additions">
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} onDismiss={dismiss} />
      ))}
    </div>
  )
}
