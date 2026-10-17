import { useEffect, useState } from 'react'
import { request, requireItems } from '../lib/api.js'
import { getDemoListings } from '../lib/demoListings.js'

export function useListings(searchParams) {
  const [state, setState] = useState({
    items: [],
    pagination: null,
    loading: true,
    error: '',
    demoMode: false,
  })
  const query = searchParams.toString()

  useEffect(() => {
    const controller = new AbortController()
    setState((current) => ({ ...current, loading: true, error: '', demoMode: false }))
    request(`/listings${query ? `?${query}` : ''}`, { signal: controller.signal })
      .then((result) =>
        setState({
          ...result,
          items: requireItems(result),
          loading: false,
          error: '',
          demoMode: false,
        }),
      )
      .catch((error) => {
        if (error.name !== 'AbortError') {
          const fallback = getDemoListings(new URLSearchParams(query))
          setState({
            ...fallback,
            loading: false,
            error: '',
            demoMode: fallback.items.length > 0,
          })
        }
      })
    return () => controller.abort()
  }, [query])

  return state
}
