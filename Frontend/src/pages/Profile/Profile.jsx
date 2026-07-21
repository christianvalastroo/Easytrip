import { useEffect, useState } from 'react'
import {
    ArrowLeft,
    AtSign,
    CalendarDays,
    Camera,
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
import { useLanguage } from '../../i18n/language-context'
import {
    clearSession,
    isAuthError,
    SESSION_EXPIRED_MESSAGE,
} from '../../utils/auth'

const Profile = () => {
    const navigate = useNavigate()
    const { language, t } = useLanguage()
    const [user, setUser] = useState(null)
    const [formData, setFormData] = useState({ firstName: '', lastName: '' })
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarError, setAvatarError] = useState('')
    const [avatarSuccess, setAvatarSuccess] = useState('')
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
                    throw new Error(data?.message || t('profile.unavailable'))
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
    }, [navigate, t])

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
            setError(t('profile.required'))
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
                throw new Error(data?.message || t('profile.updateError'))
            }

            setUser(data.user)
            setFormData({
                firstName: data.user.firstName || '',
                lastName: data.user.lastName || '',
            })
            setSuccess(data.message || t('profile.updated'))
            setIsEditing(false)
            window.dispatchEvent(new Event('auth-change'))
        } catch (saveError) {
            setError(saveError.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) {
            return
        }

        setAvatarError('')
        setAvatarSuccess('')

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

        if (!allowedTypes.includes(file.type)) {
            setAvatarError(t('profile.imageType'))
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setAvatarError(t('profile.imageSize'))
            return
        }

        setIsUploadingAvatar(true)

        try {
            const token = localStorage.getItem('token')
            const uploadData = new FormData()
            uploadData.append('avatar', file)

            const response = await fetch(`${API_URL}/users/me/avatar`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: uploadData,
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
                throw new Error(data?.message || t('profile.uploadError'))
            }

            setUser(data.user)
            setAvatarSuccess(data.message || t('profile.avatarUpdated'))
            window.dispatchEvent(new Event('auth-change'))
        } catch (uploadError) {
            setAvatarError(uploadError.message)
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    if (isLoading) {
        return (
            <ProfileMessage
                message={<LoadingSpinner label={t('profile.loading')} />}
            />
        )
    }

    if (!user) {
        return <ProfileMessage isError message={error || t('profile.unavailable')} />
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
    const memberSince = user.createdAt
        ? new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en', { month: 'long', year: 'numeric' }).format(
            new Date(user.createdAt),
        )
        : t('profile.notAvailable')

    return (
        <main className='min-h-[calc(100vh-65px)] bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-5xl'>
                <button
                    type='button'
                    onClick={() => navigate('/dashboard')}
                    className='mb-6 flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-cyan-200'
                >
                    <ArrowLeft size={17} />
                    {t('trips.backDashboard')}
                </button>

                <section className='overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/40 backdrop-blur-xl'>
                    <div className='px-5 py-7 sm:px-8 sm:py-9'>
                        <div className='flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
                            <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
                                <div
                                    translate='no'
                                    className='notranslate relative h-28 w-28 shrink-0 sm:h-32 sm:w-32'
                                >
                                    <div className='flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-3xl font-black text-slate-950 shadow-xl'>
                                        {user.avatar?.url ? (
                                            <img
                                                src={user.avatar.url}
                                                alt={`${fullName || 'User'} avatar`}
                                                className='h-full w-full object-cover'
                                            />
                                        ) : (
                                            initials
                                        )}
                                    </div>

                                    <label
                                        htmlFor='avatar-upload'
                                        aria-disabled={isUploadingAvatar}
                                        aria-label={t('profile.photo')}
                                        title={t('profile.photo')}
                                        className={`absolute bottom-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-cyan-300 text-slate-950 shadow-lg shadow-slate-950/40 transition hover:scale-105 hover:bg-cyan-200 ${isUploadingAvatar
                                            ? 'cursor-not-allowed opacity-60'
                                            : 'cursor-pointer'
                                            }`}
                                    >
                                        {isUploadingAvatar ? (
                                            <LoadingSpinner
                                                label={t('profile.uploading')}
                                                showLabel={false}
                                                size={16}
                                            />
                                        ) : (
                                            <Camera size={17} />
                                        )}
                                    </label>
                                    <input
                                        id='avatar-upload'
                                        type='file'
                                        accept='image/jpeg,image/png,image/webp'
                                        onChange={handleAvatarChange}
                                        disabled={isUploadingAvatar}
                                        className='sr-only'
                                    />
                                </div>
                                <div className='pb-1'>
                                    <p className='text-sm font-bold uppercase tracking-[0.2em] text-cyan-300'>
                                        {t('profile.title')}
                                    </p>
                                    <h1 className='mt-1 text-3xl font-black tracking-tight sm:text-4xl'>
                                        {fullName || t('common.user')}
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
                                    <Pencil size={16} /> {t('profile.edit')}
                                </button>
                            )}
                        </div>

                        {avatarSuccess && (
                            <div className='mt-5 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200'>
                                <CheckCircle2 size={17} /> {avatarSuccess}
                            </div>
                        )}

                        {avatarError && (
                            <div className='mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-200'>
                                {avatarError}
                            </div>
                        )}
                    </div>
                </section>

                <div className='mt-6 grid gap-6 lg:grid-cols-[1fr_300px]'>
                    <section className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30 sm:p-7'>
                        <div className='mb-6'>
                            <h2 className='text-xl font-black'>{t('profile.personal')}</h2>
                            <p className='mt-1 text-sm text-slate-400'>
                                {t('profile.personalText')}
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
                                label={t('profile.firstName')}
                                name='firstName'
                                onChange={handleChange}
                                value={formData.firstName}
                            />
                            <ProfileField
                                disabled={!isEditing}
                                label={t('profile.lastName')}
                                name='lastName'
                                onChange={handleChange}
                                value={formData.lastName}
                            />

                            <div className='sm:col-span-2'>
                                <label className='mb-2 block text-sm font-bold text-slate-300' htmlFor='email'>
                                    {t('profile.email')}
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
                                <p className='mt-2 text-xs text-slate-500'>{t('profile.emailLocked')}</p>
                            </div>

                            {isEditing && (
                                <div className='flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-end'>
                                    <button
                                        type='button'
                                        onClick={handleCancel}
                                        className='flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10'
                                    >
                                        <X size={16} /> {t('profile.cancel')}
                                    </button>
                                    <button
                                        type='submit'
                                        disabled={isSaving}
                                        className='flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        {isSaving ? (
                                            <LoadingSpinner label={t('profile.saving')} size={16} />
                                        ) : (
                                            <>
                                                <Save size={16} /> {t('profile.save')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>

                    <aside className='space-y-4'>
                        <ProfileInfoCard icon={CalendarDays} label={t('profile.memberSince')} value={memberSince} />
                        <ProfileInfoCard icon={UserRound} label={t('profile.status')} value={t('profile.active')} />
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
