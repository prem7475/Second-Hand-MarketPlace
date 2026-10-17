import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, Menu, Plus, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function submitSearch(event) {
    event.preventDefault()
    navigate(`/browse${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`)
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Refind home">
          <span className="brand-mark">
            <ShoppingBag size={19} strokeWidth={2.4} />
          </span>
          <span>
            refind<span className="brand-period">.</span>
          </span>
        </Link>
        <form className="header-search" onSubmit={submitSearch}>
          <Search size={17} aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find something lovely..."
            aria-label="Search listings"
          />
          <button type="submit" aria-label="Submit search">
            Search
          </button>
        </form>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/browse" onClick={() => setMenuOpen(false)}>
            Explore
          </NavLink>
          {user ? (
            <>
              <NavLink to="/saved" onClick={() => setMenuOpen(false)}>
                <Heart size={16} /> Saved
              </NavLink>
              <NavLink to="/inbox" onClick={() => setMenuOpen(false)}>
                Inbox
              </NavLink>
              <Link className="nav-profile" to="/profile" onClick={() => setMenuOpen(false)}>
                <UserRound size={17} />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>
              Sign in
            </NavLink>
          )}
          <Link className="button button-primary header-sell" to={user ? '/sell' : '/login'}>
            <Plus size={17} /> Sell an item
          </Link>
        </nav>
        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
