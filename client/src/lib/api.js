const apiBase = import.meta.env?.VITE_API_URL || ''
let csrfToken = ''

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export function setCsrfToken(value) {
  csrfToken = value || ''
}

export function requireItems(payload) {
  if (!Array.isArray(payload?.items)) {
    throw new TypeError('The server returned an invalid response: expected an items array.')
  }
  return payload.items
}

export async function request(path, options = {}) {
  const method = options.method || 'GET'
  const headers = { Accept: 'application/json', ...options.headers }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase()) && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }
  const response = await fetch(`${apiBase}/api${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json') && !contentType.includes('+json')) {
    throw new ApiError(
      'The marketplace API returned a non-JSON response. Check the Netlify API proxy and Render API deployment.',
      response.status,
    )
  }
  const payload = await response.json()
  if (!response.ok) {
    throw new ApiError(
      payload.message || 'The request could not be completed.',
      response.status,
      payload.errors || [],
    )
  }
  return payload
}

export async function initializeCsrf() {
  const result = await request('/auth/csrf')
  setCsrfToken(result.csrfToken)
}
