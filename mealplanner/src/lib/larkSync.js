// 飞书多维表格同步模块：纯前端 + 用户本地 lark-cli
// 原理：把当前 localStorage 里的 4 份数据（库存/食谱/偏好/计划）
//       序列化成标准 JSON，用户复制后
//       用 lark-cli base +record-batch-create 命令批量写入飞书 Base；
//       反之，把 lark-cli record-list 输出的 JSON 粘贴进来即可恢复。
//
// 注意：飞书 OpenAPI 有 CORS 限制且需要 app_secret 签名，
//       所以本模块不直接 fetch 调用官方 API，而是生成可复制粘贴的
//       CLI 命令和 JSON 数据，用户在本机一键执行。

export const DEFAULT_BASE_TOKEN = 'XbkRb7vtvaQRNEs4wdscugTjnge'

export const TABLE_IDS = {
  inventory: 'tbl1z8HX1ad3ZdaB',
  recipes:   'tblfUfuBPOPYsGe9',
  preference:'tblUq2mv4KMeQSli',
  plans:     'tblMnKodpEHUzrUb',
}

export const TABLE_NAMES = {
  inventory:  '食材库存',
  recipes:    '食谱库',
  preference: '偏好设置',
  plans:      '每日计划',
}

// —— 导出：localStorage → 飞书 Base cellValue ——

function pad(n) { return n < 10 ? '0' + n : '' + n }
function fmtDate(d) {
  if (!d) return null
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return null
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}
function fmtDateTime(d) {
  if (!d) return null
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return null
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const INV_TAG_ALLOW = new Set(['清淡', '高蛋白', '主食替代', '素食', '辣'])
const REC_TAG_ALLOW = new Set(['清淡', '重口', '快手', '高蛋白', '低脂', '低卡', '素食', '下饭', '汤品', '健身'])
const PREF_TASTE_LIKE = new Set(['清淡', '重口', '麻辣', '酸甜', '咸鲜', '快手'])
const PREF_TASTE_AVOID = new Set(['麻辣', '重口', '过咸', '过甜'])
const PREF_CUISINE = new Set(['家常', '川菜', '粤菜', '西式', '日式', '韩式'])
const PREF_NUTRITION = new Set(['高蛋白', '低脂', '低卡', '素食', '均衡'])
const mealMap = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '小食' }
const diffMap = { easy: '简单', medium: '中等', hard: '较难' }
const mealsCountMap = { 1: '1 餐', 2: '2 餐', 3: '3 餐', 4: '4 餐(加小食)' }

export function inventoryToRecords(items) {
  return (items || []).map(it => ({
    '名称': it.name,
    '类型': [it.category === 'ingredient' ? '食材' : '调味料'],
    '子分类': it.subcategory || '',
    '数量': Number(it.quantity) || 0,
    '单位': it.unit || '',
    '采购日期': fmtDate(it.purchaseDate),
    '保质期至': fmtDate(it.expiryDate),
    '标签': Array.isArray(it.tags) ? it.tags.filter(t => INV_TAG_ALLOW.has(t)) : [],
    '备注': it.note || '',
  }))
}

export function recipesToRecords(list) {
  return (list || []).map(r => ({
    '菜名': r.name,
    '餐型': [mealMap[r.mealType] || '午餐'],
    '菜系': r.cuisine || '',
    '难度': [diffMap[r.difficulty] || '简单'],
    '时长(分)': Number(r.prepTime) || 0,
    '热量(kcal)': Number(r.calories) || 0,
    '份数': Number(r.servings) || 1,
    '标签': Array.isArray(r.tags) ? r.tags.filter(t => REC_TAG_ALLOW.has(t)) : [],
    '原料(JSON)': JSON.stringify((r.ingredients || []).map(x => ({
      name: x.name, quantity: x.quantity, unit: x.unit, isMain: !!x.isMain,
    }))),
    '步骤(JSON)': JSON.stringify(r.steps || []),
    '备注': r.note || '',
  }))
}

export function preferenceToRecords(p) {
  if (!p) p = {}
  return [{
    '配置名': '默认',
    '喜欢口味': Array.isArray(p.tasteTags) ? p.tasteTags.filter(t => PREF_TASTE_LIKE.has(t)) : [],
    '忌口口味': Array.isArray(p.avoidTags) ? p.avoidTags.filter(t => PREF_TASTE_AVOID.has(t)) : [],
    '忌口食材(JSON)': JSON.stringify(p.avoidIngredients || []),
    '偏好菜系': Array.isArray(p.cuisinePreference) ? p.cuisinePreference.filter(t => PREF_CUISINE.has(t)) : [],
    '餐数': [mealsCountMap[p.mealsPerDay] || '3 餐'],
    '热量目标(kcal)': Number(p.calorieTarget) || 1800,
    '营养重点': Array.isArray(p.nutritionFocus) ? p.nutritionFocus.filter(t => PREF_NUTRITION.has(t)) : [],
    '优先消耗临期': !!p.preferUseExpiring,
  }]
}

export function plansToRecords(plans) {
  return (plans || []).map(p => ({
    '日期': fmtDate(p.date),
    '生成时间': fmtDateTime(p.generatedAt),
    '餐数': Number(p.mealsCount) || 0,
    '总热量(kcal)': Number(p.totalCalories) || 0,
    '缺料项数': Number(p.missingCount) || 0,
    '覆盖率(%)': Number(p.coverage) || 0,
    '使用了临期食材': !!p.usedExpiring,
    '详情(JSON)': JSON.stringify(p.plan || []),
  }))
}

// 把 4 份状态全部打包成同步需要的 payload
export function buildSyncPayload({ inventory, recipes, preference, plans }) {
  return {
    meta: { version: 'v1', baseToken: DEFAULT_BASE_TOKEN, generatedAt: new Date().toISOString() },
    tables: {
      inventory:  inventoryToRecords(inventory),
      recipes:    recipesToRecords(recipes),
      preference: preferenceToRecords(preference),
      plans:      plansToRecords(plans),
    },
  }
}

// 生成 lark-cli 上传命令（分步：先清空再写入）
// 注意：lark-cli record-delete 需要 record id，清空动作推荐在 Base UI 手动删除；
// 这里生成的是"追加写入"模式的命令；用户若要覆盖，在 Base UI 里先清空旧记录即可。
export function buildUploadCommands(payloadOrNull, { asUser = true } = {}) {
  const asFlag = asUser ? '--as user' : '--as bot'
  const base = 'XbkRb7vtvaQRNEs4wdscugTjnge'
  const tables = [
    { key: 'inventory',  id: TABLE_IDS.inventory,  name: TABLE_NAMES.inventory,  jsonVar: 'INV_JSON' },
    { key: 'recipes',    id: TABLE_IDS.recipes,    name: TABLE_NAMES.recipes,    jsonVar: 'REC_JSON' },
    { key: 'preference', id: TABLE_IDS.preference, name: TABLE_NAMES.preference, jsonVar: 'PREF_JSON' },
    { key: 'plans',      id: TABLE_IDS.plans,      name: TABLE_NAMES.plans,      jsonVar: 'PLANS_JSON' },
  ]
  const parts = []
  parts.push('# — 餐食计划：飞书 Base 上传命令 —')
  parts.push('# 1) 在本地 /workspace/mealplanner 目录下把同步 JSON 存成文件 sync-payload.json')
  parts.push('# 2) 执行下面这段脚本即可分表写入：')
  parts.push('')
  parts.push(`BASE="${base}"`)
  parts.push(`AS_FLAG="${asFlag}"`)
  parts.push(`cd /workspace/mealplanner`)
  parts.push('')
  for (const t of tables) {
    parts.push(`# 表：${t.name}（${t.id}）`)
    parts.push(`jq -c '{"create_records": .tables.${t.key}}' sync-payload.json > _lark/_upload_${t.key}.json`)
    parts.push(`lark-cli base +record-batch-create --base-token "$BASE" --table-id "${t.id}" --json "@_lark/_upload_${t.key}.json" $AS_FLAG`)
    parts.push('')
  }
  return parts.join('\n')
}

// —— 导入：飞书 Base cellValue → localStorage 数据结构 ——

const typeMapInv = { '食材': 'ingredient', '调味料': 'seasoning' }
const mealInv = { '早餐': 'breakfast', '午餐': 'lunch', '晚餐': 'dinner', '小食': 'snack' }
const diffInv = { '简单': 'easy', '中等': 'medium', '较难': 'hard' }
const mealsCntInv = { '1 餐': 1, '2 餐': 2, '3 餐': 3, '4 餐(加小食)': 4 }

// record-list 的返回字段通常是 .data.items[]：{fields: {名称, ...}, record_id}
// 也兼容直接传 fields 对象本身。
function pick(record, field, fallback = null) {
  const obj = record && record.fields ? record.fields : record
  if (!obj) return fallback
  const v = obj[field]
  if (v === undefined || v === null) return fallback
  return v
}
function pickArr(record, field) {
  const v = pick(record, field, [])
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v) return [v]
  return []
}

export function recordsToInventory(rows) {
  return (rows || []).map((r, i) => {
    const name = pick(r, '名称', `食材-${i + 1}`)
    const typeArr = pickArr(r, '类型')
    const cat = typeMapInv[typeArr[0]] || 'ingredient'
    // 用稳定的名字生成 id，确保 planner 可以按 name 匹配
    const id = `${cat === 'ingredient' ? 'ing' : 'sea'}_${btoa(name).slice(0, 8)}${i}`
    return {
      id,
      name,
      category: cat,
      subcategory: pick(r, '子分类', '') || '',
      quantity: Number(pick(r, '数量', 0)) || 0,
      unit: pick(r, '单位', '') || '',
      purchaseDate: pick(r, '采购日期', null),
      expiryDate: pick(r, '保质期至', null),
      tags: pickArr(r, '标签'),
      note: pick(r, '备注', '') || '',
    }
  })
}

export function recordsToRecipes(rows) {
  return (rows || []).map((r, i) => {
    const name = pick(r, '菜名', `菜谱-${i + 1}`)
    const mealArr = pickArr(r, '餐型')
    const diffArr = pickArr(r, '难度')
    let ingredients = []
    let steps = []
    try {
      const raw = pick(r, '原料(JSON)', '')
      if (raw) ingredients = JSON.parse(raw)
    } catch (_) { ingredients = [] }
    try {
      const raw = pick(r, '步骤(JSON)', '')
      if (raw) steps = JSON.parse(raw)
    } catch (_) { steps = [] }
    return {
      id: `rec_${btoa(name).slice(0, 8)}${i}`,
      name,
      mealType: mealInv[mealArr[0]] || 'lunch',
      cuisine: pick(r, '菜系', '') || '',
      difficulty: diffInv[diffArr[0]] || 'easy',
      prepTime: Number(pick(r, '时长(分)', 0)) || 0,
      calories: Number(pick(r, '热量(kcal)', 0)) || 0,
      servings: Number(pick(r, '份数', 1)) || 1,
      tags: pickArr(r, '标签'),
      ingredients,
      steps,
      note: pick(r, '备注', '') || '',
    }
  })
}

export function recordsToPreference(rows) {
  const r = (rows || [])[0]
  if (!r) return null
  let avoidIngredients = []
  try {
    const raw = pick(r, '忌口食材(JSON)', '')
    if (raw) avoidIngredients = JSON.parse(raw)
  } catch (_) { avoidIngredients = [] }
  const mealsArr = pickArr(r, '餐数')
  return {
    tasteTags: pickArr(r, '喜欢口味'),
    avoidTags: pickArr(r, '忌口口味'),
    avoidIngredients,
    cuisinePreference: pickArr(r, '偏好菜系'),
    mealsPerDay: mealsCntInv[mealsArr[0]] ?? 3,
    calorieTarget: Number(pick(r, '热量目标(kcal)', 1800)) || 1800,
    nutritionFocus: pickArr(r, '营养重点'),
    preferUseExpiring: !!pick(r, '优先消耗临期', false),
  }
}

export function recordsToPlans(rows) {
  return (rows || []).map((r, i) => {
    let plan = []
    try {
      const raw = pick(r, '详情(JSON)', '')
      if (raw) plan = JSON.parse(raw)
    } catch (_) { plan = [] }
    return {
      id: `plan_${Date.now()}_${i}`,
      date: pick(r, '日期', null),
      generatedAt: pick(r, '生成时间', null),
      mealsCount: Number(pick(r, '餐数', 0)) || 0,
      totalCalories: Number(pick(r, '总热量(kcal)', 0)) || 0,
      missingCount: Number(pick(r, '缺料项数', 0)) || 0,
      coverage: Number(pick(r, '覆盖率(%)', 0)) || 0,
      usedExpiring: !!pick(r, '使用了临期食材', false),
      plan,
    }
  })
}

// 把 lark-cli 返回的 JSON（.data.items 或直接数组）解出来并还原
export function hydrateFromBaseExport({ inventoryRows, recipesRows, preferenceRows, plansRows }) {
  return {
    inventory: recordsToInventory(inventoryRows),
    recipes: recordsToRecipes(recipesRows),
    preference: recordsToPreference(preferenceRows) || null,
    plans: recordsToPlans(plansRows),
  }
}

// 生成导出命令：把 lark-cli record-list 输出拼装成可粘贴的 JSON
export function buildDownloadCommands({ asUser = true } = {}) {
  const asFlag = asUser ? '--as user' : '--as bot'
  const base = DEFAULT_BASE_TOKEN
  const tables = [
    { key: 'inventory',  id: TABLE_IDS.inventory,  name: TABLE_NAMES.inventory },
    { key: 'recipes',    id: TABLE_IDS.recipes,    name: TABLE_NAMES.recipes },
    { key: 'preference', id: TABLE_IDS.preference, name: TABLE_NAMES.preference },
    { key: 'plans',      id: TABLE_IDS.plans,      name: TABLE_NAMES.plans },
  ]
  const lines = []
  lines.push('# — 餐食计划：从飞书 Base 导出为恢复 JSON —')
  lines.push('# 把以下命令分别在本机执行，然后把每行输出分别粘回到"从飞书 Base 恢复"对话框对应字段')
  lines.push('')
  lines.push(`BASE="${base}"`)
  lines.push(`AS_FLAG="${asFlag}"`)
  lines.push('cd /workspace/mealplanner')
  lines.push('')
  for (const t of tables) {
    lines.push(`# 表：${t.name}`)
    lines.push(`lark-cli base +record-list --base-token "$BASE" --table-id "${t.id}" $AS_FLAG --jq '.data.items' > _lark/_download_${t.key}.json`)
    lines.push(`echo "===${t.key}===" ; cat _lark/_download_${t.key}.json ; echo`)
    lines.push('')
  }
  lines.push('# — 一键打包成粘贴 JSON —')
  lines.push('node <<\'NODE\'')
  lines.push('const {readFileSync, writeFileSync} = require(\'fs\');')
  lines.push('const pkg = {')
  for (const t of tables) {
    lines.push(`  ${t.key}: (() => { try { return JSON.parse(readFileSync(\`_lark/_download_${t.key}.json\`, \'utf8\')) } catch (_) { return [] } })(),`)
  }
  lines.push('};')
  lines.push('writeFileSync(\'_lark/sync-restore.json\', JSON.stringify(pkg, null, 2));')
  lines.push('console.log(\'\\n==恢复 JSON 开始==\'); console.log(JSON.stringify(pkg)); console.log(\'\\n==恢复 JSON 结束==\');')
  lines.push('NODE')
  return lines.join('\n')
}
