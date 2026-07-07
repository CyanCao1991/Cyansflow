# 领星 ERP 风格 (lingxing)

> 来源：领星 ERP 系统
> 适用：ERP / 进销存 / SaaS 后台

## 文件结构（分层）

```
lingxing/
├── tokens.json        基础视觉变量（配色/字号/间距/圆角）— 全风格共享
├── components.json    组件规则（输入框/按钮/表格…）— 全风格共享
└── patterns/          页面模式 — 按页面类型区分
    ├── create.json    ✅ 新增页
    ├── edit.json      ⏳ 编辑页（待用户上传截图）
    ├── detail.json    ⏳ 详情页（待用户上传截图）
    └── list.json      ⏳ 查询列表页（待用户上传截图）
```

生成原型时的合成公式：

```
完整规则 = tokens + components + patterns/<页面类型>
```

## 风格识别要点

1. **输入框无边框、仅底线** — focus 时底线变蓝 `#2B5CFF` ⭐核心识别点
2. **基本信息区 4 列网格** — 标签左置 84px，整体可折叠
3. **必填红 `*` 紧贴标签**（无空格）
4. **表格列头带『批量』蓝字链接** — 操作列固定右侧 `移除/复制`
5. **底部按钮居中** — 取消 / 暂存 / 提交
6. **主色** `#2B5CFF` / **必填红** `#FF4D4F` / **页面底** `#F5F7FA`

## 已覆盖的页面模式

| 页面类型 | 状态 | 来源截图 | 关键特征 |
| --- | --- | --- | --- |
| 新增页 (create) | ✅ 已完成 | 创建采购单 ×2 | 4列网格 + 行内编辑表格 + 底部居中按钮 |
| 编辑页 (edit) | ⏳ 待补充 | — | 预计：复用 create + 头部加单号/状态 |
| 详情页 (detail) | ⏳ 待补充 | — | 预计：只读 label:value 展示 + 多 Tab 切换 |
| 列表页 (list) | ⏳ 待补充 | — | 预计：筛选栏 + 表格 + 分页 |

补全方式：用户上传对应页面截图，按相同分层结构追加 pattern 文件。

## 使用方式

向 AI 说：

> 用 `lingxing` 风格的 `create` 模式生成 XX 单据的新增页，字段表格如下：……

AI 会自动加载 `tokens + components + patterns/create`，按 `patterns/create.json` 中的 `field_table_schema` 解析您的字段表，按 `generation_rules` 生成原型。
