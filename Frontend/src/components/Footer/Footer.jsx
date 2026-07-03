import { Link } from 'react-router-dom'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className='border-t border-white/10 bg-slate-950 text-white'>
            <div className='mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8'>
                <div>
                    <Link to='/' className='inline-flex items-center gap-3'>
                        <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20'>
                            ✈
                        </span>
                        <span className='text-xl font-black tracking-tight'>
                            EasyTrip
                        </span>
                    </Link>

                    <p className='mt-4 max-w-sm text-sm leading-6 text-slate-300'>
                        Organize trips, activities and budgets in one place,
                        with a simple and clear structure.
                    </p>
                </div>

                <div>
                    <h2 className='text-sm font-black uppercase tracking-wide text-cyan-200'>
                        Contact
                    </h2>

                    <div className='mt-4 space-y-3 text-sm leading-6 text-slate-300'>
                        <p>Have questions about the project?</p>
                        <a
                            href='mailto:christianvalastro@gmail.com'
                            className='inline-flex transition hover:text-white'
                        >
                            Email: christianvalastro@gmail.com
                        </a>
                        <a
                            href='https://wa.me/37060266624'
                            className='block transition hover:text-white'
                            target='_blank'
                            rel='noreferrer'
                        >
                            WhatsApp: +370 602 66 624
                        </a>
                    </div>
                </div>
            </div>

            <div className='border-t border-white/10 px-4 py-5'>
                <p className='mx-auto max-w-7xl text-sm text-slate-400 sm:px-6 lg:px-8'>
                    © {currentYear} EasyTrip. All rights reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer
