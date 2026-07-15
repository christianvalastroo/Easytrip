import { useEffect, useState } from 'react'
import {
    Activity,
    LogOut,
    Map,
    Menu,
    Plane,
    Settings,
    UserRound,
    X,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { API_URL } from '../../config/api'
import {
    clearSession,
    isAuthError,
    SESSION_EXPIRED_MESSAGE,
} from '../../utils/auth'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [user, setUser] = useState(null)
    const [authRefreshKey, setAuthRefreshKey] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const updateToken = () => {
            setToken(localStorage.getItem('token'))
            setAuthRefreshKey((currentKey) => currentKey + 1)
        }

        window.addEventListener('auth-change', updateToken)
        window.addEventListener('storage', updateToken)

        return () => {
            window.removeEventListener('auth-change', updateToken)
            window.removeEventListener('storage', updateToken)
        }
    }, [])

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setUser(null)
                return
            }

            try {
                const response = await fetch(`${API_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (isAuthError(response)) {
                    clearSession()
                    setIsMenuOpen(false)
                    setIsProfileMenuOpen(false)
                    navigate('/login', {
                        state: { message: SESSION_EXPIRED_MESSAGE },
                    })
                    return
                }

                const responseText = await response.text()
                const data = responseText ? JSON.parse(responseText) : null

                if (!response.ok) {
                    throw new Error(data?.message || 'User not available')
                }

                setUser(data)
            } catch {
                setUser(null)
            }
        }

        fetchUser()
    }, [authRefreshKey, navigate, token])

    const navLinks = []

    const mobilePrivateLinks = [
        { path: '/dashboard', label: 'My trips', icon: Map },
        { path: '/dashboard', label: 'Activities', icon: Activity },
        { path: '/profile', label: 'Profile', icon: UserRound },
        { path: '/settings', label: 'Settings', icon: Settings },
    ]

    const handleLogout = () => {
        clearSession()
        setToken(null)
        setUser(null)
        setIsMenuOpen(false)
        setIsProfileMenuOpen(false)
        navigate('/login')
    }

    const userInitial = user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'

    return (
        <header className='sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 shadow-lg shadow-slate-950/20 backdrop-blur-xl'>
            <nav className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8'>
                <Link
                    to='/'
                    className='flex cursor-pointer items-center gap-3'
                    onClick={() => setIsMenuOpen(false)}
                >
                    <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/25'>
                        <Plane size={20} />
                    </span>
                    <span className='text-xl font-black tracking-tight text-white'>
                        EasyTrip
                    </span>
                </Link>

                {navLinks.length > 0 && (
                    <div className='hidden rounded-full border border-white/10 bg-white/10 px-2 py-1 md:flex md:items-center md:gap-1'>
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-cyan-200 shadow-sm'
                                        : 'rounded-full px-4 py-2 text-sm font-semibold text-cyan-50/85 transition hover:bg-white/10 hover:text-white'
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                )}

                {token ? (
                    <div className='relative hidden items-center gap-5 md:flex'>
                        <button
                            type='button'
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5'
                            aria-label='Open user menu'
                            aria-expanded={isProfileMenuOpen}
                        >
                            {userInitial}
                        </button>

                        {isProfileMenuOpen && (
                            <div className='absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-slate-950/40 backdrop-blur-xl'>
                                <div className='border-b border-white/10 px-4 py-3'>
                                    <p className='text-sm font-black text-white'>
                                        {user?.firstName || 'EasyTrip user'}
                                    </p>
                                    <p className='mt-1 truncate text-xs font-medium text-slate-400'>
                                        {user?.email || 'Account'}
                                    </p>
                                </div>

                                <NavLink
                                    to='/profile'
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className='mt-2 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan-50/85 transition hover:bg-white/10 hover:text-white'
                                >
                                    <UserRound size={16} />
                                    Profile
                                </NavLink>

                                <NavLink
                                    to='/settings'
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className='flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan-50/85 transition hover:bg-white/10 hover:text-white'
                                >
                                    <Settings size={16} />
                                    Settings
                                </NavLink>

                                <button
                                    type='button'
                                    onClick={handleLogout}
                                    className='mt-2 flex w-full cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-left text-sm font-bold text-white transition hover:bg-white/15'
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='hidden items-center gap-5 md:flex'>
                        <Link
                            to='/login'
                            className='cursor-pointer text-sm font-bold text-cyan-50/85 transition hover:text-white'
                        >
                            Login
                        </Link>

                        <Link
                            to='/register'
                            className='cursor-pointer rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/25'
                        >
                            Sign up
                        </Link>
                    </div>
                )}

                <button
                    type='button'
                    className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white md:hidden'
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label='Toggle navigation menu'
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {isMenuOpen && (
                <div className='border-t border-white/10 bg-slate-950/95 px-4 py-4 shadow-xl shadow-slate-950/30 md:hidden'>
                    <div className='flex flex-col gap-4'>
                        {(token ? mobilePrivateLinks : navLinks).map((link) => (
                            <MobileNavLink
                                key={link.label}
                                link={link}
                                onClick={() => setIsMenuOpen(false)}
                            />
                        ))}

                        {token ? (
                            <>
                                <div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3'>
                                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-sm font-black text-slate-950'>
                                        {userInitial}
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='truncate text-sm font-black text-white'>
                                            {user?.firstName || 'EasyTrip user'}
                                        </p>
                                        <p className='truncate text-xs font-medium text-slate-400'>
                                            {user?.email || 'Account'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type='button'
                                    onClick={handleLogout}
                                    className='flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-center text-sm font-bold text-white'
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to='/login'
                                    onClick={() => setIsMenuOpen(false)}
                                    className='cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-cyan-50/85'
                                >
                                    Login
                                </Link>

                                <Link
                                    to='/register'
                                    onClick={() => setIsMenuOpen(false)}
                                    className='cursor-pointer rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-4 py-2.5 text-center text-sm font-bold text-slate-950'
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

const MobileNavLink = ({ link, onClick }) => {
    const Icon = link.icon

    return (
        <NavLink
            to={link.path}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive
                    ? 'bg-white/10 font-bold text-cyan-200'
                    : 'font-semibold text-cyan-50/85'
                }`
            }
        >
            {Icon && <Icon size={17} />}
            {link.label}
        </NavLink>
    )
}

export default Navbar
