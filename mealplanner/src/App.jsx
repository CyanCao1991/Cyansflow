import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import ToastStack from './components/Toast'
import PlannerPage from './pages/PlannerPage'
import InventoryPage from './pages/InventoryPage'
import RecipesPage from './pages/RecipesPage'
import PreferencesPage from './pages/PreferencesPage'
import { useLocalStorage } from './lib/useLocalStorage'

const PAGES = {
  planner: PlannerPage,
  inventory: InventoryPage,
  recipes: RecipesPage,
  preferences: PreferencesPage,
}

export default function App() {
  const [page, setPage] = useLocalStorage('current-page', 'planner', { version: 1 })
  const CurrentPage = PAGES[page] || PlannerPage

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  return (
    <>
      <Layout current={page} onNavigate={setPage}>
        <CurrentPage />
      </Layout>
      <ToastStack />
    </>
  )
}
