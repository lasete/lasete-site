/*
THESIS: The league's tools introduce its private workspace: a Flipper Zero and HackRF bearing LASETE's emblem.
OWN-WORLD: Pure black stage, monochrome product photograph, white controls, a quiet graphite login frame.
STORY: Recognize the league, enter authorized credentials, reach the editorial workspace.
FIRST VIEWPORT: Compact brand/home header; large overlapping devices on the left and a complete login on the right.
FORM: User-pinned two-column reference; no social login, app badges, signup, link directory or page scroll at normal viewport sizes.
*/
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Brand, Emblem } from '@/components/shared/Brand';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/data/supabase';
import { useAuth } from '@/lib/data/auth';

export default function AdminAccess({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading, error: accessError, retry } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError('');
    try {
      const { error: failure } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (failure) {
        setError(
          failure.status === 429
            ? 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
            : failure.status === 400
              ? 'E-mail ou senha incorretos. Confira os dados e tente novamente.'
              : 'Não foi possível entrar. Confira sua conexão e tente novamente.',
        );
      } else setPassword('');
    } catch {
      setError(
        'Não foi possível conectar. Confira sua conexão e tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    if (!supabase) return;
    setBusy(true);
    setError('');
    try {
      const { error: failure } = await supabase.auth.signOut();
      if (failure) throw failure;
    } catch {
      setError('Não foi possível sair. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };
  if (isAdmin && !loading) return children;
  return (
    <main className="admin-access admin-access--hardware">
      <header className="access-header">
        <Link to="/" aria-label="LASETE · Voltar ao site">
          <Brand />
        </Link>
        <Link className="access-back" to="/">
          <ArrowLeft size={16} /> Voltar ao site
        </Link>
      </header>
      <div className="access-stage">
        <section
          className="access-identity"
          aria-label="Dispositivos da LASETE"
        >
          <img
            className="access-hardware"
            src="/images/admin-hardware.webp"
            alt="Composição de um Flipper Zero branco e um HackRF One preto, personalizados com o emblema da LASETE."
            width="1400"
            height="1400"
            fetchPriority="high"
            decoding="async"
          />
        </section>
        <section className="access-panel" aria-label="Acesso administrativo">
          <div className="access-device-top" aria-hidden="true">
            <span className="device-port" />
            <span className="device-port" />
            <span className="device-antenna" />
          </div>
          <div className="access-device-brand" aria-hidden="true">
            <span>LASETE</span>
            <span>HackRF One / PortaPack</span>
          </div>
          <div className="access-device-screws" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="access-form-wrap">
            <Emblem className="access-form-emblem" />
            <h1>
              {loading
                ? 'Conferindo seu acesso.'
                : session
                  ? 'Seu acesso à liga.'
                  : 'Entrar na LASETE'}
            </h1>
            <p className="access-intro">
              {loading
                ? 'Estamos verificando sua sessão e suas permissões.'
                : session
                  ? 'O painel está disponível para administradores autorizados pela LASETE.'
                  : 'Seu espaço para fazer a liga acontecer.'}
            </p>
            {loading ? (
              <div className="access-loading" role="status">
                <LoaderCircle className="admin-spinner" size={20} /> Verificando
                acesso…
              </div>
            ) : !supabase ? (
              <div className="access-message" role="alert">
                <strong>Login ainda não configurado</strong>
                <p>
                  Configure as variáveis do Supabase neste ambiente para acessar
                  o painel.
                </p>
              </div>
            ) : session ? (
              <div className="access-message">
                <strong>
                  {accessError
                    ? 'Não conseguimos verificar sua permissão'
                    : 'Esta conta ainda não tem permissão'}
                </strong>
                <p>
                  {accessError ||
                    'Peça à diretoria para autorizar sua conta como administradora.'}
                </p>
                <span className="access-account">{session.user.email}</span>
                {accessError && (
                  <Button onClick={retry}>Tentar novamente</Button>
                )}
                <Button variant="outline" disabled={busy} onClick={logout}>
                  <LogOut size={16} /> Sair e usar outra conta
                </Button>
              </div>
            ) : (
              <form className="access-form" onSubmit={login} aria-busy={busy}>
                <label className="admin-field">
                  <span>E-mail</span>
                  <input
                    type="email"
                    autoComplete="username"
                    placeholder="Seu e-mail de acesso"
                    required
                    value={email}
                    disabled={busy}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Senha</span>
                  <span className="access-password">
                    <input
                      type={visible ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      disabled={busy}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible((v) => !v)}
                      aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={visible}
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                {(error || accessError) && (
                  <p className="form-error" role="alert">
                    {error || accessError}
                  </p>
                )}
                <Button type="submit" disabled={busy}>
                  {busy ? (
                    <>
                      <LoaderCircle className="admin-spinner" size={18} />{' '}
                      Entrando…
                    </>
                  ) : (
                    <>
                      Entrar no painel <ArrowRight size={18} />
                    </>
                  )}
                </Button>
                <p className="access-restriction">
                  <LockKeyhole size={13} /> Acesso exclusivo à diretoria
                </p>
              </form>
            )}
            {session && error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="access-device-controls" aria-hidden="true">
            <div className="device-signal">
              <span />
              <span />
              <span />
              <small>SDR</small>
            </div>
            <div className="device-dial">
              <Emblem />
            </div>
            <div className="device-direction">
              <ChevronUp />
              <ChevronLeft />
              <ChevronRight />
              <ChevronDown />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
