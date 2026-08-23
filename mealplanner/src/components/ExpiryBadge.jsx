import { EXPIRY_META, expiryStatus, daysUntil } from '../lib/utils'

export default function ExpiryBadge({ date, showDays = true }) {
  if (!date) {
    return <span className={`chip ${EXPIRY_META.unknown.cls}`}>{EXPIRY_META.unknown.label}</span>
  }
  const s = expiryStatus(date)
  const meta = EXPIRY_META[s]
  const d = daysUntil(date)
  const txt = showDays && d !== null
    ? (d < 0 ? `已过期 ${-d} 天` : d === 0 ? '今日到期' : `剩 ${d} 天`)
    : meta.label
  return <span className={`chip ${meta.cls}`}>{txt}</span>
}
