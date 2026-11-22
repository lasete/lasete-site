import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';

import { supabase } from './supabase';
import { useAuth } from './auth';
import {
  fetchContent,
  contentTables,
  itemRow,
  settingsRow,
} from './content-api';

export type ContentType =
  'project' | 'research' | 'activity' | 'media' | 'member' | 'notice';
export type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  subtitle: string;
  description: string;
  author?: string;
  image: string;
  url: string;
  category: string;
  published: boolean;
  role?: string;
  area?: string;
  group?: string;
  date?: string;
  postCrop?: boolean;
};
export type Settings = {
  email: string;
  instagram: string;
  linkedin: string;
  aiUrl: string;
  selectionOpen: boolean;
  selectionNote: string;
  editalUrl: string;
  formUrl: string;
};
export type SiteData = { version: 1; items: ContentItem[]; settings: Settings };
export const navItems = [
  { to: '/', label: 'Home', number: '01' },
  { to: '/a-liga', label: 'A liga', number: '02' },
  { to: '/membros', label: 'Membros', number: '03' },
  { to: '/atividades', label: 'Atividades', number: '04' },
  { to: '/pesquisas', label: 'Pesquisas', number: '05' },
  { to: '/projetos', label: 'Projetos', number: '06' },
  { to: '/participar', label: 'Participar e contato', number: '07' },
];
// O site só mostra o que vem do banco. Antes da resposta, ou se ela falhar, o estado é este:
// vazio, sem conteúdo de exemplo. As telas conferem `loading` e `loadError` antes de mostrar
// estados vazios ou links que dependem das configurações.
const emptySettings: Settings = {
  email: '',
  instagram: '',
  linkedin: '',
  aiUrl: '',
  selectionOpen: false,
  selectionNote: '',
  editalUrl: '',
  formUrl: '',
};
const emptyData: SiteData = {
  version: 1,
  settings: emptySettings,
  items: [],
};
const ContentContext = createContext<{
  data: SiteData;
  loading: boolean;
  loadError: string;
  reload: () => void;
  save: (data: SiteData) => Promise<boolean>;
}>({
  data: emptyData,
  loading: false,
  loadError: '',
  reload: () => {},
  save: async () => false,
});
export function ContentProvider({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading: authLoading } = useAuth();
  const [data, setData] = useState<SiteData>(emptyData);
  const [loading, setLoading] = useState(!!supabase);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const saving = useRef(false);
  const identity = `${session?.user.id ?? 'public'}:${isAdmin}:${authLoading}`;
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  useEffect(() => {
    // Never retain private drafts after a session or permission change.
    setData(emptyData);
    if (!supabase) {
      setLoading(false);
      return;
    }
    if (authLoading) {
      setLoading(true);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    void fetchContent(controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) setData(next);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setLoadError(
            'Não foi possível carregar os conteúdos. Confira sua conexão e tente novamente.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [identity, revision, authLoading]);
  const save = useCallback(
    async (next: SiteData) => {
      if (!supabase || !isAdmin || loading || loadError || saving.current)
        return false;
      saving.current = true;
      const startedAs = currentIdentity.current;
      try {
        // Write only records changed by this action, never a full table replacement.
        for (const item of next.items) {
          const old = data.items.find(
            (i) => i.type === item.type && i.id === item.id,
          );
          if (old && JSON.stringify(old) === JSON.stringify(item)) continue;
          const order = old ? data.items.indexOf(old) : -1;
          const { data: written, error } = await supabase
            .from(contentTables[item.type])
            .upsert(itemRow(item, order))
            .select('id')
            .single();
          if (error || !written) throw error ?? new Error('Sem permissão.');
        }
        for (const item of data.items) {
          if (next.items.some((i) => i.type === item.type && i.id === item.id))
            continue;
          const { data: deleted, error } = await supabase
            .from(contentTables[item.type])
            .delete()
            .eq('id', item.id)
            .select('id')
            .single();
          if (error || !deleted) throw error ?? new Error('Sem permissão.');
        }
        if (JSON.stringify(next.settings) !== JSON.stringify(data.settings)) {
          const { data: written, error } = await supabase
            .from('site_settings')
            .update(settingsRow(next.settings))
            .eq('id', 1)
            .select('id')
            .single();
          if (error || !written) throw error ?? new Error('Sem permissão.');
        }
        if (startedAs !== currentIdentity.current) return false;
        setData({
          ...next,
          items: next.items.map((item) =>
            item.id === 'lasete-ai'
              ? { ...item, url: next.settings.aiUrl }
              : item,
          ),
        });
        return true;
      } catch {
        // A multi-record action may have partially completed; reload the real state.
        if (startedAs === currentIdentity.current) setRevision((n) => n + 1);
        return false;
      } finally {
        saving.current = false;
      }
    },
    [data, isAdmin, loading, loadError],
  );
  return (
    <ContentContext.Provider
      value={{
        data: isAdmin
          ? data
          : { ...data, items: data.items.filter((i) => i.published) },
        save,
        loading,
        loadError,
        reload: () => setRevision((n) => n + 1),
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}
export const useContent = () => useContext(ContentContext);
export function usePublished(type: ContentType) {
  return useContent().data.items.filter((i) => i.type === type && i.published);
}
