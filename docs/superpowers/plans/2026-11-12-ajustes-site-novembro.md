# Ajustes do site (novembro/2026) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar os sete ajustes aprovados no site da LASETE: botão da hero, "Temas" na Home, busca em Pesquisas, rodapé enxuto, divisória dos projetos, área "Projetos" e envio de imagem por arrastar/colar no admin.

**Architecture:** SPA React + Vite com CSS único em `src/styles.css`. Cada ajuste é local a uma página ou componente; as únicas peças novas são `ResearchFields` (componente extraído) e `research-search` (função pura). Nenhuma mudança de banco.

**Tech Stack:** React 19, React Router 7, TypeScript, GSAP, lucide-react, Supabase JS, Playwright (único runner de testes; o conteúdo é simulado por `tests/supabase-fixture.ts` com `tests/fixtures/content.json`).

**Spec:** `docs/superpowers/specs/2026-11-12-ajustes-site-novembro-design.md`

## Global Constraints

- Branch `feat/ajustes-site-novembro`. Commits pequenos com prefixo do README (`feat:`, `style:`, `test:`, `docs:`).
- O site se chama "LASETE" em todo texto visível (o checklist diz "LA7" por transcrição).
- Estilos novos entram em `src/styles.css`, perto das regras que alteram; nada de CSS-in-JS nem arquivos de estilo novos.
- Toda animação nova respeita `prefers-reduced-motion: reduce`.
- Alvos de toque com no mínimo 44px.
- Testes da Home abrem a página com o helper `openHome(page)` de `tests/site.spec.ts`, que pula a abertura L7.
- Rodar um teste: `npx playwright test -g "<nome>"`. Checagem de tipos: `npx tsc --noEmit`.
- `tests/admin.spec.ts:57` e `tests/site.spec.ts:350` já falham antes deste trabalho; não corrigir aqui e não contar como regressão.
- Fora de escopo: seção "Seletivo fechado", "LASETE na mídia", "Estudos e materiais / LASETE AI" e altura da hero.

## Review Focus

1. Busca com espaços nas pontas ou só espaços: deve se comportar como busca vazia e mostrar tudo (Task 3).
2. Busca com caracteres de regex (`(`, `*`, `?`): não pode quebrar a página; é comparação de texto simples (Task 3).
3. Ctrl+V com texto dentro de um campo do editor: o texto é colado normalmente e nenhum envio começa (Task 7).
4. Soltar um arquivo que não é imagem (PDF) ou soltar fora da área: mostra o erro de formato existente e o navegador não navega para o arquivo (Task 7).
5. Projeto publicado com id diferente de `ctf`/`lasete-ai`, ou só um projeto publicado: a divisória não pode esconder texto nem deixar um card recortado sozinho (Task 5).

---

### Task 1: Botão "Explore a LASETE" em pílula

**Files:**
- Modify: `src/components/Hero.tsx` (link `.hero-scroll`)
- Modify: `src/styles.css` (`.hero-scroll`, `.scroll-mark`, `@keyframes scroll-signal`, bloco `@media (max-width: 700px) .hero-scroll`, bloco `prefers-reduced-motion`)
- Test: `tests/site.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
test('botão da hero é uma pílula legível que leva à apresentação', async ({ page }) => {
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
```

- [ ] **Step 2: Rodar e ver falhar** — `npx playwright test -g "botão da hero é uma pílula"`; falha em `font-size`.

- [ ] **Step 3: Implementar**

Em `Hero.tsx`, trocar o `<span className="scroll-mark">` pelo ícone `ArrowDown` do lucide-react (`size={16}`, `aria-hidden`), depois do texto. Em `styles.css`, `.hero-scroll` passa a ter: `border: 1px solid rgba(255,255,255,0.28)`, `border-radius: 999px`, `background: rgba(10,10,10,0.72)`, `backdrop-filter: blur(6px)`, `padding: 0 20px`, `min-height: 44px`, `color: #fff`, `font-size: 14px`, `gap: 10px`; hover clareia a borda para `rgba(255,255,255,0.6)`. A seta usa uma animação `hero-cue` (desce 3px e volta, 1,8s, infinita), desligada em `prefers-reduced-motion`. Remover `.scroll-mark`, `.scroll-mark > span` e `@keyframes scroll-signal` se não tiverem outro uso (`grep -n "scroll-mark\|scroll-signal" src`). Posição (`bottom: 24px`, `20px` até 700px) não muda.

- [ ] **Step 4: Rodar e ver passar** — o teste novo e `npx playwright test -g "abertura L7|Matrix preserva"` (usam o mesmo link).

- [ ] **Step 5: Commit** — `style: destaca o botão de rolagem da hero`

---

### Task 2: "Temas que dialogam com a liga" na Home

**Files:**
- Create: `src/components/ResearchFields.tsx`
- Modify: `src/pages/Home.tsx` (entre `</section>` de `home-intro` e `<NetworkInterlude />`)
- Modify: `src/pages/Pesquisas.tsx` (remover a `<section className="... research-fields">`)
- Modify: `src/styles.css` (apenas se o espaçamento precisar de ajuste)
- Test: `tests/site.spec.ts`

**Interfaces:**
- Produces: `export function ResearchFields(): JSX.Element` — a seção inteira (`<section className="shell section-space research-fields">`), sem props, com o mesmo markup e textos que hoje estão em `Pesquisas.tsx`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
test('temas da liga ficam na Home, depois dos pilares, e saem de Pesquisas', async ({ page }) => {
  await openHome(page);
  const fields = page.locator('.research-fields');
  await expect(fields.getByText('Temas que dialogam com a liga')).toBeVisible();
  await expect(fields.locator('.research-field')).toHaveCount(4);
  const order = await page.evaluate(() =>
    [...document.querySelector('.home-page')!.children].map((el) => el.className),
  );
  const at = (name: string) => order.findIndex((c) => c.includes(name));
  expect(at('home-intro')).toBeLessThan(at('research-fields'));
  expect(at('research-fields')).toBeLessThan(at('network-interlude'));
  await page.goto('/pesquisas');
  await expect(page.getByRole('heading', { name: 'Investigações e aprendizados da liga.' })).toBeVisible();
  await expect(page.locator('.research-fields')).toHaveCount(0);
});
```

- [ ] **Step 2: Rodar e ver falhar** — `npx playwright test -g "temas da liga ficam na Home"`.

- [ ] **Step 3: Implementar** — mover o JSX para `ResearchFields`, usar na Home, remover de Pesquisas (e o import de `SectionHeading` lá só se sobrar sem uso). Conferir visualmente em 1440px e 390px que a seção não cola nos pilares nem no vórtice e que o fim de Pesquisas mantém respiro antes do rodapé; ajustar `padding-block` só se necessário.

- [ ] **Step 4: Rodar e ver passar** — o teste novo, mais `npx tsc --noEmit`.

- [ ] **Step 5: Commit** — `feat: leva os temas da liga para a Home`

---

### Task 3: Busca em Pesquisas

**Files:**
- Create: `src/lib/research-search.ts`
- Modify: `src/pages/Pesquisas.tsx`
- Modify: `src/styles.css` (novo bloco `.research-search` junto das regras `.research-page`)
- Test: `tests/site.spec.ts`

**Interfaces:**
- Produces: `export function matchesResearch(item: ContentItem, query: string): boolean` — normaliza (NFD sem diacríticos, minúsculas, `trim`) a consulta e o texto `title + subtitle + author + category`; divide a consulta por espaços; retorna `true` se todas as palavras aparecem no texto (via `includes`, nunca `RegExp`). Consulta vazia ou só espaços retorna `true`.

- [ ] **Step 1: Escrever os testes que falham**

Os dados vêm de `tests/fixtures/content.json` (três pesquisas: "Privacidade e proteção de dados" / `Material educativo · Privacidade`, "Machine Learning e Visão Computacional" / `Material de estudo · IA`, "Como funciona um Capture the Flag?" / `Material educativo · Segurança`). Para o caso de autor, definir `author` de uma delas antes do `goto` pelo objeto retornado por `mockSupabase` (mesmo padrão de `backend.tables` em `tests/admin.spec.ts`).

```ts
test('busca de pesquisas filtra por título, tema, autor e ignora acentos', async ({ page }) => {
  await page.goto('/pesquisas');
  const search = page.getByRole('searchbox', { name: 'Buscar pesquisas' });
  const cards = page.locator('.research-results .content-card');
  await expect(cards).toHaveCount(3);
  await search.fill('visao computacional');           // título, sem acento
  await expect(cards).toHaveCount(1);
  await search.fill('SEGURANÇA');                      // tema, maiúsculas
  await expect(cards).toHaveCount(1);
  await search.fill('material educativo');             // tipo/tag
  await expect(cards).toHaveCount(2);
  await search.fill('educativo privacidade');          // todas as palavras
  await expect(cards).toHaveCount(1);
  await search.fill('   ');                            // só espaços
  await expect(cards).toHaveCount(3);
  await search.fill('(.*?');                           // caracteres de regex
  await expect(page.getByText('Nenhuma pesquisa encontrada')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('0 pesquisas');
  await page.getByRole('button', { name: 'Limpar busca' }).click();
  await expect(cards).toHaveCount(3);
  await expect(search).toHaveValue('');
});
```

Acrescentar ao mesmo arquivo um teste `busca de pesquisas encontra pelo autor` que injeta `author: 'Maria Souza'` numa pesquisa, busca `maria` e espera 1 card.

- [ ] **Step 2: Rodar e ver falhar** — `npx playwright test -g "busca de pesquisas"`.

- [ ] **Step 3: Implementar `matchesResearch`** em `src/lib/research-search.ts` conforme a interface.

- [ ] **Step 4: Implementar a página**

Em `Pesquisas.tsx`: estado `query`; lista `items.filter((i) => matchesResearch(i, query))`. O `SectionHeading` do bloco de resultados é substituído por um cabeçalho local com a mesma classe `section-heading` (rótulo e `h2` iguais) e, à direita, `<label className="research-search">` com ícone `Search` e `<input type="search" aria-label="Buscar pesquisas" placeholder="Buscar por título, tema ou autor">`. Abaixo, `<p role="status" className="sr-only">` com `"{n} pesquisas"` (singular `1 pesquisa`). Sem resultado: bloco com "Nenhuma pesquisa encontrada" e `<button>Limpar busca</button>` que zera `query`. Com `items.length === 0`, mantém o `EmptyState` e não renderiza o campo. Os cards filtrados não podem ficar invisíveis por causa de `data-reveal`: se o reveal só roda na troca de rota, os cards da lista filtrada recebem `key` estável por `item.id` (já é assim) e o teste do Step 1 confirma visibilidade com `toBeVisible()` no primeiro card após filtrar — adicionar essa asserção.

CSS: `.research-search` com largura `min(320px, 100%)`, altura 44px, fundo `#171717`, borda `1px solid #292929`, raio 8px, foco visível; até 700px, largura 100% e o cabeçalho empilha.

- [ ] **Step 5: Rodar e ver passar** — testes da busca e `npx tsc --noEmit`.

- [ ] **Step 6: Commit** — `feat: adiciona busca na página de pesquisas`

---

### Task 4: Rodapé enxuto

**Files:**
- Modify: `src/components/Layout.tsx:125-188` (componente do rodapé)
- Modify: `src/styles.css` (`.footer-top`, `.footer-identity`, `.footer-top > nav*`, `.footer-bottom` e os overrides em ~2466, ~2669, ~3212)
- Test: `tests/site.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
test('rodapé traz identidade, contato e copyright, sem links de páginas', async ({ page }) => {
  await page.goto('/a-liga');
  const footer = page.locator('.site-footer');
  await expect(footer.getByRole('navigation')).toHaveCount(0);
  await expect(footer.getByText('Liga Acadêmica de Segurança e Tecnologias Emergentes')).toBeVisible();
  await expect(footer.getByText('São Luís, Maranhão')).toBeVisible();
  await expect(footer.getByRole('link', { name: 'lasete.undb@gmail.com' }))
    .toHaveAttribute('href', 'mailto:lasete.undb@gmail.com');
  await expect(footer.getByRole('link', { name: 'Instagram da LASETE' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'LinkedIn da LASETE' })).toBeVisible();
  await expect(footer.getByRole('button', { name: 'Voltar ao topo' })).toBeVisible();
  await expect(footer.getByText('Ensino, pesquisa e extensão.')).toHaveCount(0);
  const copy = footer.getByText(`© ${new Date().getFullYear()} LASETE`);
  await expect(copy).toBeVisible();
  const [box, shell] = [await copy.boundingBox(), await footer.locator('.shell').boundingBox()];
  expect(Math.abs(box!.x + box!.width / 2 - (shell!.x + shell!.width / 2))).toBeLessThan(2);
});
```

(Conferir o e-mail do fixture em `tests/fixtures/content.json` e usar o valor de lá.)

- [ ] **Step 2: Rodar e ver falhar** — `npx playwright test -g "rodapé traz identidade"`.

- [ ] **Step 3: Implementar**

`footer-top` continua com três colunas: `footer-identity` (só o `Link` com `<Brand />`), uma nova `footer-league` central (`<p>` com o nome da liga em uma frase e `<span>São Luís, Maranhão</span>`, texto centralizado, reaproveitando as cores das regras atuais de `.footer-identity > p/span`) e `footer-contact` como está. Remover o `<nav>` e suas regras CSS. `footer-bottom` fica só com o copyright e `justify-content: center`. Até 700px as três partes empilham na ordem logo, liga, contato, alinhadas à esquerda. Remover do `Layout.tsx` imports que ficarem sem uso.

- [ ] **Step 4: Rodar e ver passar** — o teste novo e `npx playwright test tests/site.spec.ts tests/mobile-ui.spec.ts`; corrigir qualquer teste que dependia de link do rodapé trocando para o link equivalente do cabeçalho (`getByRole('navigation', { name: 'Principal' })`).

- [ ] **Step 5: Commit** — `feat: enxuga o rodapé`

---

### Task 5: Divisória rachada dos projetos

**Files:**
- Modify: `src/pages/Home.tsx` (bloco `.home-projects-split`: os dois `<svg className="project-fracture ...">`)
- Modify: `src/styles.css:5212-5330` e o bloco `@media (max-width: 700px)` logo abaixo
- Test: `tests/site.spec.ts`

**Decisões:**
- Um único traçado por orientação, guardado como constante no topo de `Home.tsx`: `FRACTURE_DESKTOP` (pontos em % para `clip-path: polygon()` vertical) e `FRACTURE_MOBILE` (horizontal). 6 a 7 vértices, amplitude de ~28px para cada lado do centro no desktop.
- O grid do bloco ganha uma coluna central de 56px (desktop) / linha central de 56px (celular) que é o território do corte; os cards avançam sobre ela com margem negativa e são recortados por `clip-path`, de modo que o fundo de cada um vai até a borda do corte. O conteúdo dos cards (imagem e texto) fica fora dessa faixa, então nada é recortado.
- O vão entre os recortes mostra o fundo do bloco, `#070a09`, com 6px de largura.
- Os SVGs com `<pattern>` saem. Fica um SVG por orientação com dois `<path>` (um por borda), `fill: none`, `stroke-width: 1.25`, `vector-effect: non-scaling-stroke`: lado CTF `rgba(220,230,232,0.55)`, lado LASETE AI `rgba(156,221,189,0.7)`, cada um com `filter: drop-shadow(0 0 6px <mesma cor a 0.35>)`.
- A divisória só é aplicada quando há exatamente dois projetos na prévia (`projects.slice(0, 2).length === 2`); com um só, o card ocupa o bloco inteiro sem recorte. O segundo card usa a paleta verde quando `data-project='lasete-ai'` (regra atual) e a neutra caso contrário; a cor do filete do lado direito segue a mesma condição.
- Celular: `.home-projects-section .project-preview-image` do LASETE AI mostra a arte inteira (conferir a causa do corte na regra de altura/`object-fit` de `.project-preview-brand` e corrigir ali).

- [ ] **Step 1: Escrever os testes que falham**

```ts
test('divisória dos projetos recorta os cards sem cobrir o conteúdo', async ({ page }) => {
  await openHome(page);
  const split = page.locator('.home-projects-split');
  await split.scrollIntoViewIfNeeded();
  const cards = split.locator('.project-preview');
  await expect(cards).toHaveCount(2);
  for (const card of await cards.all())
    expect(await card.evaluate((el) => getComputedStyle(el).clipPath)).toContain('polygon');
  await expect(split.locator('pattern')).toHaveCount(0);
  await expect(split.locator('.project-fracture-edge')).toHaveCount(2);
  for (const link of await split.getByRole('link', { name: 'Explorar projeto' }).all())
    await link.click({ trial: true });   // visível e não coberto
});
```

Em `tests/mobile-ui.spec.ts`, um teste equivalente em 390×844 que também verifica que a imagem do segundo card não transborda: `scrollHeight <= clientHeight` em `.project-preview-image`. E um teste `divisória some com um único projeto` que deixa só um projeto publicado no backend simulado e espera `clip-path: none` no card.

- [ ] **Step 2: Rodar e ver falhar** — `npx playwright test -g "divisória"`.

- [ ] **Step 3: Implementar** conforme as decisões acima.

- [ ] **Step 4: Conferência visual** — capturar `.home-projects-split` em 1440px e 390px com `deviceScaleFactor: 2` e olhar: sem emenda nos padrões de fundo, filetes contínuos de ponta a ponta, pontas com folga das molduras das imagens, corte do celular sem encostar em "Explorar projeto".

- [ ] **Step 5: Rodar e ver passar** — testes da divisória e `npx tsc --noEmit`.

- [ ] **Step 6: Commit** — `style: refaz a divisória rachada dos projetos`

---

### Task 6: Área "Projetos" para membros

**Files:**
- Modify: `src/pages/Admin.tsx:82-88` (`departmentAreas`)
- Modify: `src/lib/member-order.ts` (`rank`)
- Modify: `docs/GUIA-DE-MANUTENCAO.md:135`
- Test: `tests/admin.spec.ts`

- [ ] **Step 1: Escrever o teste que falha**

No padrão do teste que hoje seleciona "Financeiro" (`tests/admin.spec.ts:225-270`): entrar como admin, abrir Membros, editar "Luiza Belfort Conceição dos Santos", selecionar a área `Projetos`, e esperar em `.member-role-preview` `Diretor de Projetos` (forma `masculine`) e `Diretora de Projetos` (forma `feminine`). Salvar, abrir `/membros` e verificar que, na aba Diretoria, ela aparece depois de quem tem cargo de Extensão e antes de quem tem cargo Financeiro (comparar índices dos nomes nos `.member-card`; se o fixture não tiver os dois vizinhos, ajustar um membro do backend simulado antes do `goto`). Nome: `área Projetos gera o cargo e ordena a diretoria`.

- [ ] **Step 2: Rodar e ver falhar** — `npx playwright test -g "área Projetos"`.

- [ ] **Step 3: Implementar** — `departmentAreas = ['Pesquisa','Ensino','Extensão','Projetos','Comunicação','Financeiro']` mantendo a ordem atual dos demais e inserindo `Projetos` depois de `Extensão`; em `rank`, `/projetos/` retorna 7 e `/financeir/` passa a 8, o resto 9. Atualizar a frase do guia para citar "Projetos".

- [ ] **Step 4: Rodar e ver passar** — o teste novo e o teste existente de membros (`npx playwright test tests/admin.spec.ts -g "membro|Membros|área"`).

- [ ] **Step 5: Commit** — `feat: adiciona a área de Projetos para membros`

---

### Task 7: Imagem por arrastar ou colar no admin

**Files:**
- Modify: `src/pages/Admin.tsx:390-430` (`upload`) e `:1107-1134` (`.image-upload-field`)
- Modify: `src/styles.css` (regras `.image-upload-field`, `.upload-control`; novo estado `.is-dragging`)
- Modify: `docs/GUIA-DE-MANUTENCAO.md` (trecho sobre imagens)
- Test: `tests/admin.spec.ts`

**Interfaces:**
- Produces (interno a `Admin.tsx`): `const uploadImage = async (file: File | undefined) => void` com todo o corpo do `upload` atual (validação de tipo e tamanho, envio, mensagens). `upload(event)` passa a chamar `uploadImage(event.target.files?.[0])` e limpa `event.target.value`.

**Decisões:**
- Soltar: handlers `onDragOver`/`onDragLeave`/`onDrop` no `div.image-upload-field`. `dragover` com arquivos faz `preventDefault()` e liga `is-dragging`; `drop` faz `preventDefault()` e envia o primeiro item de `dataTransfer.files`. Para o navegador nunca abrir um arquivo solto fora da área, o `<form>` do editor também cancela `dragover`/`drop` de arquivos.
- Colar: `onPaste` no `<form>` do editor. Se `clipboardData.files` tiver um arquivo `image/*`, faz `preventDefault()` e envia; caso contrário não faz nada, e o texto cola normalmente.
- Enquanto `uploading` é `true`, novos arquivos são ignorados.
- Texto de ajuda: `JPG, PNG ou WebP · até 5 MB. Arraste, cole (Ctrl+V) ou escolha um arquivo.`
- `.image-upload-field.is-dragging`: borda tracejada clara e fundo levemente mais claro.

- [ ] **Step 1: Escrever os testes que falham**

Helper no topo do arquivo de teste:

```ts
// Dispara drop ou paste com um arquivo sintético sobre o seletor dado.
async function sendFile(page: Page, selector: string, kind: 'drop' | 'paste', name: string, type: string) {
  await page.evaluate(({ selector, kind, name, type }) => {
    const data = new DataTransfer();
    data.items.add(new File([new Uint8Array([1, 2, 3])], name, { type }));
    const target = document.querySelector(selector)!;
    const event = kind === 'drop'
      ? new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true })
      : new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
  }, { selector, kind, name, type });
}
```

Teste `imagem pode ser solta ou colada no editor`: entrar como admin, abrir "Editar Capture the Flag"; `sendFile(..., '.image-upload-field', 'drop', 'a.png', 'image/png')` e esperar `.upload-preview` visível (o fixture responde ao storage com `test/image.webp`); reabrir outro item sem imagem, `sendFile(..., '[role="dialog"] form', 'paste', 'b.webp', 'image/webp')` e esperar `.upload-preview`.

Teste `arquivo inválido ou texto colado não iniciam envio`: `drop` de `a.pdf` (`application/pdf`) mostra `Escolha uma imagem JPG, PNG ou WebP.` e não há `.upload-preview`; em seguida focar o campo de título, `page.keyboard.insertText('abc')` e um `paste` sem arquivos (DataTransfer só com `text/plain`) não mostra "Enviando imagem…" nem altera a mensagem de erro, e o título contém `abc`. Verificar também que a URL da página não mudou após o `drop`.

- [ ] **Step 2: Rodar e ver falhar** — `npx playwright test -g "imagem pode ser solta|arquivo inválido ou texto"`.

- [ ] **Step 3: Implementar** conforme interface e decisões; atualizar o guia de manutenção com uma frase sobre arrastar e colar.

- [ ] **Step 4: Rodar e ver passar** — os dois testes e `npx tsc --noEmit`.

- [ ] **Step 5: Commit** — `feat: aceita imagem arrastada ou colada no admin`

---

### Task 8: Verificação final

- [ ] **Step 1:** `npx tsc --noEmit && npm run build` — sem erros.
- [ ] **Step 2:** `npx playwright test` — só podem falhar `tests/admin.spec.ts:57` e `tests/site.spec.ts:350`.
- [ ] **Step 3:** Percorrer no navegador, em 1440px e 390px: Home (hero, temas, projetos, rodapé), Pesquisas (busca) e Admin (membro com área Projetos, arrastar e colar imagem).
- [ ] **Step 4:** `npx prettier --write` nos arquivos `.ts`/`.tsx`/`.md` alterados (não em `src/styles.css`, que já diverge do formatador) e commit `chore: formata arquivos alterados` se houver diferença.
