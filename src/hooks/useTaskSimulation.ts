import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useInterval } from './useInterval'

export function useTaskSimulation() {
  const advance = useAppStore((state) => state.advanceRunningTasks)
  const running = useAppStore((state) => state.tasks.some((t) => t.status === 'running' || t.status === 'queued'))

  useInterval(
    () => {
      advance()
    },
    running ? 1000 : null
  )

  // seed queued tasks to start on mount
  useEffect(() => {
    advance()
  }, [advance])
}
