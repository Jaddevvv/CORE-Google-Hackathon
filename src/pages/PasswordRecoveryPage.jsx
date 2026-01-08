import { Link } from 'react-router-dom';

export default function PasswordRecoveryPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-slate-950 px-4 py-16">
      <div className="w-full max-w-lg rounded-[32px] border border-slate-800 bg-slate-900/70 p-10 shadow-soft">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">Reset password</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-50">Let’s get you back in</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter the email address connected to your SOAR workspace. We will send you a secure link to reset your
            password.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="recoveryEmail" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Work email
            </label>
            <input
              id="recoveryEmail"
              type="email"
              placeholder="you@company.com"
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link className="font-semibold text-accent hover:text-accent-soft" to="/auth/signin">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
