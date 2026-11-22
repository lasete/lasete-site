import { useState } from 'react';
import { Search } from 'lucide-react';
import { memberGroups, orderMembers } from '@/lib/member-order';
import { useContent, usePublished } from '@/lib/content';
import { EmptyState, PageIntro, safeImage } from '@/components/Shared';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

export default function Membros() {
  const { loading, loadError } = useContent();
  const people = orderMembers(usePublished('member'));
  const [group, setGroup] = useState('Todos');
  const [query, setQuery] = useState('');
  const filtered = people.filter(
    (i) =>
      (group === 'Todos' || i.group === group) &&
      normalize(`${i.title} ${i.role} ${i.area}`).includes(normalize(query)),
  );
  return (
    <>
      <PageIntro
        ambient
        label="Membros"
        title="Quem faz a liga acontecer."
        description="Pessoas com diferentes perguntas e uma vontade em comum: aprender, criar e compartilhar conhecimento."
      />
      <section className="shell members-section">
        <div className="members-toolbar">
          <Tabs value={group} onValueChange={setGroup}>
            <TabsList aria-label="Filtrar membros por grupo">
              {memberGroups.map((g) => (
                <TabsTrigger key={g} value={g}>
                  {g}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <label className="search-field">
            <Search size={16} />
            <span className="sr-only">Buscar membro</span>
            <input
              placeholder="Encontre uma pessoa"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        {!loading && !loadError && (
          <p className="results-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'pessoa' : 'pessoas'} ·{' '}
            {group}
          </p>
        )}
        <div className="member-grid">
          {filtered.map((person) => (
            <article className="member-card" key={person.id} data-reveal>
              <div className="member-photo">
                {person.image ? (
                  <img
                    src={safeImage(person.image)}
                    alt={person.title}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    className="member-initials"
                    aria-label="Retrato ainda não disponível"
                  >
                    <span>
                      {person.title
                        .split(' ')
                        .filter(Boolean)
                        .map((p, i, a) =>
                          i === 0 || i === a.length - 1 ? p[0] : '',
                        )
                        .join('')}
                    </span>
                    <small>LASETE / {person.area}</small>
                  </div>
                )}
                <span className="member-area">{person.area}</span>
              </div>
              <h2>{person.title}</h2>
              <p>{person.role || person.subtitle}</p>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <EmptyState
            title="Vamos tentar outro nome?"
            description="Nenhuma pessoa corresponde à busca. Você pode trocar o grupo ou buscar por uma área."
          />
        )}
        {group === 'Diretoria' && (
          <p className="members-note">
            Diretoria financeira: responsável a confirmar.
          </p>
        )}
      </section>
    </>
  );
}
