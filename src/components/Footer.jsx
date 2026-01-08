import { Link } from 'react-router-dom';
import { primaryNav } from '../data/navigation.js';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-purple-200 bg-gradient-to-br from-purple-100 via-purple-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img src="/img/logo-noir.png" alt="CORE" className="h-10 w-auto" />
              <div className="text-left">
                <p className="text-base font-semibold text-gray-900">CORE</p>
                <p className="text-xs text-gray-700">AI attribution that favors your brand.</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-gray-700">
              We help growth, product, and comms teams monitor how AI surfaces their brand and deliver the proof they
              need to shift market share.
            </p>
          </div>
          <nav className="text-sm text-gray-700 md:col-span-2 md:grid md:grid-cols-2 md:gap-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-gray-600">Product</p>
              <ul className="space-y-2">
                {primaryNav.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="transition hover:text-purple-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 space-y-3 md:mt-0">
              <p className="text-xs uppercase tracking-widest text-gray-600">Need help?</p>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:hello@core.ai" className="transition hover:text-purple-600">
                    hello@core.ai
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com" className="transition hover:text-purple-600">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://www.x.com" className="transition hover:text-purple-600">
                    X (Twitter)
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-purple-200 pt-6 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} CORE Labs. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/legal/privacy" className="transition hover:text-purple-600">
              Privacy
            </Link>
            <Link to="/legal/terms" className="transition hover:text-purple-600">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
