import { useEffect, useState } from 'react'
import {
    ArrowLeft,
    AtSign,
    CalendarDays,
    CheckCircle2,
    Mail,
    Pencil,
    Save,
    UserRound,
    X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'
import { API_URL } from '../../config/api'
import {
    clearSession,
    isAuthError,
    SESSION_EXPIRED_MESSAGE,
} from '../../utils/auth'

const Profile = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [formData, setFormData] = useState({ firstName: '', lastName: '' })
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token')

            try {
                const response = await fetch(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (isAuthError(response)) {
                    clearSession()
                    navigate('/login', {
                        state: { message: SESSION_EXPIRED_MESSAGE },
                    })
                    return
                }

                const responseText = await response.text()
                const data = responseText ? JSON.parse(responseText) : null

                if (!response.ok) {
                    throw new Error(data?.message || 'Profile unavailable')
                }

                setUser(data)
                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                })
            } catch (fetchError) {
                setError(fetchError.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [navigate])

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((currentData) => ({ ...currentData, [name]: value }))
    }

    const handleCancel = () => {
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
        })
        setError('')
        setSuccess('')
        setIsEditing(false)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!formData.firstName.trim()) {
            setError('First name is required')
            return
        }

        setIsSaving(true)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                }),
            })

            if (isAuthError(response)) {
                clearSession()
                navigate('/login', {
                    state: { message: SESSION_EXPIRED_MESSAGE },
                })
                return
            }

            const responseText = await response.text()
            const data = responseText ? JSON.parse(responseText) : null

            if (!response.ok) {
                throw new Error(data?.message || 'Unable to update profile')
            }

            setUser(data.user)
            setFormData({
                firstName: data.user.firstName || '',
                lastName: data.user.lastName || '',
            })
            setSuccess(data.message || 'Profile updated successfully')
            setIsEditing(false)
            window.dispatchEvent(new Event('auth-change'))
        } catch (saveError) {
            setError(saveError.message)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <ProfileMessage
                message={<LoadingSpinner label='Loading profile...' />}
            />
        )
    }

    if (!user) {
        return <ProfileMessage isError message={error || 'Profile unavailable'} />
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
    const memberSince = user.createdAt
        ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
            new Date(user.createdAt),
        )
        : 'Not available'

    return (
        <main className='min-h-[calc(100vh-65px)] bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-5xl'>
                <button
                    type='button'
                    onClick={() => navigate('/dashboard')}
                    className='mb-6 flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-cyan-200'
                >
                    <ArrowLeft size={17} />
                    Back to dashboard
                </button>

                <section className='overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/40 backdrop-blur-xl'>
                    <div className='px-5 py-7 sm:px-8 sm:py-9'>
                        <div className='flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
                            <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
                                <div className='flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-3xl font-black text-slate-950 shadow-xl sm:h-32 sm:w-32'>
                                    {initials}
                                </div>
                                <div className='pb-1'>
                                    <p className='text-sm font-bold uppercase tracking-[0.2em] text-cyan-300'>
                                        My profile
                                    </p>
                                    <h1 className='mt-1 text-3xl font-black tracking-tight sm:text-4xl'>
                                        {fullName || 'EasyTrip user'}
                                    </h1>
                                    <p className='mt-2 flex items-center gap-2 text-sm text-slate-400'>
                                        <Mail size={15} /> {user.email}
                                    </p>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    type='button'
                                    onClick={() => {
                                        setError('')
                                        setSuccess('')
                                        setIsEditing(true)
                                    }}
                                    className='flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5'
                                >
                                    <Pencil size={16} /> Edit profile
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <div className='mt-6 grid gap-6 lg:grid-cols-[1fr_300px]'>
                    <section className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30 sm:p-7'>
                        <div className='mb-6'>
                            <h2 className='text-xl font-black'>Personal information</h2>
                            <p className='mt-1 text-sm text-slate-400'>
                                Your personal details for your EasyTrip account.
                            </p>
                        </div>

                        {success && (
                            <div className='mb-5 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200'>
                                <CheckCircle2 size={17} /> {success}
                            </div>
                        )}

                        {error && (
                            <div className='mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-200'>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className='grid gap-5 sm:grid-cols-2'>
                            <ProfileField
                                disabled={!isEditing}
                                label='First name'
                                name='firstName'
                                onChange={handleChange}
                                value={formData.firstName}
                            />
                            <ProfileField
                                disabled={!isEditing}
                                label='Last name'
                                name='lastName'
                                onChange={handleChange}
                                value={formData.lastName}
                            />

                            <div className='sm:col-span-2'>
                                <label className='mb-2 block text-sm font-bold text-slate-300' htmlFor='email'>
                                    Email address
                                </label>
                                <div className='relative'>
                                    <AtSign className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500' size={17} />
                                    <input
                                        id='email'
                                        value={user.email}
                                        disabled
                                        className='w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-400 outline-none'
                                    />
                                </div>
                                <p className='mt-2 text-xs text-slate-500'>The email address cannot be changed.</p>
                            </div>

                            {isEditing && (
                                <div className='flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-end'>
                                    <button
                                        type='button'
                                        onClick={handleCancel}
                                        className='flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10'
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={isSaving}
                                        className='flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>

                    <aside className='space-y-4'>
                        <ProfileInfoCard icon={CalendarDays} label='Member since' value={memberSince} />
                        <ProfileInfoCard icon={UserRound} label='Account status' value='Active' />
                    </aside>
                </div>
            </div>
        </main>
    )
}

const ProfileField = ({ disabled, label, name, onChange, value }) => (
    <div>
        <label className='mb-2 block text-sm font-bold text-slate-300' htmlFor={name}>
            {label}
        </label>
        <input
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className='w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 disabled:text-slate-300'
        />
    </div>
)

const ProfileInfoCard = ({ icon: Icon, label, value }) => (
    <div className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30'>
        <span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300'>
            <Icon size={20} />
        </span>
        <p className='mt-4 text-xs font-bold uppercase tracking-widest text-slate-500'>{label}</p>
        <p className='mt-1 font-black text-white'>{value}</p>
    </div>
)

const ProfileMessage = ({ isError = false, message }) => (
    <main className='flex min-h-[calc(100vh-65px)] items-center justify-center bg-slate-950 px-4 text-white'>
        <div className={`rounded-3xl border px-8 py-6 text-center font-bold ${isError ? 'border-rose-400/20 bg-rose-400/10 text-rose-200' : 'border-white/10 bg-slate-900 text-slate-300'}`}>
            {message}
        </div>
    </main>
)

export default Profile
