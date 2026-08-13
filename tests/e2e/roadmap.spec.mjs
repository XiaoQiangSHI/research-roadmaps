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
  await expect(page.getByRole('dialog').getByRole('link', { name: '打开论文 ↗' })).toHaveAttribute('href', 'https://arxiv.org/abs/2303.02506');
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/roadmaps/embodied-ai/');
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
