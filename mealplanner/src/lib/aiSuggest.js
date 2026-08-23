// AI 智能建议模块
// 当前实现：基于本地库存与偏好，用模板组合生成"快手菜灵感"。
// 设计预留了 callRemoteAI(prompt) 接口位置，未来可接入大模型 API。

import { expiryStatus, shuffle } from './utils'

// 远程 AI 占位 - 接入真实模型时替换此实现
// 返回 Promise<{ text, dishes: [{name, ingredients, steps, tags}] }>
export async function callRemoteAI(prompt, _opts = {}) {
  // 预留接口：未来接 OpenAI / Claude / 本地模型
  // 当前环境下返回提示信息
  await new Promise(r => setTimeout(r, 200))
  return {
    text: '当前未配置远程 AI 服务。下方灵感由本地库存匹配规则生成；如需更强的自由文本生成，可在设置中接入大模型 API。',
    dishes: [],
  }
}

// 本地：基于库存生成"快手菜灵感"
// 思路：取 2-3 个主料 + 已有调味料，套用简单烹饪模板
const TEMPLATES = [
  {
    name: '快手清炒 {main}',
    steps: ['主料切配', '热锅冷油爆香蒜末', '下主料大火快炒，加盐、生抽调味出锅'],
    tags: ['清淡', '快手'],
  },
  {
    name: '{main} 番茄烩',
    steps: ['番茄切块，主料切块', '热锅下油炒番茄出汁', '下主料烩煮 5 分钟，加盐糖调味'],
    tags: ['酸甜', '下饭'],
  },
  {
    name: '{main} 蛋花汤',
    steps: ['主料切丁，鸡蛋打散', '烧水煮开下主料', '淋蛋液，加盐和几滴醋'],
    tags: ['清淡', '汤品'],
  },
  {
    name: '香煎 {main}',
    steps: ['主料切片，加盐黑胡椒腌制 5 分钟', '热锅下油，中火煎至两面金黄', '出锅静置 2 分钟'],
    tags: ['高蛋白', '快手'],
  },
  {
    name: '{main} 焖饭',
    steps: ['主料切丁，米淘洗', '热锅下油爆香主料', '与米同焖，加生抽调味'],
    tags: ['一锅出', '下饭'],
  },
]

export function generateLocalInspirations(inventory, preference = {}, count = 3) {
  // 候选主料：从库存里挑有量的食材，优先临期
  const mains = inventory
    .filter(it => it.category === 'ingredient' && it.quantity > 0 && it.subcategory !== '主食')
    .map(it => ({ ...it, _urgency: urgencyRank(it) }))
    .sort((a, b) => b._urgency - a._urgency)

  if (mains.length < 1) return []

  const ideas = []
  const used = new Set()

  for (let i = 0; i < count; i++) {
    // 取 1-2 个主料
    const picks = shuffle(mains).slice(0, 2).filter(m => !used.has(m.name))
    if (picks.length === 0) break
    picks.forEach(p => used.add(p.name))

    const mainName = picks.map(p => p.name).join('+')
    const tpl = TEMPLATES[i % TEMPLATES.length]
    const tags = [...tpl.tags]
    if (picks.some(p => p.subcategory === '肉类')) tags.push('高蛋白')

    ideas.push({
      id: `idea_${Date.now()}_${i}`,
      name: tpl.name.replace('{main}', mainName),
      ingredients: picks.map(p => ({ name: p.name, quantity: Math.min(p.quantity, 200), unit: 'g', isMain: true })),
      steps: tpl.steps.map(s => s.replace('主料', mainName)),
      tags,
      source: 'local-template',
      note: picks.some(p => expiryStatus(p.expiryDate) === 'urgent') ? '使用了临期食材' : '',
    })
  }
  return ideas
}

function urgencyRank(it) {
  const s = expiryStatus(it.expiryDate)
  const map = { expired: 4, urgent: 3, soon: 2, normal: 1, unknown: 0 }
  return map[s] || 0
}

// 高层 API：一键获取建议（本地优先，远程可选）
export async function getAISuggestions({ inventory, preference, remote = false, prompt = '' }) {
  const local = generateLocalInspirations(inventory, preference, 3)
  if (remote && prompt) {
    try {
      const remote = await callRemoteAI(prompt)
      return { local, remote, source: 'mixed' }
    } catch (e) {
      console.warn('remote AI failed:', e)
      return { local, remote: null, source: 'local-fallback' }
    }
  }
  return { local, remote: null, source: 'local' }
}
