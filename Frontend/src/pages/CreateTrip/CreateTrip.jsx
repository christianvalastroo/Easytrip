import { useState } from 'react'
import { ArrowLeft, CalendarDays, MapPin, Plane, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import homeHeroImage from '../../assets/home-hero.png'
import { API_URL } from '../../config/api'
import {
    clearSession,
    isAuthError,
    SESSION_EXPIRED_MESSAGE,
} from '../../utils/auth'

const initialFormData = {
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    notes: '',
}

const CreateTrip = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(initialFormData)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setError('End date cannot be before start date')
            return
        }

        setIsLoading(true)

        try {
            const payload = {
                title: formData.title.trim(),
                destination: formData.destination.trim(),
                startDate: formData.startDate,
                endDate: formData.endDate,
                budget: formData.budget === '' ? 0 : Number(formData.budget),
                notes: formData.notes.trim(),
            }

            const response = await fetch(`${API_URL}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (isAuthError(response)) {
                clearSession()
                navigate('/login', {
                    state: { message: SESSION_EXPIRED_MESSAGE },
                })
                return
            }

            const responseText = await response.text()
            const data = responseText ? JSON.parse(responseText) : {}

            if (!response.ok) {
                throw new Error(data.message || 'Trip creation failed')
            }

            navigate('/trips')
        } catch (error) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className='min-h-[calc(100vh-65px)] bg-slate-950 text-white'>
            <section className='mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8'>
                <div className='relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/40 lg:min-h-[calc(100vh-8rem)]'>
                    <img
                        src={homeHeroImage}
                        alt=''
                        className='absolute inset-0 h-full w-full object-cover opacity-60'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/10' />
                    <div className='relative z-10 flex h-full min-h-[24rem] flex-col justify-between p-6 sm:p-8'>
                        <button
                            type='button'
                            onClick={() => navigate('/trips')}
                            className='inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-white/20 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25'
                        >
                            <ArrowLeft size={17} />
                            Back to trips
                        </button>

                        <div>
                            <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                                New itinerary
                            </p>
                            <h1 className='mt-3 max-w-xl text-4xl font-black leading-tight sm:text-5xl'>
                                Create your next trip
                            </h1>
                            <p className='mt-4 max-w-md text-sm leading-6 text-slate-200 sm:text-base'>
                                Add the core travel details now. Activities, notes and budget
                                planning can grow from this trip.
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flex items-center'>
                    <form
                        onSubmit={handleSubmit}
                        className='w-full rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-7'
                    >
                        <div className='mb-6'>
                            <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                                Trip details
                            </p>
                            <h2 className='mt-2 text-3xl font-black'>Plan basics</h2>
                        </div>

                        <div className='grid gap-5 sm:grid-cols-2'>
                            <FormField
                                icon={Plane}
                                id='title'
                                label='Title'
                                name='title'
                                onChange={handleChange}
                                placeholder='Summer in Greece'
                                required
                                value={formData.title}
                            />

                            <FormField
                                icon={MapPin}
                                id='destination'
                                label='Destination'
                                name='destination'
                                onChange={handleChange}
                                placeholder='Athens'
                                required
                                value={formData.destination}
                            />

                            <FormField
                                icon={CalendarDays}
                                id='startDate'
                                label='Start date'
                                name='startDate'
                                onChange={handleChange}
                                required
                                type='date'
                                value={formData.startDate}
                            />

                            <FormField
                                icon={CalendarDays}
                                id='endDate'
                                label='End date'
                                min={formData.startDate}
                                name='endDate'
                                onChange={handleChange}
                                required
                                type='date'
                                value={formData.endDate}
                            />

                            <FormField
                                icon={Wallet}
                                id='budget'
                                label='Budget'
                                min='0'
                                name='budget'
                                onChange={handleChange}
                                placeholder='1200'
                                type='number'
                                value={formData.budget}
                            />
                        </div>

                        <div className='mt-5'>
                            <label
                                htmlFor='notes'
                                className='text-sm font-bold text-slate-200'
                            >
                                Notes
                            </label>
                            <textarea
                                id='notes'
                                name='notes'
                                value={formData.notes}
                                onChange={handleChange}
                                rows='5'
                                placeholder='Flights, hotel ideas, must-see places...'
                                className='mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/15'
                            />
                        </div>

                        {error && (
                            <p className='mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>
                                {error}
                            </p>
                        )}

                        <div className='mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end'>
                            <button
                                type='button'
                                onClick={() => navigate('/trips')}
                                className='cursor-pointer rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-slate-200 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/15 hover:text-white'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={isLoading}
                                className='cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70'
                            >
                                {isLoading ? 'Creating...' : 'Create trip'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    )
}

const FormField = ({
    icon: Icon,
    id,
    label,
    name,
    onChange,
    placeholder,
    required = false,
    type = 'text',
    value,
    ...inputProps
}) => {
    return (
        <div>
            <label htmlFor={id} className='text-sm font-bold text-slate-200'>
                {label}
            </label>
            <div className='mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition focus-within:border-cyan-300 focus-within:bg-white/15'>
                <Icon size={18} className='shrink-0 text-slate-500' />
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className='w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500'
                    {...inputProps}
                />
            </div>
        </div>
    )
}

export default CreateTrip
