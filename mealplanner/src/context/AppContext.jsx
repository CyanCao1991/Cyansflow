import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useLocalStorage } from '../lib/useLocalStorage'
import { SEED_INVENTORY, SEED_RECIPES, SEED_PREFERENCE } from '../lib/seedData'
import { uid } from '../lib/utils'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [inventory, setInventory] = useLocalStorage('inventory', SEED_INVENTORY, { version: 1 })
  const [recipes, setRecipes]   = useLocalStorage('recipes',   SEED_RECIPES,    { version: 1 })
  const [preference, setPreference] = useLocalStorage('preference', SEED_PREFERENCE, { version: 1 })
  const [plans, setPlans]       = useLocalStorage('plans', [], { version: 1 })

  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, type = 'info') => {
    const id = uid('toast')
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id))
    }, 2400)
  }, [])
  const dismissToast = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])

  // —— Inventory Actions ——
  const addIngredient = useCallback(item => {
    setInventory(list => [...list, { ...item, id: item.id || uid('ing') }])
    toast(`已添加「${item.name}」`, 'success')
  }, [setInventory, toast])

  const updateIngredient = useCallback((id, patch) => {
    setInventory(list => list.map(it => it.id === id ? { ...it, ...patch } : it))
  }, [setInventory])

  const removeIngredient = useCallback(id => {
    setInventory(list => list.filter(it => it.id !== id))
    toast('已删除食材', 'info')
  }, [setInventory, toast])

  // —— Recipe Actions ——
  const addRecipe = useCallback(r => {
    setRecipes(list => [...list, { ...r, id: r.id || uid('rec') }])
    toast(`已添加食谱「${r.name}」`, 'success')
  }, [setRecipes, toast])

  const updateRecipe = useCallback((id, patch) => {
    setRecipes(list => list.map(r => r.id === id ? { ...r, ...patch } : r))
  }, [setRecipes])

  const removeRecipe = useCallback(id => {
    setRecipes(list => list.filter(r => r.id !== id))
    toast('已删除食谱', 'info')
  }, [setRecipes, toast])

  // —— Preference Actions ——
  const updatePreference = useCallback(patch => {
    setPreference(p => ({ ...p, ...patch }))
  }, [setPreference])

  // —— Plan Actions ——
  const savePlan = useCallback(plan => {
    setPlans(list => {
      const idx = list.findIndex(p => p.id === plan.id || p.date === plan.date)
      if (idx >= 0) {
        const next = [...list]
        next[idx] = { ...plan, id: list[idx].id }
        return next
      }
      return [{ ...plan, id: plan.id || uid('plan') }, ...list].slice(0, 30)
    })
    toast('计划已保存', 'success')
  }, [setPlans, toast])

  const removePlan = useCallback(id => {
    setPlans(list => list.filter(p => p.id !== id))
    toast('已删除计划', 'info')
  }, [setPlans, toast])

  const resetAll = useCallback(() => {
    setInventory(SEED_INVENTORY)
    setRecipes(SEED_RECIPES)
    setPreference(SEED_PREFERENCE)
    setPlans([])
    toast('已重置为示例数据', 'info')
  }, [setInventory, setRecipes, setPreference, setPlans, toast])

  const value = useMemo(() => ({
    inventory, recipes, preference, plans,
    toasts, toast, dismissToast,
    addIngredient, updateIngredient, removeIngredient,
    addRecipe, updateRecipe, removeRecipe,
    updatePreference, savePlan, removePlan, resetAll,
  }), [
    inventory, recipes, preference, plans, toasts,
    toast, dismissToast, addIngredient, updateIngredient, removeIngredient,
    addRecipe, updateRecipe, removeRecipe, updatePreference, savePlan, removePlan, resetAll,
  ])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
