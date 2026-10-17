import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="brand footer-brand" to="/">
          <span className="brand-mark">r</span>
          <span>
            refind<span className="brand-period">.</span>
          </span>
        </Link>
        <p>Good things deserve another chapter.</p>
        <span className="footer-note">A little better for your home, and the planet.</span>
      </div>
    </footer>
  )
}
