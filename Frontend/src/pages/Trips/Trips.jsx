import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../config/api'
import {
  clearSession,
  isAuthError,
  SESSION_EXPIRED_MESSAGE,
} from '../../utils/auth'

const Trips = () => {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('asc')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    const fetchTrips = async () => {
      try {
        const response = await fetch(`${API_URL}/trips`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (isAuthError(response)) {
          clearSession()
          navigate('/login', {
            state: { message: SESSION_EXPIRED_MESSAGE },
          })
          return
        }

        const responseText = await response.text()
        const data = responseText ? JSON.parse(responseText) : []

        if (!response.ok) {
          throw new Error(data.message || 'Trips unavailable')
        }

        setTrips(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrips()
  }, [navigate])

  const visibleTrips = useMemo(() => {
    const today = new Date()
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return trips
      .filter((trip) => {
        const matchesSearch =
          trip.title.toLowerCase().includes(normalizedSearchTerm) ||
          trip.destination.toLowerCase().includes(normalizedSearchTerm)

        if (!matchesSearch) {
          return false
        }

        if (activeFilter === 'upcoming') {
          return trip.startDate && new Date(trip.startDate) >= today
        }

        if (activeFilter === 'past') {
          return trip.endDate && new Date(trip.endDate) < today
        }

        return true
      })
      .sort((firstTrip, secondTrip) => {
        const firstDate = new Date(firstTrip.startDate)
        const secondDate = new Date(secondTrip.startDate)

        return sortOrder === 'asc' ? firstDate - secondDate : secondDate - firstDate
      })
  }, [activeFilter, searchTerm, sortOrder, trips])

  return (
    <main className='min-h-[calc(100vh-65px)] bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8'>
      <section className='mx-auto max-w-7xl space-y-6'>
        <button
          type='button'
          onClick={() => navigate('/dashboard')}
          className='flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-cyan-200'
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        <div className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                Travel archive
              </p>
              <h1 className='mt-2 text-3xl font-black sm:text-4xl'>
                My trips
              </h1>
              <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-300'>
                Search, filter and organize every trip in your private travel
                workspace.
              </p>
            </div>

            <button
              type='button'
              onClick={() => navigate('/trips/new')}
              className='inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5'
            >
              <Plus size={18} />
              New trip
            </button>
          </div>
        </div>

        <section className='rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-5'>
          <div className='grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center'>
            <label className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition-all duration-300 focus-within:border-cyan-400/40 focus-within:bg-white/[0.13]'>
              <Search size={18} className='shrink-0 text-slate-500' />
              <input
                type='search'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder='Search by name or destination'
                className='w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500'
              />
            </label>

            <div className='grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-1'>
              {['all', 'upcoming', 'past'].map((filter) => (
                <button
                  key={filter}
                  type='button'
                  onClick={() => setActiveFilter(filter)}
                  className={`cursor-pointer rounded-xl px-3 py-2 text-sm font-bold capitalize transition-all duration-300 ${activeFilter === filter
                      ? 'bg-slate-800 text-cyan-200'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className='cursor-pointer rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-bold text-white outline-none transition-all duration-300 focus:border-cyan-400/40'
            >
              <option value='asc'>Date ascending</option>
              <option value='desc'>Date descending</option>
            </select>
          </div>
        </section>

        {isLoading ? (
          <TripsMessage message='Loading trips...' />
        ) : error ? (
          <TripsMessage isError message={error} />
        ) : visibleTrips.length > 0 ? (
          <section className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {visibleTrips.map((trip) => (
              <TripCard
                key={trip._id}
                onOpenDetails={() => navigate(`/trips/${trip._id}`)}
                trip={trip}
              />
            ))}
          </section>
        ) : (
          <TripsMessage message='No trips match your filters.' />
        )}
      </section>
    </main>
  )
}

const TripCard = ({ onOpenDetails, trip }) => {
  return (
    <article className='overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/25 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-800/80 hover:shadow-cyan-500/10'>
      <div className='relative h-44 overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-300 sm:h-56'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.45),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.05),rgba(15,23,42,0.55))]' />
        <div className='absolute bottom-3 left-3 rounded-full border border-white/20 bg-slate-950/40 px-3 py-1 text-xs font-black text-white backdrop-blur'>
          {trip.destination}
        </div>
      </div>

      <div className='p-5'>
        <h2 className='truncate text-xl font-black text-white'>{trip.title}</h2>
        <p className='mt-2 text-sm font-semibold text-slate-400'>
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </p>

        {trip.notes && (
          <p className='mt-3 line-clamp-2 text-sm leading-6 text-slate-300'>
            {trip.notes}
          </p>
        )}

        <button
          type='button'
          onClick={onOpenDetails}
          className='mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/15 hover:text-white'
        >
          <ArrowRight size={16} />
          View details
        </button>
      </div>
    </article>
  )
}

const TripsMessage = ({ message, isError = false }) => {
  return (
    <div
      className={`rounded-3xl border p-6 text-sm font-semibold shadow-xl ${isError
          ? 'border-red-400/30 bg-red-500/10 text-red-200'
          : 'border-white/10 bg-slate-900/70 text-slate-300'
        }`}
    >
      {message}
    </div>
  )
}

const formatDate = (date) => {
  if (!date) {
    return 'Date not set'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export default Trips
