import { useEffect, useState } from 'react'
import { ArrowRight, MapPin, PackagePlus, Pencil, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { request, requireItems } from '../lib/api.js'
import { formatPrice } from '../lib/format.js'
import { listingImage } from '../components/ListingCard.jsx'
import Loading from '../components/Loading.jsx'

export default function Profile() {
  const { user, signOut, updateUser } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user.name, location: user.location || '' })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    request('/listings/mine')
      .then((result) => {
        const listings = requireItems(result)
        if (active) setItems(listings)
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

  async function saveProfile(event) {
    event.preventDefault()
    setNotice('')
    try {
      const result = await request('/auth/me', { method: 'PATCH', body: form })
      updateUser(result.user)
      setEditing(false)
      setNotice('Your profile is up to date.')
    } catch (requestError) {
      setNotice(requestError.message)
    }
  }

  async function deleteListing(id) {
    if (!window.confirm('Remove this listing? This cannot be undone.')) return
    try {
      await request(`/listings/${id}`, { method: 'DELETE' })
      setItems((current) => current.filter((item) => item._id !== id))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="page-shell profile-page">
      <div className="profile-welcome">
        <div className="profile-avatar">
          <UserRound size={28} />
        </div>
        <div>
          <span className="eyebrow">Your corner of Refind</span>
          <h1>Hi, {user.name.split(' ')[0]}.</h1>
          <p>Good things are in motion.</p>
        </div>
        <button className="button button-secondary signout-button" onClick={signOut}>
          Sign out
        </button>
      </div>
      {notice && <div className="notice notice-success">{notice}</div>}
      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-card-heading">
            <h2>Your details</h2>
            <button className="icon-text-button" onClick={() => setEditing((value) => !value)}>
              <Pencil size={14} />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editing ? (
            <form className="profile-edit-form" onSubmit={saveProfile}>
              <label>
                Name
                <input
                  required
                  minLength="2"
                  maxLength="60"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label>
                Location
                <input
                  maxLength="100"
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  placeholder="Your area"
                />
              </label>
              <button className="button button-primary">Save details</button>
            </form>
          ) : (
            <div className="profile-details">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              {user.location && (
                <span>
                  <MapPin size={14} />
                  {user.location}
                </span>
              )}
              <small>
                Member since{' '}
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </small>
            </div>
          )}
          <Link className="profile-shortcut" to="/saved">
            <span>Saved finds</span>
            <ArrowRight size={16} />
          </Link>
          <Link className="profile-shortcut" to="/inbox">
            <span>Your conversations</span>
            <ArrowRight size={16} />
          </Link>
        </aside>
        <section className="my-listings-section">
          <div className="section-heading compact-heading">
            <div>
              <span className="eyebrow">Your side of the marketplace</span>
              <h2>
                Your <em>listings.</em>
              </h2>
            </div>
            <Link className="button button-primary" to="/sell">
              <PackagePlus size={16} /> New listing
            </Link>
          </div>
          {loading ? (
            <Loading label="Getting your listings..." />
          ) : error ? (
            <div className="notice notice-error">{error}</div>
          ) : items.length ? (
            <div className="my-listings">
              {items.map((item) => (
                <article className="my-listing" key={item._id}>
                  <img src={listingImage(item)} alt="" />
                  <div className="my-listing-copy">
                    <span className={`status-pill ${item.status}`}>
                      {item.status === 'sold' ? 'Found a home' : 'Active'}
                    </span>
                    <strong>{item.title}</strong>
                    <small>
                      {formatPrice(item.price)} · {item.location}
                    </small>
                  </div>
                  <div className="my-listing-actions">
                    <Link to={`/sell/${item._id}`}>Edit</Link>
                    {item.status === 'active' && (
                      <button
                        onClick={async () => {
                          try {
                            const result = await request(`/listings/${item._id}`, {
                              method: 'PATCH',
                              body: { status: 'sold' },
                            })
                            setItems((current) =>
                              current.map((listing) =>
                                listing._id === item._id ? result.item : listing,
                              ),
                            )
                          } catch (requestError) {
                            setError(requestError.message)
                          }
                        }}
                      >
                        Mark sold
                      </button>
                    )}
                    <button className="danger-link" onClick={() => deleteListing(item._id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state profile-empty">
              <span className="empty-icon">
                <PackagePlus size={22} />
              </span>
              <h3>Your first listing starts here.</h3>
              <p>Give a good thing a chance to find its next person.</p>
              <Link className="button button-primary" to="/sell">
                List something
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
