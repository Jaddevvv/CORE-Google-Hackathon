export default function PrivacyPage() {
  return (
    <div className="bg-slate-950 pb-20 pt-16">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-semibold text-slate-50">Privacy policy</h1>
        <p className="mt-4 text-sm text-slate-400">
          We take the security of your data seriously. This lightweight overview summarizes how SOAR collects, stores,
          and uses information. Customize the content to match your organization’s policies before going live.
        </p>
        <div className="mt-8 space-y-6 text-sm text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-slate-100">Data we process</h2>
            <p className="mt-2">
              We store account information such as name, email, and company details that you provide. Optional telemetry
              data helps us improve the product and can be disabled anytime.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-100">How we use data</h2>
            <p className="mt-2">
              Data is used to deliver and improve the SOAR service, personalize experiences, and communicate updates.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-100">Your controls</h2>
            <p className="mt-2">
              You can request data deletion, export, or updates by contacting{' '}
              <a href="mailto:privacy@soar.ai" className="text-accent hover:text-accent-soft">
                privacy@soar.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
