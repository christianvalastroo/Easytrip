import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'
import { API_URL } from '../../config/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send the reset email')
      }

      setMessage(data.message)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className='flex min-h-[calc(100vh-65px)] items-center bg-slate-950 px-4 py-12 text-white sm:px-6'>
      <section className='mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8'>
        <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
          Account recovery
        </p>
        <h1 className='mt-3 text-4xl font-black tracking-tight'>
          Forgot your password?
        </h1>
        <p className='mt-3 text-sm leading-6 text-slate-300'>
          Enter your email and we will send you a secure link to choose a new password.
        </p>

        <form className='mt-8 space-y-5' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='email' className='text-sm font-bold text-slate-200'>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='Enter your email'
              required
              className='mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white/15'
            />
          </div>

          {message && (
            <p className='rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100'>
              {message}
            </p>
          )}
          {error && (
            <p className='rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isLoading ? (
              <LoadingSpinner label='Sending link...' size={18} />
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-300'>
          Remembered your password?{' '}
          <Link to='/login' className='font-bold text-cyan-200 transition hover:text-white'>
            Back to login
          </Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPassword
