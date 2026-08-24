// 把前端种子数据（JS import）转换成飞书 Base cellValue 格式，
// 输出为 3 个独立文件（inventory / recipes / preference），供 lark-cli batch-create 读取
import { SEED_INVENTORY, SEED_RECIPES, SEED_PREFERENCE } from '../src/lib/seedData.js'
import { writeFileSync } from 'node:fs'

function pad(n) { return n < 10 ? '0' + n : '' + n }

function fmtDateYMD(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function fmtDateTime(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 飞书 Base select 字段不会自动新建选项；这里用白名单只保留已预定义的值
const INVENTORY_TAG_ALLOW = new Set(['清淡', '高蛋白', '主食替代', '素食', '辣'])
const RECIPES_TAG_ALLOW = new Set(['清淡', '重口', '快手', '高蛋白', '低脂', '低卡', '素食', '下饭', '汤品', '健身'])
const PREFERENCE_TASTE_LIKE = new Set(['清淡', '重口', '麻辣', '酸甜', '咸鲜', '快手'])
const PREFERENCE_TASTE_AVOID = new Set(['麻辣', '重口', '过咸', '过甜'])
const PREFERENCE_CUISINE = new Set(['家常', '川菜', '粤菜', '西式', '日式', '韩式'])
const PREFERENCE_NUTRITION = new Set(['高蛋白', '低脂', '低卡', '素食', '均衡'])

// 1. 食材库存
const inv = SEED_INVENTORY.map(it => ({
  '名称': it.name,
  '类型': [it.category === 'ingredient' ? '食材' : '调味料'],
  '子分类': it.subcategory || '',
  '数量': Number(it.quantity),
  '单位': it.unit,
  '采购日期': fmtDateYMD(it.purchaseDate),
  '保质期至': fmtDateYMD(it.expiryDate),
  '标签': Array.isArray(it.tags) ? it.tags.filter(t => INVENTORY_TAG_ALLOW.has(t)) : [],
  '备注': it.note || '',
}))

// 2. 食谱库
const mealMap = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '小食' }
const diffMap = { easy: '简单', medium: '中等', hard: '较难' }
const rec = SEED_RECIPES.map(r => ({
  '菜名': r.name,
  '餐型': [mealMap[r.mealType] || '午餐'],
  '菜系': r.cuisine || '',
  '难度': [diffMap[r.difficulty] || '简单'],
  '时长(分)': Number(r.prepTime) || 0,
  '热量(kcal)': Number(r.calories) || 0,
  '份数': Number(r.servings) || 1,
  '标签': Array.isArray(r.tags) ? r.tags.filter(t => RECIPES_TAG_ALLOW.has(t)) : [],
  '原料(JSON)': JSON.stringify((r.ingredients || []).map(x => ({
    name: x.name, quantity: x.quantity, unit: x.unit, isMain: !!x.isMain
  }))),
  '步骤(JSON)': JSON.stringify(r.steps || []),
  '备注': r.note || '',
}))

// 3. 偏好设置
const mealsMapNum = { 1: '1 餐', 2: '2 餐', 3: '3 餐', 4: '4 餐(加小食)' }
const pref = [{
  '配置名': '默认',
  '喜欢口味': Array.isArray(SEED_PREFERENCE.tasteTags) ? SEED_PREFERENCE.tasteTags.filter(t => PREFERENCE_TASTE_LIKE.has(t)) : [],
  '忌口口味': Array.isArray(SEED_PREFERENCE.avoidTags) ? SEED_PREFERENCE.avoidTags.filter(t => PREFERENCE_TASTE_AVOID.has(t)) : [],
  '忌口食材(JSON)': JSON.stringify(SEED_PREFERENCE.avoidIngredients || []),
  '偏好菜系': Array.isArray(SEED_PREFERENCE.cuisinePreference) ? SEED_PREFERENCE.cuisinePreference.filter(t => PREFERENCE_CUISINE.has(t)) : [],
  '餐数': [mealsMapNum[SEED_PREFERENCE.mealsPerDay] || '3 餐'],
  '热量目标(kcal)': Number(SEED_PREFERENCE.calorieTarget || 1800),
  '营养重点': Array.isArray(SEED_PREFERENCE.nutritionFocus) ? SEED_PREFERENCE.nutritionFocus.filter(t => PREFERENCE_NUTRITION.has(t)) : [],
  '优先消耗临期': !!SEED_PREFERENCE.preferUseExpiring,
}]

const base = process.argv[2] || '.'
writeFileSync(`${base}/_lark/seed_inventory.json`, JSON.stringify({ create_records: inv }, null, 2), 'utf8')
writeFileSync(`${base}/_lark/seed_recipes.json`, JSON.stringify({ create_records: rec }, null, 2), 'utf8')
writeFileSync(`${base}/_lark/seed_preference.json`, JSON.stringify({ create_records: pref }, null, 2), 'utf8')

console.log(JSON.stringify({
  ok: true,
  inventory: inv.length,
  recipes: rec.length,
  preference: pref.length,
}, null, 2))
