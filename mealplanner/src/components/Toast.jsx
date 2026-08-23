import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const ICON = {
  success: CheckCircle2,
  info: Info,
  warn: XCircle,
  error: XCircle,
}
const COLOR = {
  success: 'bg-olive-600 text-cream-50',
  info: 'bg-cacao-500 text-cream-50',
  warn: 'bg-pumpkin-500 text-cream-50',
  error: 'bg-tomato-500 text-cream-50',
}

export default function ToastStack() {
  const { toasts, dismissToast } = useApp()
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-[92vw] w-[360px]">
      {toasts.map(t => {
        const Icon = ICON[t.type] || Info
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl2 shadow-lift animate-pop-in ${COLOR[t.type] || COLOR.info}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-sm font-medium leading-relaxed">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="opacity-80 hover:opacity-100 transition shrink-0"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
