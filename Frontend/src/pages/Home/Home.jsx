import { Link } from 'react-router-dom'
import homeHeroImage from '../../assets/home-hero.jpg'
import { useLanguage } from '../../i18n/language-context'

const Home = () => {
  const { t } = useLanguage()
  return (
    <main className="bg-slate-950 text-white">
      <section className="relative min-h-[calc(100vh-65px)] overflow-hidden">
        <img
          src={homeHeroImage}
          alt={t('home.imageAlt')}
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-65px)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-2 backdrop-blur-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950">
                ✈
              </span>
              <span className="text-sm font-semibold tracking-wide">
                {t('home.badge')}
              </span>
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              {t('home.title')}{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                {t('home.accent')}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              {t('home.description')}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-7 py-4 text-center text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                {t('home.start')}
              </Link>

              <Link
                to="/login"
                className="cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-center text-sm font-bold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                {t('common.login')}
              </Link>
            </div>

            <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-2xl">
                <p className="text-sm font-black text-white">{t('home.tripsTitle')}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  {t('home.tripsText')}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-2xl">
                <p className="text-sm font-black text-white">{t('home.activitiesTitle')}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  {t('home.activitiesText')}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-2xl">
                <p className="text-sm font-black text-white">{t('home.budgetTitle')}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  {t('home.budgetText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
