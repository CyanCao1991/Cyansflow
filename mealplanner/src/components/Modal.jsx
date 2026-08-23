import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onEsc = e => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const sizeCls = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] || 'max-w-lg'

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-cacao-700/40 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeCls} max-h-[92vh] bg-cream-50 rounded-t-3xl sm:rounded-3xl shadow-lift
                    border border-cream-300 flex flex-col animate-pop-in overflow-hidden`}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-cream-300/70">
          <div className="min-w-0">
            <h3 className="text-xl font-display font-semibold text-cacao-700 truncate">{title}</h3>
            {subtitle && <p className="text-sm text-cacao-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost -mr-2 -mt-1"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-cream-300/70 bg-cream-100/60 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
