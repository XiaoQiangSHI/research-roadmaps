import { test, expect } from '@playwright/test';

test('renders, filters, and opens paper details', async ({ page }) => {
  await page.goto('/roadmaps/embodied-ai/');
  await expect(page.getByRole('heading', { name: '具身智能论文发展路线图' })).toBeVisible();
  await expect(page.locator('[data-paper-node]')).toHaveCount(62);

  await page.getByPlaceholder('例如：论文标题、问题或机构').fill('Prismer');
  const visible = page.locator('[data-paper-node]:not([hidden])');
  await expect(visible).toHaveCount(1);
  await visible.getByRole('button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('NVIDIA');
  await expect(page.getByRole('dialog').getByRole('link', { name: '阅读论文' })).toHaveAttribute('href', 'https://arxiv.org/abs/2303.02506');
  await expect(page.getByRole('dialog').getByRole('heading', { name: '论文讲解' })).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('link', { name: '贡献讲解' })).toHaveAttribute('href', '/contribute/explanation/?domain=embodied-ai&paper=prismer');
});

test('GaP and RoboTTT expose their reviewed details and blog explanations', async ({ page }) => {
  const papers = [
    {
      id: 'gap',
      title: 'GaP',
      institution: 'Bosch Research',
      explanation: 'S-X-Q · GaP 方法通俗讲解',
      explanationUrl: 'https://www.cnblogs.com/sxq-blog/p/22481629'
    },
    {
      id: 'robottt',
      title: 'RoboTTT',
      institution: 'NVIDIA',
      explanation: 'S-X-Q · RoboTTT 方法详解',
      explanationUrl: 'https://www.cnblogs.com/sxq-blog/p/22480410'
    }
  ];

  for (const paper of papers) {
    await page.goto('/roadmaps/embodied-ai/');
    await page.getByPlaceholder('例如：论文标题、问题或机构').fill(paper.title);
    const target = page.locator(`[data-paper-id="${paper.id}"]:not([hidden])`);
    await expect(target).toBeVisible();
    await target.getByRole('button').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: paper.title })).toBeVisible();
    await expect(dialog).toContainText(paper.institution);
    await expect(dialog.getByRole('link', { name: paper.explanation })).toHaveAttribute('href', paper.explanationUrl);
  }
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/roadmaps/embodied-ai/');
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  await page.getByPlaceholder('例如：论文标题、问题或机构').fill('GRAIL');
  await page.locator('[data-paper-node]:not([hidden])').getByRole('button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const dialogDimensions = await page.getByRole('dialog').evaluate((dialog) => ({ scrollWidth: dialog.scrollWidth, clientWidth: dialog.clientWidth }));
  expect(dialogDimensions.scrollWidth).toBeLessThanOrEqual(dialogDimensions.clientWidth);
});

test('contribution wizard validates and prepares a standalone paper file', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/contribute/?domain=computer-vision');
  await expect(page.locator('#domain')).toHaveValue('computer-vision');
  await expect(page.locator('#active-domain-name')).toHaveText('计算机视觉研究路线图');
  await expect(page.locator('#validation-errors')).toBeEmpty();
  await page.locator('#title').fill('Example Contribution Paper');
  await page.locator('#arxiv').fill('2608.01234');
  await page.locator('#date').fill('2026-08-01');
  await page.locator('#summary').fill('提出一个用于验证论文贡献向导的完整示例方法。');
  await page.locator('#problem').fill('现有贡献流程需要手写较长的 YAML，容易出现格式和引用错误。');
  await page.locator('#solution').fill('使用网页表单实时校验字段，并自动生成独立的论文 YAML 文件。');
  await page.locator('#track').selectOption('recognition');
  await page.locator('#rationale').fill('主要贡献直接改善视觉表征与识别线路的资料维护流程。');
  await page.locator('#primary-select').selectOption('nvidia');
  await page.getByRole('button', { name: '添加' }).first().click();
  await page.getByRole('button', { name: '添加讲解' }).click();
  await page.locator('[data-explanation-title]').fill('Example Author · 深入讲解');
  await page.locator('[data-explanation-url]').fill('https://example.org/explanation');

  await expect(page.getByText('可以提交', { exact: true })).toBeVisible();
  await expect(page.locator('#yaml-preview')).toContainText('id: "example-contribution-paper"');
  await expect(page.locator('#yaml-preview')).toContainText('primary:\n    - "nvidia"');
  await expect(page.locator('#yaml-preview')).toContainText('explanations:');
  await expect(page.locator('#yaml-preview')).toContainText('title: "Example Author · 深入讲解"');
  const submitUrl = await page.locator('#github-submit').getAttribute('href');
  expect(submitUrl).toContain('/new/main?filename=datasets%2Fcomputer-vision%2Fpapers%2Fexample-contribution-paper.yaml');
  expect(submitUrl).toContain('value=');
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('existing papers accept independent explanation contributions', async ({ page }) => {
  await page.goto('/contribute/explanation/?domain=embodied-ai&paper=prismer');
  await expect(page.locator('#domain')).toHaveValue('embodied-ai');
  await expect(page.locator('#paper')).toHaveValue('prismer');
  await page.locator('#explanation-title').fill('Community Author · Prismer 讲解');
  await page.locator('#explanation-url').fill('https://example.org/prismer-guide');
  await expect(page.locator('#preview')).toContainText('paperId: "prismer"');
  await expect(page.locator('#preview')).toContainText('title: "Community Author · Prismer 讲解"');
  const submitUrl = await page.locator('#github-submit').getAttribute('href');
  expect(submitUrl).toContain('datasets%2Fembodied-ai%2Fexplanations%2Fprismer%2Fcommunity-author-prismer.yaml');
});

test('homepage and empty domains expose first-paper contribution entry points', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.roadmap-card').filter({ hasText: '待社区共建' })).toHaveCount(13);
  await expect(page.getByRole('heading', { name: '任务与研究对象' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '方法与系统' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '横向与应用领域' })).toBeVisible();
  await page.getByRole('link', { name: /计算机视觉研究路线图/ }).click();
  await expect(page.getByText('路线骨架已经建立，等待第一篇论文')).toBeVisible();
  await expect(page.getByRole('heading', { name: '这个领域收录什么' })).toHaveCount(0);
  await expect(page.locator('.contribute-button')).toHaveAttribute('href', '/contribute/?domain=computer-vision');
  await expect(page.getByRole('link', { name: '贡献第一篇论文' })).toHaveAttribute('href', '/contribute/?domain=computer-vision');
});

test('site branding loads without overlapping navigation', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 900 },
    { width: 320, height: 720 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const branding = await page.evaluate(() => {
      const brand = document.querySelector('.site-nav .brand');
      const logo = document.querySelector('.site-nav .brand img');
      const links = document.querySelector('.site-nav > div');
      const brandBox = brand.getBoundingClientRect();
      const linksBox = links.getBoundingClientRect();

      return {
        favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href'),
        logoLoaded: logo.complete && logo.naturalWidth > 0,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        overlaps: brandBox.right > linksBox.left
      };
    });

    expect(branding.favicon).toBe('/favicon.png');
    expect(branding.logoLoaded).toBe(true);
    expect(branding.hasHorizontalOverflow).toBe(false);
    expect(branding.overlaps).toBe(false);
  }
});
