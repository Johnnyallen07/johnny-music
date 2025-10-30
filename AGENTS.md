## **项目概览（Project Overview）**

你将协助开发一个**简单的音乐播放网站**，技术栈包括：

* **React（App Router）**
* **Tailwind CSS**
* **TypeScript**（在 JavaScript 基础上的类型安全，配套 Eslint）
* **APP routing** Next.js的页面逻辑跟app下的folder name一致

## **你的角色（Your Role）**

作为前端 AI 助手，你需要负责：

1. **编写可用于生产环境的代码**（React + Tailwind CSS）
2. **调试现有代码**，并识别架构或结构性问题
3. **提出并实现最佳实践**，以保持代码简洁、可扩展、可维护
4. **确保所有 UI 组件在移动端也有优秀体验与适配**
5. **严格遵循既定的目录结构与架构**

---

## **项目目录结构（Project Folder Structure）**

所有代码位于 `src/` 下。**必须严格遵循**以下结构：

```
src/
  components/   → 可复用 UI 组件（如：按钮、卡片、模态框）
  hooks/        → 自定义 React hooks
  schemas/      → 校验 Schema（如：Yup）
  app/        → 页面级组件；应保持整洁，仅负责组合 hooks 与 components
```

### 规则（Rules）：

* **不要在 `page.tsx` 中放置 hooks 或复杂逻辑**。页面只负责导入并拼装 hooks/组件，以保证可读性。
* **始终关注关注点分离**：UI 逻辑在 components，数据逻辑在 hooks，校验在 `schemas/`。
* **组件应保持模块化与可复用**。
* 项目使用 `@tanstack/react-query` 处理所有请求与响应。**不要**使用不依赖 react-query 的其它 GET/POST 方式。

---

## **UI 与响应式规范（UI & Responsiveness Guidelines）**

当你修改或创建 UI 时：

* 必须保证**移动端适配**与**响应式**（最小支持：360px 宽）。
* 使用 **Tailwind CSS 最佳实践**：

    * 避免重复的工具类 —— 必要时可在组件级 CSS 中使用 `@apply`。
    * 正确使用响应式前缀（`sm:`、`md:`、`lg:`）。
    * 保持 className 可读性；除非必要，尽量避免内联样式。
* 在所有屏幕尺寸上都要确保**良好的用户体验**（布局、间距、触控区域、滚动行为等）。

## **代码质量与最佳实践（Code Quality & Best Practices）**

务必：

* 在动手前尽可能获取页面与上下文的**完整信息**。
* 按照 React 与 Tailwind 的最佳实践编写**简洁可读**的代码。
* 使用**函数式组件 + hooks**，不使用 class 组件。
* 保持代码**可扩展性** —— 面向未来功能，避免不必要的耦合。
* 使用**有意义的组件命名**与一致的命名规范。
* 如果任务只涉及架构或最佳实践，**请先给出方案/提案，再编写代码**。
* 在捕获错误时，**不要仅仅显示错误**而无进一步处理（应有合理的错误状态与回退策略）。
* 用`npm run lint`检查对应的eslint规范

## **示例工作流（Example Workflow）**

❌ **错误示范**：把整页的业务逻辑、UI 组件和样式混写在一起。

✅ **正确示范**：

1. 在 `hooks/` 中创建用于数据获取的 hook。
2. 在 `components/` 中创建可复用 UI 组件。
3. 在 `schemas/` 中进行输入校验。
4. 在 `page.tsx` 中以最少的额外逻辑进行组装。

---

## 📌 **关键规则总结（Summary of Key Rules）**

* ✅ 严格遵守目录结构
* ✅ 优先保障移动端体验与 Tailwind 最佳实践
* ✅ 使用模块化、可复用的 React 组件
* ✅ 使用清晰的 TypeScript 类型与校验
* ✅ 清晰地分离逻辑、UI 与校验
* ✅ 当被要求时，先解释架构方案再实现
* ✅ 保持页面整洁、声明式
