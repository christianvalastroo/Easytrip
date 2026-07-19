import { useState } from 'react'
import {
    ArrowLeft,
    CheckCircle2,
    Info,
    KeyRound,
    LogOut,
    ShieldCheck,
    Trash2,
    TriangleAlert,
    UserCog,
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
import packageJson from '../../../package.json'

const Settings = () => {
    const navigate = useNavigate()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState('')

    const handleLogout = () => {
        clearSession()
        navigate('/login')
    }

    const handlePasswordChange = (event) => {
        const { name, value } = event.target

        setPasswords((currentPasswords) => ({
            ...currentPasswords,
            [name]: value,
        }))
    }

    const handlePasswordSubmit = async (event) => {
        event.preventDefault()
        setPasswordError('')
        setPasswordSuccess('')

        if (passwords.newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long')
            return
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError('New passwords do not match')
            return
        }

        setIsChangingPassword(true)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users/me/password`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
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
                throw new Error(data?.message || 'Unable to update password')
            }

            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
            setPasswordSuccess(data.message || 'Password updated successfully')
        } catch (changeError) {
            setPasswordError(changeError.message)
        } finally {
            setIsChangingPassword(false)
        }
    }

    const closeDeleteDialog = () => {
        if (isDeleting) return

        setIsDeleteDialogOpen(false)
        setConfirmation('')
        setError('')
    }

    const handleDeleteAccount = async () => {
        if (confirmation !== 'DELETE') return

        setIsDeleting(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/users/me`, {
                method: 'DELETE',
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
                throw new Error(data?.message || 'Unable to delete account')
            }

            clearSession()
            navigate('/', { replace: true })
        } catch (deleteError) {
            setError(deleteError.message)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <main className='min-h-[calc(100vh-65px)] bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-4xl'>
                <button
                    type='button'
                    onClick={() => navigate('/dashboard')}
                    className='mb-6 flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-cyan-200'
                >
                    <ArrowLeft size={17} />
                    Back to dashboard
                </button>

                <header className='mb-8'>
                    <p className='text-sm font-bold uppercase tracking-[0.2em] text-cyan-300'>
                        Your account
                    </p>
                    <h1 className='mt-2 text-4xl font-black tracking-tight sm:text-5xl'>
                        Settings
                    </h1>
                    <p className='mt-3 max-w-2xl text-slate-400'>
                        Manage your preferences, session and EasyTrip account.
                    </p>
                </header>

                <div className='space-y-6'>
                    <SettingsSection
                        icon={UserCog}
                        title='Account'
                        description='Update your personal details and password.'
                    >
                        <div className='flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <p className='font-bold text-white'>Personal information</p>
                                <p className='mt-1 text-sm text-slate-400'>
                                    Change your name and view your email address.
                                </p>
                            </div>
                            <button
                                type='button'
                                onClick={() => navigate('/profile')}
                                className='flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/15'
                            >
                                <UserCog size={17} /> Edit profile
                            </button>
                        </div>

                        <form
                            onSubmit={handlePasswordSubmit}
                            className='mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4'
                        >
                            <div className='mb-5 flex items-start gap-3'>
                                <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300'>
                                    <KeyRound size={17} />
                                </span>
                                <div>
                                    <h3 className='font-bold text-white'>Change password</h3>
                                    <p className='mt-1 text-sm text-slate-400'>
                                        Use at least 8 characters for your new password.
                                    </p>
                                </div>
                            </div>

                            <div className='grid gap-4 md:grid-cols-3'>
                                <PasswordField
                                    label='Current password'
                                    name='currentPassword'
                                    onChange={handlePasswordChange}
                                    value={passwords.currentPassword}
                                />
                                <PasswordField
                                    label='New password'
                                    name='newPassword'
                                    onChange={handlePasswordChange}
                                    value={passwords.newPassword}
                                />
                                <PasswordField
                                    label='Confirm password'
                                    name='confirmPassword'
                                    onChange={handlePasswordChange}
                                    value={passwords.confirmPassword}
                                />
                            </div>

                            {passwordError && (
                                <p className='mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-200'>
                                    {passwordError}
                                </p>
                            )}

                            {passwordSuccess && (
                                <p className='mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200'>
                                    <CheckCircle2 size={17} /> {passwordSuccess}
                                </p>
                            )}

                            <div className='mt-5 flex justify-end'>
                                <button
                                    type='submit'
                                    disabled={isChangingPassword}
                                    className='flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    {isChangingPassword ? (
                                        <LoadingSpinner label='Updating...' size={17} />
                                    ) : (
                                        <>
                                            <KeyRound size={17} /> Change password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </SettingsSection>

                    <SettingsSection
                        icon={ShieldCheck}
                        title='Session'
                        description='Manage the session active on this browser.'
                    >
                        <div className='flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <div className='flex items-center gap-2'>
                                    <p className='font-bold text-white'>Current session</p>
                                    <span className='rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-black text-emerald-300'>
                                        Active
                                    </span>
                                </div>
                                <p className='mt-1 text-sm text-slate-400'>
                                    Your session lasts up to one hour. Log out when using a shared device.
                                </p>
                            </div>
                            <button
                                type='button'
                                onClick={handleLogout}
                                className='flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/15'
                            >
                                <LogOut size={17} /> Log out
                            </button>
                        </div>
                    </SettingsSection>

                    <section className='rounded-3xl border border-rose-400/25 bg-rose-400/5 p-5 shadow-xl shadow-slate-950/30 sm:p-7'>
                        <div className='flex items-start gap-4'>
                            <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300'>
                                <TriangleAlert size={21} />
                            </span>
                            <div>
                                <h2 className='text-xl font-black text-rose-200'>Danger zone</h2>
                                <p className='mt-1 text-sm text-slate-400'>
                                    Actions in this section cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className='mt-6 flex flex-col gap-4 rounded-2xl border border-rose-400/20 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <p className='font-bold text-white'>Delete account</p>
                                <p className='mt-1 text-sm text-slate-400'>
                                    Permanently delete your account, trips and activities.
                                </p>
                            </div>
                            <button
                                type='button'
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className='flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm font-black text-rose-200 transition hover:bg-rose-400/20'
                            >
                                <Trash2 size={17} /> Delete account
                            </button>
                        </div>
                    </section>

                    <SettingsSection
                        icon={Info}
                        title='About'
                        description='Information about this EasyTrip installation.'
                    >
                        <div className='flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4'>
                            <div>
                                <p className='font-black text-white'>EasyTrip</p>
                                <p className='mt-1 text-sm text-slate-400'>Travel planning made simple.</p>
                            </div>
                            <span className='inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-center text-xs font-black leading-none text-cyan-200'>
                                Version {packageJson.version}
                            </span>
                        </div>
                    </SettingsSection>
                </div>
            </div>

            {isDeleteDialogOpen && (
                <DeleteAccountDialog
                    confirmation={confirmation}
                    error={error}
                    isDeleting={isDeleting}
                    onChange={setConfirmation}
                    onClose={closeDeleteDialog}
                    onConfirm={handleDeleteAccount}
                />
            )}
        </main>
    )
}

const SettingsSection = ({ children, description, icon: Icon, title }) => (
    <section className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30 sm:p-7'>
        <div className='flex items-start gap-4'>
            <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300'>
                <Icon size={21} />
            </span>
            <div>
                <h2 className='text-xl font-black'>{title}</h2>
                <p className='mt-1 text-sm text-slate-400'>{description}</p>
            </div>
        </div>
        <div className='mt-6'>{children}</div>
    </section>
)

const PasswordField = ({ label, name, onChange, value }) => (
    <div>
        <label className='mb-2 block text-sm font-bold text-slate-300' htmlFor={name}>
            {label}
        </label>
        <input
            id={name}
            name={name}
            type='password'
            value={value}
            onChange={onChange}
            required
            autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
            className='w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10'
        />
    </div>
)

const DeleteAccountDialog = ({
    confirmation,
    error,
    isDeleting,
    onChange,
    onClose,
    onConfirm,
}) => (
    <div
        className='fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm'
        role='dialog'
        aria-modal='true'
        aria-labelledby='delete-account-title'
    >
        <div className='w-full max-w-md rounded-3xl border border-rose-400/25 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60'>
            <div className='flex items-start justify-between gap-4'>
                <div>
                    <h2 id='delete-account-title' className='text-2xl font-black text-white'>
                        Delete your account?
                    </h2>
                    <p className='mt-2 text-sm leading-6 text-slate-400'>
                        This permanently removes your account, trips and activities. Type
                        <strong className='mx-1 text-rose-200'>DELETE</strong>
                        to confirm.
                    </p>
                </div>
                <button
                    type='button'
                    onClick={onClose}
                    disabled={isDeleting}
                    className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed'
                    aria-label='Close dialog'
                >
                    <X size={19} />
                </button>
            </div>

            <input
                value={confirmation}
                onChange={(event) => onChange(event.target.value)}
                disabled={isDeleting}
                placeholder='Type DELETE'
                autoComplete='off'
                className='mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-rose-400/60 focus:ring-4 focus:ring-rose-400/10'
            />

            {error && (
                <p className='mt-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-200'>
                    {error}
                </p>
            )}

            <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                <button
                    type='button'
                    onClick={onClose}
                    disabled={isDeleting}
                    className='cursor-pointer rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed'
                >
                    Cancel
                </button>
                <button
                    type='button'
                    onClick={onConfirm}
                    disabled={confirmation !== 'DELETE' || isDeleting}
                    className='flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40'
                >
                    {isDeleting ? (
                        <LoadingSpinner label='Deleting...' size={17} />
                    ) : (
                        <>
                            <Trash2 size={17} /> Delete permanently
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
)

export default Settings
