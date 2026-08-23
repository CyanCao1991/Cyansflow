import { useMemo, useState } from 'react'
import { Search, Carrot, FlaskConical, AlertTriangle, Plus, Pencil, Trash2, Soup } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import ExpiryBadge from '../components/ExpiryBadge'
import { EmptyState, SectionHeader, StatCard, AddButton } from '../components/ui'
import { expiryStatus, daysUntil, todayISO } from '../lib/utils'

const TABS = [
  { key: 'all',       label: '全部' },
  { key: 'ingredient', label: '食材' },
  { key: 'seasoning', label: '调味料' },
  { key: 'urgent',    label: '临期' },
]

const EMPTY = {
  id: null,
  name: '',
  category: 'ingredient',
  subcategory: '',
  quantity: 1,
  unit: 'g',
  purchaseDate: todayISO(),
  expiryDate: '',
  note: '',
  tags: [],
}

export default function InventoryPage() {
  const { inventory, addIngredient, updateIngredient, removeIngredient } = useApp()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)

  const stats = useMemo(() => {
    const ingredients = inventory.filter(i => i.category === 'ingredient')
    const seasonings = inventory.filter(i => i.category === 'seasoning')
    const urgent = inventory.filter(i => {
      const s = expiryStatus(i.expiryDate)
      return s === 'urgent' || s === 'expired'
    })
    return { total: inventory.length, ingredients: ingredients.length, seasonings: seasonings.length, urgent: urgent.length }
  }, [inventory])

  const list = useMemo(() => {
    let arr = inventory
    if (tab === 'ingredient') arr = arr.filter(i => i.category === 'ingredient')
    else if (tab === 'seasoning') arr = arr.filter(i => i.category === 'seasoning')
    else if (tab === 'urgent') arr = arr.filter(i => {
      const s = expiryStatus(i.expiryDate)
      return s === 'urgent' || s === 'expired'
    })
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      arr = arr.filter(i => i.name.toLowerCase().includes(q) ||
        (i.subcategory || '').toLowerCase().includes(q) ||
        (i.tags || []).some(t => t.toLowerCase().includes(q)))
    }
    // 按临期程度排序：临期/过期优先
    return [...arr].sort((a, b) => {
      const ra = urgencyRank(a.expiryDate)
      const rb = urgencyRank(b.expiryDate)
      if (rb !== ra) return rb - ra
      return a.name.localeCompare(b.name, 'zh')
    })
  }, [inventory, tab, query])

  const openAdd = () => setEditing({ ...EMPTY, purchaseDate: todayISO() })
  const openEdit = item => setEditing({ ...item })
  const close = () => setEditing(null)
  const submit = () => {
    if (!editing.name.trim()) return
    if (editing.id) {
      updateIngredient(editing.id, editing)
    } else {
      addIngredient({ ...editing, id: null })
    }
    close()
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeader
        title="食材库存"
        subtitle="管理冰箱里的食材与调味料，临期会自动提示"
        icon={Carrot}
        action={<AddButton label="添加食材" onClick={openAdd} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="食材种类" value={stats.total} unit="种" icon={Soup} accent="olive" />
        <StatCard label="食材" value={stats.ingredients} unit="种" icon={Carrot} accent="pumpkin" />
        <StatCard label="调味料" value={stats.seasonings} unit="种" icon={FlaskConical} accent="skyhaze" />
        <StatCard label="临期提醒" value={stats.urgent} unit="项" icon={AlertTriangle} accent={stats.urgent ? 'tomato' : 'cacao'} />
      </div>

      {/* 搜索 + Tab */}
      <div className="card-base p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cacao-400" />
          <input
            className="field-input pl-9"
            placeholder="搜索食材 / 分类 / 标签..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(t => {
            const count = t.key === 'all' ? inventory.length
              : t.key === 'urgent' ? stats.urgent
              : inventory.filter(i => i.category === t.key).length
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5
                  ${tab === t.key ? 'bg-olive-600 text-cream-50 shadow-soft' : 'bg-cream-200/60 text-cacao-500 hover:bg-cream-200'}`}
              >
                {t.label}
                <span className={`num text-xs px-1.5 rounded-full
                  ${tab === t.key ? 'bg-cream-50/25' : 'bg-cream-50/60'}`}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 列表 */}
      {list.length === 0 ? (
        <div className="card-base">
          <EmptyState
            icon={Carrot}
            title="这里还空着"
            description="添加你的第一份食材或调味料，开始管理餐食计划"
            action={<AddButton label="添加食材" onClick={openAdd} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={() => openEdit(item)}
              onDelete={() => removeIngredient(item.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={close}
        title={editing?.id ? '编辑食材' : '添加食材'}
        subtitle={editing?.id ? '修改食材信息与保质期' : '记录新增的食材或调味料'}
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={close}>取消</button>
            <button className="btn-primary" onClick={submit} disabled={!editing?.name?.trim()}>
              <Plus size={16} /> {editing?.id ? '保存' : '添加'}
            </button>
          </>
        }
      >
        {editing && <ItemForm value={editing} onChange={setEditing} />}
      </Modal>
    </div>
  )
}

function urgencyRank(date) {
  const s = expiryStatus(date)
  const map = { expired: 4, urgent: 3, soon: 2, normal: 1, unknown: 0 }
  return map[s] || 0
}

function ItemCard({ item, onEdit, onDelete }) {
  const isSeasoning = item.category === 'seasoning'
  const d = daysUntil(item.expiryDate)
  const isExpiring = d !== null && d <= 2
  return (
    <div className={`card-base p-4 group relative transition hover:shadow-lift hover:-translate-y-0.5
      ${isExpiring ? 'ring-1 ring-tomato-400/40' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
              ${isSeasoning ? 'bg-skyhaze-400/20 text-skyhaze-500' : 'bg-pumpkin-100 text-pumpkin-600'}`}>
              {isSeasoning ? <FlaskConical size={16} /> : <Carrot size={16} />}
            </span>
            <h3 className="font-display font-semibold text-cacao-700 truncate">{item.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5 ml-10">
            <span className="text-xs text-cacao-400">{item.subcategory || (isSeasoning ? '调味料' : '食材')}</span>
            {(item.tags || []).map(t => (
              <span key={t} className="chip bg-cream-200/70 text-cacao-500 text-[10px]">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button className="btn-ghost p-1.5" onClick={onEdit} aria-label="编辑">
            <Pencil size={14} />
          </button>
          <button className="btn-danger p-1.5" onClick={onDelete} aria-label="删除">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-cream-300/70 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-cacao-400 uppercase tracking-wide">库存</p>
          <p className="text-xl font-display font-semibold text-cacao-700 num">
            {item.quantity}<span className="text-sm text-cacao-400 ml-1 font-sans">{item.unit}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-cacao-400 uppercase tracking-wide">保质期</p>
          <div className="mt-1"><ExpiryBadge date={item.expiryDate} /></div>
        </div>
      </div>

      {item.note && (
        <p className="mt-2 text-xs text-cacao-400 italic">“{item.note}”</p>
      )}
    </div>
  )
}

function ItemForm({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const addTag = t => { if (t && !value.tags.includes(t)) set({ tags: [...value.tags, t] }) }
  const removeTag = t => set({ tags: value.tags.filter(x => x !== t) })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">名称</label>
          <input className="field-input" value={value.name}
                 onChange={e => set({ name: e.target.value })} placeholder="如 番茄" />
        </div>
        <div>
          <label className="field-label">类型</label>
          <select className="field-input" value={value.category}
                  onChange={e => set({ category: e.target.value })}>
            <option value="ingredient">食材</option>
            <option value="seasoning">调味料</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="field-label">数量</label>
          <input type="number" min="0" step="any" className="field-input num"
                 value={value.quantity}
                 onChange={e => set({ quantity: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="field-label">单位</label>
          <input className="field-input" value={value.unit}
                 onChange={e => set({ unit: e.target.value })} placeholder="g / 个 / ml" />
        </div>
        <div>
          <label className="field-label">子分类</label>
          <input className="field-input" value={value.subcategory || ''}
                 onChange={e => set({ subcategory: e.target.value })} placeholder="蔬菜/肉类" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">采购日期</label>
          <input type="date" className="field-input num" value={value.purchaseDate || ''}
                 onChange={e => set({ purchaseDate: e.target.value })} />
        </div>
        <div>
          <label className="field-label">保质期至</label>
          <input type="date" className="field-input num" value={value.expiryDate || ''}
                 onChange={e => set({ expiryDate: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="field-label">标签</label>
        <div className="field-input flex flex-wrap gap-1.5 min-h-[44px] py-1.5">
          {value.tags.map(t => (
            <span key={t} className="chip bg-cream-200 text-cacao-500 pr-1">
              {t}
              <button type="button" className="ml-0.5 hover:text-tomato-500" onClick={() => removeTag(t)}>×</button>
            </span>
          ))}
          <input
            className="flex-1 min-w-[80px] bg-transparent outline-none text-sm py-0.5"
            placeholder="回车添加"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag(e.target.value.trim())
                e.target.value = ''
              }
            }}
          />
        </div>
      </div>

      <div>
        <label className="field-label">备注</label>
        <textarea className="field-input" rows={2} value={value.note || ''}
                  onChange={e => set({ note: e.target.value })}
                  placeholder="比如：已切片、需要先泡水" />
      </div>
    </div>
  )
}
