import { Languages } from 'lucide-react'
import { useLanguage } from '../../i18n/language-context'

const LanguageSwitcher = ({ compact = false }) => {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div
      className='flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] p-1'
      aria-label={language === 'en' ? 'Choose language' : 'Scegli la lingua'}
    >
      {!compact && <Languages size={15} className='ml-1 text-cyan-200' />}
      {['en', 'it'].map((option) => (
        <button
          key={option}
          type='button'
          onClick={() => setLanguage(option)}
          aria-label={t(`common.${option === 'en' ? 'english' : 'italian'}`)}
          aria-pressed={language === option}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-black transition ${language === option
            ? 'bg-cyan-300 text-slate-950'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
