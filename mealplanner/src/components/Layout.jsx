import { DesktopNav, MobileNav, MobileHeader } from './Sidebar'

export default function Layout({ current, onNavigate, children }) {
  return (
    <div className="min-h-screen flex">
      <DesktopNav current={current} onNavigate={onNavigate} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileHeader />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
      <MobileNav current={current} onNavigate={onNavigate} />
    </div>
  )
}
