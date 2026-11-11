import { test, expect } from '@playwright/test';
import { mockSupabase } from './supabase-fixture';
import sharp from 'sharp';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'no-preference',
});
test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

async function pixelDifference(a: Buffer, b: Buffer) {
  const first = await sharp(a).removeAlpha().raw().toBuffer();
  const second = await sharp(b).removeAlpha().raw().toBuffer();
  let sum = 0;
  for (let i = 0; i < first.length; i++) sum += Math.abs(first[i] - second[i]);
  return sum / first.length;
}

test('cubo responde a toque, gira no arraste lateral e permite rolar na vertical', async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // Pula a abertura L7 para testar o cubo já interativo.
  await page.keyboard.press('Shift');
  const cube = page.locator('.hero-object');
  await expect(cube.locator('canvas')).toBeVisible({ timeout: 30000 });
  await page.addStyleTag({ content: '.matrix-canvas { visibility: hidden; }' });
  const box = (await cube.boundingBox())!;
  const x = box.x + box.width * 0.45,
    y = box.y + box.height * 0.48;
  const input = await context.newCDPSession(page);
  const before = await cube.screenshot();
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });
  await expect(cube).toHaveClass(/is-dragging/);
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  const tapped = await cube.screenshot();
  expect(await pixelDifference(before, tapped)).toBeGreaterThan(0.1);
  await page.waitForTimeout(1600);
  const settled = await cube.screenshot();
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: x - 40, y }],
  });
  for (let step = 1; step <= 6; step++)
    await input.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x - 40 + step * 20, y }],
    });
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await page.waitForTimeout(1400);
  expect(
    await pixelDifference(settled, await cube.screenshot()),
  ).toBeGreaterThan(0.5);
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: y + 60 }],
  });
  for (let step = 1; step <= 6; step++)
    await input.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y + 60 - step * 40 }],
    });
  await input.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(40);
});

test('Matrix respeita o alcance de cada página interna mobile', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const route of [
    '/a-liga',
    '/membros',
    '/projetos',
    '/pesquisas',
    '/atividades',
    '/participar',
  ]) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();
    await expect
      .poll(async () =>
        page.locator('.matrix-canvas').evaluate((canvas: HTMLCanvasElement) => {
          const values = canvas
            .getContext('2d')!
            .getImageData(0, 0, canvas.width, canvas.height).data;
          for (let i = 3; i < values.length; i += 4)
            if (values[i] > 0) return true;
          return false;
        }),
      )
      .toBe(true);
  }
  for (const route of ['/projetos', '/pesquisas', '/atividades']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const intro = page.locator('[data-matrix="intro"]');
    await expect(intro).toBeVisible();
    await page.evaluate(() => {
      const intro = document.querySelector<HTMLElement>(
        '[data-matrix="intro"]',
      )!;
      window.scrollTo({
        top: intro.offsetTop + intro.offsetHeight + 60,
        behavior: 'instant',
      });
    });
    await expect
      .poll(() =>
        page.locator('.matrix-canvas').evaluate((canvas: HTMLCanvasElement) =>
          canvas
            .getContext('2d')!
            .getImageData(0, 0, canvas.width, canvas.height)
            .data.some((value, index) => index % 4 === 3 && value > 0),
        ),
      )
      .toBe(true);
    await page.evaluate(() => {
      const intro = document.querySelector<HTMLElement>(
        '[data-matrix="intro"]',
      )!;
      const next = intro.nextElementSibling!;
      const end =
        next.getBoundingClientRect().top +
        window.scrollY +
        Math.min(520, innerHeight * 0.65);
      window.scrollTo({ top: end + 40, behavior: 'instant' });
    });
    await expect
      .poll(() =>
        page.locator('.matrix-canvas').evaluate((canvas: HTMLCanvasElement) =>
          canvas
            .getContext('2d')!
            .getImageData(0, 0, canvas.width, canvas.height)
            .data.some((value, index) => index % 4 === 3 && value > 0),
        ),
      )
      .toBe(false);
  }
  await page.goto('/participar', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: '.artifacts/mobile-participate-matrix.png' });
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight / 2),
  );
  await expect
    .poll(async () =>
      page.locator('.matrix-canvas').evaluate((canvas: HTMLCanvasElement) =>
        canvas
          .getContext('2d')!
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.some((value, index) => index % 4 === 3 && value > 0),
      ),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.matrix-canvas')).toHaveCount(0);
});

test('menu mobile tem destinos legíveis, fecha ao navegar e cabe em telas pequenas', async ({
  page,
}) => {
  await page.goto('/membros', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('link'),
  ).toHaveCount(7);
  await page.screenshot({ path: '.artifacts/mobile-menu-redesign.png' });
  await page
    .getByRole('navigation', { name: 'Navegação móvel' })
    .getByRole('link', { name: 'Projetos', exact: true })
    .click();
  await expect(page).toHaveURL(/\/projetos$/);
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused();
});

test('login no HackRF mobile mantém campos reais e cabe no viewport', async ({
  page,
}) => {
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'Entrar na LASETE' }),
  ).toBeVisible();
  for (const [width, height] of [
    [320, 568],
    [360, 740],
    [390, 844],
    [412, 915],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('.access-device-controls')).toBeVisible();
    await expect(page.locator('.access-identity')).toBeHidden();
    expect(
      await page.evaluate(() => ({
        x: document.documentElement.scrollWidth > innerWidth,
        y: document.documentElement.scrollHeight > innerHeight,
      })),
      `${width}x${height}`,
    ).toEqual({ x: false, y: false });
    await expect(
      page.getByRole('button', { name: 'Entrar no painel' }),
    ).toBeInViewport();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.artifacts/mobile-hackrf-login.png' });
  await page
    .getByLabel('E-mail', { exact: true })
    .fill('felipe.admin@lasete.com');
  await page.getByLabel('Senha', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Entrar no painel' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'E-mail ou senha incorretos',
  );
  await page.getByLabel('Senha', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Entrar no painel' }).click();
  await expect(
    page.getByRole('navigation', { name: 'Seções do painel' }),
  ).toBeVisible();
});
