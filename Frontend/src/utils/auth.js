export const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please sign in again.'

export function clearSession() {
  localStorage.removeItem('token')
  window.dispatchEvent(new Event('auth-change'))
}

export function isAuthError(response) {
  return response.status === 401 || response.status === 403
}
