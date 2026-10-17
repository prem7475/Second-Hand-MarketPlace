import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import Loading from '../components/Loading.jsx'
import { request, requireItems } from '../lib/api.js'

export default function Saved() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    request('/favorites')
      .then((result) => {
        const savedItems = requireItems(result)
        if (active) setItems(savedItems)
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

  function removeSaved(id) {
    setItems((current) => current.filter((item) => item._id !== id))
  }

  return (
    <main className="page-shell">
      <div className="page-heading">
        <span className="eyebrow">Your little collection</span>
        <h1>
          Saved for <em>later.</em>
        </h1>
        <p>All the finds you want to come back to.</p>
      </div>
      {loading ? (
        <Loading label="Gathering your saved finds..." />
      ) : error ? (
        <div className="notice notice-error">{error}</div>
      ) : items.length ? (
        <div className="listing-grid">
          {items.map((item) => (
            <ListingCard key={item._id} item={item} saved onSavedChange={removeSaved} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <Heart size={23} />
          </span>
          <h3>A little space for your next favorite.</h3>
          <p>Tap the heart on anything you love to keep it close.</p>
          <Link className="button button-primary" to="/browse">
            Find something good
          </Link>
        </div>
      )}
    </main>
  )
}
