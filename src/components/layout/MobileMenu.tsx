import type { RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu } from 'lucide-react';
import { useContent } from '@/lib/data/content';
import { useReducedMotion } from '@/lib/preferences';
import { Brand } from '@/components/shared/Brand';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { navItems } from './navigation';

// Menu em tela cheia que substitui o menu do cabeçalho em telas menores.
export function MobileMenu({
  open,
  onOpenChange,
  desktop,
  brandLink,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  desktop: boolean;
  brandLink: RefObject<HTMLAnchorElement | null>;
}) {
  const { data } = useContent();
  const reduced = useReducedMotion();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="menu-trigger" aria-label="Abrir menu">
          <Menu size={24} />
        </button>
      </DialogTrigger>
      <DialogContent
        className="mobile-navigation"
        onCloseAutoFocus={(event) => {
          if (desktop) {
            event.preventDefault();
            brandLink.current?.focus();
          }
        }}
      >
        <DialogTitle className="sr-only">Explore a LASETE</DialogTitle>
        <DialogDescription className="sr-only">
          Navegue pelas páginas da liga.
        </DialogDescription>
        <Brand />
        <div className="mobile-menu-intro">
          <span>Navegue pela LASETE</span>
        </div>
        <motion.nav
          initial={reduced ? false : { y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.18 }}
          aria-label="Navegação móvel"
        >
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </motion.nav>
        {data.settings.email && (
          <a className="mobile-contact" href={`mailto:${data.settings.email}`}>
            {data.settings.email}
          </a>
        )}
        <p>
          Liga Acadêmica de Segurança
          <br />e Tecnologias Emergentes
        </p>
      </DialogContent>
    </Dialog>
  );
}
