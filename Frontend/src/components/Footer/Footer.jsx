import { Link } from 'react-router-dom'
import { useLanguage } from '../../i18n/language-context'

const Footer = () => {
    const currentYear = new Date().getFullYear()
    const { t } = useLanguage()

    return (
        <footer className='border-t border-white/10 bg-slate-950 text-white'>
            <div className='mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-10 lg:px-8'>
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
                        {t('footer.description')}
                    </p>
                </div>

                <div className='hidden md:block'>
                    <h2 className='text-sm font-black uppercase tracking-wide text-cyan-200'>
                        {t('footer.project')}
                    </h2>

                    <p className='mt-4 text-sm leading-6 text-slate-300'>
                        {t('footer.projectDescription')}
                    </p>
                </div>
            </div>

            <div className='border-t border-white/10 px-4 py-4 md:py-5'>
                <p className='mx-auto max-w-7xl text-sm text-slate-400 sm:px-6 lg:px-8'>
                    © {currentYear} EasyTrip. {t('footer.rights')}
                </p>
            </div>
        </footer>
    )
}

export default Footer
