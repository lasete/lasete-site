# Requisitos da prévia do frontend

## RF-001 — Navegação pública

Sete páginas acessíveis por URL própria e menu responsivo, sem numeração visível. Destino Participar e contato por extenso. /admin não aparece nos menus públicos. Acesso à IA disponível em desktop e celular.

## RF-002 — Conteúdo institucional

Exibir a apresentação, os eixos, os projetos, materiais de estudo, atividades, mídia e comunicados baseados nos registros fornecidos. Membros filtrados por diretoria, ligantes e orientadores; busca por nome ou área.

## RF-003 — Hero

Renderizar um volume cúbico composto apenas por caracteres ASCII, com os cortes do emblema repetidos nas quatro quinas verticais. Indicador de rolagem leva à apresentação institucional. Dispersar glifos na região do ponteiro, recompor a forma após sua saída e permitir arraste ou teclado para girar. Matrix binária um pouco mais visível ao fundo da hero e contínua na apresentação seguinte; nas páginas internas, apenas os cabeçalhos de A liga, Membros e Projetos recebem o campo discreto. A hero não contém textos laterais, toggles de material ou lettering gigante. Fallback do emblema em caso de ausência de WebGL; movimento reduzido desativa a Matrix e mantém o volume estático.

## RF-004 — Seletivo

Contatos em destaque no início da página. Mensagem grande e distinta para aberto/fechado, configuração editorial, edital e formulário acessíveis em ambos os estados. O status do site não altera o Google Forms externo.

## RF-006 — Projetos

Exploração dentro da própria página, sem pop-up de detalhe. Escolha por projeto e categoria; etapas do CTF acessíveis por abas; ações externas usam os destinos editoriais. Registros de atividades e materiais expandem o relato no próprio cartão.

## RF-005 — Painel de demonstração

Criar, editar, publicar, despublicar e excluir registros dos módulos; editar contatos e seletivo; restaurar dados iniciais mediante confirmação. As mudanças persistem no mesmo navegador. Indicar a natureza de demonstração e erros de armazenamento.

## RNF-001 — Qualidade da prévia

Layouts sem overflow nas larguras verificadas; navegação por teclado, foco visível, rótulos e diálogos acessíveis. Respeitar movimento reduzido. Suspender animações fora da tela e com aba oculta; imagens WebP locais e carregamento posterior do módulo 3D. Fluidez em dispositivos físicos precisa de validação adicional.

## Integração futura

Supabase Auth, Database e Storage aprovados para etapa posterior. Permissões validadas no backend em todas as operações; somente administradores definidos pela liga publicam. Nenhuma integração com Supabase é executada na prévia.
