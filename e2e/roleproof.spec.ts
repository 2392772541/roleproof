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
  await expect(page.getByRole('heading', { name: /不是告诉你.*为什么匹配/ })).toBeVisible()
  if (testInfo.project.name === 'chromium-desktop') await page.screenshot({ path: 'docs/roleproof-overview.png', fullPage: true })

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
    await page.screenshot({ path: 'docs/roleproof-mobile.png', fullPage: true })
  }
  expect(consoleErrors).toEqual([])
})


