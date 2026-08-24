import { useState } from 'react'
import { Sliders, Sun, CloudSun, Moon, Cookie, Flame, Leaf, ShieldAlert, RotateCcw, Heart, Trash2, Cloud, CloudUpload, CloudDownload, Copy, Check, Download, Database } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import TagInput from '../components/TagInput'
import { SectionHeader } from '../components/ui'
import { SEED_INVENTORY, SEED_RECIPES, SEED_PREFERENCE } from '../lib/seedData'
import {
  DEFAULT_BASE_TOKEN,
  TABLE_IDS,
  TABLE_NAMES,
  buildSyncPayload,
  buildUploadCommands,
  buildDownloadCommands,
  hydrateFromBaseExport,
} from '../lib/larkSync'

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
  const { preference, inventory, recipes, plans, updatePreference, setInventory, setRecipes, setPreference, setPlans, resetAll } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showDownload, setShowDownload] = useState(false)
  const [restoreText, setRestoreText] = useState('')
  const [restoreErr, setRestoreErr] = useState('')
  const [copyState, setCopyState] = useState({})
  const [importConfirm, setImportConfirm] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const p = preference

  const ingredientNames = Array.from(new Set(inventory.map(i => i.name))).sort()

  const syncPayload = buildSyncPayload({ inventory, recipes, preference, plans })
  const syncPayloadStr = JSON.stringify(syncPayload, null, 2)
  const uploadCmd = buildUploadCommands(syncPayload, { asUser: true })
  const downloadCmd = buildDownloadCommands({ asUser: true })

  async function copyOnce(key, text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopyState(s => ({ ...s, [key]: true }))
      setTimeout(() => setCopyState(s => ({ ...s, [key]: false })), 1500)
    } catch (_) { /* ignore */ }
  }

  function downloadAsFile(name, text, mime = 'application/json') {
    const blob = new Blob([text], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  function triggerParseRestore() {
    setRestoreErr('')
    const text = restoreText.trim()
    if (!text) { setRestoreErr('请先粘贴恢复 JSON'); return }
    let parsed
    try { parsed = JSON.parse(text) } catch (e) {
      setRestoreErr(`JSON 解析失败：${e.message}`); return
    }
    const keys = ['inventory', 'recipes', 'preference', 'plans']
    if (!keys.some(k => Array.isArray(parsed[k]) || (k === 'preference' && parsed[k] !== undefined))) {
      setRestoreErr('JSON 结构不匹配，需包含 inventory/recipes/preference/plans 字段')
      return
    }
    const restored = hydrateFromBaseExport({
      inventoryRows: parsed.inventory || [],
      recipesRows:   parsed.recipes || [],
      preferenceRows: parsed.preference && !Array.isArray(parsed.preference) ? [parsed.preference] : (parsed.preference || []),
      plansRows:     parsed.plans || [],
    })
    setPendingImport(restored)
    setImportConfirm(true)
  }

  function applyRestore() {
    if (!pendingImport) return
    if (pendingImport.inventory && Array.isArray(pendingImport.inventory)) setInventory(pendingImport.inventory)
    if (pendingImport.recipes   && Array.isArray(pendingImport.recipes))   setRecipes(pendingImport.recipes)
    if (pendingImport.preference)                                           setPreference(pendingImport.preference)
    if (pendingImport.plans     && Array.isArray(pendingImport.plans))     setPlans(pendingImport.plans)
    setPendingImport(null)
    setImportConfirm(false)
    setRestoreText('')
    setShowDownload(false)
  }

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

      {/* 飞书 Base 同步 */}
      <section className="card-base p-5 border-olive-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Cloud size={16} className="text-olive-600" />
          <h3 className="font-display text-lg font-semibold text-cacao-700">飞书 Base 云同步</h3>
        </div>
        <div className="flex items-start gap-2 mb-3">
          <Database size={14} className="text-cacao-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-cacao-500 leading-relaxed">
              把你的本地数据同步到飞书多维表格，或从 Base 里的表格恢复回来。
              已绑定 Base：
              <code className="mx-1 rounded bg-cream-200 px-1.5 py-0.5 text-[11px] text-cacao-700">{DEFAULT_BASE_TOKEN}</code>
              ，含 4 张数据表：
              {Object.values(TABLE_NAMES).join('、')}。
            </p>
            <p className="text-xs text-cacao-400 mt-1.5">
              由于浏览器跨域与密钥安全限制，云同步通过生成本机可执行的 CLI 命令完成，你只需复制粘贴即可。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <CloudUpload size={16} /> 上传到飞书 Base
          </button>
          <button onClick={() => setShowDownload(true)} className="btn-secondary">
            <CloudDownload size={16} /> 从飞书 Base 恢复
          </button>
        </div>
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

      {/* 上传模态 */}
      <Modal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        title="上传到飞书 Base"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowUpload(false)}>关闭</button>
            <button className="btn-secondary" onClick={() => downloadAsFile('sync-payload.json', syncPayloadStr)}>
              <Download size={16} /> 下载 sync-payload.json
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                downloadAsFile('sync-payload.json', syncPayloadStr)
                copyOnce('upCmd', uploadCmd)
              }}
            >
              <Download size={16} /> 下载 JSON + 复制命令
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-cacao-500 leading-relaxed">
            同步 4 张表：<b>食材库存 {syncPayload.tables.inventory.length}</b> 条、
            <b>食谱库 {syncPayload.tables.recipes.length}</b> 条、
            <b>偏好设置 {syncPayload.tables.preference.length}</b> 条、
            <b>每日计划 {syncPayload.tables.plans.length}</b> 条。
            若 Base 中已有数据，建议先清空对应表再执行下面的脚本，避免重复。
          </p>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="field-label mb-0">① 同步 JSON（也可在上方直接下载为 sync-payload.json 文件）</label>
              <button className="btn-secondary !py-1 !px-2 text-xs" onClick={() => copyOnce('upJson', syncPayloadStr)}>
                {copyState.upJson ? <><Check size={12} /> 已复制</> : <><Copy size={12} /> 复制 JSON</>}
              </button>
            </div>
            <textarea readOnly value={syncPayloadStr}
              className="w-full h-44 font-mono text-[11px] rounded-xl border border-cream-300 bg-cream-50/60 p-3 text-cacao-700 resize-y"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="field-label mb-0">② 执行命令（粘贴到本机终端执行即可写入飞书 Base）</label>
              <button className="btn-secondary !py-1 !px-2 text-xs" onClick={() => copyOnce('upCmd2', uploadCmd)}>
                {copyState.upCmd2 ? <><Check size={12} /> 已复制</> : <><Copy size={12} /> 复制命令</>}
              </button>
            </div>
            <textarea readOnly value={uploadCmd}
              className="w-full h-56 font-mono text-[11px] rounded-xl border border-cream-300 bg-cacao-900/95 p-3 text-cream-100 resize-y"
              spellCheck={false}
            />
          </div>

          <div className="rounded-xl bg-cream-200/50 border border-cream-300 p-3 text-xs text-cacao-500 leading-relaxed">
            <p className="font-semibold text-cacao-700 mb-1">操作步骤</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>把"同步 JSON"下载成文件 <code>sync-payload.json</code>，放到 <code>/workspace/mealplanner</code> 目录下</li>
              <li>复制第 ② 步的命令，粘贴到本机终端并运行（需先完成飞书授权，lark-cli 可用）</li>
              <li>脚本会自动把数据写入飞书 Base 的 4 张表</li>
            </ol>
          </div>
        </div>
      </Modal>

      {/* 恢复模态 */}
      <Modal
        open={showDownload}
        onClose={() => setShowDownload(false)}
        title="从飞书 Base 恢复"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowDownload(false)}>关闭</button>
            <button
              className="btn-primary bg-olive-600 hover:bg-olive-700"
              onClick={triggerParseRestore}
            >
              <CloudDownload size={16} /> 解析并预览恢复
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-cacao-500 leading-relaxed">
            先在本机终端执行下方命令把飞书 Base 中 4 张表的记录导出成 JSON，然后把末尾打印出的
            <code className="mx-1 rounded bg-cream-200 px-1 py-0.5 text-[11px]">恢复 JSON</code>
            整段粘贴到下面的文本框里，点击"解析并预览恢复"。
          </p>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="field-label mb-0">① 导出命令（本机终端执行）</label>
              <button className="btn-secondary !py-1 !px-2 text-xs" onClick={() => copyOnce('dnCmd', downloadCmd)}>
                {copyState.dnCmd ? <><Check size={12} /> 已复制</> : <><Copy size={12} /> 复制命令</>}
              </button>
            </div>
            <textarea readOnly value={downloadCmd}
              className="w-full h-72 font-mono text-[11px] rounded-xl border border-cream-300 bg-cacao-900/95 p-3 text-cream-100 resize-y"
              spellCheck={false}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="field-label mb-0">② 粘贴恢复 JSON</label>
            </div>
            <textarea
              value={restoreText}
              onChange={e => setRestoreText(e.target.value)}
              placeholder='例如 {"inventory":[...],"recipes":[...],"preference":[...],"plans":[...]}'
              className="w-full h-40 font-mono text-[11px] rounded-xl border border-cream-300 bg-cream-50/60 p-3 text-cacao-700 resize-y"
            />
            {restoreErr && <p className="mt-1.5 text-xs text-tomato-600">{restoreErr}</p>}
          </div>
        </div>
      </Modal>

      {/* 导入确认 */}
      <Modal
        open={importConfirm}
        onClose={() => setImportConfirm(false)}
        title="确认覆盖本地数据？"
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setImportConfirm(false)}>取消</button>
            <button className="btn-primary bg-olive-600 hover:bg-olive-700" onClick={applyRestore}>
              <Database size={16} /> 确认覆盖
            </button>
          </>
        }
      >
        {pendingImport && (
          <div className="space-y-2 text-sm text-cacao-600 leading-relaxed">
            <p>解析成功！即将把以下数据<u className="text-tomato-600">覆盖写入</u>本地 localStorage：</p>
            <ul className="list-disc list-inside text-cacao-700 space-y-1 pl-1">
              <li>食材库存 <b>{pendingImport.inventory.length}</b> 条</li>
              <li>食谱库 <b>{pendingImport.recipes.length}</b> 条</li>
              <li>偏好设置 <b>{pendingImport.preference ? '已解析' : '空'}</b></li>
              <li>每日计划 <b>{pendingImport.plans.length}</b> 条</li>
            </ul>
            <p className="text-xs text-cacao-400 pt-1">建议先在"上传到飞书 Base"里备份当前本地数据。</p>
          </div>
        )}
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
