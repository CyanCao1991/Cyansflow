import { useState } from 'react'
import { Sliders, Sun, CloudSun, Moon, Cookie, Flame, Leaf, ShieldAlert, RotateCcw, Heart, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import TagInput from '../components/TagInput'
import { SectionHeader } from '../components/ui'
import { SEED_INVENTORY, SEED_RECIPES, SEED_PREFERENCE } from '../lib/seedData'

const TASTE_OPTIONS = ['清淡', '重口', '麻辣', '酸甜', '咸鲜', '酸口', '甜口', '清淡鲜']
const AVOID_OPTIONS = ['麻辣', '重口', '过咸', '过甜']
const FOCUS_OPTIONS = ['高蛋白', '低脂', '低卡', '素食', '均衡', '富含胡萝卜素']
const CUISINE_OPTIONS = ['家常', '川菜', '粤菜', '西式', '日式', '韩式']

const MEAL_OPTS = [
  { value: 1, label: '1 餐', icon: Sun },
  { value: 2, label: '2 餐', icon: CloudSun },
  { value: 3, label: '3 餐', icon: Moon },
  { value: 4, label: '4 餐 (加小食)', icon: Cookie },
]

export default function PreferencesPage() {
  const { preference, inventory, updatePreference, resetAll } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)
  const p = preference

  const ingredientNames = Array.from(new Set(inventory.map(i => i.name))).sort()

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
      <SectionHeader
        title="偏好设置"
        subtitle="你的口味、忌口与营养目标会影响每日计划的生成"
        icon={Sliders}
      />

      {/* 口味偏好 */}
      <section className="card-base p-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={16} className="text-pumpkin-500" />
          <h3 className="font-display text-lg font-semibold text-cacao-700">口味偏好</h3>
        </div>

        <div>
          <label className="field-label">喜欢的口味</label>
          <TagInput
            value={p.tasteTags || []}
            onChange={v => updatePreference({ tasteTags: v })}
            suggestions={TASTE_OPTIONS}
            placeholder="添加喜欢的口味"
          />
        </div>

        <div>
          <label className="field-label">不喜欢的口味</label>
          <TagInput
            value={p.avoidTags || []}
            onChange={v => updatePreference({ avoidTags: v })}
            suggestions={AVOID_OPTIONS}
            placeholder="不想要的口味"
          />
        </div>

        <div>
          <label className="field-label">忌口食材</label>
          <TagInput
            value={p.avoidIngredients || []}
            onChange={v => updatePreference({ avoidIngredients: v })}
            suggestions={ingredientNames}
            placeholder="食材名称，如 花生、海鲜"
          />
          <p className="text-xs text-cacao-400 mt-1.5">生成计划时会自动避开包含忌口食材的食谱</p>
        </div>

        <div>
          <label className="field-label">偏好菜系</label>
          <TagInput
            value={p.cuisinePreference || []}
            onChange={v => updatePreference({ cuisinePreference: v })}
            suggestions={CUISINE_OPTIONS}
            placeholder="如 家常、粤菜"
          />
        </div>
      </section>

      {/* 餐数与营养目标 */}
      <section className="card-base p-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Flame size={16} className="text-olive-600" />
          <h3 className="font-display text-lg font-semibold text-cacao-700">餐数与营养目标</h3>
        </div>

        <div>
          <label className="field-label">每日餐数</label>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_OPTS.map(opt => {
              const Icon = opt.icon
              const active = (p.mealsPerDay || 3) === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => updatePreference({ mealsPerDay: opt.value })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition
                    ${active ? 'border-olive-500 bg-olive-100/60' : 'border-cream-300 bg-cream-50 hover:bg-cream-200/50'}`}
                >
                  <Icon size={18} className={active ? 'text-olive-600' : 'text-cacao-400'} />
                  <span className={`text-xs font-medium ${active ? 'text-olive-700' : 'text-cacao-500'}`}>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="field-label mb-0">每日热量目标</label>
            <span className="text-lg font-display font-semibold text-cacao-700 num">
              {p.calorieTarget || 1800}<span className="text-sm text-cacao-400 ml-1">kcal</span>
            </span>
          </div>
          <input
            type="range" min="1200" max="3000" step="50"
            className="w-full accent-olive-600"
            value={p.calorieTarget || 1800}
            onChange={e => updatePreference({ calorieTarget: parseInt(e.target.value) })}
          />
          <div className="flex justify-between text-[11px] text-cacao-400 mt-1">
            <span>1200</span><span>减脂 1500</span><span>维持 1800</span><span>增肌 2400</span><span>3000</span>
          </div>
        </div>

        <div>
          <label className="field-label">营养重点</label>
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_OPTIONS.map(f => {
              const active = (p.nutritionFocus || []).includes(f)
              return (
                <button
                  key={f}
                  onClick={() => {
                    const list = p.nutritionFocus || []
                    updatePreference({
                      nutritionFocus: active ? list.filter(x => x !== f) : [...list, f]
                    })
                  }}
                  className={`chip transition cursor-pointer
                    ${active ? 'bg-olive-600 text-cream-50' : 'bg-cream-200 text-cacao-500 hover:bg-cream-300'}`}
                >
                  {active && '✓ '}{f}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-cacao-400 mt-1.5">食谱标签匹配时，含这些标签的菜会更优先被推荐</p>
        </div>
      </section>

      {/* 偏好开关 */}
      <section className="card-base p-5">
        <div className="flex items-center gap-2 mb-3">
          <Leaf size={16} className="text-olive-600" />
          <h3 className="font-display text-lg font-semibold text-cacao-700">智能行为</h3>
        </div>
        <Toggle
          checked={!!p.preferUseExpiring}
          onChange={v => updatePreference({ preferUseExpiring: v })}
          title="优先消耗临期食材"
          desc="生成计划时，能用到临期食材的食谱会优先被推荐"
        />
      </section>

      {/* 危险区 */}
      <section className="card-base p-5 border-tomato-400/30">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={16} className="text-tomato-500" />
          <h3 className="font-display text-lg font-semibold text-cacao-700">数据管理</h3>
        </div>
        <p className="text-sm text-cacao-500 mb-3">所有数据保存在浏览器本地。重置会清空库存、食谱与计划，恢复为示例数据。</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setConfirmReset(true)} className="btn-secondary text-tomato-600 hover:bg-tomato-500/10">
            <RotateCcw size={16} /> 重置为示例数据
          </button>
        </div>
      </section>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="确认重置"
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setConfirmReset(false)}>取消</button>
            <button className="btn-primary bg-tomato-500 hover:bg-tomato-600" onClick={() => { resetAll(); setConfirmReset(false) }}>
              <Trash2 size={16} /> 确认重置
            </button>
          </>
        }
      >
        <p className="text-cacao-600 leading-relaxed">
          这将清除你所有的食材库存、食谱库、偏好设置与每日计划，并恢复为初始示例数据。
          此操作不可撤销。
        </p>
      </Modal>
    </div>
  )
}

function Toggle({ checked, onChange, title, desc }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <div>
        <p className="font-medium text-cacao-700">{title}</p>
        {desc && <p className="text-xs text-cacao-400 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition shrink-0
          ${checked ? 'bg-olive-600' : 'bg-cream-300'}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-cream-50 shadow-soft transition-transform
          ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  )
}
