import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { API_URL } from '../../config/api'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const updateToken = () => {
            setToken(localStorage.getItem('token'))
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
    }, [token])

    const navLinks = []

    const mobilePrivateLinks = [
        { path: '/dashboard', label: 'My trips' },
        { path: '/dashboard', label: 'Activities' },
        { path: '/dashboard', label: 'Profile' },
        { path: '/dashboard', label: 'Settings' },
    ]

    const handleLogout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsMenuOpen(false)
        setIsProfileMenuOpen(false)
        window.dispatchEvent(new Event('auth-change'))
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
                        ✈
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
                                    to='/dashboard'
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className='mt-2 block rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan-50/85 transition hover:bg-white/10 hover:text-white'
                                >
                                    Profile
                                </NavLink>

                                <NavLink
                                    to='/dashboard'
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className='block rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan-50/85 transition hover:bg-white/10 hover:text-white'
                                >
                                    Settings
                                </NavLink>

                                <button
                                    type='button'
                                    onClick={handleLogout}
                                    className='mt-2 w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-left text-sm font-bold text-white transition hover:bg-white/15'
                                >
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
                    <span className='relative h-6 w-6'>
                        <span
                            className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 rounded bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45' : '-translate-y-2'
                                }`}
                        ></span>

                        <span
                            className={`absolute left-0 top-1/2 h-0.5 w-6 translate-y-[-40%] rounded bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''
                                }`}
                        ></span>

                        <span
                            className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 rounded bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45' : 'translate-y-2'
                                }`}
                        ></span>
                    </span>
                </button>
            </nav>

            {isMenuOpen && (
                <div className='border-t border-white/10 bg-slate-950/95 px-4 py-4 shadow-xl shadow-slate-950/30 md:hidden'>
                    <div className='flex flex-col gap-4'>
                        {(token ? mobilePrivateLinks : navLinks).map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-cyan-200'
                                        : 'rounded-xl px-3 py-2 text-sm font-semibold text-cyan-50/85'
                                }
                            >
                                {link.label}
                            </NavLink>
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
                                    className='cursor-pointer rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-center text-sm font-bold text-white'
                                >
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

export default Navbar
