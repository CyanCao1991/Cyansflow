import { AIMessage, AIMode, StageType } from '../types';

const INTENT_KEYWORDS = {
  goal: ['目标', '目的', 'KPI', '指标', '达成', '提升', '增加', '减少'],
  painPoint: ['痛点', '问题', '困难', '障碍', '卡点', '瓶颈', '效率'],
  boundary: ['范围', '边界', '不包括', '不做', '限制', '约束'],
  stakeholder: ['干系人', '负责人', '使用者', '相关方', '部门', '客户'],
  exception: ['如果', '异常', '错误', '失败', '边界', '极端情况', '万一']
};

export const recognizeIntent = (text: string): string[] => {
  return Object.entries(INTENT_KEYWORDS)
    .filter(([_, keywords]) => 
      keywords.some(keyword => text.includes(keyword))
    )
    .map(([intent]) => intent);
};

const AI_QUESTION_TEMPLATES: Record<StageType, string[]> = {
  'business-planning': [
    '请问这个需求的业务背景是什么？为什么要做这个系统？',
    '能否详细描述一下当前的痛点？这对业务有多大影响？',
    '您提到的痛点，具体是指哪些环节？每个环节大概浪费多少时间？',
    '如果不做这个系统，会有什么后果？业务会受到多大影响？',
    '这个项目的目标用户是谁？他们的核心需求是什么？',
    '您期望这个系统上线后，能达到什么样的效果？有哪些可量化的指标？',
    '在这个业务中，有哪些关键的利益相关方？他们各自的诉求是什么？'
  ],
  'process-mapping': [
    '请描述一下当前的业务流程，从开始到结束？',
    '在这个流程中，哪些环节是最耗时的？',
    '每个环节一般需要多长时间？涉及哪些角色？',
    '目前流程中最大的卡点是什么？为什么会卡住？',
    '哪些环节经常出现返工或重复劳动？',
    '如果某个环节出错，后续会怎么处理？',
    '理想的流程应该是什么样的？'
  ],
  'solution-design': [
    '这个业务场景中，有哪些核心的业务规则需要明确？',
    '有哪些特殊情况需要特别处理？比如金额为0、数量为负等？',
    '不同角色的权限如何划分？管理员和普通用户有什么区别？',
    '有没有行业标准的做法可以参考？',
    '如果要设计数据实体，应该包含哪些核心属性？',
    '如果系统出现异常，应该如何提示用户？'
  ],
  'system-architecture': [
    '系统的预期用户量是多少？峰值并发是多少？',
    '系统需要对接哪些外部系统？',
    '数据安全性有什么特殊要求？',
    '系统预计什么时候上线？上线后的推广计划是什么？',
    '现有的IT基础设施是什么样的？',
    '对系统性能有什么具体要求？响应时间要控制在多少毫秒内？'
  ],
  'prototype-design': [
    '这个页面的主要用户是谁？他们的技术水平如何？',
    '用户在这个页面最常做的操作是什么？',
    '页面上需要展示哪些核心信息？信息的重要性如何排序？',
    '用户在填写表单时，最容易出错的地方是什么？',
    '这个页面在不同设备上的展示要求是什么？',
    '用户完成操作后，应该给什么样的反馈？'
  ],
  'detailed-design': [
    '这个数据库表的数据量预估有多大？',
    '哪些字段需要建立索引？',
    '接口的调用频率预估是多少？',
    '状态机的每个状态转换条件是什么？',
    '有没有配置项需要灵活调整？调整频率如何？',
    '异常情况下的补偿机制是什么？'
  ],
  'test-cases': [
    '正向流程中，每个步骤的预期结果是什么？',
    '有哪些边界值需要测试？比如0、最大值、负数等？',
    '如果网络中断，操作应该怎么处理？',
    '并发操作时，系统应该如何保证数据一致性？',
    '历史数据迁移时，有什么需要注意的？',
    '有哪些测试数据需要提前准备？'
  ],
  'bp-testing': [
    '测试场景的优先级如何？哪些是P0必须通过的？',
    '测试数据从哪里来？有现成的测试环境吗？',
    '测试过程中发现的bug，如何分类和记录？',
    '回归测试的范围如何确定？',
    '如果测试发现是需求问题，应该如何处理？',
    '测试完成的标准是什么？'
  ],
  'acceptance': [
    '验收的标准是什么？有哪些指标必须达成？',
    '谁负责执行验收测试？',
    '验收过程中发现的缺陷，如何分级？',
    '遗留问题的处理策略是什么？',
    '验收通过后，系统如何切换到生产环境？',
    '上线后有没有观察期？'
  ],
  'configuration': [
    '配置项的调整频率如何？哪些是高频调整的？',
    '配置变更是否需要审批流程？',
    '配置调整后，如何验证是否生效？',
    '有没有敏感配置需要特殊处理？',
    '不同环境（测试、预发、生产）的配置如何管理？'
  ],
  'operations': [
    '系统上线后，由谁负责运维？',
    '出现故障时，响应时间要求是多少？',
    '有哪些监控指标需要重点关注？',
    '应急预案中，每个故障类型的处置流程是什么？',
    '知识库的内容由谁负责维护和更新？',
    '系统升级的流程是怎样的？'
  ]
};

const AI_COMPARISON_TEMPLATES: Partial<Record<StageType, any[]>> = {
  'solution-design': [
    {
      title: '方案A：简单流程方案',
      description: '适用于需求明确、流程简单的场景',
      pros: ['开发周期短', '成本较低', '易于维护'],
      cons: ['扩展性有限', '难以应对复杂业务']
    },
    {
      title: '方案B：标准企业方案',
      description: '适用于有一定复杂度、需要规范管理的场景',
      pros: ['架构清晰', '扩展性好', '符合行业标准'],
      cons: ['开发周期较长', '需要更多技术投入']
    },
    {
      title: '方案C：高级定制方案',
      description: '适用于复杂业务、需要高度个性化的场景',
      pros: ['完全定制', '灵活性高', '竞争力强'],
      cons: ['成本最高', '风险较大', '维护复杂']
    }
  ],
  'system-architecture': [
    {
      title: '单体架构',
      description: '所有功能在一个应用中',
      pros: ['开发简单', '部署便捷', '调试容易'],
      cons: ['扩展性差', '技术栈单一', '维护困难']
    },
    {
      title: '微服务架构',
      description: '功能拆分为独立服务',
      pros: ['高扩展', '独立部署', '技术灵活'],
      cons: ['复杂度高', '运维成本大', '分布式挑战']
    },
    {
      title: '混合架构',
      description: '核心服务微服务 + 非核心单体',
      pros: ['平衡成本与扩展', '渐进式演进'],
      cons: ['一致性挑战', '需要经验']
    }
  ],
  'prototype-design': [
    {
      title: '简洁型设计',
      description: '功能优先，界面简洁',
      pros: ['学习成本低', '开发快', '易用性好'],
      cons: ['视觉效果一般', '差异化不足']
    },
    {
      title: '现代设计',
      description: '注重用户体验和视觉效果',
      pros: ['用户体验好', '品牌形象提升', '吸引用户'],
      cons: ['开发周期长', '需要专业设计']
    }
  ]
};

const AI_VALIDATION_TEMPLATES: Partial<Record<StageType, string[]>> = {
  'detailed-design': [
    '请检查数据库表的主键和外键设置是否正确？',
    '接口的异常处理是否完整？有没有遗漏的错误码？',
    '状态机的每个状态转换是否有对应的业务逻辑？',
    '配置项是否有合理的默认值和校验规则？',
    '有没有循环依赖或死锁的风险？'
  ],
  'test-cases': [
    '正向流程的测试步骤是否完整？有没有遗漏的环节？',
    '异常场景是否覆盖了所有可能的情况？',
    '边界值的选取是否合理？',
    '测试用例之间是否有依赖关系？',
    '用例的优先级划分是否符合业务重要性？'
  ],
  'bp-testing': [
    '测试场景是否覆盖了所有关键业务流程？',
    '每个场景的预期结果是否明确？',
    '测试数据是否足够真实？',
    '缺陷描述是否清晰，便于开发定位问题？',
    '回归测试的范围是否合理？'
  ],
  'acceptance': [
    '验收标准是否可量化、可测试？',
    '每个标准是否有明确的通过/失败判断依据？',
    '验收场景是否覆盖了核心用户旅程？',
    '遗留问题的处理策略是否明确？',
    '验收通过后的上线计划是否完整？'
  ],
  'configuration': [
    '所有可配置项是否都已梳理完整？',
    '配置项的值域是否正确？',
    '配置变更的影响范围是否评估过？',
    '配置验证的方法是否可行？',
    '有没有遗漏的特殊配置场景？'
  ],
  'operations': [
    '监控指标是否覆盖了系统的关键路径？',
    '告警阈值是否合理？会不会产生告警疲劳？',
    '应急预案是否经过演练验证？',
    '知识库的内容是否足够完整和准确？',
    '运维手册的操作步骤是否足够详细？'
  ]
};

export const generateAIResponse = async (
  mode: AIMode,
  stageType: StageType,
  messages: AIMessage[],
  userMessage?: string
): Promise<AIMessage> => {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  const id = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();
  
  if (mode === 'questioning') {
    const templates = AI_QUESTION_TEMPLATES[stageType] || [];
    const usedIndices = messages
      .filter(m => m.role === 'ai')
      .map(() => 0);
    
    let nextIndex = 0;
    for (let i = 0; i < Math.min(usedIndices.length, templates.length); i++) {
      nextIndex = (nextIndex + 1) % templates.length;
    }
    
    const question = templates[nextIndex] || '请问您对这个阶段还有什么需要补充的吗？';
    const intentTags = recognizeIntent(question);
    
    return {
      id,
      role: 'ai',
      content: question,
      type: 'question',
      intentTags,
      timestamp
    };
  }
  
  if (mode === 'comparing') {
    const templates = AI_COMPARISON_TEMPLATES[stageType];
    if (templates && messages.length === 1) {
      const comparisonText = templates.map((t) => 
        `### ${t.title}\n**${t.description}**\n\n**优点：**\n${t.pros.map(p => `- ${p}`).join('\n')}\n\n**缺点：**\n${t.cons.map(c => `- ${c}`).join('\n')}`
      ).join('\n\n---\n\n');
      
      return {
        id,
        role: 'ai',
        content: `根据您的需求，我为您准备了以下几个方案供选择：\n\n${comparisonText}\n\n请问您倾向于哪个方案？或者有其他想法？`,
        type: 'suggestion',
        timestamp
      };
    }
    
    return {
      id,
      role: 'ai',
      content: '好的，方案已记录。请问还有其他需要调整的地方吗？',
      type: 'answer',
      timestamp
    };
  }
  
  if (mode === 'validating') {
    const templates = AI_VALIDATION_TEMPLATES[stageType] || [
      '请确认这个设计方案是否完整？',
      '有没有遗漏的场景需要考虑？',
      '这个方案实施过程中可能遇到什么风险？'
    ];
    
    const question = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id,
      role: 'ai',
      content: `我帮您验证一下设计内容：\n\n${question}\n\n请提供更多信息，以便我给出更准确的建议。`,
      type: 'validation',
      timestamp
    };
  }
  
  return {
    id,
    role: 'ai',
    content: '收到您的输入，请问还有其他的想法吗？',
    type: 'answer',
    timestamp
  };
};

export const generateInitialMessage = (stageType: StageType, mode: AIMode): AIMessage => {
  const id = `ai-init-${Date.now()}`;
  const stageIntros: Record<StageType, string> = {
    'business-planning': '您好！我是您的AI协作助手。在开始业务规划之前，让我先了解一下您的需求背景。请告诉我您想做什么样的系统？',
    'process-mapping': '现在让我们来梳理业务流程。请先描述一下当前的运作方式是怎样的？',
    'solution-design': '基于前面的梳理，我来帮您设计具体的业务方案。首先，我们来明确一下核心的业务规则。',
    'system-architecture': '现在进入技术架构设计阶段。我会根据业务需求，为您推荐合适的技术方案。',
    'prototype-design': '让我们开始设计界面原型。您希望用户在这个系统中完成哪些核心操作？',
    'detailed-design': '现在进行详细设计。我会帮您把概要设计细化为可开发的交付物。',
    'test-cases': '我来帮您编写测试用例。首先确认一下核心的业务流程有哪些？',
    'bp-testing': '现在开始BP测试。请告诉我需要验证的关键业务场景有哪些？',
    'acceptance': '进入验收阶段。我会帮您制定验收标准，确保系统满足业务需求。',
    'configuration': '现在进行系统配置。请告诉我有哪些业务参数需要灵活调整？',
    'operations': '最后是运维保障阶段。我来帮您梳理运维场景和应急预案。'
  };
  
  return {
    id,
    role: 'ai',
    content: stageIntros[stageType] || '让我们开始这个阶段的工作吧。',
    type: 'answer',
    timestamp: Date.now()
  };
};
