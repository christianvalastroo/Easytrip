import { Link } from 'react-router-dom'
import { useLanguage } from '../../i18n/language-context'

const NotFound = () => {
  const { t } = useLanguage()

  return (
    <main className='flex min-h-[calc(100vh-65px)] items-center justify-center bg-slate-950 px-4 text-center text-white'>
      <div>
        <p className='text-sm font-black uppercase tracking-[0.2em] text-cyan-300'>404</p>
        <h1 className='mt-3 text-4xl font-black'>{t('notFound.title')}</h1>
        <p className='mt-3 text-slate-400'>{t('notFound.description')}</p>
        <Link to='/' className='mt-6 inline-block rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950'>
          {t('notFound.action')}
        </Link>
      </div>
    </main>
  )
}

export default NotFound
