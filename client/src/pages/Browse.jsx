import { useEffect, useState } from 'react'
import { ArrowUpDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import Loading from '../components/Loading.jsx'
import { useListings } from '../hooks/useListings.js'
import { request, requireItems } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'

const categories = [
  'Furniture',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Sports',
  'Books',
  'Other',
]
const conditions = ['Like new', 'Excellent', 'Good', 'Fair']

export default function Browse() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const listingParams = new URLSearchParams(searchParams)
  if (!listingParams.has('limit')) listingParams.set('limit', '24')
  const { items, pagination, loading, error, demoMode } = useListings(listingParams)
  const [saved, setSaved] = useState(new Set())
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => setQuery(searchParams.get('q') || ''), [searchParams])
  useEffect(() => {
    if (!user) {
      setSaved(new Set())
      return undefined
    }
    let active = true
    request('/favorites')
      .then((result) => {
        const items = requireItems(result)
        if (active) setSaved(new Set(items.map((item) => item._id)))
      })
      .catch((error) => {
        if (active) console.error('Unable to load saved listings:', error)
      })
    return () => {
      active = false
    }
  }, [user])

  function update(name, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    next.delete('page')
    setSearchParams(next)
  }

  function submitSearch(event) {
    event.preventDefault()
    update('q', query.trim())
  }

  function toggleSaved(id, value) {
    setSaved((current) => {
      const next = new Set(current)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <main className="page-shell browse-page">
      <div className="page-heading">
        <span className="eyebrow">The marketplace</span>
        <h1>
          Find something <em>good.</em>
        </h1>
        <p>Pre-loved pieces, waiting for the right person.</p>
      </div>
      <div className="browse-toolbar">
        <form className="browse-search" onSubmit={submitSearch}>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try 'wooden chair' or 'camera'"
            aria-label="Search listings"
          />
          <button type="submit">Search</button>
        </form>
        <div className="sort-control">
          <ArrowUpDown size={15} />
          <label htmlFor="sort-listings">Sort by</label>
          <select
            id="sort-listings"
            value={searchParams.get('sort') || 'newest'}
            onChange={(event) => update('sort', event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>
      <div className="browse-layout">
        <aside className="filters-panel">
          <div className="filter-title">
            <SlidersHorizontal size={17} />
            <strong>Filters</strong>
            {[...searchParams.keys()].length > 0 && (
              <button onClick={() => setSearchParams({})}>Clear</button>
            )}
          </div>
          <fieldset>
            <legend>Category</legend>
            {categories.map((category) => (
              <label className="filter-choice" key={category}>
                <input
                  type="radio"
                  name="category"
                  checked={searchParams.get('category') === category}
                  onChange={() => update('category', category)}
                />
                {category}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Condition</legend>
            {conditions.map((condition) => (
              <label className="filter-choice" key={condition}>
                <input
                  type="radio"
                  name="condition"
                  checked={searchParams.get('condition') === condition}
                  onChange={() => update('condition', condition)}
                />
                {condition}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Price range</legend>
            <div className="price-inputs">
              <label>
                <span>Min</span>
                <input
                  type="number"
                  min="0"
                  value={searchParams.get('minPrice') || ''}
                  onChange={(event) => update('minPrice', event.target.value)}
                  placeholder="₹0"
                />
              </label>
              <span>—</span>
              <label>
                <span>Max</span>
                <input
                  type="number"
                  min="0"
                  value={searchParams.get('maxPrice') || ''}
                  onChange={(event) => update('maxPrice', event.target.value)}
                  placeholder="Any"
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Near you</legend>
            <label className="location-input">
              <Search size={15} />
              <input
                value={searchParams.get('location') || ''}
                onChange={(event) => update('location', event.target.value)}
                placeholder="City or area"
              />
            </label>
          </fieldset>
          <button
            className="mobile-filter-close"
            onClick={() =>
              document.querySelector('.filters-panel')?.classList.remove('filters-open')
            }
          >
            <X size={16} /> Done filtering
          </button>
        </aside>
        <section className="results-section">
          <div className="results-heading">
            <div>
              <strong>{pagination?.total ?? '—'} finds</strong>
              <span>{searchParams.get('category') || 'Everything worth finding'}</span>
            </div>
            <button
              className="mobile-filter-button"
              onClick={() =>
                document.querySelector('.filters-panel')?.classList.toggle('filters-open')
              }
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
          {demoMode && (
            <div className="notice">
              Showing sample finds while the marketplace service reconnects.
            </div>
          )}
          {loading ? (
            <Loading label="Finding your next favorite..." />
          ) : error ? (
            <div className="notice notice-error">{error}</div>
          ) : items.length ? (
            <>
              <div className="listing-grid">
                {items.map((item) => (
                  <ListingCard
                    key={item._id}
                    item={item}
                    saved={saved.has(item._id)}
                    onSavedChange={toggleSaved}
                  />
                ))}
              </div>
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => update('page', String(pagination.page - 1))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => update('page', String(pagination.page + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state browse-empty">
              <span className="empty-icon">
                <Search size={22} />
              </span>
              <h3>Nothing quite like that yet.</h3>
              <p>Try another search or clear a filter to see more finds.</p>
              <button
                className="button button-secondary"
                onClick={() => {
                  setSearchParams({})
                  setQuery('')
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
