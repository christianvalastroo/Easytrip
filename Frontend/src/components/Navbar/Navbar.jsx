import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import easyTripLogo from '../../assets/easytrip-logo.png'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/dashboard', label: 'Dashboard' },
    ]

    return (
        <header className='sticky top-0 z-50 border-b border-slate-200 bg-white'>
            <nav className='flex items-center justify-between px-4 py-3 sm:px-6 lg:px-10'>
                <Link
                    to='/'
                    className='flex items-center'
                    onClick={() => setIsMenuOpen(false)}
                >
                    <img
                        src={easyTripLogo}
                        alt='EasyTrip logo'
                        className='h-10 w-auto object-contain'
                    />
                </Link>

                <div className='hidden items-center gap-8 md:flex'>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                isActive
                                    ? 'text-sm font-semibold text-blue-600'
                                    : 'text-sm font-medium text-slate-700 hover:text-blue-600'
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className='hidden items-center gap-5 md:flex'>
                    <Link
                        to='/login'
                        className='text-sm font-medium text-slate-700 hover:text-blue-600'
                    >
                        Login
                    </Link>

                    <Link
                        to='/register'
                        className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
                    >
                        Register
                    </Link>
                </div>

                <button
                    type='button'
                    className='flex h-10 w-10 items-center justify-center text-slate-700 md:hidden'
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
                <div className='border-t border-slate-200 bg-white px-4 py-4 md:hidden'>
                    <div className='flex flex-col gap-4'>
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'text-sm font-semibold text-blue-600'
                                        : 'text-sm font-medium text-slate-700'
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}

                        <Link
                            to='/login'
                            onClick={() => setIsMenuOpen(false)}
                            className='text-sm font-medium text-slate-700'
                        >
                            Login
                        </Link>

                        <Link
                            to='/register'
                            onClick={() => setIsMenuOpen(false)}
                            className='rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white'
                        >
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
