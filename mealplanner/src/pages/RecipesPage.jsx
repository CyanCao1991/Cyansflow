import { useMemo, useState } from 'react'
import {
  BookOpen, Plus, Pencil, Trash2, Search, Sun, CloudSun, Moon, Cookie,
  Flame, Clock, ChefHat, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import TagInput from '../components/TagInput'
import { EmptyState, SectionHeader, StatCard, AddButton, Tag } from '../components/ui'
import { matchRecipeIngredients, tagColor, fmtDate } from '../lib/utils'

const MEALS = [
  { key: 'all',       label: '全部',  icon: BookOpen },
  { key: 'breakfast', label: '早餐',  icon: Sun },
  { key: 'lunch',     label: '午餐',  icon: CloudSun },
  { key: 'dinner',    label: '晚餐',  icon: Moon },
  { key: 'snack',     label: '小食',  icon: Cookie },
]

const MEAL_META = {
  breakfast: { label: '早餐', cls: 'bg-pumpkin-100 text-pumpkin-600' },
  lunch:     { label: '午餐', cls: 'bg-olive-100 text-olive-700' },
  dinner:    { label: '晚餐', cls: 'bg-skyhaze-400/20 text-skyhaze-500' },
  snack:     { label: '小食', cls: 'bg-cream-200 text-cacao-500' },
}

const DIFFICULTY_META = {
  easy:   { label: '简单', cls: 'bg-olive-100 text-olive-700' },
  medium: { label: '中等', cls: 'bg-pumpkin-100 text-pumpkin-600' },
  hard:   { label: '较难', cls: 'bg-tomato-500/15 text-tomato-600' },
}

const EMPTY_RECIPE = {
  id: null,
  name: '',
  mealType: 'lunch',
  cuisine: '',
  difficulty: 'easy',
  prepTime: 15,
  calories: 0,
  servings: 1,
  ingredients: [],
  steps: [],
  tags: [],
  note: '',
}

const TAG_SUGGESTIONS = ['清淡', '重口', '麻辣', '酸甜', '快手', '高蛋白', '低脂', '低卡', '素食', '汤品', '下饭', '一锅出', '早餐', '宴客']

export default function RecipesPage() {
  const { recipes, inventory, addRecipe, updateRecipe, removeRecipe } = useApp()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)

  const stats = useMemo(() => ({
    total: recipes.length,
    breakfast: recipes.filter(r => r.mealType === 'breakfast').length,
    lunch: recipes.filter(r => r.mealType === 'lunch').length,
    dinner: recipes.filter(r => r.mealType === 'dinner').length,
  }), [recipes])

  const list = useMemo(() => {
    let arr = recipes
    if (tab !== 'all') arr = arr.filter(r => r.mealType === tab)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      arr = arr.filter(r => r.name.toLowerCase().includes(q) ||
        (r.cuisine || '').toLowerCase().includes(q) ||
        (r.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (r.ingredients || []).some(i => i.name.toLowerCase().includes(q)))
    }
    return arr
  }, [recipes, tab, query])

  const openAdd = () => setEditing({ ...EMPTY_RECIPE })
  const openEdit = r => setEditing({ ...r, ingredients: r.ingredients?.map(x => ({ ...x })) || [], steps: [...(r.steps || [])], tags: [...(r.tags || [])] })
  const close = () => setEditing(null)
  const submit = () => {
    if (!editing.name.trim()) return
    const cleaned = {
      ...editing,
      ingredients: editing.ingredients.filter(i => i.name.trim()),
      steps: editing.steps.filter(s => s.trim()),
      tags: editing.tags.filter(Boolean),
    }
    if (editing.id) updateRecipe(editing.id, cleaned)
    else addRecipe({ ...cleaned, id: null })
    close()
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeader
        title="食谱库"
        subtitle="管理你的拿手菜与原料清单，自动生成每日计划时从这里挑选"
        icon={BookOpen}
        action={<AddButton label="添加食谱" onClick={openAdd} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="食谱总数" value={stats.total} unit="道" icon={BookOpen} accent="olive" />
        <StatCard label="早餐" value={stats.breakfast} unit="道" icon={Sun} accent="pumpkin" />
        <StatCard label="午餐" value={stats.lunch} unit="道" icon={CloudSun} accent="olive" />
        <StatCard label="晚餐" value={stats.dinner} unit="道" icon={Moon} accent="skyhaze" />
      </div>

      <div className="card-base p-3 sm:p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cacao-400" />
          <input
            className="field-input pl-9"
            placeholder="搜索菜名 / 菜系 / 标签 / 原料..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MEALS.map(m => {
            const Icon = m.icon
            const active = tab === m.key
            const count = m.key === 'all' ? recipes.length : recipes.filter(r => r.mealType === m.key).length
            return (
              <button
                key={m.key}
                onClick={() => setTab(m.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5
                  ${active ? 'bg-olive-600 text-cream-50 shadow-soft' : 'bg-cream-200/60 text-cacao-500 hover:bg-cream-200'}`}
              >
                <Icon size={14} /> {m.label}
                <span className={`num text-xs px-1.5 rounded-full ${active ? 'bg-cream-50/25' : 'bg-cream-50/60'}`}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card-base">
          <EmptyState
            icon={BookOpen}
            title="还没有食谱"
            description="把你的拿手菜加进来：原料、步骤、口味标签，自动生成计划时会用到"
            action={<AddButton label="添加食谱" onClick={openAdd} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map(r => (
            <RecipeCard
              key={r.id}
              recipe={r}
              inventory={inventory}
              onView={() => setViewing(r)}
              onEdit={() => openEdit(r)}
              onDelete={() => removeRecipe(r.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={close}
        title={editing?.id ? '编辑食谱' : '添加食谱'}
        subtitle={editing?.id ? '修改食谱信息、原料与步骤' : '完整记录一道菜的做法'}
        size="xl"
        footer={
          <>
            <button className="btn-secondary" onClick={close}>取消</button>
            <button className="btn-primary" onClick={submit} disabled={!editing?.name?.trim()}>
              <Plus size={16} /> {editing?.id ? '保存' : '添加'}
            </button>
          </>
        }
      >
        {editing && <RecipeForm value={editing} onChange={setEditing} inventory={inventory} />}
      </Modal>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.name}
        subtitle={viewing ? `${MEAL_META[viewing.mealType]?.label || ''} · ${viewing.cuisine || '家常'} · ${viewing.prepTime} 分钟` : ''}
        size="lg"
      >
        {viewing && <RecipeDetail recipe={viewing} inventory={inventory} />}
      </Modal>
    </div>
  )
}

function RecipeCard({ recipe, inventory, onView, onEdit, onDelete }) {
  const mealMeta = MEAL_META[recipe.mealType] || MEAL_META.lunch
  const diffMeta = DIFFICULTY_META[recipe.difficulty] || DIFFICULTY_META.easy
  const { hasAll, missing } = matchRecipeIngredients(recipe, inventory)
  return (
    <div className="card-base p-4 group relative transition hover:shadow-lift hover:-translate-y-0.5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onView} className="text-left min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`chip ${mealMeta.cls}`}>{mealMeta.label}</span>
            {recipe.cuisine && <span className="chip bg-cream-200 text-cacao-500">{recipe.cuisine}</span>}
          </div>
          <h3 className="font-display font-semibold text-cacao-700 truncate text-lg">{recipe.name}</h3>
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button className="btn-ghost p-1.5" onClick={onEdit}><Pencil size={14} /></button>
          <button className="btn-danger p-1.5" onClick={onDelete}><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <span className={`chip ${diffMeta.cls}`}>{diffMeta.label}</span>
        <span className="chip bg-cream-200 text-cacao-500 gap-1"><Clock size={11} />{recipe.prepTime}分钟</span>
        {recipe.calories > 0 && (
          <span className="chip bg-cream-200 text-cacao-500 gap-1"><Flame size={11} />{recipe.calories}kcal</span>
        )}
        {(recipe.tags || []).slice(0, 2).map(t => (
          <span key={t} className={`chip ${tagColor(t)}`}>{t}</span>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-cream-300/70 flex items-center justify-between">
        <span className="text-xs text-cacao-400">原料 {recipe.ingredients?.length || 0} 种</span>
        {hasAll ? (
          <span className="chip bg-olive-100 text-olive-700 gap-1"><CheckCircle2 size={11} />原料齐</span>
        ) : missing.length > 0 ? (
          <span className="chip bg-pumpkin-100 text-pumpkin-600 gap-1"><AlertCircle size={11} />缺 {missing.length}</span>
        ) : null}
      </div>
    </div>
  )
}

function RecipeDetail({ recipe, inventory }) {
  const { matched, missing } = matchRecipeIngredients(recipe, inventory)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {(recipe.tags || []).map(t => <Tag key={t} color={tagColor(t)}>{t}</Tag>)}
      </div>

      <div>
        <h4 className="field-label mb-2">所需原料</h4>
        <ul className="space-y-1.5">
          {recipe.ingredients?.map((i, idx) => {
            const found = matched.find(m => m.need.name === i.name)
            const isMissing = missing.some(m => m.name === i.name)
            return (
              <li key={idx} className="flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-lg bg-cream-100/70">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isMissing ? 'bg-tomato-500' : 'bg-olive-500'}`} />
                  <span className="text-cacao-700 truncate">{i.name}</span>
                  {i.isMain && <span className="chip bg-cream-200 text-cacao-500 text-[10px]">主料</span>}
                </div>
                <span className="num text-cacao-500 text-sm shrink-0">
                  {i.quantity}{i.unit}
                  {isMissing
                    ? <span className="ml-1 text-tomato-500">·缺</span>
                    : <span className="ml-1 text-olive-600">·有</span>}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {recipe.steps?.length > 0 && (
        <div>
          <h4 className="field-label mb-2">烹饪步骤</h4>
          <ol className="space-y-2.5">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-olive-600 text-cream-50 flex items-center justify-center text-xs font-semibold shrink-0 num">{i + 1}</span>
                <p className="text-cacao-600 leading-relaxed pt-0.5">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {recipe.note && (
        <div className="bg-cream-100 rounded-xl p-3 text-sm text-cacao-500 italic">
          {recipe.note}
        </div>
      )}
    </div>
  )
}

function RecipeForm({ value, onChange, inventory }) {
  const set = (patch) => onChange({ ...value, ...patch })

  const setIngredient = (idx, patch) => {
    const list = value.ingredients.map((x, i) => i === idx ? { ...x, ...patch } : x)
    set({ ingredients: list })
  }
  const addIngredient = () => set({ ingredients: [...value.ingredients, { name: '', quantity: 100, unit: 'g', isMain: false }] })
  const removeIngredient = idx => set({ ingredients: value.ingredients.filter((_, i) => i !== idx) })

  const setStep = (idx, text) => {
    const steps = value.steps.map((s, i) => i === idx ? text : s)
    set({ steps })
  }
  const addStep = () => set({ steps: [...value.steps, ''] })
  const removeStep = idx => set({ steps: value.steps.filter((_, i) => i !== idx) })

  const nameSuggestions = useMemo(() => {
    const seen = new Set()
    return inventory
      .filter(i => i.name && !seen.has(i.name))
      .map(i => (seen.add(i.name), i.name))
      .slice(0, 20)
  }, [inventory])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="field-label">菜名</label>
          <input className="field-input" value={value.name}
                 onChange={e => set({ name: e.target.value })} placeholder="如 番茄炒蛋" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="field-label">餐型</label>
          <select className="field-input" value={value.mealType}
                  onChange={e => set({ mealType: e.target.value })}>
            <option value="breakfast">早餐</option>
            <option value="lunch">午餐</option>
            <option value="dinner">晚餐</option>
            <option value="snack">小食</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="field-label">菜系</label>
          <input className="field-input" value={value.cuisine || ''}
                 onChange={e => set({ cuisine: e.target.value })} placeholder="家常/川菜" />
        </div>
        <div>
          <label className="field-label">难度</label>
          <select className="field-input" value={value.difficulty}
                  onChange={e => set({ difficulty: e.target.value })}>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">较难</option>
          </select>
        </div>
        <div>
          <label className="field-label">时长(分)</label>
          <input type="number" min="1" className="field-input num" value={value.prepTime}
                 onChange={e => set({ prepTime: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="field-label">热量(kcal)</label>
          <input type="number" min="0" className="field-input num" value={value.calories}
                 onChange={e => set({ calories: parseInt(e.target.value) || 0 })} />
        </div>
      </div>

      {/* 原料 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">所需原料</label>
          <button type="button" className="btn-ghost text-xs" onClick={addIngredient}>
            <Plus size={12} /> 添加原料
          </button>
        </div>
        <div className="space-y-2">
          {value.ingredients.map((ing, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                className="field-input col-span-5"
                list="ingredient-suggestions"
                value={ing.name}
                onChange={e => setIngredient(idx, { name: e.target.value })}
                placeholder="原料名"
              />
              <input
                type="number" min="0" step="any"
                className="field-input col-span-3 num"
                value={ing.quantity}
                onChange={e => setIngredient(idx, { quantity: parseFloat(e.target.value) || 0 })}
              />
              <input
                className="field-input col-span-2"
                value={ing.unit}
                onChange={e => setIngredient(idx, { unit: e.target.value })}
                placeholder="单位"
              />
              <button
                type="button"
                onClick={() => setIngredient(idx, { isMain: !ing.isMain })}
                className={`col-span-1 h-9 rounded-lg text-xs font-medium transition
                  ${ing.isMain ? 'bg-olive-600 text-cream-50' : 'bg-cream-200 text-cacao-400'}`}
                title="标记为主料"
              >主</button>
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="col-span-1 h-9 rounded-lg text-tomato-600 hover:bg-tomato-500/10 transition"
              >
                <Trash2 size={14} className="mx-auto" />
              </button>
            </div>
          ))}
          {value.ingredients.length === 0 && (
            <p className="text-xs text-cacao-400 py-2">至少添加一项原料，才能在生成计划时匹配</p>
          )}
        </div>
        <datalist id="ingredient-suggestions">
          {nameSuggestions.map(n => <option key={n} value={n} />)}
        </datalist>
      </div>

      {/* 步骤 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">烹饪步骤</label>
          <button type="button" className="btn-ghost text-xs" onClick={addStep}>
            <Plus size={12} /> 添加步骤
          </button>
        </div>
        <div className="space-y-2">
          {value.steps.map((s, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="w-6 h-6 mt-1.5 rounded-full bg-olive-600 text-cream-50 flex items-center justify-center text-xs font-semibold shrink-0 num">{idx + 1}</span>
              <textarea
                className="field-input flex-1"
                rows={2}
                value={s}
                onChange={e => setStep(idx, e.target.value)}
                placeholder="详细描述这一步..."
              />
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="mt-1.5 btn-danger p-1.5"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {value.steps.length === 0 && (
            <p className="text-xs text-cacao-400 py-2">添加步骤，方便日后查看做法</p>
          )}
        </div>
      </div>

      {/* 标签 */}
      <div>
        <label className="field-label">口味 / 标签</label>
        <TagInput
          value={value.tags}
          onChange={tags => set({ tags })}
          suggestions={TAG_SUGGESTIONS}
          placeholder="如 清淡、高蛋白"
        />
      </div>

      <div>
        <label className="field-label">备注</label>
        <textarea className="field-input" rows={2} value={value.note || ''}
                  onChange={e => set({ note: e.target.value })}
                  placeholder="如：儿童友好、忌口提示" />
      </div>
    </div>
  )
}
