import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useContent } from '@/lib/data/content';
import { useMediaQuery } from '@/lib/preferences';
import { usePointerHighlight } from '@/lib/pointer-highlight';
import { safeUrl } from '@/lib/utils';
import { Brand } from '@/components/shared/Brand';
import { Button } from '../ui/button';
import { MobileMenu } from './MobileMenu';
import { navItems } from './navigation';

// Barra superior: logo, menu, botão LASETE AI e o menu móvel.
export function Header() {
  usePointerHighlight('.site-header');
  const { data } = useContent();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const desktop = useMediaQuery('(min-width: 1171px)');
  const brandLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (desktop) setOpen(false);
  }, [desktop]);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);
  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        <Link ref={brandLink} to="/" aria-label="LASETE — início">
          <Brand />
        </Link>
        <nav className="desktop-nav" aria-label="Principal">
          {navItems.map((item) => (
            <NavLink key={item.to} end={item.to === '/'} to={item.to}>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          {safeUrl(data.settings.aiUrl) && (
            <Button asChild size="sm" className="ai-nav">
              <a
                href={safeUrl(data.settings.aiUrl)}
                target="_blank"
                rel="noreferrer"
              >
                LASETE AI
              </a>
            </Button>
          )}
          <MobileMenu
            open={open}
            onOpenChange={setOpen}
            desktop={desktop}
            brandLink={brandLink}
          />
        </div>
      </div>
    </header>
  );
}
