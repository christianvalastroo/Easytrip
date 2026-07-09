import { useEffect, useMemo, useState } from 'react'
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckSquare,
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
    const [showActivityForm, setShowActivityForm] = useState(false)
    const [checklistItems, setChecklistItems] = useState(defaultChecklist)
    const [newChecklistItem, setNewChecklistItem] = useState('')
    const [editingChecklistItem, setEditingChecklistItem] = useState('')
    const [editingChecklistValue, setEditingChecklistValue] = useState('')

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

        if (!token) {
            navigate('/login')
            return
        }

        setIsSavingChecklist(true)

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
            setError(error.message)
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
                    return new Date(firstActivity.date) - new Date(secondActivity.date)
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

    const handleDeleteTrip = async () => {
        const shouldDelete = window.confirm('Delete this trip and all its activities?')

        if (!shouldDelete) {
            return
        }

        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

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

            navigate('/trips')
        } catch (error) {
            setError(error.message)
            setIsDeletingTrip(false)
        }
    }

    return (
        <main className='min-h-[calc(100vh-65px)] bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8'>
            <section className='mx-auto max-w-7xl space-y-6'>
                {isLoading ? (
                    <TripDetailsMessage message='Loading trip...' />
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
                            <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900' />
                            <div className='absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(16,185,129,0.14),transparent_26%)]' />
                            <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent' />

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

                                    <p className='mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-200 sm:text-base'>
                                        <CalendarDays size={18} />
                                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                    </p>
                                </div>
                            </div>

                        </section>

                        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                            <DetailBox
                                icon={MapPin}
                                label='Destination'
                                value={trip.destination}
                            />
                            <DetailBox
                                icon={CalendarDays}
                                label='Dates'
                                value={`${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`}
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
                                    <div className='flex items-center gap-3'>
                                        <span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-200'>
                                            <FileText size={20} />
                                        </span>
                                        <div>
                                            <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                                                Trip notes
                                            </p>
                                            <h2 className='text-2xl font-black'>Overview</h2>
                                        </div>
                                    </div>

                                    <p className='mt-5 text-sm leading-7 text-slate-300'>
                                        {trip.notes ||
                                            'No notes yet. Use this space later for hotel ideas, transport details, places to visit and useful reminders.'}
                                    </p>
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
                                                            {dayActivities.map((activity) => (
                                                                <ActivityCard
                                                                    activity={activity}
                                                                    key={activity._id}
                                                                />
                                                            ))}
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
                                    isSaving={isSavingChecklist}
                                    items={checklistItems}
                                    newItem={newChecklistItem}
                                    onAdd={handleAddChecklistItem}
                                    onCancelEdit={handleCancelEditChecklistItem}
                                    onChangeEditingValue={setEditingChecklistValue}
                                    onChangeNewItem={setNewChecklistItem}
                                    onDelete={handleDeleteChecklistItem}
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
                                            onClick={handleDeleteTrip}
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
        </main>
    )
}

const ActivityCard = ({ activity }) => {
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

                <span className='w-fit rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-bold capitalize text-slate-300'>
                    {activity.type}
                </span>
            </div>

            {activity.description && (
                <p className='mt-3 text-sm leading-6 text-slate-300'>
                    {activity.description}
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
    isLoading,
    onChange,
    onSubmit,
    trip,
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className='mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4'
        >
            <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                    id='activity-title'
                    label='Title'
                    name='title'
                    onChange={onChange}
                    placeholder='Visit the museum'
                    required
                    value={formData.title}
                />

                <FormField
                    id='activity-location'
                    label='Location'
                    name='location'
                    onChange={onChange}
                    placeholder='City center'
                    value={formData.location}
                />

                <FormField
                    id='activity-date'
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
                    id='activity-cost'
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
                        htmlFor='activity-type'
                        className='text-sm font-bold text-slate-200'
                    >
                        Type
                    </label>
                    <select
                        id='activity-type'
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
                    htmlFor='activity-description'
                    className='text-sm font-bold text-slate-200'
                >
                    Description
                </label>
                <textarea
                    id='activity-description'
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

            <button
                type='submit'
                disabled={isLoading}
                className='mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70'
            >
                <Plus size={17} />
                {isLoading ? 'Saving...' : 'Save activity'}
            </button>
        </form>
    )
}

const ChecklistCard = ({
    editingItem,
    editingValue,
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
                        {isSaving ? 'Saving checklist...' : 'Saved with this trip'}
                    </p>
                </div>
            </div>

            <form onSubmit={onAdd} className='mt-5 flex gap-2'>
                <input
                    type='text'
                    value={newItem}
                    onChange={(event) => onChangeNewItem(event.target.value)}
                    placeholder='Add checklist item'
                    className='min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/15'
                />
                <button
                    type='submit'
                    className='flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 transition-all duration-300 hover:-translate-y-0.5'
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
                                        className='min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => onSaveEdit(item)}
                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-emerald-400 text-slate-950'
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        type='button'
                                        onClick={onCancelEdit}
                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200'
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
                                            className='h-4 w-4 shrink-0 cursor-pointer accent-cyan-400'
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
                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-300 transition-all duration-300 hover:text-white'
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => onDelete(item)}
                                        className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 transition-all duration-300 hover:bg-red-500/15'
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
        <div className='rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/25 backdrop-blur-xl sm:p-5'>
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
