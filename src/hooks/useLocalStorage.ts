import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T, parse?: (value: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      if (!saved) return initialValue
      const decoded: unknown = JSON.parse(saved)
      return parse ? parse(decoded) : decoded as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 浏览器禁用存储或空间不足时，当前会话仍保持可用。
    }
  }, [key, value])

  return [value, setValue] as const
}
