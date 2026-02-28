import { useState, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

const THRESHOLD = 80

export default function PullToRefresh({ children }) {
  const queryClient = useQueryClient()
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const isDragging = useRef(false)

  const canPull = () => {
    return window.scrollY <= 0
  }

  const handleTouchStart = useCallback((e) => {
    if (canPull() && !refreshing) {
      startY.current = e.touches[0].clientY
      isDragging.current = true
    }
  }, [refreshing])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current || refreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0 && canPull()) {
      // Apply resistance — pull distance decreases as you pull further
      const distance = Math.min(diff * 0.4, 120)
      setPullDistance(distance)
      setPulling(true)
    } else {
      setPullDistance(0)
      setPulling(false)
    }
  }, [refreshing])

  const handleTouchEnd = useCallback(async () => {
    isDragging.current = false

    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullDistance(THRESHOLD * 0.5)
      try {
        await queryClient.invalidateQueries()
      } finally {
        setRefreshing(false)
      }
    }

    setPullDistance(0)
    setPulling(false)
  }, [pullDistance, refreshing, queryClient])

  const progress = Math.min(pullDistance / THRESHOLD, 1)
  const showIndicator = pulling || refreshing

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-full"
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: showIndicator ? `${Math.max(pullDistance, refreshing ? 40 : 0)}px` : 0 }}
      >
        <RefreshCw
          className="w-5 h-5 text-primary-500 transition-transform"
          style={{
            transform: `rotate(${progress * 360}deg)`,
            opacity: progress,
            animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
          }}
        />
      </div>

      {children}
    </div>
  )
}
