import { useState } from 'react'
import {
  BarChart3,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  MapPinned,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import { API_URL } from '../../config/api'
import { useLanguage } from '../../i18n/language-context'
import {
  clearSession,
  isAuthError,
  SESSION_EXPIRED_MESSAGE,
} from '../../utils/auth'

const stepDefinitions = [
  {
    icon: Sparkles,
    eyebrow: 'Welcome to EasyTrip',
    title: 'Plan every trip in one place',
    description:
      'EasyTrip helps you turn a destination into a clear itinerary, keeping dates, activities, notes and spending together.',
    points: [
      'Organize multiple trips from one private dashboard',
      'Plan each day without losing important details',
      'Keep your travel budget under control',
    ],
    hint: 'This quick introduction takes less than a minute.',
  },
  {
    icon: LayoutDashboard,
    eyebrow: 'Your dashboard',
    title: 'See what matters at a glance',
    description:
      'The dashboard is your starting point. It summarizes upcoming plans and gives you quick access to the main areas.',
    points: [
      'Check your next destination and travel dates',
      'See how many trips and activities you have planned',
      'Open recent trips or create a new one immediately',
    ],
    hint: 'Use the sidebar to reach trips, profile and settings.',
  },
  {
    icon: CalendarPlus,
    eyebrow: 'Create a trip',
    title: 'Start with the essential details',
    description:
      'Give your trip a clear title, choose the destination and define the dates before building the itinerary.',
    points: [
      'Set a total budget for the complete journey',
      'Add initial notes about flights, hotels or ideas',
      'Upload a cover image to recognize the trip quickly',
    ],
    hint: 'You can edit notes, dates, budget and cover later from the trip page.',
  },
  {
    icon: MapPinned,
    eyebrow: 'Build the itinerary',
    title: 'Organize activities day by day',
    description:
      'Add every planned stop to the trip. Activities are automatically grouped by date and sorted by time.',
    points: [
      'Choose between transport, hotel, food, visits and other',
      'Save location, time, description and expected cost',
      'Edit or remove activities whenever plans change',
    ],
    hint: 'Activity dates must stay within the selected trip dates.',
  },
  {
    icon: ClipboardCheck,
    eyebrow: 'Prepare everything',
    title: 'Use notes and the travel checklist',
    description:
      'Keep practical information close to the itinerary and prepare everything you need before departure.',
    points: [
      'Write accommodation, transport and reservation notes',
      'Track documents, tickets, luggage and chargers',
      'Add, rename, complete or remove checklist items',
    ],
    hint: 'Checklist changes are saved directly with the trip.',
  },
  {
    icon: WalletCards,
    eyebrow: 'Control spending',
    title: 'Compare costs with your budget',
    description:
      'EasyTrip adds the cost of all activities and shows how much of the travel budget remains available.',
    points: [
      'View total planned activity costs',
      'Compare expenses with the trip budget',
      'Adjust activities before exceeding your limit',
    ],
    hint: 'You are ready. Create, explore and keep every journey organized.',
  },
]

const OnboardingTour = ({ onClose, onSessionExpired }) => {
  const { t } = useLanguage()
  const steps = stepDefinitions.map((definition, index) => {
    const [eyebrow, title, description, points, hint] = t('onboarding.steps')[index]
    return { ...definition, eyebrow, title, description, points, hint }
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === steps.length - 1

  const finishOnboarding = async () => {
    setError('')
    setIsSaving(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/users/me/onboarding`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      })

      if (isAuthError(response)) {
        clearSession()
        onSessionExpired(SESSION_EXPIRED_MESSAGE)
        return
      }

      const responseText = await response.text()
      const data = responseText ? JSON.parse(responseText) : {}

      if (!response.ok) {
        throw new Error(data.message || t('onboarding.error'))
      }

      onClose()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md'
      role='dialog'
      aria-modal='true'
      aria-labelledby='onboarding-title'
    >
      <section className='max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-cyan-300/20 bg-slate-900 shadow-2xl shadow-cyan-950/40'>
        <div className='h-1 bg-white/10'>
          <div
            className='h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300'
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className='p-6 sm:p-8'>
          <div className='flex items-start justify-between gap-4'>
            <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200'>
              <Icon size={27} />
            </span>
            <button
              type='button'
              onClick={finishOnboarding}
              disabled={isSaving}
              aria-label={t('onboarding.skip')}
              className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60'
            >
              <X size={18} />
            </button>
          </div>

          <div className='mt-7 flex flex-wrap items-center justify-between gap-2'>
            <p className='text-sm font-black uppercase tracking-[0.18em] text-cyan-300'>
              {step.eyebrow}
            </p>
            <p className='text-xs font-bold uppercase tracking-wide text-slate-500'>
              {t('onboarding.step')} {currentStep + 1} {t('onboarding.of')} {steps.length}
            </p>
          </div>
          <h2 id='onboarding-title' className='mt-3 text-3xl font-black text-white sm:text-4xl'>
            {step.title}
          </h2>
          <p className='mt-4 text-base leading-7 text-slate-300'>{step.description}</p>

          <div className='mt-5 grid gap-3'>
            {step.points.map((point) => (
              <div
                key={point}
                className='flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3'
              >
                <span className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300'>
                  <BarChart3 size={14} />
                </span>
                <p className='text-sm font-semibold leading-6 text-slate-200'>{point}</p>
              </div>
            ))}
          </div>

          <p className='mt-5 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold leading-6 text-slate-300'>
            {step.hint}
          </p>

          {error && (
            <p className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>
              {error}
            </p>
          )}

          <div className='mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <button
              type='button'
              onClick={() => setCurrentStep((stepIndex) => stepIndex - 1)}
              disabled={currentStep === 0 || isSaving}
              className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <ChevronLeft size={17} /> {t('onboarding.back')}
            </button>

            {isLastStep ? (
              <button
                type='button'
                onClick={finishOnboarding}
                disabled={isSaving}
                className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSaving ? <LoadingSpinner label={t('onboarding.saving')} size={17} /> : t('onboarding.finish')}
              </button>
            ) : (
              <button
                type='button'
                onClick={() =>
                  setCurrentStep((stepIndex) =>
                    Math.min(stepIndex + 1, steps.length - 1),
                  )
                }
                disabled={isSaving}
                className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200'
              >
                {t('onboarding.next')} <ChevronRight size={17} />
              </button>
            )}
          </div>

          <div className='mt-6 flex justify-center gap-2' aria-label={t('onboarding.progress')}>
            {steps.map((tourStep, stepIndex) => (
              <span
                key={tourStep.title}
                className={`h-2 rounded-full transition-all duration-300 ${stepIndex === currentStep
                  ? 'w-8 bg-cyan-300'
                  : stepIndex < currentStep
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-white/20'
                  }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default OnboardingTour
