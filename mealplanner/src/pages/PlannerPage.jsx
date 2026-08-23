import { useMemo, useState } from 'react'
import {
  Soup, Sparkles, ChevronLeft, ChevronRight, RefreshCw, Save, Sparkle,
  CheckCircle2, AlertCircle, Clock, Flame, Pencil, ShoppingCart,
  History, Lightbulb, X, Plus, Carrot,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import { SectionHeader, StatCard, EmptyState, Tag } from '../components/ui'
import { matchRecipeIngredients, tagColor, expiryStatus, todayISO, fmtDate, daysUntil } from '../lib/utils'
import { generateMealPlan, auditPlanAgainstInventory } from '../lib/planner'
import { generateLocalInspirations } from '../lib/aiSuggest'

const MEAL_META = {
  breakfast: { label: '早餐', icon: '🌅', cls: 'bg-pumpkin-100 text-pumpkin-600' },
  lunch:     { label: '午餐', icon: '☀️', cls: 'bg-olive-100 text-olive-700' },
  dinner:    { label: '晚餐', icon: '🌙', cls: 'bg-skyhaze-400/20 text-skyhaze-500' },
  snack:     { label: '加餐', icon: '🍪', cls: 'bg-cream-200 text-cacao-500' },
}

export default function PlannerPage() {
  const { inventory, recipes, preference, plans, savePlan } = useApp()
  const [date, setDate] = useState(todayISO())
  const [draft, setDraft] = useState(null) // 当前编辑中的计划草稿
  const [showOptions, setShowOptions] = useState(false)
  const [mustInclude, setMustInclude] = useState([]) // [recipeId]
  const [exclude, setExclude] = useState([])
  const [editingMeal, setEditingMeal] = useState(null) // { idx, recipeSnapshot }
  const [showInspiration, setShowInspiration] = useState(false)

  const existingPlan = useMemo(
    () => plans.find(p => p.date === date) || null,
    [plans, date]
  )

  const currentPlan = draft || existingPlan

  const onGenerate = () => {
    const plan = generateMealPlan(inventory, recipes, preference, {
      date,
      mustInclude: mustInclude.map(recipeId => ({ recipeId })),
      exclude,
    })
    setDraft(plan)
    setShowOptions(false)
  }

  const shiftDate = (delta) => {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    setDate(d.toISOString().slice(0, 10))
    setDraft(null)
  }

  const onSave = () => {
    if (draft) {
      savePlan(draft)
      setDraft(null)
    }
  }

  // 替换某餐
  const onReplaceMeal = (idx, recipeId) => {
    if (!currentPlan) return
    const r = recipes.find(x => x.id === recipeId)
    if (!r) return
    const meals = currentPlan.meals.slice()
    const { matched, missing } = matchRecipeIngredients(r, inventory)
    meals[idx] = {
      ...meals[idx],
      type: meals[idx].type,
      recipeId: r.id,
      recipeSnapshot: {
        id: r.id, name: r.name, calories: r.calories, prepTime: r.prepTime,
        tags: r.tags, ingredients: r.ingredients, steps: r.steps, mealType: r.mealType,
      },
      matched: matched.map(m => ({ name: m.have.name, qty: m.need.quantity, unit: m.need.unit })),
      missing: missing.map(m => ({ name: m.name, qty: m.quantity, unit: m.unit, isMain: m.isMain })),
      score: 0, reasons: [],
    }
    setDraft({ ...currentPlan, meals })
    setEditingMeal(null)
  }

  // 汇总当前计划
  const summary = useMemo(() => {
    if (!currentPlan) return null
    const meals = currentPlan.meals || []
    const total = meals.reduce((s, m) => s + (m.recipeSnapshot?.calories || 0), 0)
    const allMissing = meals.flatMap(m => m.missing || [])
    const coverage = meals.length
      ? Math.round(meals.filter(m => (m.missing || []).length === 0).length / meals.length * 100)
      : 0
    const usedExpiring = meals.some(m =>
      (m.matched || []).some(mi => {
        const inv = inventory.find(i => i.name === mi.name)
        return inv?.expiryDate && ['urgent', 'soon', 'expired'].includes(expiryStatus(inv.expiryDate))
      })
    )
    return {
      total,
      target: preference.calorieTarget || 1800,
      missingCount: allMissing.length,
      missingItems: allMissing,
      coverage,
      usedExpiring,
      mealCount: meals.length,
    }
  }, [currentPlan, inventory, preference])

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeader
        title="今日计划"
        subtitle="根据库存与偏好自动生成三餐，临期食材会被优先消耗"
        icon={Soup}
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setShowInspiration(true)}>
              <Lightbulb size={16} /> 灵感
            </button>
            <button className="btn-primary" onClick={onGenerate} disabled={recipes.length === 0}>
              <Sparkles size={16} /> {currentPlan && !draft ? '重新生成' : '生成今日计划'}
            </button>
          </div>
        }
      />

      {/* 日期导航 */}
      <div className="card-base p-3 flex items-center justify-between">
        <button className="btn-ghost p-2" onClick={() => shiftDate(-1)}>
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-display text-xl font-semibold text-cacao-700">
            {date === todayISO() ? '今天' : fmtDate(date, 'MM月dd日 EEEE')}
          </p>
          <p className="text-xs text-cacao-400 num">{date}</p>
        </div>
        <button className="btn-ghost p-2" onClick={() => shiftDate(1)}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 高级选项 */}
      <div className="card-base">
        <button
          className="w-full flex items-center justify-between px-4 py-3"
          onClick={() => setShowOptions(v => !v)}
        >
          <span className="flex items-center gap-2 text-cacao-600 font-medium">
            <Sparkle size={15} className="text-olive-600" /> 生成选项
          </span>
          <span className="text-xs text-cacao-400">
            {mustInclude.length > 0 || exclude.length > 0
              ? `${mustInclude.length} 必含 · ${exclude.length} 排除`
              : '未设置约束'}
          </span>
        </button>
        {showOptions && (
          <div className="px-4 pb-4 space-y-4 border-t border-cream-300/70 pt-4 animate-fade-up">
            <OptionPicker
              label="必含菜品（想吃这个）"
              recipes={recipes}
              selected={mustInclude}
              onChange={setMustInclude}
              emptyHint="勾选你想吃的菜，生成时会尽量包含"
            />
            <OptionPicker
              label="排除菜品（不想吃）"
              recipes={recipes}
              selected={exclude}
              onChange={setExclude}
              emptyHint="勾选不想出现的菜"
            />
            <div className="flex justify-end">
              <button className="btn-primary" onClick={onGenerate} disabled={recipes.length === 0}>
                <RefreshCw size={15} /> 应用并生成
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 计划展示 */}
      {!currentPlan ? (
        <div className="card-base">
          <EmptyState
            icon={Soup}
            title="今日还没有计划"
            description="点击右上角「生成今日计划」，系统会根据你的库存、偏好和想吃的菜，自动安排三餐"
            action={
              <button className="btn-primary" onClick={onGenerate} disabled={recipes.length === 0}>
                <Sparkles size={16} /> 生成今日计划
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* 概览 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="已安排餐数" value={summary.mealCount} unit="餐" icon={Soup} accent="olive" />
            <StatCard
              label="预计热量"
              value={summary.total}
              unit={`/ ${summary.target}`}
              icon={Flame}
              accent={summary.total > summary.target * 1.1 ? 'tomato' : 'pumpkin'}
            />
            <StatCard
              label="原料覆盖"
              value={summary.coverage}
              unit="%"
              icon={summary.coverage === 100 ? CheckCircle2 : AlertCircle}
              accent={summary.coverage === 100 ? 'olive' : summary.missingCount > 0 ? 'tomato' : 'cacao'}
            />
            <StatCard
              label="缺料项"
              value={summary.missingCount}
              unit="项"
              icon={ShoppingCart}
              accent={summary.missingCount > 0 ? 'tomato' : 'olive'}
            />
          </div>

          {/* 临期食材已用提示 */}
          {summary.usedExpiring && (
            <div className="card-base bg-olive-50 p-3 flex items-center gap-2.5 text-olive-700">
              <CheckCircle2 size={16} />
              <p className="text-sm">本日计划已考虑优先消耗临期食材，帮你减少浪费</p>
            </div>
          )}

          {/* 三餐 */}
          <div className="space-y-3">
            {currentPlan.meals.map((meal, idx) => (
              <MealCard
                key={idx}
                meal={meal}
                inventory={inventory}
                onEdit={() => setEditingMeal({ idx, recipeSnapshot: meal.recipeSnapshot })}
              />
            ))}
          </div>

          {/* 缺料清单 */}
          {summary.missingCount > 0 && (
            <div className="card-base p-5">
              <h3 className="font-display text-lg font-semibold text-cacao-700 mb-3 flex items-center gap-2">
                <ShoppingCart size={18} className="text-pumpkin-500" />
                缺料清单
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(summary.missingItems.map(m => m.name))).map(name => {
                  const need = summary.missingItems.find(m => m.name === name)
                  return (
                    <span key={name} className="chip bg-pumpkin-100 text-pumpkin-600">
                      {name} <span className="num ml-1 opacity-70">{need?.qty}{need?.unit}</span>
                    </span>
                  )
                })}
              </div>
              <p className="text-xs text-cacao-400 mt-3">可以采购补齐，或在食谱库里调整为有库存的菜品</p>
            </div>
          )}

          {/* 操作区 */}
          <div className="flex flex-wrap gap-2 justify-end">
            <button className="btn-secondary" onClick={onGenerate}>
              <RefreshCw size={16} /> 换一份方案
            </button>
            {draft && (
              <button className="btn-primary" onClick={onSave}>
                <Save size={16} /> 保存到历史
              </button>
            )}
          </div>
        </>
      )}

      {/* 历史计划 */}
      {plans.length > 0 && (
        <HistoryList plans={plans} inventory={inventory} onPick={(d) => { setDate(d); setDraft(null) }} />
      )}

      {/* 替换菜品 Modal */}
      <Modal
        open={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        title="替换这一餐"
        subtitle={editingMeal?.recipeSnapshot?.name ? `当前：${editingMeal.recipeSnapshot.name}` : ''}
        size="lg"
      >
        {editingMeal && (
          <ReplacePicker
            inventory={inventory}
            recipes={recipes}
            currentRecipeId={editingMeal.recipeSnapshot?.id}
            onPick={(id) => onReplaceMeal(editingMeal.idx, id)}
          />
        )}
      </Modal>

      {/* 灵感 Modal */}
      <Modal
        open={showInspiration}
        onClose={() => setShowInspiration(false)}
        title="厨房灵感"
        subtitle="基于现有库存的快手菜建议"
        size="lg"
      >
        <InspirationView inventory={inventory} preference={preference} />
      </Modal>
    </div>
  )
}

function MealCard({ meal, inventory, onEdit }) {
  const meta = MEAL_META[meal.type] || MEAL_META.lunch
  const r = meal.recipeSnapshot
  const missingCount = (meal.missing || []).length
  const hasAll = missingCount === 0

  return (
    <div className="card-base p-4 sm:p-5 animate-fade-up">
      <div className="flex items-start gap-4">
        {/* 餐型徽章 */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${meta.cls}`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-cacao-400 uppercase tracking-wider font-semibold">{meta.label}</p>
              <h3 className="font-display text-xl font-semibold text-cacao-700 truncate">{r?.name}</h3>
            </div>
            <button className="btn-ghost p-2 shrink-0" onClick={onEdit}>
              <Pencil size={15} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {r?.calories > 0 && <span className="chip bg-cream-200 text-cacao-500 gap-1"><Flame size={11} />{r.calories}kcal</span>}
            {r?.prepTime > 0 && <span className="chip bg-cream-200 text-cacao-500 gap-1"><Clock size={11} />{r.prepTime}分</span>}
            {(r?.tags || []).slice(0, 3).map(t => <span key={t} className={`chip ${tagColor(t)}`}>{t}</span>)}
          </div>

          {/* 得分原因 */}
          {(meal.reasons || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {meal.reasons.slice(0, 3).map((reason, i) => {
                const cls = reason.type === 'good' ? 'bg-olive-100 text-olive-700'
                  : reason.type === 'warn' ? 'bg-tomato-500/15 text-tomato-600'
                  : 'bg-cream-200 text-cacao-500'
                return <span key={i} className={`chip ${cls} text-[11px]`}>{reason.text}</span>
              })}
            </div>
          )}
        </div>
      </div>

      {/* 所需原料 */}
      <div className="mt-4 pt-4 border-t border-cream-300/70">
        <div className="flex items-center justify-between mb-2">
          <h4 className="field-label mb-0">所需原料</h4>
          {hasAll
            ? <span className="chip bg-olive-100 text-olive-700 gap-1"><CheckCircle2 size={11} />库存齐全</span>
            : <span className="chip bg-pumpkin-100 text-pumpkin-600 gap-1"><AlertCircle size={11} />缺 {missingCount} 种</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {(r?.ingredients || []).map((ing, i) => {
            const found = (meal.matched || []).some(m => m.name === ing.name)
            return (
              <div key={i} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm
                ${found ? 'bg-olive-50 text-cacao-600' : 'bg-pumpkin-50 text-pumpkin-600'}`}>
                <span className="truncate flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${found ? 'bg-olive-500' : 'bg-pumpkin-500'}`} />
                  {ing.name}
                  {ing.isMain && <span className="text-[9px] text-cacao-400">主</span>}
                </span>
                <span className="num text-xs ml-1 shrink-0">{ing.quantity}{ing.unit}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function OptionPicker({ label, recipes, selected, onChange, emptyHint }) {
  const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  return (
    <div>
      <label className="field-label">{label}</label>
      {recipes.length === 0 ? (
        <p className="text-xs text-cacao-400 py-2">食谱库为空，请先添加食谱</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {recipes.map(r => {
            const active = selected.includes(r.id)
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggle(r.id)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-sm transition
                  ${active ? 'bg-olive-600 text-cream-50' : 'bg-cream-100 text-cacao-600 hover:bg-cream-200'}`}
              >
                <span className="truncate">{r.name}</span>
                <span className={`chip text-[10px] ${active ? 'bg-cream-50/20' : 'bg-cream-200'}`}>
                  {MEAL_META[r.mealType]?.label || '其他'}
                </span>
              </button>
            )
          })}
        </div>
      )}
      {emptyHint && selected.length === 0 && recipes.length > 0 && (
        <p className="text-xs text-cacao-400 mt-1.5">{emptyHint}</p>
      )}
    </div>
  )
}

function ReplacePicker({ inventory, recipes, currentRecipeId, onPick }) {
  // 计算每个食谱的匹配度，按主料齐全 + 缺料数排序
  const ranked = useMemo(() => {
    return recipes.map(r => {
      const { missing, hasAll } = matchRecipeIngredients(r, inventory)
      const mainMissing = missing.filter(m => m.isMain).length
      return { r, missing: missing.length, mainMissing, hasAll }
    }).sort((a, b) => {
      if (a.mainMissing !== b.mainMissing) return a.mainMissing - b.mainMissing
      if (a.missing !== b.missing) return a.missing - b.missing
      return a.r.name.localeCompare(b.r.name, 'zh')
    })
  }, [recipes, inventory])

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
      {ranked.map(({ r, missing, mainMissing, hasAll }) => (
        <button
          key={r.id}
          onClick={() => onPick(r.id)}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition
            ${r.id === currentRecipeId ? 'bg-olive-100 ring-1 ring-olive-300' : 'bg-cream-100 hover:bg-cream-200'}`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="chip bg-cream-200 text-cacao-500 text-[10px]">{MEAL_META[r.mealType]?.label}</span>
              {r.cuisine && <span className="chip bg-cream-200 text-cacao-500 text-[10px]">{r.cuisine}</span>}
            </div>
            <p className="font-display font-semibold text-cacao-700 truncate">{r.name}</p>
            <div className="flex gap-2 mt-1 text-xs text-cacao-400">
              <span className="flex items-center gap-0.5"><Clock size={11} />{r.prepTime}分</span>
              {r.calories > 0 && <span className="flex items-center gap-0.5"><Flame size={11} />{r.calories}kcal</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            {hasAll
              ? <span className="chip bg-olive-100 text-olive-700 gap-1"><CheckCircle2 size={11} />齐全</span>
              : <span className="chip bg-pumpkin-100 text-pumpkin-600 gap-1"><AlertCircle size={11} />缺 {missing}</span>}
            {mainMissing > 0 && <p className="text-[10px] text-tomato-500 mt-1">缺主料 {mainMissing}</p>}
          </div>
        </button>
      ))}
    </div>
  )
}

function InspirationView({ inventory, preference }) {
  const [ideas] = useState(() => generateLocalInspirations(inventory, preference, 4))

  if (ideas.length === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="库存还太少"
        description="先在「食材库存」里添加一些食材，再回来看看灵感"
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-cream-100 rounded-xl p-3 text-xs text-cacao-500 leading-relaxed">
        以下灵感基于现有库存与临期食材，由本地模板生成；接入大模型 API 后可输出更自由的创意菜品。
      </div>
      {ideas.map(idea => (
        <div key={idea.id} className="card-base p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="font-display font-semibold text-cacao-700">{idea.name}</h4>
            <div className="flex gap-1">
              {idea.tags.map(t => <span key={t} className={`chip ${tagColor(t)} text-[10px]`}>{t}</span>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {idea.ingredients.map((i, idx) => (
              <span key={idx} className="chip bg-cream-200 text-cacao-500">{i.name} {i.quantity}{i.unit}</span>
            ))}
          </div>
          <ol className="space-y-1.5 text-sm text-cacao-600">
            {idea.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="num text-olive-600 font-semibold shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
          {idea.note && <p className="mt-2 text-xs text-olive-700 italic">{idea.note}</p>}
        </div>
      ))}
    </div>
  )
}

function HistoryList({ plans, inventory, onPick }) {
  const sorted = [...plans].sort((a, b) => (a.date < b.date ? 1 : -1))
  return (
    <div className="card-base p-5">
      <h3 className="font-display text-lg font-semibold text-cacao-700 mb-3 flex items-center gap-2">
        <History size={18} className="text-olive-600" /> 历史计划
      </h3>
      <div className="space-y-2">
        {sorted.map(p => {
          const total = (p.meals || []).reduce((s, m) => s + (m.recipeSnapshot?.calories || 0), 0)
          const d = daysUntil(p.date)
          const dayLabel = d === 0 ? '今天' : d === 1 ? '明天' : d === -1 ? '昨天' : fmtDate(p.date, 'MM月dd日')
          return (
            <button
              key={p.id}
              onClick={() => onPick(p.date)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-cream-100 hover:bg-cream-200 transition text-left"
            >
              <div className="min-w-0">
                <p className="font-medium text-cacao-700">{dayLabel}</p>
                <p className="text-xs text-cacao-400 truncate mt-0.5">
                  {(p.meals || []).map(m => m.recipeSnapshot?.name).join(' · ')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="num text-cacao-600 text-sm">{total} kcal</p>
                <p className="text-[11px] text-cacao-400">{p.meals?.length || 0} 餐</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
