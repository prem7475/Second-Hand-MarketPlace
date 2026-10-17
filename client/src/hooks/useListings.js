import { useEffect, useState } from 'react'
import { request } from '../lib/api.js'

export function useListings(searchParams) {
  const [state, setState] = useState({ items: [], pagination: null, loading: true, error: '' })
  const query = searchParams.toString()

  useEffect(() => {
    const controller = new AbortController()
    setState((current) => ({ ...current, loading: true, error: '' }))
    request(`/listings${query ? `?${query}` : ''}`, { signal: controller.signal })
      .then((result) => setState({ ...result, loading: false, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError')
          setState({ items: [], pagination: null, loading: false, error: error.message })
      })
    return () => controller.abort()
  }, [query])

  return state
}
