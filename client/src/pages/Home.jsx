import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Leaf,
  Recycle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ListingCard from '../components/ListingCard.jsx'
import Loading from '../components/Loading.jsx'
import { useListings } from '../hooks/useListings.js'
import { request } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'

const categories = [
  { name: 'Furniture', icon: '⌂', count: 'Make room for new stories', color: 'lavender' },
  { name: 'Electronics', icon: '⌁', count: 'Good tech, less waste', color: 'blue' },
  { name: 'Fashion', icon: '✳', count: 'Wear it your way', color: 'peach' },
  { name: 'Home & Living', icon: '◌', count: 'The little things, too', color: 'sage' },
  { name: 'Sports', icon: '↗', count: 'Gear up for more', color: 'butter' },
  { name: 'Books', icon: '▤', count: 'Stories worth sharing', color: 'rose' },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, loading, error } = useListings(new URLSearchParams('limit=8&sort=newest'))
  const [savedItems, setSavedItems] = useState(new Set())

  useEffect(() => {
    let active = true
    if (!user) {
      setSavedItems(new Set())
      return () => {
        active = false
      }
    }
    request('/favorites')
      .then(({ items: favorites }) => {
        if (active) setSavedItems(new Set(favorites.map((item) => item._id)))
      })
      .catch((error) => {
        if (active) console.error('Unable to load saved listings:', error)
      })
    return () => {
      active = false
    }
  }, [user])

  function chooseCategory(category) {
    navigate(`/browse?category=${encodeURIComponent(category)}`)
  }

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> A marketplace with a second side
          </div>
          <h1>
            Good things,
            <br />
            <em>found again.</em>
          </h1>
          <p>
            Thoughtfully pre-loved pieces, ready for their next chapter. Find something you love —
            and let go of something someone else will.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" to="/browse">
              Explore the marketplace <ArrowRight size={18} />
            </Link>
            <Link className="hero-link" to="/sell">
              I have something to sell <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              <span>J</span>
              <span>M</span>
              <span>A</span>
              <span>+</span>
            </div>
            <div>
              <strong>Little things, big impact</strong>
              <small>Give good stuff another go-round.</small>
            </div>
          </div>
        </div>
        <div className="hero-art" aria-label="A curated collection of second-hand home goods">
          <div className="hero-photo hero-photo-main">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85"
              alt="Warm, thoughtfully furnished living room"
            />
          </div>
          <div className="hero-photo hero-photo-small">
            <img
              src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=500&q=85"
              alt="Ceramic vase and decor"
            />
          </div>
          <div className="hero-note">
            <span>↗</span>
            <strong>
              Every find
              <br />
              has a story.
            </strong>
          </div>
          <div className="hero-stamp">
            <span>SECOND</span>
            <Recycle size={24} />
            <span>CHANCES</span>
          </div>
          <div className="hero-caption">
            <span className="caption-line" /> Pieces worth passing on <ArrowDownRight size={14} />
          </div>
        </div>
        <div className="hero-bottom">
          <span>01 / 04</span>
          <span className="hero-bottom-line" />
          <span>Scroll to discover</span>
        </div>
      </section>

      <section className="category-section section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A little bit of everything</span>
            <h2>
              Find your <em>kind</em> of good.
            </h2>
          </div>
          <Link className="text-link" to="/browse">
            All categories <ArrowRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <button
              key={category.name}
              className={`category-tile category-${category.color}`}
              onClick={() => chooseCategory(category.name)}
            >
              <span className="category-number">0{index + 1}</span>
              <span className="category-symbol">{category.icon}</span>
              <strong>{category.name}</strong>
              <small>{category.count}</small>
              <ArrowUpRight className="category-arrow" size={18} />
            </button>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">The good stuff, lately</span>
              <h2>
                Freshly <em>found.</em>
              </h2>
            </div>
            <Link className="text-link" to="/browse">
              Browse everything <ArrowRight size={16} />
            </Link>
          </div>
          {loading ? (
            <Loading label="Finding the good stuff..." />
          ) : error ? (
            <div className="notice notice-error">{error}</div>
          ) : items.length ? (
            <div className="listing-grid">
              {items.map((item) => (
                <ListingCard
                  key={item._id}
                  item={item}
                  saved={savedItems.has(item._id)}
                  onSavedChange={(id, value) =>
                    setSavedItems((current) => {
                      const next = new Set(current)
                      if (value) next.add(id)
                      else next.delete(id)
                      return next
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Sparkles size={24} />
              </span>
              <h3>First dibs are still up for grabs.</h3>
              <p>Be the first to add something lovely to the marketplace.</p>
              <Link className="button button-primary" to="/sell">
                List your first find <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="manifesto-section section-shell">
        <div className="manifesto-mark">
          <Leaf size={21} /> A softer kind of shopping
        </div>
        <div className="manifesto-content">
          <span className="eyebrow">Keep good things going</span>
          <h2>
            Less new.
            <br />
            <em>More meaningful.</em>
          </h2>
          <p>
            Refind is for the pieces that still have a little more to give. Buy thoughtfully, sell
            simply, and keep the good stuff moving.
          </p>
          <Link className="text-link" to="/browse">
            Find your next favorite <ArrowRight size={16} />
          </Link>
        </div>
        <div className="manifesto-points">
          <div>
            <span>
              <Recycle size={19} />
            </span>
            <div>
              <strong>Give it another life</strong>
              <small>Pass along pieces that deserve more.</small>
            </div>
            <Check size={15} />
          </div>
          <div>
            <span>
              <ShieldCheck size={19} />
            </span>
            <div>
              <strong>Keep it personal</strong>
              <small>Talk directly with the people behind it.</small>
            </div>
            <Check size={15} />
          </div>
          <div>
            <span>
              <Sparkles size={19} />
            </span>
            <div>
              <strong>Find the unexpected</strong>
              <small>One-of-a-kind finds, every day.</small>
            </div>
            <Check size={15} />
          </div>
        </div>
      </section>
    </>
  )
}
