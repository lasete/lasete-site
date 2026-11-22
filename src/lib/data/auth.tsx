import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthState = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  error: string;
  retry: () => void;
};
const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  isAdmin: false,
  error: '',
  retry: () => {},
});
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [isAdmin, setAdmin] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    let generation = 0;
    let verifiedUser: string | null | undefined;
    const check = async (next: Session | null) => {
      const run = ++generation;
      const background = !!next && verifiedUser === next.user.id;
      setSession(next);
      if (!background) setAdmin(false);
      setError('');
      if (!background) setLoading(!!next);
      if (!next) {
        verifiedUser = null;
        return;
      }
      try {
        const { data, error: failure } = await client
          .from('lasete_admins')
          .select('user_id')
          .eq('user_id', next.user.id)
          .maybeSingle();
        if (!active || generation !== run) return;
        if (failure) throw failure;
        verifiedUser = next.user.id;
        setAdmin(!!data);
      } catch {
        if (active && generation === run) {
          verifiedUser = undefined;
          setAdmin(false);
          setError(
            'Não foi possível verificar seu acesso. Confira sua conexão e tente novamente.',
          );
        }
      } finally {
        if (active && generation === run) setLoading(false);
      }
    };
    // Keep database calls outside the auth callback to avoid holding the auth lock.
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      if (!next || verifiedUser !== next.user.id) {
        setAdmin(false);
        setLoading(!!next);
      }
      setSession(next);
      queueMicrotask(() => {
        if (active) void check(next);
      });
    });
    void client.auth.getSession().then(({ data, error: failure }) => {
      if (!active || generation) return;
      if (failure) {
        setError('Não foi possível recuperar sua sessão. Tente novamente.');
        setLoading(false);
      } else void check(data.session);
    });
    return () => {
      active = false;
      generation++;
      subscription.unsubscribe();
    };
  }, [attempt]);
  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isAdmin,
        error,
        retry: () => setAttempt((x) => x + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
