// 餐食计划生成算法
// 输入：库存、食谱库、偏好、可选约束（必含、排除、目标日期）
// 输出：{ date, meals: [{type, recipeId, recipeSnapshot, missing, score, reasons}], summary }
//
// 评分维度（综合得分越高越优先）：
//   - 食材齐全度（主料全匹配得高分，缺主料重扣）
//   - 口味标签匹配 / 忌口过滤
//   - 菜系偏好
//   - 营养重点（高蛋白 / 低卡 / 素食...）
//   - 临期食材优先消耗（偏好开启时加分）
//   - 难度与烹饪时长（早餐倾向更简单）
//   - 已用食材去重（避免一日三餐重复消耗）
//
// 策略：先按餐型分组打分排序，再贪心选择三餐，每选一餐就扣除该餐使用的主料，
//       避免后续餐型重复消耗同一主料。

import { matchRecipeIngredients, expiryStatus, shuffle, uid, todayISO } from './utils'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] // 默认三餐

const DIFFICULTY_SCORE = { easy: 6, medium: 2, hard: -4 }
const MEAL_CALORIE_RATIO = { breakfast: 0.27, lunch: 0.4, dinner: 0.33 }

// 单食谱打分
function scoreRecipe(recipe, ctx) {
  const { inventory, preference, usedIngredientNames, mealType, caloriePerMeal } = ctx
  const reasons = []
  let score = 0

  // 1. 忌口食材：直接降权（不绝对剔除，给出警示）
  const avoidSet = new Set((preference.avoidIngredients || []).map(s => s.toLowerCase()))
  const hasAvoid = (recipe.ingredients || []).some(i => avoidSet.has(i.name.toLowerCase()))
  if (hasAvoid) {
    score -= 80
    reasons.push({ type: 'warn', text: '包含忌口食材' })
  }

  // 2. 食材齐全度
  const { matched, missing } = matchRecipeIngredients(recipe, inventory)
  const mainNeeds = (recipe.ingredients || []).filter(i => i.isMain)
  const mainMissing = missing.filter(i => i.isMain)
  const mainMatched = mainNeeds.length - mainMissing.length
  // 主料齐全权重最高
  if (mainNeeds.length > 0) {
    score += (mainMatched / mainNeeds.length) * 60
  }
  // 全部辅料齐全
  if (missing.length === 0) {
    score += 25
    reasons.push({ type: 'good', text: '食材齐全' })
  } else if (mainMissing.length === 0) {
    score += 10
    reasons.push({ type: 'info', text: `缺 ${missing.length} 种辅料` })
  } else {
    reasons.push({ type: 'warn', text: `缺主料 ${mainMissing.map(m => m.name).join('、')}` })
    score -= 15
  }

  // 3. 口味偏好
  const prefTaste = new Set((preference.tasteTags || []))
  const avoidTaste = new Set((preference.avoidTags || []))
  for (const t of (recipe.tags || [])) {
    if (prefTaste.has(t)) {
      score += 12
      reasons.push({ type: 'good', text: `符合口味「${t}」` })
    }
    if (avoidTaste.has(t)) {
      score -= 30
      reasons.push({ type: 'warn', text: `不喜欢的口味「${t}」` })
    }
  }

  // 4. 菜系偏好
  const prefCuisine = new Set((preference.cuisinePreference || []))
  if (recipe.cuisine && prefCuisine.has(recipe.cuisine)) {
    score += 8
  }

  // 5. 营养重点
  const focusSet = new Set((preference.nutritionFocus || []))
  for (const f of (recipe.tags || [])) {
    if (focusSet.has(f)) {
      score += 7
      reasons.push({ type: 'good', text: `符合营养「${f}」` })
    }
  }

  // 6. 临期食材优先消耗
  if (preference.preferUseExpiring) {
    const usedExpiring = matched.some(m =>
      m.have.expiryDate && ['urgent', 'soon', 'expired'].includes(expiryStatus(m.have.expiryDate))
    )
    if (usedExpiring) {
      score += 14
      reasons.push({ type: 'good', text: '优先消耗临期食材' })
    }
  }

  // 7. 难度 + 时间
  score += DIFFICULTY_SCORE[recipe.difficulty] || 0
  if (mealType === 'breakfast') {
    // 早餐倾向更简单
    if (recipe.prepTime <= 15) score += 6
    if (recipe.prepTime > 25) score -= 5
  }

  // 8. 已用主料去重（避免一日重复用同一主料）
  const recipeMainNames = mainNeeds.map(m => m.name.toLowerCase())
  const overlap = recipeMainNames.filter(n => usedIngredientNames.has(n))
  if (overlap.length > 0) {
    score -= overlap.length * 8
    reasons.push({ type: 'info', text: `本日已用：${overlap.join('、')}` })
  }

  // 9. 热量匹配
  if (caloriePerMeal && recipe.calories) {
    const target = caloriePerMeal
    const diff = Math.abs(recipe.calories - target)
    const ratio = 1 - Math.min(diff / target, 1)
    score += ratio * 8
  }

  return { score, reasons, matched, missing }
}

// 主入口
export function generateMealPlan(inventory, recipes, preference, options = {}) {
  const {
    date = todayISO(),
    mealTypes = MEAL_TYPES.slice(0, preference.mealsPerDay || 3),
    mustInclude = [], // [{recipeId}] 或 [{name}]
    exclude = [],     // [recipeId]
    mode = 'balanced',
  } = options

  // 整体热量目标分配
  const totalCal = preference.calorieTarget || 1800
  const usedIngredientNames = new Set()

  // 排除指定食谱
  const excludeSet = new Set(exclude)
  let pool = recipes.filter(r => !excludeSet.has(r.id))

  // 必含食谱：找到对应 recipeId 或按 name 匹配
  const mustHit = new Set()
  for (const m of mustInclude) {
    const r = recipes.find(x =>
      x.id === m.recipeId ||
      (m.name && x.name.toLowerCase().includes(String(m.name).toLowerCase()))
    )
    if (r) mustHit.add(r.id)
  }

  const meals = []
  const usedRecipeIds = new Set()

  for (const type of mealTypes) {
    const caloriePerMeal = Math.round(totalCal * (MEAL_CALORIE_RATIO[type] || 0.3))

    // 必含且未用：直接放入
    const forced = [...mustHit]
      .map(id => recipes.find(r => r.id === id))
      .filter(r => r && !usedRecipeIds.has(r.id) &&
        (r.mealType === type || r.mealType === 'lunch' || r.mealType === 'dinner'))

    let chosen = null
    if (forced.length > 0 && (forced[0].mealType === type || type !== 'breakfast')) {
      chosen = forced[0]
    } else {
      // 候选：本餐型食谱
      let candidates = pool.filter(r =>
        !usedRecipeIds.has(r.id) &&
        (r.mealType === type || (type !== 'breakfast' && r.mealType === 'lunch'))
      )
      // 早餐限制更严格
      if (type === 'breakfast') {
        candidates = pool.filter(r => !usedRecipeIds.has(r.id) && r.mealType === 'breakfast')
      }
      if (candidates.length === 0) {
        // 放宽：用任意可用食谱
        candidates = pool.filter(r => !usedRecipeIds.has(r.id))
      }

      const scored = candidates.map(r => ({
        recipe: r,
        ...scoreRecipe(r, { inventory, preference, usedIngredientNames, mealType: type, caloriePerMeal }),
      }))
      scored.sort((a, b) => b.score - a.score)

      // 在 top-N 中随机一个，避免每次完全一样
      const topN = scored.slice(0, Math.min(3, scored.length))
      chosen = (shuffle(topN)[0] || scored[0])?.recipe
    }

    if (!chosen) continue

    usedRecipeIds.add(chosen.id)
    // 记录主料使用
    for (const ing of (chosen.ingredients || [])) {
      if (ing.isMain) usedIngredientNames.add(ing.name.toLowerCase())
    }

    const { matched, missing, reasons, score } = scoreRecipe(chosen, {
      inventory, preference, usedIngredientNames: new Set(), mealType: type, caloriePerMeal,
    })

    meals.push({
      type,
      recipeId: chosen.id,
      recipeSnapshot: { id: chosen.id, name: chosen.name, calories: chosen.calories, prepTime: chosen.prepTime, tags: chosen.tags, ingredients: chosen.ingredients, steps: chosen.steps, mealType: chosen.mealType },
      matched: matched.map(m => ({ name: m.have.name, qty: m.need.quantity, unit: m.need.unit })),
      missing: missing.map(m => ({ name: m.name, qty: m.quantity, unit: m.unit, isMain: m.isMain })),
      score: Math.round(score),
      reasons,
    })
  }

  // 汇总
  const totalCalories = meals.reduce((s, m) => s + (m.recipeSnapshot.calories || 0), 0)
  const allMissing = meals.flatMap(m => m.missing)
  const expiringUsed = meals.some(m =>
    m.matched.some(mi => {
      const inv = inventory.find(i => i.name === mi.name)
      return inv && inv.expiryDate && ['urgent', 'soon', 'expired'].includes(expiryStatus(inv.expiryDate))
    })
  )

  return {
    id: uid('plan'),
    date,
    meals,
    generatedAt: new Date().toISOString(),
    summary: {
      totalCalories,
      totalCalorieTarget: totalCal,
      missingCount: allMissing.length,
      expiringUsed,
      coverage: meals.length ? Math.round(meals.filter(m => m.missing.length === 0).length / meals.length * 100) : 0,
    },
  }
}

// 校验：给定一份计划，比对当前库存，输出每餐所需食材的齐全情况
export function auditPlanAgainstInventory(plan, inventory) {
  return (plan.meals || []).map(meal => {
    const recipe = meal.recipeSnapshot
    const { matched, missing, hasAll } = matchRecipeIngredients(recipe, inventory)
    return {
      ...meal,
      matched: matched.map(m => m.have.name),
      missing: missing.map(m => m.name),
      hasAll,
    }
  })
}
