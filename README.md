# LASETE Institucional

Prévia do frontend em React, TypeScript, Vite e Tailwind. Sete páginas públicas; hero WebGL/ASCII; painel editorial em `/admin`.

Para localizar rapidamente onde fazer cada manutenção, consulte o [Guia prático de manutenção](docs/GUIA-DE-MANUTENCAO.md).

## Desenvolvimento

```sh
npm install
npm run dev
# http://localhost:5180 (porta separada do SEMISPE)
```

## Verificação

```sh
npm run build
npm run test:e2e
```

## Deploy na Vercel

Use o preset **Vite**, o comando de build `npm run build` e o diretório de saída `dist`.
O `vercel.json` na raiz encaminha acessos diretos e atualizações de rotas como `/admin`
e `/membros` para o React Router. Endereços desconhecidos exibem o 404 da LASETE.
Depois de enviar essa configuração ao repositório conectado, faça um novo deploy para
aplicar a correção; repetir um deploy antigo não inclui arquivos locais novos.

## Painel editorial e Supabase

`/admin` tem login por e-mail e senha e verifica a autorização em `lasete_admins`.
O painel grava nas tabelas `members`, `researches`, `activities`, `media`, `projects`
e `notices`; contatos e seletivo ficam em `site_settings`. As permissões são
validadas no banco por RLS. Visitantes veem apenas conteúdo publicado.

Configure `.env.local` usando `.env.example`. Na Vercel, use os mesmos nomes
`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` e faça um novo deploy.
Sem essas variáveis o site mostra o conteúdo inicial e o login fica indisponível;
não existe edição local ou acesso alternativo ao painel.

O SQL de instalação está em `docs/supabase-setup.sql`. Ele inclui os 31 registros
iniciais e o bucket público `lasete-images` (upload por administradores, até 5 MB).
Se executado sobre a versão antiga, preserva `content_items` como cópia legada.
Os testes de navegador simulam o Supabase e não escrevem no projeto remoto.

### Administradores de teste

Para criar e autorizar automaticamente, configure `SUPABASE_SECRET_KEY`
(ou `SUPABASE_SERVICE_ROLE_KEY`) em `.env.admin.local`, arquivo ignorado pelo Git,
e execute apenas no terminal local:

```sh
node --env-file=.env.local --env-file=.env.admin.local scripts/create-test-admins.mjs
```

O script confirma os e-mails e preserva senhas de contas já existentes. Uma senha
alternativa pode ser passada em `LASETE_TEST_ADMIN_PASSWORD`. Não use prefixo
`VITE_` para chaves secretas.

Também é possível criar as três contas em **Authentication → Users → Add user**,
com e-mail confirmado, e depois executar `docs/authorize-test-admins.sql` no SQL Editor.

As mudanças no seletivo controlam o aviso do site; não abrem ou fecham o Google
Forms. `PRODUCT.md` registra as decisões de produto e `DESIGN.md` a direção visual.
