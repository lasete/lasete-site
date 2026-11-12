import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { mockSupabase } from './supabase-fixture';
test.beforeEach(async ({ page }, testInfo) => {
  await mockSupabase(page, {
    signedIn: /painel publica|edição preserva/.test(testInfo.title),
  });
});
const routes = [
  '/',
  '/a-liga',
  '/membros',
  '/projetos',
  '/pesquisas',
  '/atividades',
  '/participar',
];
// A abertura L7 cobre a Home por alguns segundos; os testes do site a pulam como um visitante faria.
async function openHome(page: Page) {
  await page.goto('/');
  await page.keyboard.press('Shift');
}
async function loadImages(page: Page) {
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = 'eager';
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => null)),
    );
    await document.fonts.ready;
  });
}
async function readPage(page: Page) {
  await loadImages(page);
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  for (let y = 0; y < height; y += 700) {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: 'instant' }),
      y,
    );
    await page.waitForTimeout(75);
  }
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}
async function difference(
  a: Buffer,
  b: Buffer,
  region: { left: number; top: number; width: number; height: number },
) {
  const first = await sharp(a)
    .extract(region)
    .removeAlpha()
    .greyscale()
    .raw()
    .toBuffer();
  const second = await sharp(b)
    .extract(region)
    .removeAlpha()
    .greyscale()
    .raw()
    .toBuffer();
  let sum = 0;
  for (let i = 0; i < first.length; i++) sum += Math.abs(first[i] - second[i]);
  return sum / first.length;
}
async function matrixPaint(page: Page) {
  return page
    .locator('.matrix-canvas')
    .evaluate((canvas: HTMLCanvasElement) => {
      const pixels = canvas
        .getContext('2d')!
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let alpha = 0;
      for (let i = 3; i < pixels.length; i += 4) alpha += pixels[i];
      return alpha;
    });
}
test('sete páginas, navegação completa e conteúdo sem overflow', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openHome(page);
  await expect(page.locator('nav[aria-label="Principal"] a')).toHaveCount(7);
  await expect(
    page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: 'Participar e contato', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.hero-object canvas')).toBeVisible({
    timeout: 30000,
  });
  await expect(
    page.getByRole('link', { name: 'Explore a LASETE', exact: true }),
  ).toBeVisible();
  // Keep slow full-page raster captures separate from route behavior checks.
  await mkdir('.artifacts', { recursive: true });
  for (const route of routes.slice(1)) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      route,
    ).toBe(true);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor,
      ),
    ).toBe('rgb(0, 0, 0)');
  }
  expect(errors).toEqual([]);
});
test('relatos de mídia e materiais expandem na página com acesso à fonte', async ({
  page,
}) => {
  await page.goto('/atividades?aba=midia');
  await expect(
    page.getByRole('tab', { name: 'LASETE na mídia' }),
  ).toHaveAttribute('data-state', 'active');
  const card = page.locator('article').filter({
    has: page.getByRole('heading', {
      name: 'LASETE no CTIC Insight Conference 2026',
      exact: true,
    }),
  });
  await card.getByRole('button', { name: /Ler sobre/ }).click();
  await expect(
    card.getByRole('button', { name: /Fechar relato/ }),
  ).toHaveAttribute('aria-expanded', 'true');
  await expect(
    card.getByRole('link', { name: 'Ver no Instagram' }),
  ).toHaveAttribute('href', 'https://www.instagram.com/lasete.undb/');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/pesquisas');
  await expect(
    page.getByRole('heading', {
      name: 'Privacidade e proteção de dados',
      exact: true,
      level: 3,
    }),
  ).toBeVisible();
});
test('projetos permitem explorar etapas, filtrar e acessar a IA sem pop-up', async ({
  page,
}) => {
  await page.goto('/projetos?projeto=ctf');
  await expect(
    page.getByRole('heading', { name: 'Capture the Flag', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Enumeração', exact: true }).click();
  await expect(
    page.getByText('Nmap · Gobuster · Dirb · ffuf', { exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Exploração', exact: true }).click();
  await expect(
    page.getByText('Headers · SQL Injection · LFI · Exploit chain', {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('tab', { name: /^LASETE AI/ }).click();
  await expect(
    page.getByRole('link', { name: 'Acessar LASETE AI', exact: true }),
  ).toHaveAttribute('href', 'https://laseteai.streamlit.app/');
  await page
    .getByRole('button', { name: 'Inteligência artificial', exact: true })
    .click();
  await expect(
    page.getByRole('tab', { name: /^Capture the Flag/ }),
  ).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('contatos aparecem primeiro e o seletivo fechado preserva os dois documentos', async ({
  page,
}) => {
  await page.goto('/participar');
  const email = page
    .locator('#contato')
    .getByRole('link', { name: /lasete\.undb@gmail\.com/ });
  await expect(email).toBeInViewport();
  await expect(page.locator('#selection-heading')).toContainText('FECHADO.');
  await expect(page.getByRole('link', { name: 'Ler edital' })).toHaveAttribute(
    'href',
    'https://drive.google.com/file/d/1gcHwt2QOeHMJhap1I15PpUr4W2yyXMWo/view',
  );
  await expect(
    page.getByRole('link', { name: 'Consultar formulário' }),
  ).toHaveAttribute('href', /closedform$/);
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
  await readPage(page);
  await page.screenshot({
    path: '.artifacts/final-contact-desktop.png',
    fullPage: true,
  });
});
test('membros mantêm busca, filtros, cargos e estados sem retrato', async ({
  page,
}) => {
  await page.goto('/membros');
  await page.getByRole('textbox', { name: 'Buscar membro' }).fill('luiza');
  await expect(
    page.getByRole('heading', {
      name: 'Luiza Belfort Conceição dos Santos',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('.member-card')).toHaveCount(1);
  await page.getByRole('textbox', { name: 'Buscar membro' }).clear();
  await page.getByRole('tab', { name: 'Orientadores', exact: true }).click();
  await expect(page.locator('.member-card')).toHaveCount(3);
  await expect(
    page.getByRole('heading', {
      name: 'Arlley Carlos Carneiro dos Santos Costa',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel('Retrato ainda não disponível')).toBeVisible();
  await page.getByRole('tab', { name: 'Ligantes', exact: true }).click();
  await expect(page.locator('.member-card')).toHaveCount(7);
});
test('painel publica projeto e alterna seletivo com persistência no banco', async ({
  page,
}) => {
  await page.goto('/admin');
  await expect(page.getByText('Espaço da diretoria')).toBeVisible();
  await page
    .getByRole('button', { name: 'Adicionar projeto', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByLabel('Título', { exact: true })
    .fill('Projeto de avaliação do frontend');
  await dialog
    .getByLabel('Subtítulo', { exact: true })
    .fill('Conteúdo criado pelo teste editorial.');
  await dialog.getByLabel('Categoria', { exact: true }).fill('Prévia');
  await dialog.getByLabel('Publicado no site').check();
  await dialog.getByRole('button', { name: 'Salvar conteúdo' }).click();
  await expect(page.getByRole('status')).toContainText('Alterações salvas');
  await page.goto('/projetos');
  await page
    .getByRole('tab', { name: /^Projeto de avaliação do frontend/ })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Projeto de avaliação do frontend',
      exact: true,
    }),
  ).toBeVisible();
  await page.goto('/admin');
  await page
    .getByRole('button', { name: 'Processo seletivo', exact: true })
    .click();
  await page.getByRole('checkbox', { name: 'Seletivo aberto' }).check();
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await page.goto('/participar');
  await expect(page.locator('#selection-heading')).toContainText('ABERTAS.');
  await page.reload();
  await expect(page.locator('#selection-heading')).toContainText('ABERTAS.');
});
test('dispersão da hero fica perto do mouse e a forma se recompõe ao sair', async ({
  page,
}) => {
  test.setTimeout(90000);
  await openHome(page);
  await expect(page.locator('.hero-object canvas')).toBeVisible({
    timeout: 30000,
  });
  await page.addStyleTag({ content: '.matrix-canvas {visibility:hidden}' });
  await page.mouse.move(10, 90);
  await page.waitForTimeout(700);
  const object = page.locator('.hero-object'),
    bounds = (await object.boundingBox())!;
  const before = await object.screenshot();
  const point = {
    x: Math.round(bounds.width * 0.4),
    y: Math.round(bounds.height * 0.4),
  };
  await page.mouse.move(bounds.x + point.x, bounds.y + point.y);
  await page.waitForTimeout(350);
  const active = await object.screenshot();
  const local = {
    left: point.x - 80,
    top: point.y - 80,
    width: 160,
    height: 160,
  };
  const remote = {
    left: Math.round(bounds.width * 0.65) - 70,
    top: Math.round(bounds.height * 0.7) - 70,
    width: 140,
    height: 140,
  };
  const nearby = await difference(before, active, local),
    distant = await difference(before, active, remote);
  expect(nearby).toBeGreaterThan(1);
  expect(nearby).toBeGreaterThan(distant * 3 + 0.5);
  await page.mouse.move(10, 90);
  await page.waitForTimeout(1500);
  const restored = await object.screenshot();
  expect(await difference(before, restored, local)).toBeLessThan(nearby * 0.35);
  await page.mouse.move(bounds.x + 20, bounds.y + bounds.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 180, bounds.y + bounds.height * 0.5, {
    steps: 3,
  });
  await page.mouse.up();
  await page.mouse.move(10, 90);
  await page.waitForTimeout(800);
  const rotated = await object.screenshot();
  expect(
    await difference(before, rotated, {
      left: 0,
      top: 0,
      width: Math.floor(bounds.width),
      height: Math.floor(bounds.height),
    }),
  ).toBeGreaterThan(0.8);
});
test('Matrix preserva a Home e continua no fundo das páginas internas', async ({
  page,
}) => {
  await openHome(page);
  await expect(page.locator('.matrix-canvas')).toHaveCount(1);
  const field = await page.locator('.matrix-canvas').elementHandle();
  await page
    .getByRole('link', { name: 'Explore a LASETE', exact: true })
    .click();
  await expect(page.locator('#conheca h1')).toBeInViewport();
  // A primeira leitura de pixels espera a GPU em software terminar a cena 3D (3 a 5 s no headless).
  await expect
    .poll(() => matrixPaint(page), { timeout: 20000 })
    .toBeGreaterThan(0);
  expect(
    await page
      .locator('.matrix-canvas')
      .evaluate((node, original) => node === original, field),
  ).toBe(true);
  await page.mouse.wheel(0, 2900);
  await expect.poll(() => matrixPaint(page)).toBe(0);
  await page.goto('/atividades');
  await expect.poll(() => matrixPaint(page)).toBeGreaterThan(0);
  await page.goto('/participar');
  await expect.poll(() => matrixPaint(page)).toBeGreaterThan(0);
});
test('edição preserva data de origem e o destino da IA em todos os acessos', async ({
  page,
}) => {
  await page.goto('/admin');
  await page.getByRole('button', { name: /^Atividades/ }).click();
  await page
    .getByRole('button', {
      name: 'Editar Web Hacking no IT Works',
      exact: true,
    })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Salvar conteúdo' })
    .click();
  await expect(page.getByRole('status')).toContainText('Alterações salvas');
  await page.goto('/atividades');
  await expect(
    page
      .locator('article')
      .filter({
        has: page.getByRole('heading', {
          name: 'Web Hacking no IT Works',
          exact: true,
        }),
      })
      .getByText('Workshop', { exact: true }),
  ).toBeVisible();
  await page.goto('/admin');
  await page
    .getByRole('button', { name: 'Contatos e links', exact: true })
    .click();
  await page
    .getByLabel('LASETE AI', { exact: true })
    .fill('https://example.com/lasete-ai');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('status')).toContainText('Alterações salvas');
  await page.goto('/projetos?projeto=lasete-ai');
  await expect(page.locator('.ai-nav')).toHaveAttribute(
    'href',
    'https://example.com/lasete-ai',
  );
  await expect(
    page.getByRole('link', { name: 'Acessar LASETE AI', exact: true }),
  ).toHaveAttribute('href', 'https://example.com/lasete-ai');
  await page.goto('/admin');
  await page
    .getByRole('button', { name: 'Editar LASETE AI', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByLabel('Link de direcionamento')
    .fill('https://example.com/outra-ia');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Salvar conteúdo' })
    .click();
  await openHome(page);
  await expect(page.locator('.ai-nav')).toHaveAttribute(
    'href',
    'https://example.com/outra-ia',
  );
  await expect(
    page.getByRole('link', { name: 'Explorar LASETE AI', exact: true }),
  ).toHaveAttribute('href', 'https://example.com/outra-ia');
});
test.describe('celular', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  test('sete rotas, menu acessível e conteúdo completo com movimento reduzido', async ({
    page,
  }) => {
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
    }
    await openHome(page);
    await expect(page.locator('.hero-object canvas')).toBeVisible();
    await expect(page.locator('.matrix-canvas')).toHaveCount(0);
    await loadImages(page);
    await page.screenshot({ path: '.artifacts/final-hero-mobile.png' });
    await page.screenshot({
      path: '.artifacts/final-home-mobile.png',
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Navegação móvel' })
      .getByRole('link', { name: 'Membros', exact: true })
      .click();
    await expect(page).toHaveURL(/\/membros$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.goto('/participar');
    await expect(
      page
        .locator('#contato')
        .getByRole('link', { name: /lasete\.undb@gmail\.com/ }),
    ).toBeInViewport();
    await page.screenshot({
      path: '.artifacts/final-contact-mobile.png',
      fullPage: true,
    });
  });
});

test('seletor acompanha o teclado e o menu libera a tela ao mudar para desktop', async ({
  page,
}) => {
  await page.goto('/projetos');
  await page.getByRole('tab', { name: /^Capture the Flag/ }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('tab', { name: /^LASETE AI/ })).toHaveAttribute(
    'data-state',
    'active',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: /^Capture the Flag/ }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /^LASETE AI/ })).toHaveAttribute(
    'data-state',
    'active',
  );
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Principal' }),
  ).toBeVisible();
  await expect(
    page
      .locator('.site-header')
      .getByRole('link', { name: 'LASETE — início', exact: true }),
  ).toBeFocused();
});
test('mudar a preferência de movimento encerra a Matrix e revela o conteúdo sem recarregar', async ({
  page,
}) => {
  await openHome(page);
  await expect(page.locator('.matrix-canvas')).toHaveCount(1);
  await expect(page.locator('.home-intro-copy')).toHaveCSS('opacity', '0');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.matrix-canvas')).toHaveCount(0);
  await expect(page.locator('.home-intro-copy')).toHaveCSS('opacity', '1');
  await expect(page.locator('.home-intro-photo')).toHaveCSS(
    'transform',
    'none',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.matrix-canvas')).toHaveCount(1);
});

test('rotas diretas e atualização abrem o admin; caminhos inválidos mostram o 404 da liga', async ({
  page,
}) => {
  await page.goto('/admin');
  await expect(
    page.getByRole('button', { name: 'Entrar no painel' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Entrar no painel' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Página não encontrada.' }),
  ).toHaveCount(0);

  for (const route of ['/pagina-inexistente', '/admin/rota-inexistente']) {
    await page.goto(route);
    await expect(
      page.getByRole('heading', { name: 'Página não encontrada.' }),
    ).toBeVisible();
    await expect(page).toHaveTitle('Página não encontrada · LASETE');
    await expect(page.locator('.not-found-path code')).toHaveText(route);
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    );
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Página não encontrada.' }),
    ).toBeVisible();
  }

  await page
    .getByRole('link', { name: 'Falar com a LASETE', exact: true })
    .click();
  await expect(page).toHaveURL(/\/participar#contato$/);
  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('#contato')).toBeInViewport();

  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/caminho-' + 'inexistente'.repeat(30));
  await expect(
    page.getByRole('heading', { name: 'Página não encontrada.' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const home = page.getByRole('link', { name: 'Voltar à Home', exact: true });
  await home.focus();
  await expect(home).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/');
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
});

test('404 grande dispersa caracteres sem girar e mantém três sugestões úteis', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/404-interativo');
  const object = page.locator('.ascii-404-object');
  await expect(object.locator('canvas')).toBeVisible({ timeout: 30000 });
  const links = page
    .getByRole('navigation', { name: 'Algumas páginas que temos' })
    .getByRole('link');
  await expect(links).toHaveCount(3);
  const paths = await links.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href')),
  );
  expect(new Set(paths).size).toBe(3);
  expect(
    paths.every((path) =>
      [
        '/a-liga',
        '/membros',
        '/projetos',
        '/pesquisas',
        '/atividades',
      ].includes(path!),
    ),
  ).toBe(true);
  const bounds = (await object.boundingBox())!;
  expect(Math.abs(bounds.x + bounds.width / 2 - 720)).toBeLessThan(2);
  expect(bounds.width).toBeGreaterThan(1100);
  const copy = (await page.locator('.not-found-copy').boundingBox())!;
  expect(copy.y).toBeGreaterThan(bounds.y + bounds.height);
  await page.mouse.move(4, 90);
  await page.waitForTimeout(1200);
  const before = await object.screenshot();
  expect(
    (await sharp(before).greyscale().stats()).channels[0].mean,
  ).toBeGreaterThan(1);
  const point = {
    x: Math.round(bounds.width * 0.27),
    y: Math.round(bounds.height * 0.57),
  };
  const local = {
    left: point.x - 70,
    top: point.y - 70,
    width: 140,
    height: 140,
  };
  const remote = {
    left: Math.round(bounds.width * 0.78),
    top: Math.round(bounds.height * 0.35),
    width: 100,
    height: 100,
  };
  await page.mouse.move(bounds.x + point.x, bounds.y + point.y);
  await page.waitForTimeout(250);
  const active = await object.screenshot();
  const nearby = await difference(before, active, local);
  const distant = await difference(before, active, remote);
  expect(nearby).toBeGreaterThan(0.5);
  expect(nearby).toBeGreaterThan(distant * 2 + 0.1);
  await page.mouse.move(4, 90);
  await page.waitForTimeout(1400);
  const restored = await object.screenshot();
  expect(await difference(before, restored, local)).toBeLessThan(
    nearby * 0.35 + 0.03,
  );
  // Isolate orientation from the deliberately springy hover trail.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(150);
  const locked = await object.screenshot();
  await page.mouse.move(bounds.x + 20, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 200, bounds.y + bounds.height / 2 + 80, {
    steps: 3,
  });
  await page.mouse.up();
  await page.mouse.move(4, 90);
  await object.dispatchEvent('keydown', { key: 'ArrowRight' });
  await page.waitForTimeout(1400);
  const afterDrag = await object.screenshot();
  expect(
    await difference(locked, afterDrag, {
      left: 0,
      top: 0,
      width: Math.floor(bounds.width),
      height: Math.floor(bounds.height),
    }),
  ).toBeLessThan(0.15);
  expect(
    await links.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href')),
    ),
  ).toEqual(paths);
  await links.first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(paths[0]!);
  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
});

test('404 no celular fica parado no toque e permite rolar a página', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5180/404-mobile');
  const object = page.locator('.ascii-404-object');
  await expect(object.locator('canvas')).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(500);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator('.ascii-404-hint')).toHaveCount(0);
  const bounds = (await object.boundingBox())!;
  const before = await object.screenshot();
  const session = await context.newCDPSession(page);
  const y = bounds.y + bounds.height / 2;
  const start = bounds.x + bounds.width * 0.75;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: start, y }],
  });
  for (let step = 1; step <= 5; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: start - step * 30, y }],
    });
  }
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  const after = await object.screenshot();
  expect(
    await difference(before, after, {
      left: 0,
      top: 0,
      width: Math.floor(bounds.width),
      height: Math.floor(bounds.height),
    }),
  ).toBeLessThan(0.1);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  const x = bounds.x + bounds.width / 2;
  const top = bounds.y + bounds.height * 0.8;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: top }],
  });
  for (let step = 1; step <= 7; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: top - step * 25 }],
    });
  }
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(80);
  await expect(
    page
      .getByRole('navigation', { name: 'Algumas páginas que temos' })
      .getByRole('link'),
  ).toHaveCount(3);
  await context.close();
});

test('404 preserva a recuperação mesmo sem WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type.includes('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto('/404-sem-webgl');
  await expect(page.locator('.ascii-404-fallback')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Página não encontrada.' }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Algumas páginas que temos' })
      .getByRole('link'),
  ).toHaveCount(3);
  await page.getByRole('link', { name: 'Voltar à Home', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.hero')).toBeVisible();
});

test('abertura L7 cobre a Home, forma o cubo, mostra o nome e não repete ao voltar', async ({
  page,
}) => {
  test.setTimeout(90000);
  const html = page.locator('html');
  await page.goto('/');
  await expect(html).toHaveAttribute('data-intro', /wait|play/);
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.matrix-canvas')).toBeHidden();
  await expect(html).toHaveAttribute('data-intro', 'name', { timeout: 40000 });
  await expect(page.locator('.hero-intro-name')).toHaveText('Lasete');
  await expect(page.locator('.hero-intro-name')).toHaveCSS('opacity', '1');
  await expect(html).not.toHaveAttribute('data-intro', /.*/, {
    timeout: 20000,
  });
  await expect(page.locator('.site-header')).toBeVisible();
  await expect(page.locator('.hero-intro-name')).toHaveCSS('opacity', '0');
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await nav.getByRole('link', { name: 'Projetos', exact: true }).click();
  await expect(page).toHaveURL(/\/projetos$/);
  await page.getByRole('link', { name: 'LASETE — início' }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.hero-object canvas')).toBeVisible();
  await expect(html).not.toHaveAttribute('data-intro', /.*/);
  await expect(page.locator('.hero-intro-name')).toHaveCount(0);
});
test('abertura L7 pode ser pulada e não toca fora da Home nem com movimento reduzido', async ({
  page,
}) => {
  const html = page.locator('html');
  await page.goto('/');
  await expect(html).toHaveAttribute('data-intro', /wait|play/);
  await page.mouse.click(700, 500);
  await expect(html).not.toHaveAttribute('data-intro', /.*/);
  await expect(page.locator('.site-header')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Explore a LASETE', exact: true }),
  ).toBeVisible();
  await page.goto('/projetos');
  await expect(html).not.toHaveAttribute('data-intro', /.*/);
  await page.goto('/#conheca');
  await expect(html).not.toHaveAttribute('data-intro', /.*/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(html).not.toHaveAttribute('data-intro', /.*/);
  await expect(page.locator('.site-header')).toBeVisible();
});
test('botão da hero é uma pílula legível que leva à apresentação', async ({
  page,
}) => {
  await openHome(page);
  const cue = page.getByRole('link', { name: 'Explore a LASETE', exact: true });
  await expect(cue).toBeVisible();
  await expect(cue).toHaveCSS('font-size', '14px');
  await expect(cue).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(cue).toHaveCSS('border-top-style', 'solid');
  expect((await cue.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await expect(cue.locator('.scroll-mark')).toHaveCount(0);
  await expect(cue.locator('svg')).toHaveCount(1);
  await expect(cue).toHaveAttribute('href', '#conheca');
});
test('temas da liga ficam na Home, depois dos pilares, e saem de Pesquisas', async ({
  page,
}) => {
  await openHome(page);
  const fields = page.locator('.research-fields');
  await expect(fields.getByText('Temas que dialogam com a liga')).toBeVisible();
  await expect(fields.locator('.research-field')).toHaveCount(4);
  const order = await page.evaluate(() =>
    [...document.querySelector('.home-page')!.children].map(
      (el) => el.className,
    ),
  );
  const at = (name: string) => order.findIndex((c) => c.includes(name));
  expect(at('home-intro')).toBeLessThan(at('research-fields'));
  expect(at('research-fields')).toBeLessThan(at('network-interlude'));
  await page.goto('/pesquisas');
  await expect(
    page.getByRole('heading', {
      name: 'Investigações e aprendizados da liga.',
    }),
  ).toBeVisible();
  await expect(page.locator('.research-fields')).toHaveCount(0);
});
