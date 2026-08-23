import { useState } from 'react'
import { X } from 'lucide-react'
import { tagColor } from '../lib/utils'

// 标签输入器：回车添加，chip 删除，可选预设建议
export default function TagInput({ value = [], onChange, suggestions = [], placeholder = '输入后回车添加' }) {
  const [text, setText] = useState('')

  const add = v => {
    const t = (v || text).trim()
    if (!t) return
    if (value.includes(t)) { setText(''); return }
    onChange([...value, t])
    setText('')
  }
  const remove = t => onChange(value.filter(x => x !== t))

  const onKeyDown = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !text && value.length) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className="space-y-2">
      <div className="field-input flex flex-wrap items-center gap-1.5 min-h-[44px] py-1.5">
        {value.map(t => (
          <span key={t} className={`chip ${tagColor(t)} pr-1`}>
            {t}
            <button type="button" onClick={() => remove(t)} className="ml-0.5 hover:text-tomato-500">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add()}
          placeholder={value.length ? '' : placeholder}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm py-0.5"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.filter(s => !value.includes(s)).slice(0, 10).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="chip bg-cream-200/70 text-cacao-500 hover:bg-cream-300 hover:text-cacao-700 transition"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
