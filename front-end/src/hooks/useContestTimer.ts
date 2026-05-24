import { useEffect, useState } from 'react'

export function useContestTimer(endAt: string) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('Ended')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endAt])

  return remaining
}
