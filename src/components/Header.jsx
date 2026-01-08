import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { primaryNav, secondaryNav } from '../data/navigation.js';

const navLinkClasses =
  'px-3 py-2 text-sm font-medium transition hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderLink = (entry, index) => (
    <NavLink
      key={`${entry.label}-${index}`}
      to={entry.to}
      className={({ isActive }) =>
        [
          navLinkClasses,
          isActive ? 'text-purple-600' : 'text-gray-700',
        ].join(' ')
      }
      onClick={() => setMobileOpen(false)}
    >
      {entry.label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-2">
        <Link to="/" className="flex items-center gap-2">
          <img src="/img/logo-noir.png" alt="Logo" className="h-16 rounded-xl shadow-soft" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {primaryNav.map(renderLink)}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink
            to={secondaryNav[0].to}
            className={({ isActive }) =>
              [
                'rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition',
                isActive ? 'border-purple-600 text-purple-600' : 'text-gray-700 hover:border-purple-600 hover:text-purple-600',
              ].join(' ')
            }
          >
            {secondaryNav[0].label}
          </NavLink>
          <Link
            to={secondaryNav[1].to}
            className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {secondaryNav[1].label}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-purple-600 hover:text-purple-600 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4">
            {primaryNav.map(renderLink)}
            <div className="mt-3 flex flex-col gap-2">
              {secondaryNav.map((entry, index) => (
                <Link
                  key={entry.to}
                  to={entry.to}
                  className={
                    index === 1
                      ? 'rounded-full bg-purple-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-purple-700'
                      : 'rounded-full border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:border-purple-600 hover:text-purple-600'
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {entry.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
