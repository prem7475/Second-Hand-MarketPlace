import { useEffect, useState } from 'react'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { request } from '../lib/api.js'
import Loading from '../components/Loading.jsx'

const emptyForm = {
  title: '',
  description: '',
  price: '',
  category: 'Furniture',
  condition: 'Good',
  location: '',
  images: '',
}

export default function SellPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(Boolean(id))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState([])

  useEffect(() => {
    if (!id) return
    let active = true
    request(`/listings/${id}`)
      .then(({ item }) => {
        if (!active) return
        setForm({
          title: item.title,
          description: item.description,
          price: String(item.price),
          category: item.category,
          condition: item.condition,
          location: item.location,
          images: (item.images || []).join('\n'),
        })
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
  }, [id])

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFieldErrors([])
    const body = {
      ...form,
      price: Number(form.price),
      images: form.images
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean),
    }
    try {
      const result = await request(id ? `/listings/${id}` : '/listings', {
        method: id ? 'PATCH' : 'POST',
        body,
      })
      navigate(`/listing/${result.item._id}`)
    } catch (requestError) {
      setError(requestError.message)
      setFieldErrors(requestError.errors || [])
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading label="Preparing your listing..." />

  return (
    <main className="page-shell sell-page">
      <Link className="back-link" to={id ? `/listing/${id}` : '/profile'}>
        <ArrowLeft size={16} /> Back
      </Link>
      <div className="sell-heading">
        <span className="eyebrow">Pass it along</span>
        <h1>
          {id ? 'Edit your ' : 'List a '}
          <em>good thing.</em>
        </h1>
        <p>A few details help the right person find it.</p>
      </div>
      <form className="listing-form" onSubmit={submit}>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="form-section-title">
          <span>01</span>
          <div>
            <h2>The essentials</h2>
            <p>Start with the details buyers want to know.</p>
          </div>
        </div>
        <label>
          What are you passing on?
          <input
            required
            minLength="3"
            maxLength="100"
            placeholder="e.g. Sheesham ki chhoti mez"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
          />
          {fieldErrors.find((item) => item.field === 'title') && (
            <small className="field-error">
              {fieldErrors.find((item) => item.field === 'title').message}
            </small>
          )}
        </label>
        <label>
          Tell its story
          <textarea
            required
            minLength="10"
            maxLength="3000"
            rows="5"
            placeholder="Kaisa hai, kitna purana hai aur iske baare mein jo bhi batana ho..."
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
          />
          {fieldErrors.find((item) => item.field === 'description') && (
            <small className="field-error">
              {fieldErrors.find((item) => item.field === 'description').message}
            </small>
          )}
        </label>
        <div className="form-two-col">
          <label>
            Category
            <select
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
            >
              {[
                'Furniture',
                'Electronics',
                'Fashion',
                'Home & Living',
                'Sports',
                'Books',
                'Other',
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Condition
            <select
              value={form.condition}
              onChange={(event) => update('condition', event.target.value)}
            >
              {['Like new', 'Excellent', 'Good', 'Fair'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-section-title form-section-spaced">
          <span>02</span>
          <div>
            <h2>Price & place</h2>
            <p>Set a fair price and help people nearby find it.</p>
          </div>
        </div>
        <div className="form-two-col">
          <label>
            Price <span className="field-inline-note">INR</span>
            <div className="price-field">
              <span>₹</span>
              <input
                required
                type="number"
                min="0"
                max="100000000"
                step="1"
                value={form.price}
                onChange={(event) => update('price', event.target.value)}
                placeholder="0"
              />
            </div>
          </label>
          <label>
            Your area
            <input
              required
              maxLength="100"
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
              placeholder="e.g. Pune, Maharashtra"
            />
          </label>
        </div>
        <div className="form-section-title form-section-spaced">
          <span>03</span>
          <div>
            <h2>Show it off</h2>
            <p>Add links to photos. One per line, up to eight.</p>
          </div>
        </div>
        <label className="image-input-label">
          <span className="image-input-icon">
            <ImagePlus size={20} />
          </span>
          Photo URLs
          <textarea
            rows="3"
            value={form.images}
            onChange={(event) => update('images', event.target.value)}
            placeholder="https://example.com/your-photo.jpg"
          />
        </label>
        <div className="form-footer">
          <span>Your listing can be edited or marked sold anytime.</span>
          <button className="button button-primary button-large" disabled={busy}>
            {busy ? 'Saving...' : id ? 'Save changes' : 'Publish listing'} <span>→</span>
          </button>
        </div>
      </form>
    </main>
  )
}
