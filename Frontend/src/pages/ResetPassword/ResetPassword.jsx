import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'
import { API_URL } from '../../config/api'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to reset password')
      }

      navigate('/login', { state: { message: data.message } })
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <main className='flex min-h-[calc(100vh-65px)] items-center bg-slate-950 px-4 py-12 text-white'>
        <section className='mx-auto w-full max-w-md rounded-3xl border border-red-400/20 bg-white/[0.08] p-8 text-center'>
          <h1 className='text-3xl font-black'>Invalid reset link</h1>
          <p className='mt-3 text-slate-300'>Request a new password reset email to continue.</p>
          <Link to='/forgot-password' className='mt-6 inline-block font-bold text-cyan-200 hover:text-white'>
            Request a new link
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className='flex min-h-[calc(100vh-65px)] items-center bg-slate-950 px-4 py-12 text-white sm:px-6'>
      <section className='mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8'>
        <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>Secure your account</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight'>Choose a new password</h1>
        <p className='mt-3 text-sm leading-6 text-slate-300'>Use at least 8 characters for your new password.</p>

        <form className='mt-8 space-y-5' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='password' className='text-sm font-bold text-slate-200'>New password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength='8'
              required
              className='mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:bg-white/15'
            />
          </div>
          <div>
            <label htmlFor='confirmPassword' className='text-sm font-bold text-slate-200'>Confirm password</label>
            <input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength='8'
              required
              className='mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:bg-white/15'
            />
          </div>

          {error && (
            <p className='rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>{error}</p>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isLoading ? <LoadingSpinner label='Updating password...' size={18} /> : 'Update password'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default ResetPassword
