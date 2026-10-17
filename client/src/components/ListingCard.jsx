import { Heart, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice, timeAgo } from '../lib/format.js'
import { request } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'

const fallbacks = {
  Furniture:
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  Electronics:
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
  Fashion:
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  'Home & Living':
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  Sports:
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
  Books:
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
  Other:
    'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80',
}

export function listingImage(item) {
  return item.images?.[0] || fallbacks[item.category] || fallbacks.Other
}

export default function ListingCard({ item, saved = false, onSavedChange }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function toggleSaved(event) {
    event.preventDefault()
    event.stopPropagation()
    if (!user) return navigate('/login')
    try {
      if (saved) await request(`/favorites/${item._id}`, { method: 'DELETE' })
      else await request(`/favorites/${item._id}`, { method: 'POST' })
      onSavedChange?.(item._id, !saved)
    } catch (error) {
      window.alert(error.message)
    }
  }

  return (
    <article className="listing-card">
      <Link className="listing-image-wrap" to={`/listing/${item._id}`}>
        <img src={listingImage(item)} alt={item.title} loading="lazy" />
        <span className="condition-tag">{item.condition}</span>
        {user && (
          <button
            className={`save-button ${saved ? 'is-saved' : ''}`}
            onClick={toggleSaved}
            aria-label={saved ? 'Remove from saved items' : 'Save item'}
          >
            <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>
        )}
      </Link>
      <div className="listing-card-body">
        <div className="listing-card-topline">
          <span>{item.category}</span>
          <span>{timeAgo(item.createdAt)}</span>
        </div>
        <Link to={`/listing/${item._id}`} className="listing-title">
          {item.title}
        </Link>
        <div className="listing-card-bottom">
          <strong>{formatPrice(item.price)}</strong>
          <span>
            <MapPin size={13} />
            {item.location}
          </span>
        </div>
      </div>
    </article>
  )
}
