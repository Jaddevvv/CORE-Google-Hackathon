export default function TermsPage() {
  return (
    <div className="bg-slate-950 pb-20 pt-16">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-semibold text-slate-50">Terms of service</h1>
        <p className="mt-4 text-sm text-slate-400">
          These draft terms outline how customers can access and use SOAR. Replace this copy with approved legal
          language before launch.
        </p>
        <div className="mt-8 space-y-6 text-sm text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-slate-100">Acceptable use</h2>
            <p className="mt-2">
              SOAR may only be used for lawful purposes. You are responsible for account activity and maintaining the
              confidentiality of your credentials.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-100">Subscriptions</h2>
            <p className="mt-2">
              Access is billed monthly or annually. Trials may be terminated at any time if misuse is detected.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-100">Liability</h2>
            <p className="mt-2">
              SOAR is provided without warranties. Our liability is limited to the amount you have paid for the service
              in the preceding 12 months.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
