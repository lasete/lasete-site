import { test, expect, type Page } from '@playwright/test';
import { mockSupabase } from './supabase-fixture';

test('login valida senha, entra na área autorizada e sai', async ({ page }) => {
  await mockSupabase(page);
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { name: 'Entrar na LASETE' }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Seções do painel' }),
  ).toHaveCount(0);
  await page
    .getByLabel('E-mail', { exact: true })
    .fill('felipe.admin@lasete.com');
  await page.getByLabel('Senha', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Mostrar senha' }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute(
    'type',
    'text',
  );
  await page.getByRole('button', { name: 'Entrar no painel' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'E-mail ou senha incorretos',
  );
  await page.getByLabel('Senha', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Entrar no painel' }).click();
  await expect(
    page.getByRole('navigation', { name: 'Seções do painel' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Editar Capture the Flag', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: '.artifacts/admin-desktop.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(
    page.getByRole('button', { name: 'Entrar no painel' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Entrar no painel' }),
  ).toBeVisible();
});
test('conta autenticada sem autorização não entra', async ({ page }) => {
  await mockSupabase(page, { signedIn: true, admin: false });
  await page.goto('/admin');
  await expect(
    page.getByText('Esta conta ainda não tem permissão'),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Seções do painel' }),
  ).toHaveCount(0);
});
test('rascunho persiste, publica, exclui e mostra falha de gravação', async ({
  page,
}) => {
  const backend = await mockSupabase(page, { signedIn: true });
  await page.goto('/admin');
  await page
    .getByRole('button', { name: 'Adicionar projeto', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByLabel('Título', { exact: true })
    .fill('Projeto de teste');
  await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
  await expect(page.getByRole('status')).toContainText('Alterações salvas');
  await page.getByRole('button', { name: /Rascunhos/ }).click();
  await expect(
    page.getByRole('button', {
      name: 'Publicar Projeto de teste',
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Editar Projeto de teste', exact: true }),
  ).toBeVisible();
  backend.failWrites = true;
  await page
    .getByRole('button', { name: 'Publicar Projeto de teste', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível salvar',
  );
  backend.failWrites = false;
  await page
    .getByRole('button', { name: 'Publicar Projeto de teste', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Alterações salvas');
  await page
    .getByRole('button', { name: 'Excluir Projeto de teste', exact: true })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Excluir conteúdo', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Editar Projeto de teste', exact: true }),
  ).toHaveCount(0);
});
test('erro de carregamento bloqueia edição e permite tentar novamente', async ({
  page,
}) => {
  const backend = await mockSupabase(page, { signedIn: true });
  backend.failReads = true;
  await page.goto('/admin');
  await expect(page.getByText('Os conteúdos não carregaram')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Adicionar projeto', exact: true }),
  ).toBeDisabled();
  backend.failReads = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(
    page.getByRole('button', { name: 'Editar Capture the Flag', exact: true }),
  ).toBeVisible();
});
test('login e painel funcionam no celular sem overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await mockSupabase(page);
  await page.goto('/admin');
  await page.screenshot({
    path: '.artifacts/admin-login-mobile.png',
    fullPage: true,
  });
  await page
    .getByLabel('E-mail', { exact: true })
    .fill('felipe.admin@lasete.com');
  await page.getByLabel('Senha', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Entrar no painel' }).click();
  await expect(
    page.getByRole('button', { name: 'Editar Capture the Flag', exact: true }),
  ).toBeVisible();
  expect(state.signedIn).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: '.artifacts/admin-mobile.png',
    fullPage: true,
  });
});

test('login de hardware cabe no viewport e mantém erro e controles acessíveis', async ({
  page,
}) => {
  await mockSupabase(page);
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { name: 'Entrar na LASETE' }),
  ).toBeVisible();
  await page
    .locator('.access-hardware')
    .evaluate(async (image: HTMLImageElement) => {
      await image.decode();
    });
  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [1280, 720],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [375, 667],
    [320, 568],
  ]) {
    await page.setViewportSize({ width, height });
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
    if (width === 1440 || width === 390)
      await page.screenshot({
        path: `.artifacts/admin-login-hardware-${width}.png`,
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 375, height: 667 });
  await page
    .getByLabel('E-mail', { exact: true })
    .fill('felipe.admin@lasete.com');
  await page.getByLabel('Senha', { exact: true }).fill('wrong-password');
  await page.getByLabel('Senha', { exact: true }).press('Enter');
  await expect(page.getByRole('alert')).toContainText(
    'E-mail ou senha incorretos',
  );
  await expect(
    page.getByRole('button', { name: 'Entrar no painel' }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
  await expect(
    page.getByRole('link', {
      name: /criar conta|sign up|google|facebook|app store|google play/i,
    }),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 667, height: 375 });
  await page
    .getByRole('button', { name: 'Entrar no painel' })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('button', { name: 'Entrar no painel' }),
  ).toBeInViewport();
});

test('membros têm filtros, hierarquia estável e preservam a seção ao voltar', async ({
  page,
}) => {
  test.setTimeout(90000);
  const backend = await mockSupabase(page, { signedIn: true });
  backend.tables.members.reverse();
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Membros/ }).click();
  const rows = page.locator('.admin-table tbody tr');
  await expect(rows).toHaveCount(17);
  await expect(rows.nth(0)).toContainText('Luiz Felipe Cerqueira Guimarães');
  await expect(rows.nth(1)).toContainText('Pedro Henrique Serra Brasil');
  await page.getByRole('tab', { name: 'Diretoria', exact: true }).click();
  await expect(rows).toHaveCount(7);
  await page
    .getByRole('button', {
      name: 'Editar Luiza Belfort Conceição dos Santos',
      exact: true,
    })
    .click();
  const memberDialog = page.getByRole('dialog');
  await memberDialog
    .getByRole('combobox', { name: /^Área/ })
    .selectOption('Financeiro');
  await memberDialog
    .getByRole('combobox', { name: /^Forma gramatical do cargo/ })
    .selectOption('masculine');
  await expect(memberDialog.locator('.member-role-preview')).toContainText(
    'Diretor Financeiro',
  );
  await memberDialog
    .getByRole('combobox', { name: /^Forma gramatical do cargo/ })
    .selectOption('feminine');
  await expect(memberDialog.locator('.member-role-preview')).toContainText(
    'Diretora Financeira',
  );
  await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
  await expect(page.getByRole('status')).toContainText('Alterações salvas');
  await expect(rows.nth(0)).toContainText('Luiz Felipe');
  await expect(rows.nth(1)).toContainText('Pedro Henrique');
  await page
    .getByRole('button', {
      name: 'Editar Luiza Belfort Conceição dos Santos',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('dialog').getByRole('combobox', { name: /^Área/ }),
  ).toHaveValue('Financeiro');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'Membros', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('tab', { name: 'Diretoria', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(rows.nth(0)).toContainText('Luiz Felipe');
  await expect(rows.nth(1)).toContainText('Pedro Henrique');
  await page.getByRole('tab', { name: 'Ligantes', exact: true }).click();
  await expect(
    page.getByRole('tab', { name: 'Ligantes', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(rows).toHaveCount(7);
  await page.getByRole('textbox', { name: 'Buscar conteúdo' }).fill('Daniel');
  await expect(rows).toHaveCount(1);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'Membros', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('tab', { name: 'Ligantes', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.getByRole('textbox', { name: 'Buscar conteúdo' }),
  ).toHaveValue('Daniel');
  await expect(rows).toHaveCount(1);
});

test('autoria de pesquisa é salva e aparece no cartão público', async ({
  page,
}) => {
  const backend = await mockSupabase(page, { signedIn: true });
  await page.goto('/admin');
  await page.getByRole('button', { name: /^Pesquisas/ }).click();
  await page
    .getByRole('button', { name: 'Adicionar pesquisa', exact: true })
    .click();
  const researchDialog = page.getByRole('dialog');
  await researchDialog
    .getByRole('textbox', { name: /^Autor\(es\)/ })
    .fill('Equipe de Pesquisa LASETE');
  await researchDialog
    .getByLabel('Título', { exact: true })
    .fill('Pesquisa com autoria');
  await researchDialog.getByLabel('Publicado no site').check();
  await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
  await expect(page.getByRole('status')).toContainText('Alterações salvas');
  expect(
    backend.tables.researches.some(
      (item) =>
        item.title === 'Pesquisa com autoria' &&
        item.author === 'Equipe de Pesquisa LASETE',
    ),
  ).toBe(true);
  await page.goto('/pesquisas');
  const researchCard = page
    .locator('.content-card')
    .filter({ hasText: 'Pesquisa com autoria' });
  await expect(researchCard).toContainText('Por Equipe de Pesquisa LASETE');
});

test('evento de sessão da mesma conta não desmonta o editor ao voltar à aba', async ({
  page,
}) => {
  const backend = await mockSupabase(page, { signedIn: true });
  await page.goto('/admin');
  await page.getByRole('button', { name: /^Membros/ }).click();
  await page
    .getByRole('button', {
      name: 'Editar Pedro Henrique Serra Brasil',
      exact: true,
    })
    .click();
  await page
    .getByRole('dialog')
    .getByLabel('Nome completo', { exact: true })
    .fill('Pedro — edição em andamento');
  const checksBefore = backend.adminChecks;
  await page.evaluate(async () => {
    const key = 'sb-gfbaidcldacxspesqdjy-auth-token';
    const channel = new BroadcastChannel(key);
    channel.postMessage({
      event: 'SIGNED_IN',
      session: JSON.parse(localStorage.getItem(key)!),
    });
    channel.close();
  });
  await expect(
    page.getByRole('dialog').getByLabel('Nome completo', { exact: true }),
  ).toHaveValue('Pedro — edição em andamento');
  await expect.poll(() => backend.adminChecks).toBeGreaterThan(checksBefore);
  await expect(
    page.getByRole('dialog').getByLabel('Nome completo', { exact: true }),
  ).toHaveValue('Pedro — edição em andamento');
  await expect(page.getByText('Conferindo seu acesso.')).toHaveCount(0);
});

test('área Projetos gera o cargo e ordena a diretoria entre Extensão e Financeiro', async ({
  page,
}) => {
  test.setTimeout(90000);
  const backend = await mockSupabase(page, { signedIn: true });
  const teaching = backend.tables.members.find(
    (member) => member.role === 'Diretor de Ensino',
  )!;
  Object.assign(teaching, {
    role: 'Diretor Financeiro',
    subtitle: 'Diretor Financeiro',
    area: 'Financeiro',
    category: 'Financeiro',
  });
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^Membros/ }).click();
  await page
    .getByRole('button', {
      name: 'Editar Luiza Belfort Conceição dos Santos',
      exact: true,
    })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: /^Área/ }).selectOption('Projetos');
  await dialog
    .getByRole('combobox', { name: /^Forma gramatical do cargo/ })
    .selectOption('masculine');
  await expect(dialog.locator('.member-role-preview')).toContainText(
    'Diretor de Projetos',
  );
  await dialog
    .getByRole('combobox', { name: /^Forma gramatical do cargo/ })
    .selectOption('feminine');
  await expect(dialog.locator('.member-role-preview')).toContainText(
    'Diretora de Projetos',
  );
  await page.getByRole('button', { name: 'Salvar conteúdo' }).click();
  await expect(page.getByRole('status')).toContainText('Alterações salvas');
  await page.goto('/membros', { waitUntil: 'domcontentloaded' });
  await page.getByRole('tab', { name: 'Diretoria', exact: true }).click();
  const roles = await page
    .locator('.member-card')
    .evaluateAll((cards) => cards.map((card) => card.textContent ?? ''));
  const at = (role: string) => roles.findIndex((text) => text.includes(role));
  expect(at('Diretora de Projetos')).toBeGreaterThan(-1);
  expect(at('Diretor de Extensão')).toBeLessThan(at('Diretora de Projetos'));
  expect(at('Diretora de Projetos')).toBeLessThan(at('Diretor Financeiro'));
});

// Dispara drop ou paste sobre o seletor com um arquivo sintético (ou só texto, sem arquivo).
async function sendToEditor(
  page: Page,
  selector: string,
  kind: 'drop' | 'paste',
  file?: { name: string; type: string },
) {
  await page.evaluate(
    ({ selector, kind, file }) => {
      const data = new DataTransfer();
      if (file)
        data.items.add(
          new File([new Uint8Array([1, 2, 3])], file.name, { type: file.type }),
        );
      else data.setData('text/plain', 'texto colado');
      const init = { bubbles: true, cancelable: true };
      document
        .querySelector(selector)!
        .dispatchEvent(
          kind === 'drop'
            ? new DragEvent('drop', { ...init, dataTransfer: data })
            : new ClipboardEvent('paste', { ...init, clipboardData: data }),
        );
    },
    { selector, kind, file },
  );
}
async function openProjectEditor(page: Page) {
  await mockSupabase(page, { signedIn: true });
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('button', { name: 'Editar Capture the Flag', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
}
test('imagem pode ser solta ou colada no editor', async ({ page }) => {
  await openProjectEditor(page);
  const preview = page.locator('.upload-preview');
  await sendToEditor(page, '.image-upload-field', 'drop', {
    name: 'a.png',
    type: 'image/png',
  });
  await expect(preview).toHaveAttribute('src', /lasete-images.*\.png$/);
  await sendToEditor(page, '.editor-form', 'paste', {
    name: 'b.webp',
    type: 'image/webp',
  });
  await expect(preview).toHaveAttribute('src', /lasete-images.*\.webp$/);
  await expect(page.locator('.image-upload-field small')).toContainText(
    'Arraste, cole (Ctrl+V) ou escolha um arquivo',
  );
});
test('arquivo inválido ou texto colado não iniciam envio', async ({ page }) => {
  await openProjectEditor(page);
  const dialog = page.getByRole('dialog');
  const before = (await page.locator('.upload-preview').count())
    ? await page.locator('.upload-preview').getAttribute('src')
    : null;
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/storage/v1/object/')) uploads.push(request.url());
  });
  const url = page.url();
  await sendToEditor(page, '.image-upload-field', 'drop', {
    name: 'a.pdf',
    type: 'application/pdf',
  });
  await expect(dialog).toContainText('Escolha uma imagem JPG, PNG ou WebP.');
  const title = dialog.getByLabel('Título', { exact: true });
  await title.fill('abc');
  await sendToEditor(page, '.editor-form', 'paste');
  await expect(title).toHaveValue('abc');
  await expect(dialog).not.toContainText('Enviando imagem');
  // Soltar fora da área não pode fazer o navegador abrir o arquivo.
  const allowed = await page.evaluate(() => {
    const data = new DataTransfer();
    data.items.add(new File([new Uint8Array([1])], 'c.png', { type: 'image/png' }));
    return document
      .querySelector('.editor-form')!
      .dispatchEvent(
        new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: data }),
      );
  });
  expect(allowed).toBe(false);
  expect(page.url()).toBe(url);
  expect(uploads).toHaveLength(0);
  if (before)
    await expect(page.locator('.upload-preview')).toHaveAttribute('src', before);
  else await expect(page.locator('.upload-preview')).toHaveCount(0);
});
