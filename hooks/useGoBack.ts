'use client'
import { useRouter } from 'next/navigation'

const useGoBack = () => {
  const router = useRouter()

  const goBack = () => {
    router.back()
  }

  return goBack
}

export default useGoBack
