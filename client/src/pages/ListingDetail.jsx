import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Heart, MapPin, MessageCircle, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { request, requireItems } from '../lib/api.js'
import { formatPrice, timeAgo } from '../lib/format.js'
import { listingImage } from '../components/ListingCard.jsx'
import Loading from '../components/Loading.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    request(`/listings/${id}`)
      .then(({ item: result }) => {
        if (active) setItem(result)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!user) return
    let active = true
    request('/favorites')
      .then((result) => {
        const items = requireItems(result)
        if (active) setSaved(items.some((favorite) => favorite._id === id))
      })
      .catch((requestError) => console.error('Unable to check saved status:', requestError))
    return () => {
      active = false
    }
  }, [id, user])

  async function toggleSaved() {
    if (!user) return navigate('/login')
    setBusy(true)
    try {
      if (saved) await request(`/favorites/${id}`, { method: 'DELETE' })
      else await request(`/favorites/${id}`, { method: 'POST' })
      setSaved(!saved)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function contactSeller() {
    if (!user) return navigate('/login')
    setBusy(true)
    try {
      const { conversation } = await request('/conversations', {
        method: 'POST',
        body: { listingId: id },
      })
      navigate(`/inbox/${conversation._id}`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  if (error && !item)
    return (
      <main className="page-shell">
        <div className="notice notice-error">
          {error} <Link to="/browse">Back to the marketplace</Link>
        </div>
      </main>
    )
  if (!item) return <Loading label="Opening this find..." />
  const ownListing = user && item.seller?._id === user._id

  return (
    <main className="page-shell detail-page">
      <Link className="back-link" to="/browse">
        <ArrowLeft size={16} /> Back to the marketplace
      </Link>
      {error && <div className="notice notice-error">{error}</div>}
      <div className="detail-layout">
        <div className="detail-photo">
          <img src={listingImage(item)} alt={item.title} />
          {item.status === 'sold' && <span className="sold-ribbon">Found its next home</span>}
        </div>
        <section className="detail-info">
          <div className="detail-meta">
            <span>{item.category}</span>
            <span>{item.condition}</span>
            <span>{timeAgo(item.createdAt)}</span>
          </div>
          <h1>{item.title}</h1>
          <div className="detail-price">{formatPrice(item.price)}</div>
          <div className="detail-location">
            <MapPin size={16} />
            {item.location}
          </div>
          <div className="detail-rule" />
          <h2>A little about it</h2>
          <p className="detail-description">{item.description}</p>
          <div className="seller-card">
            <div className="seller-avatar">
              {item.seller?.name?.slice(0, 1).toUpperCase() || '?'}
            </div>
            <div>
              <strong>{item.seller?.name || 'Marketplace member'}</strong>
              <small>
                Sharing good things since{' '}
                {new Date(item.seller?.createdAt || item.createdAt).getFullYear()}
              </small>
            </div>
            <span className="seller-verified">
              <ShieldCheck size={15} /> Member
            </span>
          </div>
          <div className="detail-actions">
            {!ownListing && item.status === 'active' && (
              <button
                className="button button-primary button-large"
                onClick={contactSeller}
                disabled={busy}
              >
                <MessageCircle size={18} /> Message seller
              </button>
            )}
            <button
              className={`button button-secondary detail-save ${saved ? 'is-saved' : ''}`}
              onClick={toggleSaved}
              disabled={busy}
            >
              <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Saved' : 'Save find'}
            </button>
          </div>
          {ownListing && (
            <Link className="text-link" to={`/sell/${item._id}`}>
              Edit your listing <ArrowUpRight size={16} />
            </Link>
          )}
          <div className="detail-footnote">
            <ShieldCheck size={16} />
            <span>
              Keep your conversations on Refind. Never share payment details before meeting safely.
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}
