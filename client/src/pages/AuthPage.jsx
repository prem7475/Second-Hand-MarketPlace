import { useState } from 'react'
import { ArrowRight, Leaf } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage({ registration = false }) {
  const { signIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isRegistration, setIsRegistration] = useState(registration)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setErrors([])
    setBusy(true)
    try {
      await signIn(form, isRegistration)
      navigate(location.state?.from?.pathname || '/profile', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setErrors(requestError.errors || [])
    } finally {
      setBusy(false)
    }
  }

  function toggleMode() {
    setIsRegistration((value) => !value)
    setError('')
    setErrors([])
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration">
        <span className="auth-orbit orbit-one" />
        <span className="auth-orbit orbit-two" />
        <div className="auth-decoration-copy">
          <Leaf size={22} />
          <span>
            A good find
            <br />
            is just the beginning.
          </span>
        </div>
      </div>
      <section className="auth-panel">
        <Link className="auth-back" to="/">
          <span>←</span> Back to Refind
        </Link>
        <div className="auth-form-wrap">
          <span className="eyebrow">
            {isRegistration ? 'Make yourself at home' : 'Good to see you again'}
          </span>
          <h1>
            {isRegistration ? (
              <>
                Join the <em>good</em> finds.
              </>
            ) : (
              <>
                Welcome <em>back.</em>
              </>
            )}
          </h1>
          <p>
            {isRegistration
              ? 'Create an account to save, share, and find your next favorite.'
              : 'Your next great find is waiting.'}
          </p>
          <form className="auth-form" onSubmit={submit}>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            {isRegistration && (
              <label>
                Your name
                <input
                  required
                  minLength="2"
                  maxLength="60"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
                {errors.find((item) => item.field === 'name') && (
                  <small className="field-error">
                    {errors.find((item) => item.field === 'name').message}
                  </small>
                )}
              </label>
            )}
            <label>
              Email address
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              {errors.find((item) => item.field === 'email') && (
                <small className="field-error">
                  {errors.find((item) => item.field === 'email').message}
                </small>
              )}
            </label>
            <label>
              Password
              <input
                required
                type="password"
                minLength={isRegistration ? 8 : 1}
                maxLength="72"
                autoComplete={isRegistration ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              {isRegistration && <small className="field-help">At least 8 characters.</small>}
            </label>
            <button className="button button-primary button-large auth-submit" disabled={busy}>
              {busy ? 'One moment...' : isRegistration ? 'Create your account' : 'Sign in'}{' '}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="auth-switch">
            {isRegistration ? 'Already part of the good stuff?' : 'New around here?'}{' '}
            <button type="button" onClick={toggleMode}>
              {isRegistration ? 'Sign in' : 'Create an account'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
