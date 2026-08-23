import { differenceInCalendarDays, format, parseISO, isValid } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 生成唯一 ID
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

// 当前日期 ISO (yyyy-MM-dd)
export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

// 格式化日期为友好显示
export function fmtDate(iso, pattern = 'MM月dd日') {
  if (!iso) return '—'
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : iso
    if (!isValid(d)) return '—'
    return format(d, pattern, { locale: zhCN })
  } catch {
    return '—'
  }
}

// 相对今天的天数差（正=未来，负=已过期）
export function daysUntil(iso) {
  if (!iso) return null
  try {
    const d = parseISO(iso)
    if (!isValid(d)) return null
    return differenceInCalendarDays(d, new Date())
  } catch {
    return null
  }
}

// 保质期状态：normal / soon / urgent / expired / unknown
export function expiryStatus(iso) {
  const d = daysUntil(iso)
  if (d === null) return 'unknown'
  if (d < 0) return 'expired'
  if (d <= 2) return 'urgent'
  if (d <= 5) return 'soon'
  return 'normal'
}

export const EXPIRY_META = {
  normal:  { label: '新鲜',   cls: 'bg-olive-100 text-olive-700' },
  soon:    { label: '近期',   cls: 'bg-pumpkin-100 text-pumpkin-600' },
  urgent:  { label: '临期',   cls: 'bg-tomato-500/15 text-tomato-600' },
  expired: { label: '已过期', cls: 'bg-tomato-500 text-cream-50' },
  unknown: { label: '—',      cls: 'bg-cream-200 text-cacao-400' },
}

// 数量标准化：去除前后空格、统一小数
export function normQty(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

// 模糊匹配：判断食材名是否在库存中（包含/被包含/去空格相等）
export function fuzzyMatchIngredient(name, inventory) {
  if (!name) return null
  const target = name.trim().toLowerCase()
  return inventory.find(it => {
    const n = it.name.trim().toLowerCase()
    return n === target || n.includes(target) || target.includes(n)
  }) || null
}

// 食谱所需食材与库存匹配情况
// 返回 { matched, missing, hasAll }
export function matchRecipeIngredients(recipe, inventory) {
  const matched = []
  const missing = []
  for (const need of (recipe.ingredients || [])) {
    const found = fuzzyMatchIngredient(need.name, inventory)
    if (found) {
      matched.push({ need, have: found })
    } else {
      missing.push(need)
    }
  }
  return { matched, missing, hasAll: missing.length === 0 }
}

// 防抖
export function debounce(fn, wait = 250) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

// 简单分类统计：[ {key, count} ]
export function groupCount(arr, keyFn) {
  const m = new Map()
  for (const it of arr) {
    const k = keyFn(it)
    m.set(k, (m.get(k) || 0) + 1)
  }
  return Array.from(m, ([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count)
}

// 颜色色调循环 - 用于标签着色
const TAG_COLORS = [
  'bg-olive-100 text-olive-700',
  'bg-pumpkin-100 text-pumpkin-600',
  'bg-cream-200 text-cacao-500',
  'bg-skyhaze-400/20 text-skyhaze-500',
  'bg-tomato-500/15 text-tomato-600',
]
export function tagColor(tag) {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0
  return TAG_COLORS[h % TAG_COLORS.length]
}

// 数组随机打乱
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 数字范围 clamp
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}
