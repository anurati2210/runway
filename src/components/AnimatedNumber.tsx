import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { rupee } from './format'

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)
  const reduce = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduce) {
      node.textContent = rupee(value)
      prev.current = value
      return
    }
    const controls = animate(prev.current, value, {
      duration: 0.6,
      onUpdate: (v) => {
        node.textContent = rupee(v)
      },
    })
    prev.current = value
    return () => controls.stop()
  }, [value, reduce])

  return <span ref={ref}>{rupee(value)}</span>
}