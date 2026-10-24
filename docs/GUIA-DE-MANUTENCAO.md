# Guia prático de manutenção da LASETE

Este guia é um mapa rápido do código atual. Para atualizar conteúdo que já aparece no site, comece pelo painel em `/admin`. Para mudar o comportamento ou a estrutura, use os arquivos indicados abaixo.

## Quero mudar algo: onde vou?

| O que você quer mudar                                                     | Onde procurar                                                                             |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Ordem dos filtros de membros                                              | `src/lib/member-order.ts`, na lista `memberGroups`                                        |
| Ordem dos cartões de pessoas por cargo                                    | `src/lib/member-order.ts`, na função `orderMembers`                                       |
| Filtro que aparece selecionado ao abrir Membros                           | `src/pages/Membros.tsx`, em `useState('Diretoria')` dentro de `Membros`                   |
| Dados reais de pessoas, projetos, pesquisas, atividades, notícias e mídia | Painel `/admin`                                                                           |
| Campo de autoria das pesquisas no Admin e nos cartões públicos            | `src/pages/Admin.tsx`, `src/lib/content-api.ts` e `src/components/Shared.tsx`             |
| Opções de cargo, forma gramatical e área dos membros                      | `src/pages/Admin.tsx`; opções e regras do formulário ficam junto ao editor                |
| Texto fixo de uma página                                                  | `src/pages/Home.tsx` ou no arquivo da página correspondente                               |
| Ordem e nomes da navegação principal                                      | `src/lib/content.tsx`, na lista `navItems`                                                |
| Endereços das páginas                                                     | `src/App.tsx`                                                                             |
| Contato, redes sociais, edital, formulário e aviso do seletivo            | Painel `/admin`; a tela correspondente fica em `src/pages/Participar.tsx`                 |
| Cores, tipografia, espaçamento e estilos gerais                           | `src/styles.css`                                                                          |
| Cabeçalho, rodapé, menu e Matrix das páginas                              | `src/components/Layout.tsx`                                                               |
| Cubo ASCII da Home e interação com o mouse                                | `src/components/Hero.tsx` e `src/components/HeroScene.tsx`                                |
| Volume ASCII da página 404                                                | `src/pages/NotFound.tsx`, `src/components/Ascii404.tsx` e `src/components/ErrorScene.tsx` |
| Efeitos de rolagem e preferência por movimento reduzido                   | `src/lib/motion.ts`, `src/lib/preferences.ts` e os componentes que os usam                |
| Componentes básicos de botão, abas e diálogo                              | `src/components/ui/`                                                                      |
| Configuração de login e autorização de administradores                    | `src/lib/auth.tsx`, `src/pages/AdminAccess.tsx` e tabela `lasete_admins` no Supabase      |
| Conexão entre o site e as tabelas do Supabase                             | `src/lib/supabase.ts` e `src/lib/content-api.ts`                                          |
| Estrutura e dados iniciais do banco                                       | `docs/supabase-setup.sql`                                                                 |
| Rota direta na Vercel e página 404                                        | `vercel.json` e `src/App.tsx`                                                             |
| Testes de navegação e painel                                              | `tests/`                                                                                  |

## Cada página em seu próprio arquivo

`src/App.tsx` associa cada endereço ao componente da página. As páginas carregam seus arquivos separadamente.

| Endereço              | Arquivo                    |
| --------------------- | -------------------------- |
| `/`                   | `src/pages/Home.tsx`       |
| `/a-liga`             | `src/pages/Liga.tsx`       |
| `/membros`            | `src/pages/Membros.tsx`    |
| `/projetos`           | `src/pages/Projetos.tsx`   |
| `/pesquisas`          | `src/pages/Pesquisas.tsx`  |
| `/atividades`         | `src/pages/Atividades.tsx` |
| `/participar`         | `src/pages/Participar.tsx` |
| `/admin`              | `src/pages/Admin.tsx`      |
| endereço desconhecido | `src/pages/NotFound.tsx`   |

Os arquivos das páginas cuidam do conteúdo e da composição daquela tela. Peças reutilizadas, como cabeçalho, cartões e abas, continuam em `src/components/`; a lógica de dados e acesso permanece em `src/lib/`.

## O caso dos filtros de membros

A ordem dos botões agora vem de um único lugar: `memberGroups`, em `src/lib/member-order.ts`. A página pública e o painel administrativo usam essa lista. A ordem atual é:

1. Todos
2. Ligantes
3. Diretoria
4. Orientadores

Para mudar depois, reorganize os textos dentro de `memberGroups`. Não precisa manter uma segunda lista de filtros em cada tela.

Essa ordem controla os **botões**. Ela não muda a ordem dos cartões de pessoas. A função `orderMembers`, no mesmo arquivo, mantém a hierarquia dos cargos da diretoria e depois organiza os demais grupos. Os registros de mesmo nível preservam a ordem recebida do banco.

Ao abrir a página, o filtro selecionado continua sendo Diretoria. Essa escolha é separada da posição dos botões e fica em `useState('Diretoria')`, no componente `Membros` de `src/pages/Membros.tsx`. Se quiser que a página abra mostrando todo mundo, mude esse valor para `'Todos'`.

## Como as pastas se relacionam

A aplicação foi separada por responsabilidade: as páginas montam cada rota, os componentes entregam partes visuais reutilizáveis ou interações específicas, e `lib` concentra dados, acesso ao banco, autenticação e funções de apoio.

```text
src/main.tsx
└── src/App.tsx
    ├── provedores de sessão e conteúdo (src/lib/)
    ├── /admin → AdminAccess → Admin
    └── páginas públicas → Layout → um arquivo para cada página

src/lib/content.tsx
└── src/lib/content-api.ts
    └── src/lib/supabase.ts → Supabase
```

A pasta `components` ainda reúne componentes compartilhados, módulos visuais maiores e peças específicas de uma experiência; só os controles básicos ficam agrupados em `components/ui`. Para encontrar uma página, agora cada rota pública tem seu próprio arquivo em `src/pages/`. Essa divisão deixa mais claro onde editar o conteúdo de cada tela.

| Pasta ou arquivo     | O que contém                                                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/`         | Um arquivo por tela: `Home.tsx`, `Liga.tsx`, `Membros.tsx`, `Projetos.tsx`, `Pesquisas.tsx`, `Atividades.tsx` e `Participar.tsx`. `Admin.tsx` é o painel e `NotFound.tsx` é o 404.                                                                 |
| `src/components/`    | Peças visuais do site. `Layout.tsx` monta cabeçalho, rodapé e estrutura pública; `Shared.tsx` reúne elementos compartilhados; `HeroScene.tsx`, `Matrix.tsx` e `ErrorScene.tsx` implementam efeitos; `Projects.tsx` monta a exploração de projetos. |
| `src/components/ui/` | Controles pequenos e reutilizáveis, como botão, abas e diálogo. São a base visual de várias telas, não páginas completas.                                                                                                                          |
| `src/lib/`           | Lógica que não é uma tela: conteúdo e estado, chamadas ao Supabase, login, animações, preferências, validação de URLs e ordem dos membros.                                                                                                         |
| `src/styles.css`     | Estilos e variáveis visuais globais, incluindo as cores da marca.                                                                                                                                                                                  |
| `public/images/`     | Imagens servidas diretamente pelo site em endereços como `/images/logo.webp`.                                                                                                                                                                      |
| `src/images/`        | Arquivos de origem e materiais guardados no projeto. Para imagens públicas do site, use `public/images/` ou envie pelo painel.                                                                                                                     |
| `docs/`              | Este guia, descoberta e requisitos do produto, instruções SQL e documentação de arte.                                                                                                                                                              |
| `tests/`             | Testes automatizados de navegação, interface mobile e painel administrativo.                                                                                                                                                                       |

### O caminho de uma página

`src/App.tsx` decide qual tela abrir para cada endereço. Nas rotas públicas, `Layout.tsx` acrescenta a navegação e o rodapé e coloca a página dentro da estrutura comum. O painel `/admin` usa o acesso administrativo e não aparece na navegação pública. Endereços sem rota conhecida caem em `NotFound.tsx`.

Cada página pública tem seu próprio arquivo: para editar Membros, abra `src/pages/Membros.tsx`; para Participar e contato, abra `src/pages/Participar.tsx`. `src/App.tsx` liga cada endereço ao arquivo correspondente.

## Conteúdo do site e Supabase

O conteúdo que a diretoria atualiza fica no Supabase. Para mudanças normais, use `/admin`; não altere os dados iniciais no código esperando que isso edite os registros atuais do banco.

| Tipo no painel                | Tabela no Supabase                             |
| ----------------------------- | ---------------------------------------------- |
| Membros                       | `members`                                      |
| Projetos                      | `projects`                                     |
| Pesquisas                     | `researches`                                   |
| Atividades                    | `activities`                                   |
| Ensino                        | `activities` (categoria iniciada por “Ensino”) |
| LASETE na mídia               | `media`                                        |
| Comunicados                   | `notices`                                      |
| Contato e seletivo            | `site_settings`                                |
| Permissões de administradores | `lasete_admins`                                |

No painel, **Ensino** aparece como uma seção própria para facilitar a gestão. Seus registros continuam na tabela `activities`; a categoria “Ensino” os separa das demais atividades e os exibe na aba Ensino do site público.

`src/lib/content.tsx` define os tipos de conteúdo, os dados iniciais de referência e o estado compartilhado usado pelas páginas. `content-api.ts` traduz os registros do banco para o formato usado no React. `supabase.ts` cria o cliente quando as variáveis de ambiente estão presentes. O SQL inicial e as políticas de acesso ficam em `docs/supabase-setup.sql`.

O login é feito pelo Supabase Auth. Uma conta só abre o painel se estiver autorizada em `lasete_admins`; as políticas RLS do banco também limitam quem pode ler rascunhos, editar conteúdo e enviar imagens. Não há cadastro público de administradores.

### Adicionar ou editar uma pesquisa

No painel, abra **Pesquisas → Adicionar pesquisa**. O campo **Autor(es)** fica antes do título e é opcional para permitir registros cuja autoria ainda não foi informada. Quando preenchido, aparece como “Por [autor]” no cartão público. Para alterar sua posição ou o texto do campo, procure o formulário em **src/pages/Admin.tsx**; o tipo de conteúdo está em **src/lib/content.tsx**, e o mapeamento entre banco e interface está em **src/lib/content-api.ts**.

A tabela researches precisa ter a coluna author. O SQL de instalação já inclui essa alteração, mas, como o banco existente foi criado anteriormente, execute uma vez no SQL Editor do Supabase:

    alter table public.researches
      add column if not exists author text not null default '';

O if not exists permite rodar o comando novamente sem duplicar a coluna. Registros já existentes ficam com autoria vazia; podem ser atualizados pelo painel.

### Adicionar ou editar um membro

Em **Membros → Adicionar membro**, informe o nome e escolha o **Cargo**. As opções são presidente, vice-presidente, secretário-geral, diretor(a) de área, ligante e professor(a) orientador(a). O campo **Área** oferece Pesquisa, Ensino, Extensão, Comunicação e Financeiro para cargos de área; presidência, vice-presidência, secretaria e orientação recebem sua área correspondente automaticamente.

Para cargos com flexão de gênero, escolha a **Forma gramatical do cargo**. Ela serve apenas para montar o texto publicado; o sistema não salva gênero como dado separado. A prévia mostra o cargo final, por exemplo, “Diretora de Comunicação”. A categoria do filtro (**Diretoria**, **Ligantes** ou **Orientadores**) é definida automaticamente pelo cargo escolhido.

As opções e a composição do texto ficam no início de **src/pages/Admin.tsx**, nas funções **memberAreaOptions**, **memberRole** e **memberGroupForCargo**. Para incluir uma nova área ou cargo, atualize essas opções e a regra de composição; não é necessário criar colunas novas no Supabase. A ordenação da diretoria continua em **src/lib/member-order.ts**.

### Imagens

Para conteúdo novo, a diretoria pode enviar a imagem pelo painel. As imagens existentes no site também podem estar em `public/images/`; dentro do conteúdo, o caminho é escrito como `/images/nome-do-arquivo.webp`. Para substituir uma imagem usada por um registro do banco, edite o registro pelo painel. Evite renomear um arquivo sem atualizar todas as referências.

### Variáveis e chaves

O frontend lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. O modelo está em `.env.example`; para desenvolvimento local, use um arquivo `.env.local`, que é ignorado pelo Git. A Vercel precisa das mesmas variáveis no ambiente do projeto e de um novo deploy para incluí-las.

A chave publishable pode aparecer no frontend; as permissões dependem das políticas RLS. Nunca coloque uma chave secreta ou `service_role` em uma variável `VITE_...`, no código ou neste guia.

## Rodar e publicar

Na raiz do projeto:

```sh
npm install
npm run dev
```

Abra o endereço que o Vite mostrar; a porta configurada para este projeto é 5180. Para gerar a versão de produção, use `npm run build`. Os testes de navegador rodam com `npm run test:e2e`; eles usam uma simulação local do Supabase, não escrevem no banco remoto.

Na Vercel, o projeto usa Vite, o comando `npm run build` e a pasta `dist`. `vercel.json` encaminha endereços como `/membros` e `/admin` para a aplicação React, permitindo abrir essas rotas diretamente. Depois de mudar variáveis de ambiente, faça um novo deploy.

## Documentos relacionados

- [Contexto do produto](../PRODUCT.md): objetivo, usuários e escopo.
- [Direção visual](../DESIGN.md): decisões de aparência e movimento.
- [Descoberta do projeto](01-project-discovery.md): informações de origem.
- [Requisitos](02-requirements.md): comportamentos previstos.
- [Instalação do Supabase](supabase-setup.sql): tabelas, regras, dados iniciais e armazenamento.
- [Autorização de administradores de teste](authorize-test-admins.sql): SQL auxiliar para contas já criadas no Supabase Auth.
