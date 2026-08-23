import { Plus, Inbox } from 'lucide-react'

// 空状态
export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-16 h-16 rounded-2xl2 bg-cream-200/70 flex items-center justify-center mb-4">
        <Icon size={28} className="text-cacao-400" />
      </div>
      <h3 className="text-lg font-display font-semibold text-cacao-600 mb-1">{title}</h3>
      {description && <p className="text-sm text-cacao-400 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// 区块标题
export function SectionHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={20} className="text-olive-600" />}
          <h2 className="text-2xl font-display font-semibold text-cacao-700">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-cacao-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// 统计小卡片
export function StatCard({ label, value, unit, icon: Icon, accent = 'olive' }) {
  const accentMap = {
    olive: 'text-olive-600 bg-olive-100',
    pumpkin: 'text-pumpkin-500 bg-pumpkin-100',
    tomato: 'text-tomato-500 bg-tomato-500/15',
    cacao: 'text-cacao-500 bg-cream-200',
  }
  return (
    <div className="card-base p-4 flex items-center gap-3.5">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-cacao-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-semibold text-cacao-700 num">
          {value}<span className="text-sm text-cacao-400 ml-1 font-sans font-medium">{unit}</span>
        </p>
      </div>
    </div>
  )
}

// 新增按钮 - 带图标
export function AddButton({ label = '新增', onClick, variant = 'primary' }) {
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-secondary'
  return (
    <button onClick={onClick} className={cls}>
      <Plus size={16} /> {label}
    </button>
  )
}

// 标签
export function Tag({ children, color, onRemove, ...props }) {
  return (
    <span
      className={`chip ${color || 'bg-cream-200 text-cacao-500'}`}
      {...props}
    >
      {children}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:text-tomato-500">×</button>
      )}
    </span>
  )
}
