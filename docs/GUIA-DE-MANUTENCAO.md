# Guia prático de manutenção da LASETE

Este guia é um mapa rápido do código atual. Para atualizar conteúdo que já aparece no site, comece pelo painel em `/admin`. Para mudar o comportamento ou a estrutura, use os arquivos indicados abaixo.

## Quero mudar algo: onde vou?

| O que você quer mudar                                                     | Onde procurar                                                                                            |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Ordem dos filtros de membros                                              | `src/lib/data/member-order.ts`, na lista `memberGroups`                                                  |
| Ordem dos cartões de pessoas por cargo                                    | `src/lib/data/member-order.ts`, na função `orderMembers`                                                 |
| Filtro que aparece selecionado ao abrir Membros                           | `src/pages/Membros.tsx`, em `useState('Diretoria')` dentro de `Membros`                                  |
| Dados reais de pessoas, projetos, pesquisas, atividades, notícias e mídia | Painel `/admin`                                                                                          |
| Campo de autoria das pesquisas no Admin e nos cartões públicos            | `src/pages/admin/Admin.tsx`, `src/lib/data/content-api.ts` e `src/components/shared/ContentCard.tsx`     |
| Opções de cargo, forma gramatical e área dos membros                      | `src/pages/admin/Admin.tsx`; opções e regras do formulário ficam junto ao editor                         |
| Texto fixo de uma página                                                  | `src/pages/Home.tsx` ou no arquivo da página correspondente                                              |
| Ordem e nomes da navegação principal                                      | `src/components/layout/navigation.ts`: uma lista só com nome e endereço; o menu segue a ordem das linhas |
| Endereços das páginas                                                     | `src/App.tsx`                                                                                            |
| Contato, redes sociais, edital, formulário e aviso do seletivo            | Painel `/admin`; a tela correspondente fica em `src/pages/Participar.tsx`                                |
| Cores, tipografia, espaçamento e estilos gerais                           | `src/styles.css`                                                                                         |
| Cabeçalho (logo, menu e botão LASETE AI)                                  | `src/components/layout/Header.tsx`                                                                       |
| Menu em telas pequenas                                                    | `src/components/layout/MobileMenu.tsx`                                                                   |
| Rodapé                                                                    | `src/components/layout/Footer.tsx`                                                                       |
| Estrutura comum das páginas (rolagem suave e fundo Matrix)                | `src/components/layout/Layout.tsx` e `src/components/effects/Matrix.tsx`                                 |
| Cubo ASCII da Home e interação com o mouse                                | `src/components/hero/Hero.tsx` e `src/components/hero/HeroScene.tsx`                                     |
| Animação de abertura L7 da Home                                           | `src/components/hero/intro-l7.ts`                                                                        |
| Volume ASCII da página 404                                                | `src/pages/NotFound.tsx` e `src/components/not-found/`                                                   |
| Efeitos de rolagem e preferência por movimento reduzido                   | `src/lib/motion.ts`, `src/lib/preferences.ts` e os componentes que os usam                               |
| Componentes básicos de botão, abas e diálogo                              | `src/components/ui/`                                                                                     |
| Configuração de login e autorização de administradores                    | `src/lib/data/auth.tsx`, `src/pages/admin/AdminAccess.tsx` e tabela `lasete_admins` no Supabase          |
| Conexão entre o site e as tabelas do Supabase                             | `src/lib/data/supabase.ts` e `src/lib/data/content-api.ts`                                               |
| Estrutura e dados iniciais do banco                                       | `docs/banco/supabase-setup.sql`                                                                          |
| Rota direta na Vercel e página 404                                        | `vercel.json` e `src/App.tsx`                                                                            |
| Testes de navegação e painel                                              | `tests/`                                                                                                 |

## Cada página em seu próprio arquivo

`src/App.tsx` associa cada endereço ao componente da página. As páginas carregam seus arquivos separadamente.

| Endereço              | Arquivo                     |
| --------------------- | --------------------------- |
| `/`                   | `src/pages/Home.tsx`        |
| `/a-liga`             | `src/pages/Liga.tsx`        |
| `/membros`            | `src/pages/Membros.tsx`     |
| `/projetos`           | `src/pages/Projetos.tsx`    |
| `/pesquisas`          | `src/pages/Pesquisas.tsx`   |
| `/atividades`         | `src/pages/Atividades.tsx`  |
| `/participar`         | `src/pages/Participar.tsx`  |
| `/admin`              | `src/pages/admin/Admin.tsx` |
| endereço desconhecido | `src/pages/NotFound.tsx`    |

Os arquivos das páginas cuidam do conteúdo e da composição daquela tela. Peças reutilizadas, como cabeçalho, cartões e abas, ficam em `src/components/`, separadas em pastas; a lógica de dados e acesso permanece em `src/lib/`.

## O caso dos filtros de membros

A ordem dos botões agora vem de um único lugar: `memberGroups`, em `src/lib/data/member-order.ts`. A página pública e o painel administrativo usam essa lista. A ordem atual é:

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
    ├── provedores de sessão e conteúdo (src/lib/data/)
    ├── /admin → AdminAccess → Admin
    └── páginas públicas → Layout → um arquivo para cada página

src/lib/data/content.tsx
└── src/lib/data/content-api.ts
    └── src/lib/data/supabase.ts → Supabase
```

A pasta `components` ainda reúne componentes compartilhados, módulos visuais maiores e peças específicas de uma experiência; só os controles básicos ficam agrupados em `components/ui`. Para encontrar uma página, agora cada rota pública tem seu próprio arquivo em `src/pages/`. Essa divisão deixa mais claro onde editar o conteúdo de cada tela.

| Pasta ou arquivo     | O que contém                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/`         | Um arquivo por tela: `Home.tsx`, `Liga.tsx`, `Membros.tsx`, `Projetos.tsx`, `Pesquisas.tsx`, `Atividades.tsx` e `Participar.tsx`. `NotFound.tsx` é o 404 e `admin/` reúne o painel (`Admin.tsx`) e a tela de entrada (`AdminAccess.tsx`).                                                                                                                                                                                                                                                               |
| `src/components/`    | Peças visuais do site, uma pasta para cada tipo: `layout/` (cabeçalho, menu móvel, rodapé, estrutura comum e a ordem do menu em `navigation.ts`), `hero/` (cubo 3D e animação de abertura da Home), `not-found/` (volume ASCII da página 404), `effects/` (fundo Matrix e a faixa em rede da Home), `sections/` (blocos de página, como projetos e temas da liga), `shared/` (logo, ícones de redes, títulos, cartões e avisos de carregamento usados em várias telas) e `ui/` (botão, abas e diálogo). |
| `src/components/ui/` | Controles pequenos e reutilizáveis, como botão, abas e diálogo. São a base visual de várias telas, não páginas completas.                                                                                                                                                                                                                                                                                                                                                                               |
| `src/lib/`           | Lógica que não é uma tela. `data/` guarda tudo o que lida com o banco e a sessão (conteúdo, Supabase, login, ordem dos membros e busca de pesquisas); na raiz ficam os ajudantes de interface: animações de rolagem, preferências de movimento, destaque do ponteiro, interação da cena ASCII e validação de URLs e imagens.                                                                                                                                                                            |
| `src/styles.css`     | Estilos e variáveis visuais globais, incluindo as cores da marca.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `public/images/`     | Imagens servidas diretamente pelo site em endereços como `/images/logo.webp`.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `src/images/`        | Arquivos de origem e materiais guardados no projeto. Para imagens públicas do site, use `public/images/` ou envie pelo painel.                                                                                                                                                                                                                                                                                                                                                                          |
| `docs/`              | Este guia e quatro pastas: `banco/` (SQL do Supabase), `produto/` (descoberta e requisitos), `design/` (arte do login) e `superpowers/` (especificações e planos de trabalho).                                                                                                                                                                                                                                                                                                                          |
| `tests/`             | Testes automatizados de navegação, interface mobile e painel administrativo.                                                                                                                                                                                                                                                                                                                                                                                                                            |

### O caminho de uma página

`src/App.tsx` decide qual tela abrir para cada endereço. Nas rotas públicas, `components/layout/Layout.tsx` acrescenta a navegação e o rodapé e coloca a página dentro da estrutura comum. O painel `/admin` usa o acesso administrativo e não aparece na navegação pública. Endereços sem rota conhecida caem em `NotFound.tsx`.

Cada página pública tem seu próprio arquivo: para editar Membros, abra `src/pages/Membros.tsx`; para Participar e contato, abra `src/pages/Participar.tsx`. `src/App.tsx` liga cada endereço ao arquivo correspondente.

## Conteúdo do site e Supabase

O conteúdo que a diretoria atualiza fica no Supabase. Para mudanças normais, use `/admin`; o código não guarda conteúdo de exemplo: tudo o que aparece em atividades, pesquisas, projetos, membros, mídia, comunicados e nos contatos vem do banco. Enquanto o banco responde, as páginas mostram um esqueleto de carregamento; se ele não responder, mostram um aviso com o botão “Tentar novamente”.

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

`src/lib/data/content.tsx` define os tipos de conteúdo e o estado compartilhado usado pelas páginas (que começa vazio e só é preenchido com a resposta do banco). `content-api.ts` traduz os registros do banco para o formato usado no React. `supabase.ts` cria o cliente quando as variáveis de ambiente estão presentes. O SQL inicial e as políticas de acesso ficam em `docs/banco/supabase-setup.sql`.

O login é feito pelo Supabase Auth. Uma conta só abre o painel se estiver autorizada em `lasete_admins`; as políticas RLS do banco também limitam quem pode ler rascunhos, editar conteúdo e enviar imagens. Não há cadastro público de administradores.

### Adicionar ou editar uma pesquisa

No painel, abra **Pesquisas → Adicionar pesquisa**. O campo **Autor(es)** fica antes do título e é opcional para permitir registros cuja autoria ainda não foi informada. Quando preenchido, aparece como “Por [autor]” no cartão público. Para alterar sua posição ou o texto do campo, procure o formulário em **src/pages/admin/Admin.tsx**; o tipo de conteúdo está em **src/lib/data/content.tsx**, e o mapeamento entre banco e interface está em **src/lib/data/content-api.ts**.

A tabela researches precisa ter a coluna author. O SQL de instalação já inclui essa alteração, mas, como o banco existente foi criado anteriormente, execute uma vez no SQL Editor do Supabase:

    alter table public.researches
      add column if not exists author text not null default '';

O if not exists permite rodar o comando novamente sem duplicar a coluna. Registros já existentes ficam com autoria vazia; podem ser atualizados pelo painel.

### Adicionar ou editar um membro

Em **Membros → Adicionar membro**, informe o nome e escolha o **Cargo**. As opções são presidente, vice-presidente, secretário-geral, diretor(a) de área, ligante e professor(a) orientador(a). O campo **Área** oferece Pesquisa, Ensino, Extensão, Projetos, Comunicação e Financeiro para cargos de área; presidência, vice-presidência, secretaria e orientação recebem sua área correspondente automaticamente.

Para cargos com flexão de gênero, escolha a **Forma gramatical do cargo**. Ela serve apenas para montar o texto publicado; o sistema não salva gênero como dado separado. A prévia mostra o cargo final, por exemplo, “Diretora de Comunicação”. A categoria do filtro (**Diretoria**, **Ligantes** ou **Orientadores**) é definida automaticamente pelo cargo escolhido.

As opções e a composição do texto ficam no início de **src/pages/admin/Admin.tsx**, nas funções **memberAreaOptions**, **memberRole** e **memberGroupForCargo**. Para incluir uma nova área ou cargo, atualize essas opções e a regra de composição; não é necessário criar colunas novas no Supabase. A ordenação da diretoria continua em **src/lib/data/member-order.ts**.

### Imagens

Para conteúdo novo, a diretoria pode enviar a imagem pelo painel: no editor, escolha o arquivo, arraste-o para o campo **Imagem** ou cole com Ctrl+V uma imagem copiada (JPG, PNG ou WebP, até 5 MB). As imagens existentes no site também podem estar em `public/images/`; dentro do conteúdo, o caminho é escrito como `/images/nome-do-arquivo.webp`. Para substituir uma imagem usada por um registro do banco, edite o registro pelo painel. Evite renomear um arquivo sem atualizar todas as referências.

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
- [Descoberta do projeto](produto/01-project-discovery.md): informações de origem.
- [Requisitos](produto/02-requirements.md): comportamentos previstos.
- [Instalação do Supabase](banco/supabase-setup.sql): tabelas, regras, dados iniciais e armazenamento.
- [Autorização de administradores de teste](banco/authorize-test-admins.sql): SQL auxiliar para contas já criadas no Supabase Auth.
