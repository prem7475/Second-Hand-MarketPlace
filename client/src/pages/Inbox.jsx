import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, MessageCircle, Send } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { request, requireItems } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { listingImage } from '../components/ListingCard.jsx'
import Loading from '../components/Loading.jsx'

function formatTime(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function Inbox() {
  const { id } = useParams()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [socketReady, setSocketReady] = useState(false)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const selected = conversations.find((item) => item._id === id)

  useEffect(() => {
    let active = true
    request('/conversations')
      .then((result) => {
        const items = requireItems(result)
        if (active) setConversations(items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!id) {
      setMessages([])
      return undefined
    }
    let active = true
    setError('')
    request(`/conversations/${id}/messages`)
      .then((result) => {
        const items = requireItems(result)
        if (active) setMessages(items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    const socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
      withCredentials: true,
    })
    socketRef.current = socket
    socket.on('connect', () => {
      setSocketReady(false)
      socket.emit('conversation:join', id, (result) => {
        if (!active) return
        if (!result?.ok) setError(result?.error || 'Could not join this conversation.')
        else setSocketReady(true)
      })
    })
    socket.on('disconnect', () => setSocketReady(false))
    socket.on('connect_error', () => {
      if (active)
        setError('Live messages are temporarily unavailable. You can still send a message.')
    })
    socket.on('message:new', (incoming) => {
      if (!active) return
      setMessages((current) =>
        current.some((existing) => existing._id === incoming._id)
          ? current
          : [...current, incoming],
      )
      setConversations((current) =>
        current.map((conversation) =>
          conversation._id === id
            ? { ...conversation, lastMessage: incoming.body, lastMessageAt: incoming.createdAt }
            : conversation,
        ),
      )
    })
    return () => {
      active = false
      socket.disconnect()
      socketRef.current = null
    }
  }, [id])

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])

  const sendMessage = useCallback(
    async (event) => {
      event.preventDefault()
      const body = message.trim()
      if (!body || !id) return
      setMessage('')
      setError('')
      if (socketRef.current?.connected && socketReady) {
        socketRef.current.emit('message:send', { conversationId: id, body }, (result) => {
          if (!result?.ok) {
            setMessage(body)
            setError(result?.error || 'Message could not be sent.')
          } else if (result.message) {
            setMessages((current) =>
              current.some((existing) => existing._id === result.message._id)
                ? current
                : [...current, result.message],
            )
          }
        })
        return
      }
      try {
        const { message: sent } = await request(`/conversations/${id}/messages`, {
          method: 'POST',
          body: { body },
        })
        setMessages((current) => [...current, sent])
      } catch (requestError) {
        setMessage(body)
        setError(requestError.message)
      }
    },
    [id, message, socketReady],
  )

  if (loading) return <Loading label="Opening your inbox..." />

  return (
    <main className="page-shell inbox-page">
      <div className="inbox-heading">
        <span className="eyebrow">A good conversation</span>
        <h1>
          Your <em>inbox.</em>
        </h1>
      </div>
      {error && <div className="notice notice-error">{error}</div>}
      <div className="inbox-layout">
        <aside className={`conversation-list ${id ? 'conversation-list-mobile-hidden' : ''}`}>
          <div className="conversation-list-title">
            <strong>Messages</strong>
            <span>{conversations.length}</span>
          </div>
          {conversations.length ? (
            conversations.map((conversation) => {
              const otherMember = conversation.members.find((member) => member._id !== user._id)
              return (
                <Link
                  className={`conversation-link ${id === conversation._id ? 'selected' : ''}`}
                  key={conversation._id}
                  to={`/inbox/${conversation._id}`}
                >
                  <div className="conversation-avatar">
                    {otherMember?.name?.slice(0, 1).toUpperCase() || '?'}
                  </div>
                  <div className="conversation-link-copy">
                    <strong>{otherMember?.name || 'Marketplace member'}</strong>
                    <span>
                      {conversation.lastMessage ||
                        conversation.listing?.title ||
                        'Start a conversation'}
                    </span>
                    <small>{conversation.listing?.title}</small>
                  </div>
                  <time>
                    {conversation.lastMessageAt ? formatTime(conversation.lastMessageAt) : ''}
                  </time>
                </Link>
              )
            })
          ) : (
            <div className="conversation-empty">
              <MessageCircle size={22} />
              <p>No conversations yet.</p>
              <Link to="/browse">Find something to talk about</Link>
            </div>
          )}
        </aside>
        <section className={`conversation-panel ${id ? 'conversation-panel-mobile-open' : ''}`}>
          {selected ? (
            <>
              <header className="conversation-header">
                <Link className="mobile-back" to="/inbox" aria-label="Back to inbox">
                  <ArrowLeft size={18} />
                </Link>
                <div className="conversation-avatar">
                  {selected.members
                    .find((member) => member._id !== user._id)
                    ?.name?.slice(0, 1)
                    .toUpperCase() || '?'}
                </div>
                <div>
                  <strong>
                    {selected.members.find((member) => member._id !== user._id)?.name ||
                      'Marketplace member'}
                  </strong>
                  <span>{socketReady ? 'Here for a real-time chat' : 'Conversation'}</span>
                </div>
                {selected.listing && (
                  <Link className="conversation-listing" to={`/listing/${selected.listing._id}`}>
                    <img src={listingImage(selected.listing)} alt="" />
                    <span>{selected.listing.title}</span>
                  </Link>
                )}
              </header>
              <div className="message-thread">
                {messages.length ? (
                  messages.map((entry) => (
                    <div
                      className={`message-row ${entry.sender?._id === user._id ? 'message-mine' : ''}`}
                      key={entry._id}
                    >
                      <div className="message-bubble">
                        <p>{entry.body}</p>
                        <time>{formatTime(entry.createdAt)}</time>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="thread-empty">
                    <span className="empty-icon">
                      <MessageCircle size={21} />
                    </span>
                    <p>Say hello and get the conversation going.</p>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <form className="message-composer" onSubmit={sendMessage}>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength="2000"
                  placeholder="Write a thoughtful message..."
                  aria-label="Message"
                />
                <button
                  className="button button-primary"
                  disabled={!message.trim()}
                  aria-label="Send message"
                >
                  <Send size={17} />
                </button>
              </form>
            </>
          ) : (
            <div className="inbox-placeholder">
              <span className="empty-icon">
                <MessageCircle size={24} />
              </span>
              <h2>Good things start with a hello.</h2>
              <p>Choose a conversation to pick up where you left off.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
