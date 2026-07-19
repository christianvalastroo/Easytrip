import { LoaderCircle } from 'lucide-react'

const LoadingSpinner = ({ label = 'Loading...', showLabel = true, size = 20 }) => {
  return (
    <span
      role='status'
      aria-live='polite'
      translate='no'
      className={`notranslate inline-flex items-center ${showLabel ? 'gap-2' : ''}`}
    >
      <LoaderCircle aria-hidden='true' className='animate-spin' size={size} />
      <span className={showLabel ? '' : 'sr-only'}>{label}</span>
    </span>
  )
}

export default LoadingSpinner
