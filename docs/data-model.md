# 数据模型

```text
Job 1 ── N Requirement
Requirement N ── N Evidence（通过匹配结果）
Evidence 1 ── N EvidenceLink
Job 1 ── N PortfolioSection
Job 1 ── N InterviewRecord
DecisionLog → Match / Portfolio / Interview
```

## Job

保存公司、岗位、地点、薪资、求职阶段、来源、采集日期和 JD 原文。原文是证据，不允许被模型改写后覆盖。

## Requirement

从 JD 中拆出的最小可判断要求：`must / nice / responsibility / ai / product / domain`。每条包含权重和关键词。

## Evidence

项目证据主对象，至少包含：

- 项目和证据标题
- 用户本人的角色
- 真实行动
- 可验证结果
- 能力标签
- GitHub、Demo、PRD、截图或评测报告
- Verified / Partial / Unverified 状态

## DecisionLog

记录用户对 AI 建议的 `pending / accepted / edited / rejected` 决策。该对象是 Human-in-the-loop 可审计性的基础。

## 完整性约束

1. Match、Portfolio、Interview 中的 Evidence ID 必须存在。
2. 未验证材料可用于提示相关性，但降低证据完整度。
3. 作品集段落默认 Pending。
4. 分数必须由公开子分相加，不保存另一个黑箱总分。
