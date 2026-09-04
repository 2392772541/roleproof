# AI 边界与降级设计

## 三种模式

### Demo Mode
仓库内置 6 个中国 AI 产品经理示例职位、6 个项目和完整预计算结果。Clone 后立即可演示。

### Rule Mode
当前已实现。使用关键词分类、能力 Taxonomy 和验证状态计算匹配，所有理由可展开查看。

### AI Mode（Adapter 预留）
后续可接 OpenAI、DeepSeek、Gemini 或 Ollama，但输出必须通过同一 Zod Schema 和 Evidence ID 校验。

```ts
interface AIProvider {
  parseJD(input: string): Promise<Requirement[]>
  matchEvidence(job: Job, evidence: Evidence[]): Promise<EvidenceMatch[]>
  generatePortfolio(job: Job, matches: EvidenceMatch[]): Promise<PortfolioSection[]>
  prepareInterview(job: Job): Promise<InterviewRecord[]>
}
```

## AI 可以做

- 提取和分类 JD 要求。
- 建议证据关联并解释理由。
- 根据已确认材料生成草稿。
- 发现证据缺口和待验证假设。

## AI 不可以做

- 编造不存在的项目、指标和岗位经历。
- 引用不存在的 Evidence ID。
- 自动接受自己的匹配结论。
- 自动覆盖原始 JD 或用户主档案。
- 代替用户编写“真实面试回答”。

## Human-in-the-loop

关键决策必须由人完成：重复职位合并、要求校正、证据确认、作品集采用、面试回答和材料对外发布。
