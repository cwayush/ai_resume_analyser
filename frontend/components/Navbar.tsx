'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, History, Target } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { href: '/', label: 'Analyze', Icon: Zap },
    { href: '/history', label: 'History', Icon: History },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: 'rgba(240,237,232,0.92)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #c9972b, #f0c860)',
              boxShadow: '0 2px 8px rgba(201,151,43,0.35)',
            }}
          >
            <Target size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span
            className="font-bold text-sm tracking-tight"
            style={{ color: 'var(--color-ink-900)' }}
          >
            Resume<span style={{ color: 'var(--color-gold)' }}>IQ</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, Icon }) => {
            const active =
              pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #c9972b, #f0c860)',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(201,151,43,0.3)',
                      }
                    : {
                        color: 'var(--color-ink-500)',
                        background: 'transparent',
                      }
                }
              >
                <Icon size={11} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status badge */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0"
          style={{
            background: 'var(--color-gold-bg)',
            border: '1px solid rgba(201,151,43,0.3)',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#16a34a',
              boxShadow: '0 0 5px rgba(22,163,74,0.6)',
            }}
          />
          <span
            className="text-[10px] font-semibold tracking-wider"
            style={{ color: 'var(--color-gold-deep)' }}
          >
            ATS v2.0
          </span>
        </div>
      </div>
    </header>
  );
}
