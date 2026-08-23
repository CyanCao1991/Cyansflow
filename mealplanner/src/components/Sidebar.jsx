import { Soup, Carrot, BookOpen, Sliders, ChefHat } from 'lucide-react'

export const NAV_ITEMS = [
  { key: 'planner', label: '今日计划', short: '计划', icon: Soup, color: 'olive' },
  { key: 'inventory', label: '食材库存', short: '食材', icon: Carrot, color: 'pumpkin' },
  { key: 'recipes', label: '食谱库', short: '食谱', icon: BookOpen, color: 'skyhaze' },
  { key: 'preferences', label: '偏好设置', short: '偏好', icon: Sliders, color: 'cacao' },
]

const ACCENT_BG = {
  olive: 'bg-olive-100 text-olive-700',
  pumpkin: 'bg-pumpkin-100 text-pumpkin-600',
  skyhaze: 'bg-skyhaze-400/20 text-skyhaze-500',
  cacao: 'bg-cream-300 text-cacao-500',
}
const ACTIVE_BAR = {
  olive: 'bg-olive-600',
  pumpkin: 'bg-pumpkin-500',
  skyhaze: 'bg-skyhaze-500',
  cacao: 'bg-cacao-500',
}

export function DesktopNav({ current, onNavigate }) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-1 px-3 py-6 sticky top-0 h-screen">
      <div className="flex items-center gap-3 px-3 mb-6">
        <div className="w-11 h-11 rounded-2xl2 bg-olive-600 text-cream-50 flex items-center justify-center shadow-soft">
          <ChefHat size={22} />
        </div>
        <div>
          <p className="font-display text-lg font-semibold leading-tight text-cacao-700">厨房笔记</p>
          <p className="text-[11px] text-cacao-400 tracking-wider uppercase">Meal Planner</p>
        </div>
      </div>

      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        const active = current === item.key
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-2xl transition
              ${active ? 'bg-cream-50 shadow-soft' : 'hover:bg-cream-200/50'}`}
          >
            {active && (
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full ${ACTIVE_BAR[item.color]}`} />
            )}
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center transition
              ${active ? ACCENT_BG[item.color] : 'bg-transparent text-cacao-400 group-hover:bg-cream-200'}`}>
              <Icon size={18} />
            </span>
            <span className={`font-medium ${active ? 'text-cacao-700' : 'text-cacao-500'}`}>
              {item.label}
            </span>
          </button>
        )
      })}

      <div className="mt-auto px-3 py-4 text-[11px] text-cacao-400/80 leading-relaxed">
        <p className="mb-1">数据保存在浏览器本地</p>
        <p>v0.1 · made with care</p>
      </div>
    </aside>
  )
}

export function MobileNav({ current, onNavigate }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-cream-50/90 backdrop-blur-md border-t border-cream-300">
      <div className="grid grid-cols-4 px-1 py-1.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = current === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition
                ${active ? 'text-olive-600' : 'text-cacao-400'}`}
            >
              <Icon size={20} />
              <span className="text-[11px] font-medium">{item.short}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-cream-50/80 backdrop-blur-md border-b border-cream-300/70 px-4 py-3 flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-olive-600 text-cream-50 flex items-center justify-center">
        <ChefHat size={18} />
      </div>
      <div>
        <p className="font-display font-semibold leading-tight text-cacao-700">厨房笔记</p>
        <p className="text-[10px] text-cacao-400 tracking-wide uppercase">Meal Planner</p>
      </div>
    </header>
  )
}
