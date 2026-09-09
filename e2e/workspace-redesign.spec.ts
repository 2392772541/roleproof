import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function nav(page: Page, name: string) {
  if ((page.viewportSize()?.width ?? 1280) <= 800) await page.getByRole('button', { name: '打开菜单' }).click()
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name, exact: true }).click()
}

test('职位有独立地址，刷新和浏览器返回保留正确上下文', async ({ page }) => {
  await page.goto('/#/jobs/J002/requirements')
  await expect(page.locator('.job-context h2')).toHaveText('大模型产品经理（评测与平台）')
  await page.getByRole('navigation', { name: '职位准备步骤' }).getByRole('link', { name: '投递材料' }).click()
  await expect(page).toHaveURL(/#\/jobs\/J002\/materials$/)
  await page.reload()
  await expect(page.locator('.job-context h2')).toHaveText('大模型产品经理（评测与平台）')
  await page.goBack()
  await expect(page).toHaveURL(/#\/jobs\/J002\/requirements$/)
  await expect(page.getByText('职位原文', { exact: true })).toBeVisible()
  await page.goForward()
  await expect(page).toHaveURL(/#\/jobs\/J002\/materials$/)
})

test('阶段变更持久保存并反映到看板和首页', async ({ page }, info) => {
  await page.goto('/#/jobs/J001/requirements')
  await page.getByLabel('更新求职阶段').selectOption('面试中')
  await nav(page, '我的职位')
  const column = page.locator('.board-column').filter({ has: page.getByRole('heading', { name: '面试中', exact: true }) })
  await expect(column).toContainText('公开岗位研究样本 A')
  if (info.project.name === 'chromium-desktop') await page.screenshot({ path: 'docs/roleproof-board.png', fullPage: true })
  await page.reload()
  await expect(column).toContainText('公开岗位研究样本 A')
  await nav(page, '工作台')
  await expect(page.locator('.home-metrics > div').nth(1)).toContainText('01')
  await expect(page.locator('.task-row').filter({ hasText: '公开岗位研究样本 A' })).toContainText('面试中')
})

test('不同职位的投递材料隔离，导出仅包含已确认的真实段落', async ({ page }) => {
  await page.goto('/#/jobs/J001/materials')
  await page.getByRole('button', { name: '生成第一版' }).click()
  await expect(page.getByRole('button', { name: '下载投递材料' })).toBeDisabled()
  const personalCopy = '这是岗位 A 的专属行动与结果，岗位 B 不应出现。'
  await page.locator('.portfolio-section textarea').first().fill(personalCopy)
  await page.getByRole('button', { name: '确认这段材料' }).first().click()
  const pendingCopy = await page.locator('.portfolio-section textarea').nth(1).inputValue()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载投递材料' }).click()
  const download = await downloadPromise
  const downloaded = await readFile((await download.path())!, 'utf-8')
  expect(downloaded).toContain(personalCopy)
  expect(downloaded).not.toContain(pendingCopy)
  expect(downloaded).toContain('https://github.com/')
  await nav(page, '我的职位')
  await page.locator('.opportunity-card a[href*="/J002/"]').click()
  await page.getByRole('navigation', { name: '职位准备步骤' }).getByRole('link', { name: '投递材料' }).click()
  await expect(page.locator('.portfolio-section')).toHaveCount(0)
  await nav(page, '我的职位')
  await page.locator('.opportunity-card a[href*="/J001/"]').click()
  await page.getByRole('navigation', { name: '职位准备步骤' }).getByRole('link', { name: '投递材料' }).click()
  await page.reload()
  await expect(page.locator('.portfolio-section textarea').first()).toHaveValue(personalCopy)
})

test('不存在的职位明确提示而非偷偷显示默认职位', async ({ page }) => {
  await page.goto('/#/jobs/missing/requirements')
  await expect(page.getByRole('heading', { name: '找不到这个页面或职位' })).toBeVisible()
  await expect(page.locator('.job-context')).toHaveCount(0)
  await page.getByRole('link', { name: '返回职位列表', exact: true }).click()
  await expect(page.locator('.opportunity-card')).toHaveCount(3)
})

test('看板无搜索结果和移动端页面不会产生全页横向溢出', async ({ page }) => {
  await page.goto('/#/jobs')
  await expect(page.locator('.opportunity-card')).toHaveCount(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByPlaceholder('搜索公司、岗位或标签').fill('不存在的唯一岗位')
  await expect(page.getByRole('heading', { name: '没有符合条件的职位' })).toBeVisible()
  await expect(page.locator('.opportunity-card')).toHaveCount(0)
})
