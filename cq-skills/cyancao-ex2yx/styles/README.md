# 风格库索引

本目录保存可复用的页面风格模板。每个风格采用**三层结构**，便于复用与维护。

## 三层结构

```
styles/
└── <风格 id>/
    ├── tokens.json      基础视觉变量（配色/字号/间距/圆角）
    ├── components.json  组件规则（输入框/按钮/表格…）
    └── patterns/        页面模式 - 按页面类型区分
        ├── create.json   新增页
        ├── edit.json     编辑页
        ├── detail.json   详情页
        └── list.json     查询列表页
```

**生成原型时的合成公式：**

```
完整规则 = tokens + components + patterns/<页面类型>
```

这样改一次主色或按钮样式，所有页面类型自动生效；不同页面类型的差异（布局/字段约定/交互）独立维护，互不污染。

## 已保存风格

| ID | 名称 | 来源 | 已覆盖页面 |
| --- | --- | --- | --- |
| [`lingxing`](lingxing/README.md) | 领星 ERP 风格 | 领星 ERP 系统 | ✅ 新增页 ⏳ 编辑/详情/列表（待补） |

## 使用方式

向 AI 说：

> 用 **`lingxing` 风格** 的 **`create` 模式**生成「XX 单据」的新增页，字段表格如下：……

AI 会自动加载 `tokens + components + patterns/create` 合成完整规则后渲染原型。

## 新增风格 / 补充页面模式

- **新增一个风格**：上传几张截图 → AI 创建 `styles/<新风格>/{tokens,components}.json` 和对应 pattern
- **给已有风格补页面模式**：上传该页面类型的截图 → AI 在 `patterns/` 下追加文件
- **跨风格共用 pattern**：若某 pattern 的布局与配色无关（例如几乎所有列表页都是『筛选栏+表格+分页』），可在 patterns 中只描述差异点，让 AI 用 tokens/components 自动填充
