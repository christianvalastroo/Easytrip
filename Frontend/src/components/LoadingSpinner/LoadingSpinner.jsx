import { LoaderCircle } from 'lucide-react'

const LoadingSpinner = ({ label = 'Loading...', size = 20 }) => {
  return (
    <span
      role='status'
      aria-live='polite'
      className='inline-flex items-center gap-2'
    >
      <LoaderCircle aria-hidden='true' className='animate-spin' size={size} />
      <span>{label}</span>
    </span>
  )
}

export default LoadingSpinner
