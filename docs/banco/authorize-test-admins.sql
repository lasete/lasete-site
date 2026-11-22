-- Depois de criar estas contas em Authentication > Users > Add user,
-- execute como postgres no SQL Editor. Não cria contas nem altera senhas.
insert into public.lasete_admins (user_id)
select id from auth.users
where lower(email) in (
  'felipe.admin@lasete.com',
  'pedro.admin@lasete.com',
  'aguiar.admin@lasete.com'
)
on conflict (user_id) do nothing;

select u.email, (a.user_id is not null) as administrador
from auth.users u
left join public.lasete_admins a on a.user_id = u.id
where lower(u.email) in (
  'felipe.admin@lasete.com',
  'pedro.admin@lasete.com',
  'aguiar.admin@lasete.com'
);
