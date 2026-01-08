import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center bg-slate-950 px-4 py-16 text-center">
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/70 px-10 py-12 shadow-soft">
        <p className="text-xs uppercase tracking-[0.4em] text-accent">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-50">We couldn&apos;t find that page</h1>
        <p className="mt-3 text-sm text-slate-400">
          The link you followed may be broken or the page might have been removed.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Back to home
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-accent hover:text-accent"
          >
            Launch demo
          </Link>
        </div>
      </div>
    </div>
  );
}
