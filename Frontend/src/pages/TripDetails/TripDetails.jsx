import { useEffect, useMemo, useState } from 'react'
import {
    ArrowLeft,
    CalendarDays,
    Camera,
    Check,
    CheckSquare,
    Clock,
    FileText,
    ListChecks,
    MapPin,
    Pencil,
    Plus,
    Trash2,
    Wallet,
    X,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'
import { API_URL } from '../../config/api'
import {
    clearSession,
    isAuthError,
    SESSION_EXPIRED_MESSAGE,
} from '../../utils/auth'

const defaultChecklist = [
    { text: 'Identity card / Passport', isCompleted: true },
    { text: 'Flight or train tickets', isCompleted: true },
    { text: 'Hotel reservation', isCompleted: true },
    { text: 'Travel insurance', isCompleted: false },
    { text: 'Luggage', isCompleted: false },
    { text: 'Chargers', isCompleted: false },
]

const initialActivityFormData = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    cost: '',
    type: 'other',
}

const TripDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [trip, setTrip] = useState(null)
    const [activities, setActivities] = useState([])
    const [activityFormData, setActivityFormData] = useState(initialActivityFormData)
    const [activityError, setActivityError] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSavingActivity, setIsSavingActivity] = useState(false)
    const [isDeletingTrip, setIsDeletingTrip] = useState(false)
    const [isSavingChecklist, setIsSavingChecklist] = useState(false)
    const [checklistError, setChecklistError] = useState('')
    const [showActivityForm, setShowActivityForm] = useState(false)
    const [checklistItems, setChecklistItems] = useState(defaultChecklist)
    const [newChecklistItem, setNewChecklistItem] = useState('')
    const [editingChecklistItem, setEditingChecklistItem] = useState('')
    const [editingChecklistValue, setEditingChecklistValue] = useState('')
    const [notesValue, setNotesValue] = useState('')
    const [notesError, setNotesError] = useState('')
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [isSavingNotes, setIsSavingNotes] = useState(false)
    const [deletingActivityId, setDeletingActivityId] = useState('')
    const [activityActionError, setActivityActionError] = useState('')
    const [editingActivityId, setEditingActivityId] = useState('')
    const [editingActivityFormData, setEditingActivityFormData] = useState(
        initialActivityFormData,
    )
    const [isSavingActivityEdit, setIsSavingActivityEdit] = useState(false)
    const [activityEditError, setActivityEditError] = useState('')
    const [isDeleteTripDialogOpen, setIsDeleteTripDialogOpen] = useState(false)
    const [deleteTripError, setDeleteTripError] = useState('')
    const [isUploadingCover, setIsUploadingCover] = useState(false)
    const [coverError, setCoverError] = useState('')
    const [coverSuccess, setCoverSuccess] = useState('')
    const [activityToDelete, setActivityToDelete] = useState(null)
    const [checklistItemToDelete, setChecklistItemToDelete] = useState(null)

    const handleCoverChange = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) {
            return
        }

        setCoverError('')
        setCoverSuccess('')

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

        if (!allowedTypes.includes(file.type)) {
            setCoverError('Choose a JPEG, PNG or WebP image')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setCoverError('Image size cannot exceed 5 MB')
            return
        }

        setIsUploadingCover(true)

        try {
            const token = localStorage.getItem('token')
            const uploadData = new FormData()
            uploadData.append('cover', file)

            const response = await fetch(`${API_URL}/trips/${id}/cover`, {
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
                throw new Error(data?.message || 'Unable to upload trip cover')
            }

            setTrip(data.trip)
            setCoverSuccess(data.message || 'Trip cover updated successfully')
        } catch (uploadError) {
            setCoverError(uploadError.message)
        } finally {
            setIsUploadingCover(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        const fetchTrip = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${token}`,
                }

                const [tripResponse, activitiesResponse] = await Promise.all([
                    fetch(`${API_URL}/trips/${id}`, { headers }),
                    fetch(`${API_URL}/activities/trip/${id}`, { headers }),
                ])

                if (isAuthError(tripResponse) || isAuthError(activitiesResponse)) {
                    clearSession()
                    navigate('/login', {
                        state: { message: SESSION_EXPIRED_MESSAGE },
                    })
                    return
                }

                const tripText = await tripResponse.text()
                const activitiesText = await activitiesResponse.text()
                const tripData = tripText ? JSON.parse(tripText) : {}
                const activitiesData = activitiesText ? JSON.parse(activitiesText) : []

                if (!tripResponse.ok) {
                    throw new Error(tripData.message || 'Trip unavailable')
                }

                if (!activitiesResponse.ok) {
                    throw new Error(activitiesData.message || 'Activities unavailable')
                }

                setTrip(tripData)
                setNotesValue(tripData.notes || '')
                setActivities(Array.isArray(activitiesData) ? activitiesData : [])
                setChecklistItems(
                    tripData.checklist?.length > 0 ? tripData.checklist : defaultChecklist,
                )
            } catch (error) {
                setError(error.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTrip()
    }, [id, navigate])

    const totalActivitiesCost = useMemo(() => {
        return activities.reduce((total, activity) => total + (activity.cost || 0), 0)
    }, [activities])

    const activitiesByDate = useMemo(() => {
        return activities.reduce((groups, activity) => {
            const dateKey = activity.date ? formatDate(activity.date) : 'Date not set'
            const nextGroup = groups[dateKey] || []

            return {
                ...groups,
                [dateKey]: [...nextGroup, activity],
            }
        }, {})
    }, [activities])

    const handleActivityChange = (event) => {
        const { name, value } = event.target

        setActivityFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }))
    }

    const handleStartEditActivity = (activity) => {
        setEditingActivityId(activity._id)

        setEditingActivityFormData({
            title: activity.title || '',
            description: activity.description || '',
            date: formatDateInput(activity.date),
            time: activity.time || '',
            location: activity.location || '',
            cost: activity.cost ?? '',
            type: activity.type || 'other',
        })

        setActivityEditError('')
        setActivityActionError('')
        setShowActivityForm(false)
    }

    const handleCancelEditActivity = () => {
        setEditingActivityId('')
        setEditingActivityFormData(initialActivityFormData)
        setActivityEditError('')
    }

    const handleEditActivityChange = (event) => {
        const { name, value } = event.target

        setEditingActivityFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }))
    }

    const handleUpdateActivity = async (event) => {
        event.preventDefault()
        setActivityEditError('')

        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        setIsSavingActivityEdit(true)

        try {
            const payload = {
                title: editingActivityFormData.title.trim(),
                description: editingActivityFormData.description.trim(),
                date: editingActivityFormData.date,
                time: editingActivityFormData.time,
                location: editingActivityFormData.location.trim(),
                cost:
                    editingActivityFormData.cost === ''
                        ? 0
                        : Number(editingActivityFormData.cost),
                type: editingActivityFormData.type,
            }

            const response = await fetch(`${API_URL}/activities/${editingActivityId}`, {
                method: 'PUT',
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
                throw new Error(data.message || 'Activity update failed')
            }

            setActivities((prevActivities) =>
                prevActivities
                    .map((activity) =>
                        activity._id === data.activity._id ? data.activity : activity,
                    )
                    .sort((firstActivity, secondActivity) => {
                        const dateDifference =
                            new Date(firstActivity.date) - new Date(secondActivity.date)

                        if (dateDifference !== 0) {
                            return dateDifference
                        }

                        return (firstActivity.time || '').localeCompare(
                            secondActivity.time || '',
                        )
                    }),
            )
            handleCancelEditActivity()
        } catch (error) {
            setActivityEditError(error.message)
        } finally {
            setIsSavingActivityEdit(false)
        }
    }

    const handleToggleChecklistItem = (item) => {
        const nextChecklist = checklistItems.map((checklistItem) =>
            checklistItem.text === item.text
                ? { ...checklistItem, isCompleted: !checklistItem.isCompleted }
                : checklistItem,
        )

        setChecklistItems(nextChecklist)
        saveChecklist(nextChecklist)
    }

    const handleAddChecklistItem = (event) => {
        event.preventDefault()

        const nextItem = newChecklistItem.trim()

        if (
            !nextItem ||
            checklistItems.some((checklistItem) => checklistItem.text === nextItem)
        ) {
            return
        }

        const nextChecklist = [
            ...checklistItems,
            { text: nextItem, isCompleted: false },
        ]

        setChecklistItems(nextChecklist)
        setNewChecklistItem('')
        saveChecklist(nextChecklist)
    }

    const handleStartEditChecklistItem = (item) => {
        setEditingChecklistItem(item.text)
        setEditingChecklistValue(item.text)
    }

    const handleCancelEditChecklistItem = () => {
        setEditingChecklistItem('')
        setEditingChecklistValue('')
    }

    const handleSaveChecklistItem = (item) => {
        const nextItem = editingChecklistValue.trim()

        if (!nextItem) {
            return
        }

        const nextChecklist = checklistItems.map((checklistItem) =>
            checklistItem.text === item.text
                ? { ...checklistItem, text: nextItem }
                : checklistItem,
        )

        setChecklistItems(nextChecklist)
        handleCancelEditChecklistItem()
        saveChecklist(nextChecklist)
    }

    const handleDeleteChecklistItem = (item) => {
        const nextChecklist = checklistItems.filter(
            (checklistItem) => checklistItem.text !== item.text,
        )

        setChecklistItems(nextChecklist)

        if (editingChecklistItem === item.text) {
            handleCancelEditChecklistItem()
        }

        saveChecklist(nextChecklist)
    }

    const saveChecklist = async (nextChecklist) => {
        const token = localStorage.getItem('token')
        const previousChecklist = checklistItems

        if (!token) {
            navigate('/login')
            return
        }

        setIsSavingChecklist(true)
        setChecklistError('')

        try {
            const response = await fetch(`${API_URL}/trips/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ checklist: nextChecklist }),
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
                throw new Error(data.message || 'Checklist update failed')
            }

            setTrip(data.trip)
        } catch (error) {
            setChecklistItems(previousChecklist)
            setChecklistError(error.message)
        } finally {
            setIsSavingChecklist(false)
        }
    }

    const handleCreateActivity = async (event) => {
        event.preventDefault()
        setActivityError('')

        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        setIsSavingActivity(true)

        try {
            const payload = {
                title: activityFormData.title.trim(),
                description: activityFormData.description.trim(),
                date: activityFormData.date,
                time: activityFormData.time || undefined,
                location: activityFormData.location.trim(),
                cost: activityFormData.cost === '' ? 0 : Number(activityFormData.cost),
                type: activityFormData.type,
                trip: id,
            }

            const response = await fetch(`${API_URL}/activities`, {
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
                throw new Error(data.message || 'Activity creation failed')
            }

            setActivities((prevActivities) => {
                return [...prevActivities, data.activity].sort((firstActivity, secondActivity) => {
                    const dateDifference = new Date(firstActivity.date) - new Date(secondActivity.date)

                    if (dateDifference !== 0) {
                        return dateDifference
                    }

                    return (firstActivity.time || '').localeCompare(secondActivity.time || '')
                })
            })
            setActivityFormData(initialActivityFormData)
            setShowActivityForm(false)
        } catch (error) {
            setActivityError(error.message)
        } finally {
            setIsSavingActivity(false)
        }
    }

    const handleStartEditNotes = () => {
        setNotesValue(trip.notes || '')
        setNotesError('')
        setIsEditingNotes(true)
    }

    const handleCancelEditNotes = () => {
        setNotesValue(trip.notes || '')
        setNotesError('')
        setIsEditingNotes(false)
    }

    const handleSaveNotes = async (event) => {
        event.preventDefault()
        setNotesError('')

        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        setIsSavingNotes(true)

        try {
            const response = await fetch(`${API_URL}/trips/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notes: notesValue.trim() }),
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
                throw new Error(data.message || 'Notes update failed')
            }

            setTrip(data.trip)
            setNotesValue(data.trip.notes || '')
            setIsEditingNotes(false)
        } catch (error) {
            setNotesError(error.message)
        } finally {
            setIsSavingNotes(false)
        }
    }

    const handleDeleteActivity = async (activity) => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        setActivityActionError('')
        setDeletingActivityId(activity._id)

        try {
            const response = await fetch(`${API_URL}/activities/${activity._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
                throw new Error(data.message || 'Activity deletion failed')
            }

            setActivities((prevActivities) =>
                prevActivities.filter((item) => item._id !== activity._id),
            )
            setActivityToDelete(null)
        } catch (error) {
            setActivityActionError(error.message)
        } finally {
            setDeletingActivityId('')
        }
    }

    const handleDeleteTrip = async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        setDeleteTripError('')
        setIsDeletingTrip(true)

        try {
            const response = await fetch(`${API_URL}/trips/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
                throw new Error(data.message || 'Trip deletion failed')
            }

            navigate('/trips', {
                replace: true,
                state: { message: data.message || 'Trip deleted successfully' },
            })
        } catch (error) {
            setDeleteTripError(error.message)
        } finally {
            setIsDeletingTrip(false)
        }
    }

    const handleOpenDeleteTripDialog = () => {
        setDeleteTripError('')
        setIsDeleteTripDialogOpen(true)
    }

    const handleOpenDeleteActivityDialog = (activity) => {
        setActivityActionError('')
        setActivityToDelete(activity)
    }

    const handleCloseDeleteActivityDialog = () => {
        if (deletingActivityId) {
            return
        }

        setActivityActionError('')
        setActivityToDelete(null)
    }

    const handleConfirmDeleteChecklistItem = () => {
        if (!checklistItemToDelete) {
            return
        }

        handleDeleteChecklistItem(checklistItemToDelete)
        setChecklistItemToDelete(null)
    }

    const handleCloseDeleteTripDialog = () => {
        if (isDeletingTrip) {
            return
        }

        setDeleteTripError('')
        setIsDeleteTripDialogOpen(false)
    }

    return (
        <main className='min-h-[calc(100vh-65px)] bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8'>
            <section className='mx-auto max-w-7xl space-y-6'>
                {isLoading ? (
                    <TripDetailsMessage
                        message={<LoadingSpinner label='Loading trip...' />}
                    />
                ) : error ? (
                    <TripDetailsMessage isError message={error} />
                ) : !trip ? (
                    <TripDetailsMessage message='Trip not found.' />
                ) : (
                    <div className='space-y-6'>
                        <button
                            type='button'
                            onClick={() => navigate('/trips')}
                            className='inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/15 hover:text-white'
                        >
                            <ArrowLeft size={17} />
                            Back to trips
                        </button>

                        <section className='relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/40'>
                            {trip.coverImage?.url && (
                                <img
                                    src={trip.coverImage.url}
                                    alt={`${trip.destination} trip cover`}
                                    className='absolute inset-0 h-full w-full object-cover'
                                />
                            )}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 ${trip.coverImage?.url ? 'opacity-20' : ''}`}
                            />
                            <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(16,185,129,0.14),transparent_26%)]' />
                            {trip.coverImage?.url && (
                                <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-900/20' />
                            )}
                            <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent' />

                            <div
                                translate='no'
                                className='notranslate absolute right-4 top-4 z-20 sm:right-6 sm:top-6'
                            >
                                <label
                                    htmlFor='trip-cover-upload'
                                    aria-disabled={isUploadingCover}
                                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-slate-950/60 text-cyan-100 shadow-lg backdrop-blur transition hover:border-cyan-300/50 hover:bg-slate-900/80 ${isUploadingCover
                                        ? 'cursor-not-allowed opacity-60'
                                        : 'cursor-pointer'
                                        }`}
                                    aria-label='Change trip cover'
                                    title='Change trip cover'
                                >
                                    {isUploadingCover ? (
                                        <LoadingSpinner
                                            label='Uploading trip cover'
                                            showLabel={false}
                                            size={17}
                                        />
                                    ) : (
                                        <Camera size={19} />
                                    )}
                                </label>
                                <input
                                    id='trip-cover-upload'
                                    type='file'
                                    accept='image/jpeg,image/png,image/webp'
                                    onChange={handleCoverChange}
                                    disabled={isUploadingCover}
                                    className='sr-only'
                                />
                            </div>

                            <div className='relative z-10 flex min-h-[18rem] flex-col justify-end p-5 sm:min-h-[22rem] sm:p-8'>
                                <div className='max-w-4xl'>
                                    <p className='w-fit rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-200'>
                                        Confirmed
                                    </p>

                                    <p className='mt-6 text-sm font-bold uppercase tracking-wide text-cyan-200'>
                                        {trip.destination}
                                    </p>

                                    <h1 className='mt-3 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl'>
                                        {trip.title}
                                    </h1>

                                    <div className='mt-4 flex items-start gap-2 text-sm font-semibold text-slate-200 sm:items-center sm:text-base'>
                                        <CalendarDays size={18} className='mt-0.5 shrink-0 sm:mt-0' />
                                        <p>
                                            <span>{formatDate(trip.startDate)}</span>
                                            <span className='block sm:inline'> - {formatDate(trip.endDate)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </section>

                        {coverSuccess && (
                            <div className='rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200'>
                                {coverSuccess}
                            </div>
                        )}

                        {coverError && (
                            <div className='rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-200'>
                                {coverError}
                            </div>
                        )}

                        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                            <DetailBox
                                icon={MapPin}
                                label='Destination'
                                value={trip.destination}
                            />
                            <DetailBox
                                icon={Wallet}
                                label='Budget'
                                value={formatCurrency(trip.budget)}
                            />
                            <DetailBox
                                icon={ListChecks}
                                label='Activities'
                                value={activities.length}
                            />
                            <DetailBox
                                icon={Wallet}
                                label='Activity costs'
                                value={formatCurrency(totalActivitiesCost)}
                            />
                        </section>

                        <section className='grid gap-6 lg:grid-cols-[1fr_20rem]'>
                            <div className='space-y-6'>
                                <article className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6'>
                                    <div className='flex items-start justify-between gap-4'>
                                        <div className='flex items-center gap-3'>
                                            <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200'>
                                                <FileText size={20} />
                                            </span>
                                            <div>
                                                <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                                                    Trip notes
                                                </p>
                                                <h2 className='text-2xl font-black'>Overview</h2>
                                            </div>
                                        </div>

                                        {!isEditingNotes && (
                                            <button
                                                type='button'
                                                onClick={handleStartEditNotes}
                                                className='flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-cyan-100 transition hover:border-cyan-400/30 hover:bg-white/15'
                                                aria-label='Edit notes'
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {isEditingNotes ? (
                                        <form onSubmit={handleSaveNotes} className='mt-5'>
                                            <textarea
                                                value={notesValue}
                                                onChange={(event) => setNotesValue(event.target.value)}
                                                rows='4'
                                                placeholder='Hotel ideas, transport details and useful reminders...'
                                                className='w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/15'
                                            />

                                            {notesError && (
                                                <p className='mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>
                                                    {notesError}
                                                </p>
                                            )}

                                            <div className='mt-3 flex flex-wrap gap-2'>
                                                <button
                                                    type='submit'
                                                    disabled={isSavingNotes}
                                                    className='inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70'
                                                >
                                                    {isSavingNotes ? (
                                                        <LoadingSpinner label='Saving...' size={16} />
                                                    ) : (
                                                        <>
                                                            <Check size={16} /> Save notes
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type='button'
                                                    onClick={handleCancelEditNotes}
                                                    disabled={isSavingNotes}
                                                    className='inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70'
                                                >
                                                    <X size={16} /> Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <p className='mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300'>
                                            {trip.notes || 'No notes yet. Add hotel ideas, transport details or useful reminders.'}
                                        </p>
                                    )}
                                </article>

                                <article className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl sm:p-6'>
                                    <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
                                        <div>
                                            <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                                                Itinerary
                                            </p>
                                            <h2 className='mt-2 text-2xl font-black'>
                                                Day by day
                                            </h2>
                                        </div>

                                        <button
                                            type='button'
                                            onClick={() => setShowActivityForm((prevValue) => !prevValue)}
                                            className='inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/15 hover:text-white'
                                        >
                                            <Plus size={16} />
                                            {showActivityForm ? 'Close form' : 'Add activity'}
                                        </button>
                                    </div>

                                    {showActivityForm && (
                                        <ActivityForm
                                            error={activityError}
                                            formData={activityFormData}
                                            isLoading={isSavingActivity}
                                            onChange={handleActivityChange}
                                            onSubmit={handleCreateActivity}
                                            trip={trip}
                                        />
                                    )}

                                    {activityActionError && (
                                        <p className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>
                                            {activityActionError}
                                        </p>
                                    )}

                                    {activities.length > 0 ? (
                                        <div className='mt-6 space-y-5'>
                                            {Object.entries(activitiesByDate).map(
                                                ([date, dayActivities], dayIndex) => (
                                                    <div key={date} className='grid gap-4 sm:grid-cols-[5rem_1fr]'>
                                                        <div>
                                                            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black text-white'>
                                                                {dayIndex + 1}
                                                            </div>
                                                            <p className='mt-2 text-xs font-bold text-slate-400'>
                                                                {date}
                                                            </p>
                                                        </div>

                                                        <div className='space-y-3'>
                                                            {dayActivities.map((activity) =>
                                                                editingActivityId === activity._id ? (
                                                                    <ActivityForm
                                                                        error={activityEditError}
                                                                        formData={editingActivityFormData}
                                                                        formIdPrefix={`edit-${activity._id}`}
                                                                        isEditing
                                                                        isLoading={isSavingActivityEdit}
                                                                        key={activity._id}
                                                                        onCancel={handleCancelEditActivity}
                                                                        onChange={handleEditActivityChange}
                                                                        onSubmit={handleUpdateActivity}
                                                                        submitLabel='Save changes'
                                                                        trip={trip}
                                                                    />
                                                                ) : (
                                                                    <ActivityCard
                                                                        activity={activity}
                                                                        isDeleting={deletingActivityId === activity._id}
                                                                        key={activity._id}
                                                                        onDelete={() => handleOpenDeleteActivityDialog(activity)}
                                                                        onEdit={() => handleStartEditActivity(activity)}
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className='mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.05] p-6'>
                                            <p className='text-sm font-bold text-white'>
                                                No activities yet
                                            </p>
                                            <p className='mt-2 text-sm leading-6 text-slate-400'>
                                                Activities will appear here once you add them to this
                                                trip.
                                            </p>
                                        </div>
                                    )}
                                </article>
                            </div>

                            <aside className='space-y-4'>
                                <ChecklistCard
                                    editingItem={editingChecklistItem}
                                    editingValue={editingChecklistValue}
                                    error={checklistError}
                                    isSaving={isSavingChecklist}
                                    items={checklistItems}
                                    newItem={newChecklistItem}
                                    onAdd={handleAddChecklistItem}
                                    onCancelEdit={handleCancelEditChecklistItem}
                                    onChangeEditingValue={setEditingChecklistValue}
                                    onChangeNewItem={setNewChecklistItem}
                                    onDelete={setChecklistItemToDelete}
                                    onSaveEdit={handleSaveChecklistItem}
                                    onStartEdit={handleStartEditChecklistItem}
                                    onToggle={handleToggleChecklistItem}
                                />

                                <section className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl'>
                                    <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                                        Spending
                                    </p>
                                    <h2 className='mt-2 text-2xl font-black'>
                                        {formatCurrency(totalActivitiesCost)}
                                    </h2>
                                    <p className='mt-2 text-sm leading-6 text-slate-400'>
                                        Total planned activity costs.
                                    </p>

                                    <div className='mt-5 space-y-3'>
                                        <SpendingRow
                                            label='Trip budget'
                                            value={formatCurrency(trip.budget)}
                                        />
                                        <SpendingRow
                                            label='Remaining'
                                            value={formatCurrency((trip.budget || 0) - totalActivitiesCost)}
                                        />
                                    </div>
                                </section>

                                <section className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl'>
                                    <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                                        Actions
                                    </p>

                                    <div className='mt-4 space-y-3'>
                                        <button
                                            type='button'
                                            disabled={isDeletingTrip}
                                            onClick={handleOpenDeleteTripDialog}
                                            className='flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition-all duration-300 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-70'
                                        >
                                            <Trash2 size={17} />
                                            {isDeletingTrip ? 'Deleting...' : 'Delete trip'}
                                        </button>
                                    </div>
                                </section>
                            </aside>
                        </section>
                    </div>
                )}
            </section>

            {isDeleteTripDialogOpen && trip && (
                <DeleteConfirmationDialog
                    error={deleteTripError}
                    isDeleting={isDeletingTrip}
                    onClose={handleCloseDeleteTripDialog}
                    onConfirm={handleDeleteTrip}
                    title='Delete this trip?'
                >
                    <span className='font-bold text-white'>{trip.title}</span> and all its activities
                    will be permanently deleted. This action cannot be undone.
                </DeleteConfirmationDialog>
            )}

            {activityToDelete && (
                <DeleteConfirmationDialog
                    error={activityActionError}
                    isDeleting={deletingActivityId === activityToDelete._id}
                    onClose={handleCloseDeleteActivityDialog}
                    onConfirm={() => handleDeleteActivity(activityToDelete)}
                    title='Delete this activity?'
                >
                    <span className='font-bold text-white'>{activityToDelete.title}</span> will be
                    permanently removed from this itinerary.
                </DeleteConfirmationDialog>
            )}

            {checklistItemToDelete && (
                <DeleteConfirmationDialog
                    confirmLabel='Delete item'
                    isDeleting={false}
                    onClose={() => setChecklistItemToDelete(null)}
                    onConfirm={handleConfirmDeleteChecklistItem}
                    title='Delete this checklist item?'
                >
                    <span className='font-bold text-white'>{checklistItemToDelete.text}</span> will be
                    removed from your trip checklist.
                </DeleteConfirmationDialog>
            )}
        </main>
    )
}

const DeleteConfirmationDialog = ({
    children,
    confirmLabel = 'Delete permanently',
    error,
    isDeleting,
    onClose,
    onConfirm,
    title,
}) => {
    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm'>
            <section
                role='dialog'
                aria-modal='true'
                aria-labelledby='delete-confirmation-title'
                className='w-full max-w-md rounded-3xl border border-red-400/20 bg-slate-900 p-5 shadow-2xl shadow-slate-950/60 sm:p-6'
            >
                <div className='flex items-start justify-between gap-4'>
                    <div>
                        <p className='text-sm font-bold uppercase tracking-wide text-red-300'>
                            Danger zone
                        </p>
                        <h2 id='delete-confirmation-title' className='mt-2 text-2xl font-black text-white'>
                            {title}
                        </h2>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={isDeleting}
                        aria-label='Close delete confirmation dialog'
                        className='flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className='mt-4 text-sm leading-6 text-slate-300'>
                    {children}
                </p>

                {error && (
                    <p className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>
                        {error}
                    </p>
                )}

                <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                    <button
                        type='button'
                        onClick={onClose}
                        disabled={isDeleting}
                        className='cursor-pointer rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className='inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-70'
                    >
                        {isDeleting ? (
                            <LoadingSpinner label='Deleting...' size={17} />
                        ) : (
                            <>
                                <Trash2 size={17} /> {confirmLabel}
                            </>
                        )}
                    </button>
                </div>
            </section>
        </div>
    )
}

const ActivityCard = ({ activity, isDeleting, onDelete, onEdit }) => {
    return (
        <article className='rounded-2xl border border-white/10 bg-white/[0.06] p-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0'>
                    <p className='truncate text-base font-black text-white'>
                        {activity.title}
                    </p>
                    {activity.location && (
                        <p className='mt-1 text-sm font-semibold text-cyan-100'>
                            {activity.location}
                        </p>
                    )}
                </div>

                <div className='flex items-center gap-2'>
                    <span className='w-fit rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-bold capitalize text-slate-300'>
                        {activity.type}
                    </span>
                    <button
                        type='button'
                        onClick={onEdit}
                        className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/15'
                        aria-label={`Edit ${activity.title}`}
                    >
                        <Pencil size={15} />
                    </button>
                    <button
                        type='button'
                        onClick={onDelete}
                        disabled={isDeleting}
                        className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60'
                        aria-label={`Delete ${activity.title}`}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {activity.description && (
                <p className='mt-3 text-sm leading-6 text-slate-300'>
                    {activity.description}
                </p>
            )}

            {activity.time && (
                <p className='mt-3 flex items-center gap-2 text-sm font-bold text-cyan-100'>
                    <Clock size={16} />
                    {activity.time}
                </p>
            )}

            <p className='mt-3 text-sm font-bold text-slate-400'>
                Cost: {formatCurrency(activity.cost)}
            </p>
        </article>
    )
}

const ActivityForm = ({
    error,
    formData,
    formIdPrefix = 'activity',
    isEditing = false,
    isLoading,
    onCancel,
    onChange,
    onSubmit,
    submitLabel = 'Save activity',
    trip,
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className='mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4'
        >
            <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                    id={`${formIdPrefix}-title`}
                    label='Title'
                    name='title'
                    onChange={onChange}
                    placeholder='Visit the museum'
                    required
                    value={formData.title}
                />

                <FormField
                    id={`${formIdPrefix}-location`}
                    label='Location'
                    name='location'
                    onChange={onChange}
                    placeholder='City center'
                    value={formData.location}
                />

                <FormField
                    id={`${formIdPrefix}-date`}
                    label='Date'
                    max={formatDateInput(trip.endDate)}
                    min={formatDateInput(trip.startDate)}
                    name='date'
                    onChange={onChange}
                    required
                    type='date'
                    value={formData.date}
                />

                <FormField
                    id={`${formIdPrefix}-time`}
                    label='Time'
                    name='time'
                    onChange={onChange}
                    type='time'
                    value={formData.time}
                />

                <FormField
                    id={`${formIdPrefix}-cost`}
                    label='Cost'
                    min='0'
                    name='cost'
                    onChange={onChange}
                    placeholder='50'
                    type='number'
                    value={formData.cost}
                />

                <div>
                    <label
                        htmlFor={`${formIdPrefix}-type`}
                        className='text-sm font-bold text-slate-200'
                    >
                        Type
                    </label>
                    <select
                        id={`${formIdPrefix}-type`}
                        name='type'
                        value={formData.type}
                        onChange={onChange}
                        className='mt-2 w-full cursor-pointer rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300'
                    >
                        <option value='transport'>Transport</option>
                        <option value='hotel'>Hotel</option>
                        <option value='food'>Food</option>
                        <option value='visit'>Visit</option>
                        <option value='other'>Other</option>
                    </select>
                </div>
            </div>

            <div className='mt-4'>
                <label
                    htmlFor={`${formIdPrefix}-description`}
                    className='text-sm font-bold text-slate-200'
                >
                    Description
                </label>
                <textarea
                    id={`${formIdPrefix}-description`}
                    name='description'
                    value={formData.description}
                    onChange={onChange}
                    rows='3'
                    placeholder='Useful notes for this activity...'
                    className='mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/15'
                />
            </div>

            {error && (
                <p className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200'>
                    {error}
                </p>
            )}

            <div className='mt-5 flex flex-wrap gap-2'>
                <button
                    type='submit'
                    disabled={isLoading}
                    className='inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70'
                >
                    {isLoading ? (
                        <LoadingSpinner label='Saving...' size={17} />
                    ) : (
                        <>
                            {isEditing ? <Check size={17} /> : <Plus size={17} />}
                            {submitLabel}
                        </>
                    )}
                </button>

                {onCancel && (
                    <button
                        type='button'
                        onClick={onCancel}
                        disabled={isLoading}
                        className='inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70'
                    >
                        <X size={17} /> Cancel
                    </button>
                )}
            </div>
        </form>
    )
}

const ChecklistCard = ({
    editingItem,
    editingValue,
    error,
    isSaving,
    items,
    newItem,
    onAdd,
    onCancelEdit,
    onChangeEditingValue,
    onChangeNewItem,
    onDelete,
    onSaveEdit,
    onStartEdit,
    onToggle,
}) => {
    return (
        <section className='rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur-xl'>
            <div className='flex items-center gap-3'>
                <span className='flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-200'>
                    <CheckSquare size={19} />
                </span>
                <div>
                    <p className='text-sm font-bold uppercase tracking-wide text-cyan-200'>
                        Checklist
                    </p>
                    <p className='text-xs font-semibold text-slate-400'>
                        {isSaving ? (
                            <LoadingSpinner label='Saving checklist...' size={14} />
                        ) : (
                            'Saved with this trip'
                        )}
                    </p>
                </div>
            </div>

            {error && (
                <p className='mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200'>
                    {error}
                </p>
            )}

            <form onSubmit={onAdd} className='mt-5 flex gap-2'>
                <input
                    type='text'
                    value={newItem}
                    onChange={(event) => onChangeNewItem(event.target.value)}
                    disabled={isSaving}
                    placeholder='Add checklist item'
                    className='min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60'
                />
                <button
                    type='submit'
                    disabled={isSaving}
                    className='flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'
                >
                    <Plus size={18} />
                </button>
            </form>

            <div className='mt-5 space-y-3'>
                {items.map((item) => {
                    const isEditing = editingItem === item.text

                    return (
                        <div
                            key={item.text}
                            className='rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5 transition-all duration-300 hover:bg-white/10'
                        >
                            {isEditing ? (
                                <div className='flex items-center gap-2'>
                                    <input
                                        type='text'
                                        value={editingValue}
                                        onChange={(event) =>
                                            onChangeEditingValue(event.target.value)
                                        }
                                        disabled={isSaving}
                                        className='min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-60'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => onSaveEdit(item)}
                                        disabled={isSaving}
                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-emerald-400 text-slate-950 disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        type='button'
                                        onClick={onCancelEdit}
                                        disabled={isSaving}
                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200 disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className='flex items-center gap-3'>
                                    <label className='flex min-w-0 flex-1 cursor-pointer items-center gap-3'>
                                        <input
                                            type='checkbox'
                                            checked={item.isCompleted}
                                            onChange={() => onToggle(item)}
                                            disabled={isSaving}
                                            className='h-4 w-4 shrink-0 cursor-pointer accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-60'
                                        />
                                        <span
                                            className={`min-w-0 break-words text-sm font-semibold ${item.isCompleted
                                                ? 'text-white'
                                                : 'text-slate-400'
                                                }`}
                                        >
                                            {item.text}
                                        </span>
                                    </label>

                                    <button
                                        type='button'
                                        onClick={() => onStartEdit(item)}
                                        disabled={isSaving}
                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 transition-all duration-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => onDelete(item)}
                                        disabled={isSaving}
                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 transition-all duration-300 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60'
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

const DetailBox = ({ icon: Icon, label, value }) => {
    return (
        <div className='min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/25 backdrop-blur-xl sm:p-5'>
            <div className='flex items-center gap-3'>
                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-200'>
                    <Icon size={19} />
                </span>
                <div className='min-w-0'>
                    <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                        {label}
                    </p>
                    <p className='mt-1 truncate text-lg font-black text-white'>{value}</p>
                </div>
            </div>
        </div>
    )
}

const FormField = ({
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
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className='mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/15'
                {...inputProps}
            />
        </div>
    )
}

const SpendingRow = ({ label, value }) => {
    return (
        <div className='flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3'>
            <p className='text-sm font-semibold text-slate-300'>{label}</p>
            <p className='text-sm font-black text-white'>{value}</p>
        </div>
    )
}

const TripDetailsMessage = ({ message, isError = false }) => {
    return (
        <div
            className={`rounded-3xl border p-6 text-sm font-semibold shadow-xl ${isError
                ? 'border-red-400/30 bg-red-500/10 text-red-200'
                : 'border-white/10 bg-slate-900/70 text-slate-300'
                }`}
        >
            {message}
        </div>
    )
}

const formatDate = (date) => {
    if (!date) {
        return 'Date not set'
    }

    return new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}

const formatDateInput = (date) => {
    if (!date) {
        return ''
    }

    return new Date(date).toISOString().slice(0, 10)
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en', {
        currency: 'EUR',
        maximumFractionDigits: 0,
        style: 'currency',
    }).format(amount || 0)
}

export default TripDetails
