import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Banknote,
  CalendarDays,
  ClipboardList,
  LogOut,
  Map,
  NotebookPen,
  Plane,
  Plus,
  Settings,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import homeHeroImage from '../../assets/home-hero.png'
import { API_URL } from '../../config/api'
import {
  clearSession,
  isAuthError,
  SESSION_EXPIRED_MESSAGE,
} from '../../utils/auth'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [trips, setTrips] = useState([])
  const [activitiesCount, setActivitiesCount] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const [userResponse, tripsResponse] = await Promise.all([
          fetch(`${API_URL}/users/me`, { headers }),
          fetch(`${API_URL}/trips`, { headers }),
        ])

        if (isAuthError(userResponse) || isAuthError(tripsResponse)) {
          clearSession()
          navigate('/login', {
            state: { message: SESSION_EXPIRED_MESSAGE },
          })
          return
        }

        const userText = await userResponse.text()
        const tripsText = await tripsResponse.text()
        const userData = userText ? JSON.parse(userText) : {}
        const tripsData = tripsText ? JSON.parse(tripsText) : []

        if (!userResponse.ok) {
          throw new Error(userData.message || 'User not authorized')
        }

        if (!tripsResponse.ok) {
          throw new Error(tripsData.message || 'Trips unavailable')
        }

        setUser(userData)
        setTrips(tripsData)

        if (tripsData.length === 0) {
          setActivitiesCount(0)
          return
        }

        const activitiesResponses = await Promise.all(
          tripsData.map((trip) =>
            fetch(`${API_URL}/activities/trip/${trip._id}`, { headers }),
          ),
        )

        if (activitiesResponses.some((response) => isAuthError(response))) {
          clearSession()
          navigate('/login', {
            state: { message: SESSION_EXPIRED_MESSAGE },
          })
          return
        }

        const activitiesData = await Promise.all(
          activitiesResponses.map(async (response) => {
            if (!response.ok) {
              return []
            }

            const responseText = await response.text()
            return responseText ? JSON.parse(responseText) : []
          }),
        )

        const nextActivitiesCount = activitiesData.reduce(
          (total, tripActivities) =>
            total + (Array.isArray(tripActivities) ? tripActivities.length : 0),
          0,
        )

        setActivitiesCount(nextActivitiesCount)
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  const upcomingTrips = useMemo(() => {
    const today = new Date()

    return trips
      .filter((trip) => trip.startDate && new Date(trip.startDate) >= today)
      .sort((firstTrip, secondTrip) => {
        return new Date(firstTrip.startDate) - new Date(secondTrip.startDate)
      })
  }, [trips])

  const nextTrip = upcomingTrips[0]
  const previewTrips = (upcomingTrips.length > 0 ? upcomingTrips : trips).slice(
    0,
    3,
  )

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  const userInitial =
    user?.firstName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'U'

  return (
    <main className='min-h-[calc(100vh-65px)] bg-slate-950 text-white'>
      <div className='mx-auto grid max-w-7xl gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[260px_1fr] lg:px-8'>
        <aside className='sticky top-24 hidden h-[calc(100vh-7rem)] rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:block'>
          <DashboardSidebar
            onLogout={handleLogout}
            user={user}
            userInitial={userInitial}
          />
        </aside>

        <section className='min-w-0 space-y-6'>
          {isLoading ? (
            <DashboardMessage message='Loading dashboard...' />
          ) : error ? (
            <DashboardMessage isError message={error} />
          ) : (
            <>
              <DashboardHero
                onCreateTrip={() => navigate('/trips/new')}
                onOpenTrips={() => navigate('/trips')}
                userName={user?.firstName}
              />

              <QuickActions />

              <section className='grid gap-4 sm:grid-cols-3'>
                <DashboardStat
                  icon={Plane}
                  label='Trips created'
                  value={trips.length}
                />
                <DashboardStat
                  icon={Activity}
                  label='Activities'
                  value={activitiesCount}
                />
                <DashboardStat
                  icon={CalendarDays}
                  label='Next trip'
                  value={nextTrip?.destination || 'Not planned'}
                />
              </section>

              <section className='grid gap-6 xl:grid-cols-[1fr_22rem]'>
                <div className='rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6'>
                  <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
                    <div>
                      <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                        Recent plans
                      </p>
                      <h2 className='mt-2 text-2xl font-black'>
                        Upcoming trips
                      </h2>
                    </div>

                    <button
                      type='button'
                      onClick={() => navigate('/trips')}
                      className='w-fit cursor-pointer rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/15 hover:text-white hover:shadow-lg hover:shadow-cyan-500/10'
                    >
                      View all trips
                    </button>
                  </div>

                  {previewTrips.length > 0 ? (
                    <div className='grid gap-5 md:grid-cols-2'>
                      {previewTrips.map((trip) => (
                        <TripPreviewCard
                          key={trip._id}
                          onOpenDetails={() => navigate(`/trips/${trip._id}`)}
                          trip={trip}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyTrips />
                  )}
                </div>

                <NextFocusCard
                  nextTrip={nextTrip}
                  plansCount={trips.length}
                />
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

const DashboardHero = ({ onCreateTrip, onOpenTrips, userName }) => {
  return (
    <section className='relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-5 text-white shadow-2xl shadow-slate-950/50 sm:p-7 lg:min-h-[21rem]'>
      <img
        src={homeHeroImage}
        alt=''
        className='absolute inset-0 h-full w-full object-cover opacity-55'
      />
      <div className='absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-slate-950/20' />
      <div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent' />

      <div className='relative z-10 flex min-h-[16rem] flex-col justify-between sm:min-h-[17rem] lg:min-h-[18rem]'>
        <div>
          <p className='text-xs font-bold uppercase tracking-wide text-cyan-200 sm:text-sm'>
            Private travel space
          </p>
          <h1 className='mt-3 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl'>
            Welcome back, {userName || 'traveler'}
          </h1>
          <p className='mt-3 max-w-xl text-sm leading-6 text-slate-200 sm:text-base'>
            Plan trips, collect activities and keep every detail organized in
            one clean workspace.
          </p>
        </div>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
          <button
            type='button'
            onClick={onCreateTrip}
            className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5'
          >
            <Plus size={18} />
            New trip
          </button>

          <button
            type='button'
            onClick={onOpenTrips}
            className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/25 hover:shadow-lg hover:shadow-cyan-500/10'
          >
            <Map size={18} />
            View trips
          </button>
        </div>
      </div>
    </section>
  )
}

const DashboardSidebar = ({ onLogout, user, userInitial }) => {
  return (
    <nav className='flex h-full flex-col'>
      <div className='mb-8'>
        <p className='text-lg font-black text-white'>EasyTrip</p>
        <p className='mt-2 text-xs font-bold uppercase tracking-wide text-slate-500'>
          Travel planner
        </p>
      </div>

      <SidebarLinks />

      <div className='mt-auto rounded-3xl border border-white/10 bg-white/[0.06] p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-sm font-black text-slate-950'>
            {userInitial}
          </div>
          <div className='min-w-0'>
            <p className='truncate text-sm font-black text-white'>
              {user?.firstName || 'EasyTrip user'}
            </p>
            <p className='truncate text-xs font-semibold text-slate-400'>
              {user?.email || 'Account'}
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={onLogout}
          className='mt-4 flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-left text-sm font-bold text-slate-200 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/15 hover:text-white'
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  )
}

const SidebarLinks = ({ onClick }) => {
  const navigate = useNavigate()
  const menuItems = [
    { icon: Map, label: 'My trips', isActive: true },
    { icon: UserRound, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <div className='flex flex-col gap-2'>
      {menuItems.map((item) => (
        <SidebarLink
          key={item.label}
          item={item}
          onClick={() => {
            onClick?.()
            if (item.path) navigate(item.path)
          }}
        />
      ))}
    </div>
  )
}

const SidebarLink = ({ item, onClick }) => {
  const Icon = item.icon

  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all duration-300 ${item.isActive
        ? 'border border-white/10 bg-slate-800 text-cyan-200'
        : 'border border-transparent text-slate-300 hover:border-cyan-400/30 hover:bg-white/10 hover:text-white'
        }`}
    >
      <span className='flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-xs'>
        <Icon size={16} />
      </span>
      {item.label}
    </button>
  )
}

const QuickActions = () => {
  const actions = [
    { icon: Plus, label: 'New trip' },
    { icon: ClipboardList, label: 'Add activity' },
    { icon: NotebookPen, label: 'Notes' },
    { icon: Banknote, label: 'Budget' },
  ]

  return (
    <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {actions.map((action) => (
        <QuickActionButton key={action.label} action={action} />
      ))}
    </section>
  )
}

const QuickActionButton = ({ action }) => {
  const Icon = action.icon

  return (
    <button
      type='button'
      disabled
      className='cursor-pointer rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left opacity-80 shadow-xl shadow-slate-950/25 backdrop-blur-xl transition-all duration-300 sm:p-5'
    >
      <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-200'>
        <Icon size={18} />
      </span>
      <span className='mt-4 block text-sm font-black text-white'>
        {action.label}
      </span>
    </button>
  )
}

const DashboardStat = ({ icon: Icon, label, value }) => {
  return (
    <div className='rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/25 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-cyan-500/10 sm:p-5'>
      <div className='flex items-center gap-3'>
        <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-cyan-200'>
          <Icon size={18} />
        </span>
        <div className='min-w-0'>
          <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
            {label}
          </p>
          <p className='mt-1 truncate text-2xl font-black text-white'>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

const TripPreviewCard = ({ onOpenDetails, trip }) => {
  return (
    <article className='overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/25 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-800/80 hover:shadow-cyan-500/10'>
      <div className='relative h-44 overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-300 sm:h-56'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.45),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.05),rgba(15,23,42,0.55))]' />
        <div className='absolute bottom-3 left-3 rounded-full border border-white/20 bg-slate-950/40 px-3 py-1 text-xs font-black text-white backdrop-blur'>
          {trip.destination}
        </div>
      </div>

      <div className='p-5'>
        <h3 className='truncate text-xl font-black text-white'>{trip.title}</h3>
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

const NextFocusCard = ({ nextTrip, plansCount }) => {
  return (
    <aside className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6'>
      <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
        Next focus
      </p>
      <div className='mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200'>
        <CalendarDays size={22} />
      </div>
      <h2 className='mt-3 text-2xl font-black'>
        {nextTrip ? nextTrip.title : 'Build your first itinerary'}
      </h2>
      <p className='mt-3 text-sm leading-6 text-slate-300'>
        {nextTrip
          ? `${nextTrip.destination} starts on ${formatDate(nextTrip.startDate)}.`
          : 'Create a trip first, then connect activities, notes and planning details.'}
      </p>

      <div className='mt-6 grid grid-cols-2 gap-3'>
        <div className='rounded-2xl border border-white/10 bg-white/[0.06] p-4'>
          <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
            Plans
          </p>
          <p className='mt-2 text-2xl font-black'>{plansCount}</p>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/[0.06] p-4'>
          <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
            Departure
          </p>
          <p className='mt-2 truncate text-sm font-black'>
            {nextTrip ? formatDate(nextTrip.startDate) : 'Not set'}
          </p>
        </div>
      </div>
    </aside>
  )
}

const EmptyTrips = () => {
  return (
    <div className='rounded-2xl border border-dashed border-white/15 bg-white/[0.05] p-8 text-center'>
      <p className='text-lg font-black text-white'>No trips yet</p>
      <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400'>
        Your first trip will appear here once you create it.
      </p>
    </div>
  )
}

const DashboardMessage = ({ message, isError = false }) => {
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

export default Dashboard
