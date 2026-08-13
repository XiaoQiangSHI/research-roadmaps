import { test, expect } from '@playwright/test';

test('renders, filters, and opens paper details', async ({ page }) => {
  await page.goto('/roadmaps/embodied-ai/');
  await expect(page.getByRole('heading', { name: '具身智能论文发展路线图' })).toBeVisible();
  await expect(page.locator('[data-paper-node]')).toHaveCount(60);

  await page.getByPlaceholder('例如：触觉、NVIDIA、世界模型').fill('Prismer');
  const visible = page.locator('[data-paper-node]:not([hidden])');
  await expect(visible).toHaveCount(1);
  await visible.getByRole('button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('NVIDIA');
  await expect(page.getByRole('dialog').getByRole('link', { name: '阅读论文' })).toHaveAttribute('href', 'https://arxiv.org/abs/2303.02506');
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/roadmaps/embodied-ai/');
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await page.getByPlaceholder('例如：触觉、NVIDIA、世界模型').fill('GRAIL');
  await page.locator('[data-paper-node]:not([hidden])').getByRole('button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const dialogDimensions = await page.getByRole('dialog').evaluate((dialog) => ({ scrollWidth: dialog.scrollWidth, clientWidth: dialog.clientWidth }));
  expect(dialogDimensions.scrollWidth).toBeLessThanOrEqual(dialogDimensions.clientWidth);
});

test('contribution wizard validates and prepares a standalone paper file', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/contribute/');
  await expect(page.locator('#validation-errors')).toBeEmpty();
  await page.locator('#title').fill('Example Contribution Paper');
  await page.locator('#arxiv').fill('2608.01234');
  await page.locator('#date').fill('2026-08-01');
  await page.locator('#summary').fill('提出一个用于验证论文贡献向导的完整示例方法。');
  await page.locator('#problem').fill('现有贡献流程需要手写较长的 YAML，容易出现格式和引用错误。');
  await page.locator('#solution').fill('使用网页表单实时校验字段，并自动生成独立的论文 YAML 文件。');
  await page.locator('#track').selectOption('data');
  await page.locator('#rationale').fill('主要贡献直接改善数据与环境规模化线路的资料维护流程。');
  await page.locator('#primary-select').selectOption('nvidia');
  await page.getByRole('button', { name: '添加' }).first().click();

  await expect(page.getByText('可以提交', { exact: true })).toBeVisible();
  await expect(page.locator('#yaml-preview')).toContainText('id: "example-contribution-paper"');
  await expect(page.locator('#yaml-preview')).toContainText('primary:\n    - "nvidia"');
  const submitUrl = await page.locator('#github-submit').getAttribute('href');
  expect(submitUrl).toContain('/new/main?filename=datasets%2Fembodied-ai%2Fpapers%2Fexample-contribution-paper.yaml');
  expect(submitUrl).toContain('value=');
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
