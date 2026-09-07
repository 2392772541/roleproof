# 2026 中国 AI 产品经理岗位研究与 RoleProof 改造依据

- 研究日期：2026-09-07
- 用途：定义作品集能力框架和合成评测样本
- 声明：不是职位原文合集，也不代表本人真实投递

## 1. 公开研究入口

- 字节跳动社会招聘：https://jobs.bytedance.com/experienced/position
- 百度招聘：https://talent.baidu.com/jobs/list
- 腾讯招聘：https://careers.tencent.com/search.html
- OpenAI Evaluation best practices：https://platform.openai.com/docs/guides/evaluation-best-practices

招聘页是动态内容。默认“公开岗位研究样本 A/B/C”是多来源能力归纳和作者改写，不是任何公司的逐字 JD。

## 2. 能力框架

### 产品基本功

问题定义、用户任务、业务价值、非 AI 替代方案、用户研究、需求拆解、PRD、原型、优先级、数据指标和跨团队推进。

### AI 系统理解

Agent、RAG、Prompt、结构化输出、工具调用、规则基线、拒答、降级、权限、审批、审计、人工接管，以及来源事实、模型推断、人工修订和业务动作的分层。

### Evaluation

先定义任务和成功标准；建立固定集；结合自动评分与人工判断；记录 Bad Case；保存 Prompt、模型、知识和工具版本；关注任务成功率、准确性、延迟、成本和人工修改率；持续把反馈加入回归集。

### 作品集证据

可运行 Demo、GitHub、PRD、数据模型、测试、评测、已知限制和明确的个人角色，而不是虚构业务指标。

## 3. 对 RoleProof 的改造映射

| 能力 | 产品改造 | 证据 |
|---|---|---|
| 问题定义 | 简历生成改为 Requirement × Evidence | 项目档案、案例复盘 |
| HITL | Accept/Edit/Reject 改变评分和下游 | Decision Log、E2E |
| 可信 AI | 原文、Evidence ID、Gap | 岗位解析、证据矩阵 |
| Evaluation | 固定集、实时指标、Bad Case | 评测实验室、测试 |
| 工程落地 | Schema、持久化、桌面/移动回归 | GitHub、Actions、Pages |
| 真实性 | 合成数据与未验证指标标注 | Truth Banner、README |

## 4. 研究限制

招聘入口动态加载，本文不声称完整覆盖所有岗位；没有把第三方聚合内容当作官方原文；能力框架仍需真实脱敏 JD、求职者和面试官反馈校正。
