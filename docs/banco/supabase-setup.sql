-- LASETE: oito tabelas, com conteúdo separado por módulo.
-- Executar no SQL Editor como postgres. Reexecução preserva registros existentes.
-- Se a versão anterior já foi executada, copia os registros por tipo e mantém
-- content_items como cópia de segurança. Não apaga tabelas nem conteúdos.
begin;

create table if not exists public.lasete_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.members (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  image text not null default '',
  url text not null default '',
  category text not null default '',
  published boolean not null default false,
  role text,
  area text,
  "group" text,
  post_crop boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.researches (
  id text primary key,
  title text not null,
  author text not null default '',
  subtitle text not null default '',
  description text not null default '',
  image text not null default '',
  url text not null default '',
  category text not null default '',
  published boolean not null default false,
  date text,
  post_crop boolean not null default false,
  sort_order integer not null default 0
);
alter table public.researches
  add column if not exists author text not null default '';

create table if not exists public.activities (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  image text not null default '',
  url text not null default '',
  category text not null default '',
  published boolean not null default false,
  date text,
  post_crop boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.media (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  image text not null default '',
  url text not null default '',
  category text not null default '',
  published boolean not null default false,
  date text,
  post_crop boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.projects (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  image text not null default '',
  url text not null default '',
  category text not null default '',
  published boolean not null default false,
  date text,
  post_crop boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.notices (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  image text not null default '',
  url text not null default '',
  category text not null default '',
  published boolean not null default false,
  date text,
  post_crop boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  email text not null default '',
  instagram text not null default '',
  linkedin text not null default '',
  ai_url text not null default '',
  selection_open boolean not null default false,
  selection_note text not null default '',
  edital_url text not null default '',
  form_url text not null default ''
);

alter table public.lasete_admins enable row level security;
alter table public.site_settings enable row level security;
grant usage on schema public to anon, authenticated;
revoke all on public.lasete_admins, public.site_settings from public, anon, authenticated;
grant select on public.lasete_admins to authenticated;
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

drop policy if exists lasete_admin_self on public.lasete_admins;
create policy lasete_admin_self on public.lasete_admins
  for select to authenticated using (user_id = (select auth.uid()));

alter table public.members enable row level security;
revoke all on public.members from public, anon, authenticated;
grant select on public.members to anon, authenticated;
grant insert, update, delete on public.members to authenticated;
drop policy if exists lasete_members_read on public.members;
create policy lasete_members_read on public.members
  for select to anon, authenticated using (published);
drop policy if exists lasete_members_admin on public.members;
create policy lasete_members_admin on public.members
  for all to authenticated
  using (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

alter table public.researches enable row level security;
revoke all on public.researches from public, anon, authenticated;
grant select on public.researches to anon, authenticated;
grant insert, update, delete on public.researches to authenticated;
drop policy if exists lasete_researches_read on public.researches;
create policy lasete_researches_read on public.researches
  for select to anon, authenticated using (published);
drop policy if exists lasete_researches_admin on public.researches;
create policy lasete_researches_admin on public.researches
  for all to authenticated
  using (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

alter table public.activities enable row level security;
revoke all on public.activities from public, anon, authenticated;
grant select on public.activities to anon, authenticated;
grant insert, update, delete on public.activities to authenticated;
drop policy if exists lasete_activities_read on public.activities;
create policy lasete_activities_read on public.activities
  for select to anon, authenticated using (published);
drop policy if exists lasete_activities_admin on public.activities;
create policy lasete_activities_admin on public.activities
  for all to authenticated
  using (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

alter table public.media enable row level security;
revoke all on public.media from public, anon, authenticated;
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;
drop policy if exists lasete_media_read on public.media;
create policy lasete_media_read on public.media
  for select to anon, authenticated using (published);
drop policy if exists lasete_media_admin on public.media;
create policy lasete_media_admin on public.media
  for all to authenticated
  using (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

alter table public.projects enable row level security;
revoke all on public.projects from public, anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
drop policy if exists lasete_projects_read on public.projects;
create policy lasete_projects_read on public.projects
  for select to anon, authenticated using (published);
drop policy if exists lasete_projects_admin on public.projects;
create policy lasete_projects_admin on public.projects
  for all to authenticated
  using (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

alter table public.notices enable row level security;
revoke all on public.notices from public, anon, authenticated;
grant select on public.notices to anon, authenticated;
grant insert, update, delete on public.notices to authenticated;
drop policy if exists lasete_notices_read on public.notices;
create policy lasete_notices_read on public.notices
  for select to anon, authenticated using (published);
drop policy if exists lasete_notices_admin on public.notices;
create policy lasete_notices_admin on public.notices
  for all to authenticated
  using (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

drop policy if exists lasete_settings_read on public.site_settings;
create policy lasete_settings_read on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists lasete_settings_update on public.site_settings;
create policy lasete_settings_update on public.site_settings
  for update to authenticated
  using (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lasete-images', 'lasete-images', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists lasete_images_select on storage.objects;
create policy lasete_images_select on storage.objects for select to authenticated
  using (bucket_id = 'lasete-images' and exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

drop policy if exists lasete_images_insert on storage.objects;
create policy lasete_images_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'lasete-images' and exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

drop policy if exists lasete_images_update on storage.objects;
create policy lasete_images_update on storage.objects for update to authenticated
  using (bucket_id = 'lasete-images' and exists (select 1 from public.lasete_admins where user_id = (select auth.uid())))
  with check (bucket_id = 'lasete-images' and exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

drop policy if exists lasete_images_delete on storage.objects;
create policy lasete_images_delete on storage.objects for delete to authenticated
  using (bucket_id = 'lasete-images' and exists (select 1 from public.lasete_admins where user_id = (select auth.uid())));

insert into public.site_settings (id, email, instagram, linkedin, ai_url, selection_open, selection_note, edital_url, form_url)
values (1, 'lasete.undb@gmail.com', 'https://www.instagram.com/lasete.undb/', 'https://www.linkedin.com/company/lasete/', 'https://laseteai.streamlit.app/', false, 'As orientações, os requisitos e as etapas do processo seletivo estão no edital. Acompanhe os canais oficiais da liga para receber as próximas atualizações.', 'https://drive.google.com/file/d/1gcHwt2QOeHMJhap1I15PpUr4W2yyXMWo/view', 'https://docs.google.com/forms/d/e/1FAIpQLSc9_NLhdGbVOXJJ0AbzfpgoXmt4FolFyY_qpPRu3DmzA8fOQQ/closedform')
on conflict (id) do nothing;

-- Recupera dados da versão anterior antes de inserir os dados iniciais.
do $migration$
begin
  if to_regclass('public.content_items') is not null then
    execute 'insert into public.members (id, title, subtitle, description, image, url, category, published, role, area, "group", post_crop, sort_order) select id, title, subtitle, description, image, url, category, published, role, area, "group", post_crop, sort_order from public.content_items where type = ''member'' on conflict (id) do nothing';
    execute 'insert into public.researches (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order) select id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order from public.content_items where type = ''research'' on conflict (id) do nothing';
    execute 'insert into public.activities (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order) select id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order from public.content_items where type = ''activity'' on conflict (id) do nothing';
    execute 'insert into public.media (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order) select id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order from public.content_items where type = ''media'' on conflict (id) do nothing';
    execute 'insert into public.projects (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order) select id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order from public.content_items where type = ''project'' on conflict (id) do nothing';
    execute 'insert into public.notices (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order) select id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order from public.content_items where type = ''notice'' on conflict (id) do nothing';
  end if;
end;
$migration$;

insert into public.members (id, title, subtitle, description, image, url, category, published, role, area, "group", post_crop, sort_order)
values
  ('luiz', 'Luiz Felipe Cerqueira Guimarães', 'Presidente', '', '/images/luiz-felipe.webp', '', 'Presidência', true, 'Presidente', 'Presidência', 'Diretoria', false, 14),
  ('pedro', 'Pedro Henrique Serra Brasil', 'Vice-presidente', '', '/images/pedro-brasil.webp', '', 'Vice-presidência', true, 'Vice-presidente', 'Vice-presidência', 'Diretoria', false, 15),
  ('joao', 'João Gabriel Garcia', 'Secretário-geral', '', '/images/joao-garcia.webp', '', 'Secretaria', true, 'Secretário-geral', 'Secretaria', 'Diretoria', false, 16),
  ('marcos-vinicius', 'Marcos Vinícius Santos Silva', 'Diretor de Pesquisa', '', '/images/marcos-vinicius.webp', '', 'Pesquisa', true, 'Diretor de Pesquisa', 'Pesquisa', 'Diretoria', false, 17),
  ('gheorghe', 'Gheorghe Marighella Lima Bastos', 'Diretor de Ensino', '', '/images/gheorghe.webp', '', 'Ensino', true, 'Diretor de Ensino', 'Ensino', 'Diretoria', false, 18),
  ('luiza', 'Luiza Belfort Conceição dos Santos', 'Diretora de Comunicação', '', '/images/luiza.webp', '', 'Comunicação', true, 'Diretora de Comunicação', 'Comunicação', 'Diretoria', false, 19),
  ('luis-castro', 'Luis Felipe da Cunha Castro', 'Diretor de Extensão', '', '/images/luis-castro.webp', '', 'Extensão', true, 'Diretor de Extensão', 'Extensão', 'Diretoria', false, 20),
  ('caio', 'Caio Fontes Gondim Silva', 'Ligante', '', '', '', 'Extensão', true, 'Ligante', 'Extensão', 'Ligantes', false, 21),
  ('daniel', 'Daniel Augusto Pereira Amaral', 'Ligante', '', '', '', 'Extensão', true, 'Ligante', 'Extensão', 'Ligantes', false, 22),
  ('hugo', 'Hugo Carvalho Diniz', 'Ligante', '', '', '', 'Pesquisa', true, 'Ligante', 'Pesquisa', 'Ligantes', false, 23),
  ('arthur', 'Arthur Campos Rezende', 'Ligante', '', '', '', 'Pesquisa', true, 'Ligante', 'Pesquisa', 'Ligantes', false, 24),
  ('marcos-eduardo', 'Marcos Eduardo França Mesquita', 'Ligante', '', '', '', 'Comunicação', true, 'Ligante', 'Comunicação', 'Ligantes', false, 25),
  ('matheus', 'Matheus Aguiar', 'Ligante', '', '', '', 'Ensino', true, 'Ligante', 'Ensino', 'Ligantes', false, 26),
  ('nicolas', 'Nicolas Mourão Mesquita', 'Ligante', '', '', '', 'Extensão', true, 'Ligante', 'Extensão', 'Ligantes', false, 27),
  ('arlley', 'Arlley Carlos Carneiro dos Santos Costa', 'Professor orientador', '', '', '', 'Orientação', true, 'Professor orientador', 'Orientação', 'Orientadores', false, 28),
  ('rodrigo-almeida', 'Rodrigo da Conceição Almeida', 'Professor orientador', '', '/images/rodrigo-almeida.webp', '', 'Orientação', true, 'Professor orientador', 'Orientação', 'Orientadores', false, 29),
  ('rodrigo-justino', 'Rodrigo Aparecido Justino', 'Professor orientador', '', '/images/rodrigo-justino.webp', '', 'Orientação', true, 'Professor orientador', 'Orientação', 'Orientadores', false, 30)
on conflict (id) do nothing;

insert into public.researches (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order)
values
  ('material-privacidade', 'Privacidade e proteção de dados', 'Um material educativo sobre os impactos de uma exposição de dados.', 'No carrossel enviado, a LASETE discute um caso de exposição de dados de um aplicativo, os impactos sobre as pessoas e a importância de construir soluções com foco em ética, privacidade e proteção de dados. Origem: material de divulgação publicado no Instagram da liga.', '/images/privacidade.webp', 'https://www.instagram.com/lasete.undb/', 'Material educativo · Privacidade', true, null, true, 9),
  ('material-ml', 'Machine Learning e Visão Computacional', 'Fundamentos de IA e ciência de dados em uma oficina prática.', 'Material de estudo e registro da oficina ministrada por Luis Felipe. Os temas divulgados incluem algoritmos de dados, regressão linear e introdução à visão computacional. Origem: publicação educativa no Instagram da liga.', '/images/machine-learning.webp', 'https://www.instagram.com/lasete.undb/', 'Material de estudo · IA', true, null, true, 10),
  ('material-ctf', 'Como funciona um Capture the Flag?', 'Desafios técnicos para aproximar o estudo da prática de segurança.', 'O material apresentado pela liga explica o formato de uma competição CTF e registra desafios de reconhecimento, enumeração e aplicações web criados pelos membros da LASETE. Origem: publicação educativa no Instagram.', '/images/ctf-registro.webp', 'https://www.instagram.com/lasete.undb/', 'Material educativo · Segurança', true, null, true, 11)
on conflict (id) do nothing;

insert into public.activities (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order)
values
  ('web-hacking', 'Web Hacking no IT Works', 'Da metodologia ao desafio.', 'Workshop sobre reconhecimento e exploração de aplicações web, ministrado por Matheus Aguiar, com aplicação dos conhecimentos em um CTF.', '/images/web-hacking.webp', 'https://www.instagram.com/lasete.undb/', 'Workshop', true, null, true, 2),
  ('machine-learning', 'Machine Learning na prática', 'Introdução à IA e à ciência de dados.', 'Oficina de Machine Learning e Visão Computacional ministrada por Luis Felipe, reunindo fundamentos, dados e aplicações práticas.', '/images/machine-learning.webp', 'https://www.instagram.com/lasete.undb/', 'Oficina', true, null, true, 3),
  ('ctic', 'CTIC Insight Conference 2026', 'Tecnologia, conhecimento e troca.', 'Participação da LASETE na conferência realizada na UEMA, com a palestra de Matheus Aguiar sobre segurança em aplicações web e APIs.', '/images/ctic.webp', 'https://www.instagram.com/lasete.undb/', 'Conferência', true, null, true, 4),
  ('giro', 'Giro de Profissões', 'Uma conversa sobre os caminhos da tecnologia.', 'A LASETE participou do Giro de Profissões da UNDB, compartilhando conhecimentos e apresentando possibilidades em cibersegurança e tecnologias emergentes.', '/images/giro.webp', 'https://www.instagram.com/lasete.undb/', 'Extensão', true, null, true, 5)
on conflict (id) do nothing;

insert into public.media (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order)
values
  ('midia-ctic', 'LASETE no CTIC Insight Conference 2026', 'Segurança, tecnologia e troca de conhecimento na UEMA.', 'Registro publicado no Instagram da LASETE sobre a participação da liga no CTIC Insight Conference 2026. Matheus Aguiar apresentou a palestra sobre segurança em aplicações web e APIs.', '/images/ctic.webp', 'https://www.instagram.com/lasete.undb/', 'Instagram da LASETE', true, null, true, 6),
  ('midia-giro', 'A liga no Giro de Profissões', 'Apresentando possibilidades em cibersegurança e tecnologias emergentes.', 'Publicação da LASETE sobre sua participação no Giro de Profissões da UNDB, com troca de conhecimentos e apresentação da área de tecnologia aos estudantes.', '/images/giro.webp', 'https://www.instagram.com/lasete.undb/', 'Instagram da LASETE', true, null, true, 7),
  ('midia-web', 'Web Hacking no IT Works', 'Um workshop que conectou metodologia e prática.', 'Registro do workshop ministrado por Matheus Aguiar e da oportunidade de aplicar os conhecimentos em um CTF voltado à segurança de aplicações web.', '/images/web-hacking.webp', 'https://www.instagram.com/lasete.undb/', 'Instagram da LASETE', true, null, true, 8)
on conflict (id) do nothing;

insert into public.projects (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order)
values
  ('ctf', 'Capture the Flag', 'Aprender segurança colocando o conhecimento em prática.', 'Um ambiente de desafios desenvolvido pelos membros da LASETE. Reconhecimento, enumeração e exploração de vulnerabilidades em uma aplicação criada para a competição aproximam o estudo da prática de segurança.', '', '', 'Cibersegurança', true, null, false, 0),
  ('lasete-ai', 'LASETE AI', 'Mais uma maneira de explorar o conhecimento.', 'Conheça a iniciativa de inteligência artificial da LASETE. A experiência está disponível em sua própria aplicação, hospedada no Streamlit.', '', 'https://laseteai.streamlit.app/', 'Inteligência artificial', true, null, false, 1)
on conflict (id) do nothing;

insert into public.notices (id, title, subtitle, description, image, url, category, published, date, post_crop, sort_order)
values
  ('comunicado-liga', 'Conheça a LASETE', 'Uma comunidade de aprendizado, projetos, pesquisa e troca.', 'A publicação de apresentação explica a proposta da Liga Acadêmica de Segurança e Tecnologias Emergentes da UNDB e suas iniciativas de ensino, pesquisa e extensão.', '/images/sobre-liga.webp', 'https://www.instagram.com/lasete.undb/', 'Sobre a liga · Instagram', true, null, true, 12),
  ('comunicado-ctf', 'Aprender segurança com desafios', 'Conheça os registros do CTF desenvolvido pelos membros da liga.', 'O CTF da LASETE colocou em prática etapas de reconhecimento, enumeração e exploração em um ambiente criado para o desafio. Conheça os registros nos canais da liga.', '/images/ctf-registro.webp', 'https://www.instagram.com/lasete.undb/', 'Projetos · Instagram', true, null, true, 13)
on conflict (id) do nothing;

commit;

-- Conferência dos registros em cada módulo.
select 'members' as tabela, count(*) as registros from public.members
union all
select 'researches' as tabela, count(*) as registros from public.researches
union all
select 'activities' as tabela, count(*) as registros from public.activities
union all
select 'media' as tabela, count(*) as registros from public.media
union all
select 'projects' as tabela, count(*) as registros from public.projects
union all
select 'notices' as tabela, count(*) as registros from public.notices;
