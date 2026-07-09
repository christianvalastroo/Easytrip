import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import homeHeroImage from '../../assets/home-hero.png'
import { API_URL } from '../../config/api'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const sessionMessage = location.state?.message
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const responseText = await response.text()
      const data = responseText ? JSON.parse(responseText) : {}

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      window.dispatchEvent(new Event('auth-change'))
      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className='min-h-[calc(100vh-65px)] bg-slate-950 text-white'>
      <section className='mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8'>
        <div className='order-2 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-slate-950/40 lg:order-1'>
          <div className='relative h-72 sm:h-96 lg:h-[620px]'>
            <img
              src={homeHeroImage}
              alt='Panorama costiero al tramonto'
              className='h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent' />
            <div className='absolute bottom-0 left-0 right-0 p-6 sm:p-8'>
              <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                EasyTrip
              </p>
              <h1 className='mt-3 max-w-md text-3xl font-black leading-tight sm:text-4xl'>
                Sign in and keep planning your next trip.
              </h1>
            </div>
          </div>
        </div>

        <div className='order-1 lg:order-2'>
          <div className='mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8'>
            <div>
              <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                Welcome back
              </p>
              <h2 className='mt-3 text-4xl font-black tracking-tight'>
                Login
              </h2>
              <p className='mt-3 text-sm leading-6 text-slate-300'>
                Enter your credentials to return to your dashboard.
              </p>
            </div>

            {sessionMessage && (
              <p className='mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100'>
                {sessionMessage}
              </p>
            )}

            <form className='mt-8 space-y-5' onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor='email'
                  className='text-sm font-bold text-slate-200'
                >
                  Email
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='Enter your email'
                  required
                  className='mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white/15'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='text-sm font-bold text-slate-200'
                >
                  Password
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Enter your password'
                  required
                  className='mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white/15'
                />
              </div>

              {error && (
                <p className='rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>
                  {error}
                </p>
              )}

              <button
                type='submit'
                disabled={isLoading}
                className='w-full cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70'
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <p className='mt-6 text-center text-sm text-slate-300'>
              Do not have an account?{' '}
              <Link
                to='/register'
                className='font-bold text-cyan-200 transition hover:text-white'
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
