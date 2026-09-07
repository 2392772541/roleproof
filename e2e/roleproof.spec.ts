import { expect, test, type Page } from '@playwright/test'

async function resetWorkspace(page: Page) {
  await page.addInitScript(() => localStorage.clear())
}

async function openSidebarView(page: Page, label: string) {
  const navButton = page.locator('aside nav').getByRole('button', { name: new RegExp(label) })
  if ((page.viewportSize()?.width ?? 1280) <= 800) await page.locator('.mobile-menu').click()
  await navButton.click()
}

test('核心求职闭环可真实操作并导出工作区', async ({ page }, testInfo) => {
  await resetWorkspace(page)
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /个人独立项目证据包/ })).toBeVisible()
  if (testInfo.project.name === 'chromium-desktop') await page.screenshot({ path: 'docs/roleproof-overview.png', fullPage: true })
  if (testInfo.project.name === 'chromium-mobile') await page.screenshot({ path: 'docs/roleproof-mobile.png', fullPage: true })

  await openSidebarView(page, '评测实验室')
  await expect(page.getByText('术语覆盖率')).toBeVisible()
  await expect(page.locator('.eval-metric').nth(0)).toContainText('100%')
  await expect(page.locator('.eval-metric').nth(1)).toContainText('58%')
  await expect(page.locator('.eval-metric').nth(2)).toContainText('100%')
  await expect(page.locator('.eval-metric').nth(3)).toContainText('0')
  await expect(page.locator('.eval-case')).toHaveCount(4)
  if (testInfo.project.name === 'chromium-desktop') await page.screenshot({ path: 'docs/roleproof-evaluation.png', fullPage: true })

  await openSidebarView(page, '职位情报')
  await page.getByRole('button', { name: '录入职位' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('公司 *').fill('海鸥智能')
  await page.getByLabel('岗位名称 *').fill('AI 产品经理（评测平台）')
  await page.getByLabel('地点').fill('上海·徐汇')
  await page.getByLabel('薪资').fill('30–45K·15薪')
  await page.getByLabel('标签').fill('评测，Agent，B端')
  await page.getByLabel('JD 原文 *').fill('负责企业级 AI Agent 产品规划与工作流设计；建立模型评测体系并推动迭代；具备用户研究、PRD 和数据指标经验；有可展示的 AI 项目优先。')
  await page.getByRole('button', { name: '保存并解析' }).click()
  await expect(page.getByRole('heading', { name: 'AI 产品经理（评测平台）' })).toBeVisible()
  await expect(page.locator('.requirement-item')).toHaveCount(4)

  const firstEdit = page.getByRole('button', { name: /编辑要求/ }).first()
  await firstEdit.click()
  await page.getByLabel('权重（1–10）').fill('9')
  await page.getByLabel('匹配关键词 *').fill('Agent，工作流，产品规划')
  await page.getByRole('button', { name: '保存校正' }).click()
  await expect(page.locator('.requirement-item').first()).toContainText('权重 9')

  await openSidebarView(page, '证据库')
  await page.getByRole('button', { name: '新建证据' }).click()
  await page.getByLabel('项目名称 *').fill('EvalPilot')
  await page.getByLabel('证据标题 *').fill('从错误案例到回归评测的质量闭环')
  await page.getByLabel('我的角色 *').fill('AI 产品经理 / 原型负责人')
  await page.getByLabel('项目介绍 *').fill('面向 AI 产品团队的评测集、错误归因和版本对比工作台。')
  await page.getByLabel('真实行动 *').fill('定义错误分类、评分准则、人工复核和回归测试工作流。')
  await page.getByLabel('可验证结果 *').fill('完成可交互原型、评测报告和测试样本。')
  await page.getByLabel('能力标签 *').fill('AI Evaluation，工作流，HITL')
  await page.getByLabel('结果指标').fill('50 条测试样本，5 类错误标签')
  await page.getByLabel('GitHub 地址').fill('https://github.com/example/eval-pilot')
  await page.getByRole('button', { name: '保存证据' }).click()
  await expect(page.getByRole('heading', { name: '从错误案例到回归评测的质量闭环' })).toBeVisible()

  await openSidebarView(page, '证据匹配')
  await expect(page.getByText('要求—证据矩阵')).toBeVisible()
  await page.getByRole('button', { name: '接受' }).first().click()
  await expect(page.locator('.decision-state').first()).toHaveText('已采纳')
  if (testInfo.project.name === 'chromium-desktop') await page.screenshot({ path: 'docs/roleproof-match.png', fullPage: true })

  await openSidebarView(page, '作品集工坊')
  await page.getByRole('button', { name: /生成第一版|生成岗位版本/ }).first().click()
  await expect(page.getByText(/AI Generated/).first()).toBeVisible()
  await expect(page.locator('.portfolio-section footer em').first()).toHaveText(/^P/)
  if (testInfo.project.name === 'chromium-desktop') await page.screenshot({ path: 'docs/roleproof-portfolio.png', fullPage: true })

  await openSidebarView(page, '面试复盘')
  await page.getByRole('button', { name: /生成问题|生成面试问题/ }).first().click()
  await expect(page.locator('.interview-card')).toHaveCount(4)
  await page.locator('.interview-card textarea').first().fill('我先定义评测目标和错误分类，再建立人工标注基线，最后将高频错误加入回归集。')
  await page.locator('.interview-card input').nth(1).fill('补充真实用户评测和版本对比数据')
  await page.getByRole('button', { name: '完成复盘' }).first().click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByTitle('导出').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^roleproof-workspace-\d{4}-\d{2}-\d{2}\.json$/)

  if (testInfo.project.name === 'chromium-mobile') {
    const bodyFitsViewport = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    expect(bodyFitsViewport).toBe(true)
  }
  expect(consoleErrors).toEqual([])
})




test('拒绝会清空职位并导致应用崩溃的非法工作区导入', async ({ page }) => {
  await resetWorkspace(page)
  await page.goto('/')
  await expect(page.locator('.job-switcher option')).toHaveCount(3)

  const dialogPromise = page.waitForEvent('dialog', { timeout: 3000 })
  await page.locator('input[type="file"]').setInputFiles({
    name: 'invalid-workspace.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, jobs: [], evidence: [] })),
  })
  const dialog = await dialogPromise
  expect(dialog.message()).toContain('导入失败')
  await dialog.accept()

  await expect(page.locator('.job-switcher option')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: /个人独立项目证据包/ })).toBeVisible()
})

test('旧版虚构种子数据会自动迁移为当前真实项目证据', async ({ page }) => {
  await page.addInitScript(() => {
    const companies = ['星海科技', '澄明教育', '远航电商', '山岚软件', '拾光传媒', '云阶智能']
    const projects = ['InfluenceOS', 'RoleProof', 'AI Script Reviewer', '辰曦经营助手', 'InsightLoop', 'KnowledgeOS']
    localStorage.setItem('roleproof.jobs.v1', JSON.stringify(companies.map((company, index) => ({
      id: `J00${index + 1}`, company, title: '旧版岗位', location: '中国', salary: '面议', stage: '关注', score: 0, updatedAt: '2026-09-04', tags: [],
      source: { name: '旧演示数据', url: '#', capturedAt: '2026-09-04' }, jd: '负责旧版 AI 产品功能。',
      requirements: [{ id: `R-OLD-${index}`, jobId: `J00${index + 1}`, text: '负责旧版 AI 产品功能', kind: 'product', weight: 8, keywords: ['产品'] }],
    }))))
    localStorage.setItem('roleproof.evidence.v1', JSON.stringify(projects.map((project, index) => ({
      id: `P-OLD-${index}`, project, title: '旧版项目证据', role: '产品经理', capability: ['产品'], action: '旧行动', result: '旧结果', summary: '旧摘要', verification: 'verified', links: [], metrics: [], updatedAt: '2026-09-04',
    }))))
    localStorage.setItem('roleproof.selected-job.v1', JSON.stringify('J001'))
  })

  await page.goto('/')
  await expect(page.locator('.job-switcher option')).toHaveCount(3)
  await expect(page.locator('.job-switcher')).toContainText('公开岗位研究样本 A')
  await expect(page.locator('.sidebar-footer')).toContainText('3 个项目 · 12 份已挂材料')
  await expect(page.getByText('InfluenceOS')).toHaveCount(0)
})

test('恢复演示数据需要人工确认并清除浏览器中的旧项目数据', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('roleproof.jobs.v1', JSON.stringify([{
      id: 'J-OLD', company: '旧版虚构公司', title: '旧岗位', location: '北京', salary: '面议', stage: '关注', score: 0, updatedAt: '2026-09-04', tags: [],
      source: { name: '旧演示数据', url: '#', capturedAt: '2026-09-04' },
      jd: '负责旧版 AI 产品功能。',
      requirements: [{ id: 'R-OLD', jobId: 'J-OLD', text: '负责旧版 AI 产品功能', kind: 'product', weight: 8, keywords: ['产品'] }],
    }]))
    localStorage.setItem('roleproof.selected-job.v1', JSON.stringify('J-OLD'))
    localStorage.setItem('roleproof.evidence.v1', JSON.stringify([]))
  })
  await page.goto('/')
  await expect(page.locator('.job-switcher')).toContainText('旧版虚构公司')

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm')
    expect(dialog.message()).toContain('尚未导出')
    await dialog.accept()
  })
  await page.getByTitle('恢复演示数据').click()

  await expect(page.locator('.job-switcher option')).toHaveCount(3)
  await expect(page.locator('.job-switcher')).toContainText('公开岗位研究样本 A')
  await expect(page.locator('.sidebar-footer')).toContainText('3 个项目 · 12 份已挂材料')
  await expect(page.getByRole('heading', { name: /个人独立项目证据包/ })).toBeVisible()
})

test('损坏的 localStorage 不阻止应用启动并会回退到演示数据', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('roleproof.jobs.v1', '{broken-json')
    localStorage.setItem('roleproof.evidence.v1', 'not-json')
  })
  await page.goto('/')
  await expect(page.locator('.job-switcher option')).toHaveCount(3)
  await openSidebarView(page, '总览')
  await expect(page.locator('.metric-card').first()).toContainText('03')
})


test('空白公司、岗位和 JD 不会被当作有效职位保存', async ({ page }) => {
  await resetWorkspace(page)
  await page.goto('/')
  await openSidebarView(page, '职位情报')
  await page.getByRole('button', { name: '录入职位' }).click()
  await page.getByLabel('公司 *').fill('   ')
  await page.getByLabel('岗位名称 *').fill('   ')
  await page.getByLabel('JD 原文 *').fill('      ')

  let message = ''
  page.once('dialog', async (dialog) => {
    message = dialog.message()
    await dialog.accept()
  })
  await page.getByRole('button', { name: '保存并解析' }).click()
  expect(message).toContain('不能为空')

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.job-switcher option')).toHaveCount(3)
})

test('职位列表分数与岗位详情的实时证据分数保持一致', async ({ page }) => {
  await resetWorkspace(page)
  await page.goto('/')
  await openSidebarView(page, '职位情报')
  await page.getByRole('button', { name: '录入职位' }).click()
  await page.getByLabel('公司 *').fill('分数一致性测试公司')
  await page.getByLabel('岗位名称 *').fill('AI Agent 产品经理')
  await page.getByLabel('JD 原文 *').fill('负责企业级 AI Agent 产品规划与工作流设计；建立模型评测体系并推动产品迭代。')
  await page.getByRole('button', { name: '保存并解析' }).click()

  const detailScore = Number((await page.locator('.hero-score strong').innerText()).replace(/\D/g, ''))
  expect(detailScore).toBeGreaterThan(0)

  await openSidebarView(page, '职位情报')
  const row = page.locator('.table-row').filter({ hasText: '分数一致性测试公司' })
  await expect(row.locator('.match-bar strong')).toHaveText(String(detailScore))
})

test('侧栏证据完整度和材料数量来自真实数据而非硬编码', async ({ page }) => {
  await resetWorkspace(page)
  await page.goto('/')
  const footer = page.locator('.sidebar-footer')
  await expect(footer).toContainText('100%')
  await expect(footer).toContainText('3 个项目 · 12 份已挂材料')
})

test('被人工驳回的证据匹配不会进入作品集', async ({ page }) => {
  await resetWorkspace(page)
  await page.goto('/')
  const workspace = {
    version: 1,
    exportedAt: '2026-09-04T00:00:00.000Z',
    jobs: [{
      id: 'J-REJECT', company: '人工决策测试公司', title: 'AI 产品经理', location: '上海', salary: '面议', stage: '准备中', score: 0, updatedAt: '刚刚', tags: ['Agent'],
      source: { name: '测试数据', url: '#', capturedAt: '2026-09-04' },
      jd: '负责 AI Agent 工作流设计和产品规划。',
      requirements: [{ id: 'R-REJECT', jobId: 'J-REJECT', text: '负责 AI Agent 工作流设计和产品规划', kind: 'ai', weight: 10, keywords: ['Agent', '工作流'] }],
    }],
    evidence: [{
      id: 'P-REJECT', project: '测试项目', title: 'Agent 工作流证据', role: 'AI 产品经理', capability: ['Agent 工作流'], action: '设计 Agent 工作流', result: '完成可运行 Demo', summary: '用于验证人工驳回是否生效', verification: 'verified', links: [], metrics: [], updatedAt: '2026-09-04',
    }],
    decisions: [], portfolio: [], interviews: [],
  }
  await page.locator('input[type="file"]').setInputFiles({ name: 'controlled-workspace.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(workspace)) })
  await expect(page.locator('.job-switcher option')).toHaveCount(1)

  await openSidebarView(page, '证据匹配')
  await page.getByRole('button', { name: '驳回' }).click()
  await expect(page.locator('.decision-state')).toHaveText('已驳回')

  await openSidebarView(page, '作品集工坊')
  await page.getByRole('button', { name: '生成第一版' }).click()
  await expect(page.locator('.portfolio-section')).toHaveCount(0)
  await expect(page.getByText('还没有岗位定制版本')).toBeVisible()
})

test('重新生成面试问题不会覆盖用户已经填写的回答和复盘', async ({ page }) => {
  await resetWorkspace(page)
  await page.goto('/')
  await openSidebarView(page, '面试复盘')
  await page.getByRole('button', { name: /生成问题|生成面试问题/ }).first().click()
  const firstCard = page.locator('.interview-card').first()
  await firstCard.locator('textarea').fill('这是我已经认真整理的 STAR 回答，不应被重新生成覆盖。')
  await firstCard.locator('input').nth(0).fill('缺少业务指标')
  await firstCard.locator('input').nth(1).fill('补充用户测试与转化数据')

  await page.getByRole('button', { name: '生成面试问题' }).click()

  await expect(page.locator('.interview-card').first().locator('textarea')).toHaveValue('这是我已经认真整理的 STAR 回答，不应被重新生成覆盖。')
  await expect(page.locator('.interview-card').first().locator('input').nth(0)).toHaveValue('缺少业务指标')
  await expect(page.locator('.interview-card').first().locator('input').nth(1)).toHaveValue('补充用户测试与转化数据')
})

test('重新生成作品集不会静默覆盖用户手工编辑的段落', async ({ page }) => {
  await resetWorkspace(page)
  await page.goto('/')
  await openSidebarView(page, '作品集工坊')
  await page.getByRole('button', { name: /生成第一版|生成岗位版本/ }).first().click()
  const editedCopy = '这是我基于真实业务背景手工重写的项目介绍，必须保留。'
  await page.locator('.portfolio-section textarea').first().fill(editedCopy)

  await page.getByRole('button', { name: '生成岗位版本' }).click()

  await expect(page.locator('.portfolio-section textarea').first()).toHaveValue(editedCopy)
})

test('语法正确但结构错误的 localStorage 会被拒绝并回退演示数据', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('roleproof.jobs.v1', JSON.stringify([]))
    localStorage.setItem('roleproof.evidence.v1', JSON.stringify({ unexpected: true }))
    localStorage.setItem('roleproof.decisions.v1', JSON.stringify({ unexpected: true }))
  })
  await page.goto('/')
  await expect(page.locator('.job-switcher option')).toHaveCount(3)
  await openSidebarView(page, '总览')
  await expect(page.locator('.metric-card').first()).toContainText('03')
  await expect(page.locator('.sidebar-footer')).toContainText('3 个项目')
})

test('编辑后采用会真实修改证据引用并约束下游作品集', async ({ page }) => {
  await resetWorkspace(page)
  await page.goto('/')
  const workspace = {
    version: 1,
    exportedAt: '2026-09-04T00:00:00.000Z',
    jobs: [{
      id: 'J-EDIT', company: '编辑决策测试公司', title: 'AI 产品经理', location: '上海', salary: '面议', stage: '准备中', score: 0, updatedAt: '刚刚', tags: ['Agent'],
      source: { name: '测试数据', url: '#', capturedAt: '2026-09-04' },
      jd: '负责 AI Agent 工作流设计和产品规划。',
      requirements: [{ id: 'R-EDIT', jobId: 'J-EDIT', text: '负责 AI Agent 工作流设计和产品规划', kind: 'ai', weight: 10, keywords: ['Agent', '工作流'] }],
    }],
    evidence: [
      { id: 'P-ONE', project: '保留项目', title: '应被采用的 Agent 证据', role: 'AI 产品经理', capability: ['Agent 工作流'], action: '设计 Agent 工作流', result: '完成 Demo', summary: '第一条证据', verification: 'verified', links: [], metrics: [], updatedAt: '2026-09-04' },
      { id: 'P-TWO', project: '移除项目', title: '不应进入作品集的 Agent 证据', role: 'AI 产品经理', capability: ['Agent 工作流'], action: '设计 Agent 工作流', result: '完成 Demo', summary: '第二条证据', verification: 'verified', links: [], metrics: [], updatedAt: '2026-09-04' },
    ],
    decisions: [], portfolio: [], interviews: [],
  }
  await page.locator('input[type="file"]').setInputFiles({ name: 'edit-workspace.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(workspace)) })
  await openSidebarView(page, '证据匹配')

  let promptType = ''
  page.once('dialog', async (dialog) => {
    promptType = dialog.type()
    await dialog.accept('P-ONE')
  })
  await page.getByRole('button', { name: '编辑后采用' }).click()
  expect(promptType).toBe('prompt')

  await expect(page.locator('.decision-state')).toHaveText('已编辑')
  await expect(page.locator('.linked-cards')).toContainText('P-ONE')
  await expect(page.locator('.linked-cards')).not.toContainText('P-TWO')

  await openSidebarView(page, '作品集工坊')
  await page.getByRole('button', { name: '生成第一版' }).click()
  await expect(page.locator('.portfolio-section')).toHaveCount(1)
  await expect(page.locator('.portfolio-section footer')).toContainText('P-ONE')
  await expect(page.locator('.portfolio-section footer')).not.toContainText('P-TWO')
})
