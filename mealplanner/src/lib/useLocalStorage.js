import { useEffect, useState, useCallback } from 'react'

/**
 * 把状态同步到 localStorage 的 hook
 * @param {string} key 存储键
 * @param {*} initialValue 初始值 / 函数
 * @param {{ version?: number, migrate?: (old, oldVersion) => any }} [opts]
 */
export function useLocalStorage(key, initialValue, opts = {}) {
  const { version = 1, migrate } = opts
  const storageKey = `mealplanner:${key}:v${version}`

  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw === null) {
        return typeof initialValue === 'function' ? initialValue() : initialValue
      }
      const parsed = JSON.parse(raw)
      // 旧版本迁移
      if (migrate) {
        const oldKey = `mealplanner:${key}`
        const oldRaw = window.localStorage.getItem(oldKey)
        if (oldRaw !== null && raw === null) {
          const oldParsed = JSON.parse(oldRaw)
          return migrate(oldParsed, version - 1)
        }
      }
      return parsed
    } catch (e) {
      console.warn('[useLocalStorage] read failed:', key, e)
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
  }, [storageKey, initialValue, migrate, key, version])

  const [value, setValue] = useState(readValue)

  // 同步到 localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    } catch (e) {
      console.warn('[useLocalStorage] write failed:', key, e)
    }
  }, [storageKey, value, key])

  // 跨标签页同步
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === storageKey && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue))
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey])

  return [value, setValue]
}

/**
 * 重置某个键的所有版本
 */
export function clearLocalStorage(key) {
  if (typeof window === 'undefined') return
  for (let v = 1; v <= 5; v++) {
    window.localStorage.removeItem(`mealplanner:${key}:v${v}`)
  }
  window.localStorage.removeItem(`mealplanner:${key}`)
}
