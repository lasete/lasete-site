# Ajustes do site — novembro de 2026

Branch: `feat/ajustes-site-novembro`, criada a partir de `feat/intro-l7` (a `develop`
ainda não tem a abertura L7 nem a hero em tela cheia, e este trabalho depende das duas).

## Objetivo

Aplicar a parte já decidida do checklist de mudanças (áudios de 09/11/2026) e os pedidos
adicionais do responsável pelo site, sem tocar no que ainda depende de resposta do Pedro.

## Escopo

### 1. Botão "Explore a LASETE" na hero

Hoje é um texto de 12px em cinza (`.hero-scroll`) com um ícone de mouse, sem fundo, e a
Matrix passa por trás.

- Vira uma pílula: contorno claro, fundo escuro translúcido que isola o texto da Matrix,
  texto branco em 14px.
- O ícone de mouse sai; entra uma seta para baixo com animação sutil. Com
  `prefers-reduced-motion`, a seta fica parada.
- Posição (24px do rodapé da hero; 20px até 700px de largura) e destino (`#conheca`) não
  mudam. Área de toque mínima de 44px.
- Continua oculto durante a abertura L7 e reaparece com o `intro-reveal`.

### 2. "Temas que dialogam com a liga" vai para a Home

- O bloco (rótulo, título "Da cibersegurança aos sistemas conectados." e os quatro cartões
  SEC, IA, IOT, PRIV) sai de `src/pages/Pesquisas.tsx` e vira o componente
  `ResearchFields` em `src/components/ResearchFields.tsx`. O conteúdo continua fixo no
  código.
- Na Home entra como seção própria logo depois de `home-intro` (que termina nos pilares
  Ensino, Pesquisa e Extensão) e antes do `NetworkInterlude`.
- É removido da página Pesquisas. O espaçamento do fim da página é conferido depois da
  remoção.

### 3. Busca na página Pesquisas

- Um único campo de busca à direita do título "Investigações e aprendizados da liga."
  Até 700px de largura, desce para baixo do título e ocupa a largura toda.
- Não há menu de temas. A busca cobre título, subtítulo, autores e categoria (o texto
  `Tipo · Tema`, que serve de tema e de tag).
- Filtra enquanto se digita, ignorando acentos e maiúsculas. Com mais de uma palavra,
  todas precisam aparecer no item (em qualquer campo).
- Sem resultados: mensagem "Nenhuma pesquisa encontrada" com botão "Limpar busca".
- O campo tem rótulo acessível e o número de resultados é anunciado em `aria-live`.
- A regra de comparação fica numa função pura em `src/lib/research-search.ts`
  (`matchesResearch(item, query)`), separada da página.
- Sem pesquisas publicadas, o `EmptyState` atual continua e o campo não aparece.

### 4. Rodapé

- Esquerda: logo e "LASETE", como hoje.
- Centro: "Liga Acadêmica de Segurança e Tecnologias Emergentes" e "São Luís, Maranhão",
  no lugar da navegação.
- Direita: contato como hoje — rótulo, e-mail em `mailto:`, Instagram, LinkedIn e o botão
  de voltar ao topo.
- Saem a navegação de páginas (`nav aria-label="Rodapé"`) e a frase "Ensino, pesquisa e
  extensão."
- Embaixo: `© {ano} LASETE` centralizado.
- No celular as três partes empilham na ordem logo, nome da liga, contato.

### 5. Divisória rachada dos projetos (Home)

Problemas de hoje: o corte é uma linha escura de 1,6px quase invisível; a rachadura é uma
faixa de 80px sobreposta com fundo próprio, o que deixa emenda nos padrões; o zigue-zague
é miúdo e raspa nas molduras das imagens; no celular o corte encosta em "Explorar projeto"
e a arte do LASETE AI aparece cortada.

- Cada card mantém a própria cor (cinza-azulado no CTF, verde no LASETE AI).
- Os dois cards passam a ser recortados no formato da rachadura (`clip-path`), de modo que
  o fundo de cada lado vá inteiro até o corte. Os SVGs de faixa com `pattern` saem.
- Entre as metades fica um vão escuro fino. Cada borda do vão ganha um filete de luz na cor
  do próprio lado, desenhado por um SVG só com os dois traços.
- O traçado tem menos pontas, maiores, e mantém folga das molduras das imagens.
- Até 700px o corte é horizontal, com espaço acima e abaixo, e a arte do LASETE AI aparece
  inteira.
- O contorno arredondado externo do bloco e o comportamento de hover continuam.

### 6. Admin: área "Projetos" para membros

- "Projetos" entra em `departmentAreas` (`src/pages/Admin.tsx`), depois de "Extensão" e
  antes de "Financeiro". Diretor(a) dessa área recebe o cargo "Diretor(a) de Projetos";
  ligantes podem ser da área.
- Em `src/lib/member-order.ts`, a diretoria de projetos fica depois de Extensão e antes de
  Financeiro.
- O banco não muda: `area` é texto livre e não há restrição de valores.
- `docs/GUIA-DE-MANUTENCAO.md` passa a citar a nova área.

### 7. Admin: imagem por arrastar ou colar

- O campo de imagem do editor (`.image-upload-field`) vira uma área de soltar: arrastar um
  arquivo sobre ela mostra destaque visual, e soltar envia.
- Com o editor aberto, colar (Ctrl+V) com uma imagem na área de transferência envia essa
  imagem. Colar texto em qualquer campo continua funcionando normalmente.
- O botão "Escolher imagem" continua.
- As três entradas chamam a mesma função de envio (extraída do `upload` atual), com as
  mesmas regras (JPG, PNG ou WebP, até 5 MB), o mesmo destino (`lasete-images` no Supabase
  Storage) e as mesmas mensagens de erro. Só o primeiro arquivo de imagem é usado.
- Vale para todo tipo de conteúdo cujo editor tem campo de imagem. O texto de ajuda do
  campo passa a mencionar arrastar e colar.

## Fora do escopo (aguardando o Pedro)

- Remover a seção "Seletivo fechado" da Home.
- Reformular "LASETE na mídia" / "Fique por dentro" e os links do Instagram.
- Destino da seção "Estudos e materiais / LASETE AI" da Home.
- Diminuir a seção da logo (item 1.4): descartado, a hero voltou à tela cheia.
- Revisão de textos da página A Liga.

## Testes

Playwright, no padrão de `tests/`:

- Hero: o botão é visível, tem o novo estilo e leva a `#conheca`.
- Home: "Temas que dialogam com a liga" aparece depois dos pilares; Pesquisas não tem mais
  a seção.
- Pesquisas: busca por título, por autor e por categoria; ignora acento; sem resultado
  mostra a mensagem e "Limpar busca" restaura a lista.
- Rodapé: sem navegação de páginas, nome da liga presente, e-mail com `mailto:`, copyright
  presente e sem "Ensino, pesquisa e extensão".
- Projetos na Home: os dois cards visíveis e clicáveis em desktop e celular.
- Admin: área "Projetos" gera "Diretor de Projetos" / "Diretora de Projetos"; soltar e
  colar uma imagem preenchem a prévia; arquivo inválido mostra o erro existente.
- Testes atuais que dependem dos links do rodapé são ajustados.

Dois testes de admin já falham antes deste trabalho (`tests/admin.spec.ts:57` e
`tests/site.spec.ts:350`); não fazem parte desta leva.
