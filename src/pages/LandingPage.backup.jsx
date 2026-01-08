import { Link } from 'react-router-dom';

const companies = [
  { name: 'OpenAI', logo: '/img/openai.png' },
  { name: 'Anthropic', logo: '/img/anthropic.png' },
  { name: 'Google Gemini', logo: '/img/gemini.png' },
  { name: 'Mistral', logo: '/img/mistral.png' },
  { name: 'DeepSeek', logo: '/img/deepseek.png' },
  { name: 'Perplexity', logo: '/img/perplexity.png' },
];

const features = [
  {
    title: 'Citation radar',
    accent: '+78% signal quality',
    description:
      'Aggregate and normalize branded citations across leading LLMs within minutes. Stay ahead of competitors the moment they surface.',
  },
  {
    title: 'Opportunity engine',
    accent: 'Live replacement ideas',
    description:
      'Pinpoint the exact prompts and verticals where competitors outrank you. Generate replacement briefs tailored to your content teams.',
  },
  {
    title: 'Proof of impact',
    accent: 'Weekly auto-reports',
    description:
      'Share beautiful attribution reports with leadership, partners, and customers. Export ready-to-share decks and CSVs on a schedule.',
  },
];

const process = [
  {
    heading: '01 • Calibrate your radar',
    body: 'Bring your priority keywords, brand pillars, and competitors. CORE maps your coverage across major LLM surfaces in a single scan.',
  },
  {
    heading: '02 • Uncover displacement plays',
    body: 'We highlight the exact answer sets where your expertise should win. Collaborate with growth, comms, and product teams in the same workspace.',
  },
  {
    heading: '03 • Activate and prove impact',
    body: 'Automated benchmarks track how fast you steal impressions back. Programmatic reports quantify revenue influence for every initiative.',
  },
];

const teamMembers = [
  {
    name: 'Avery Collins',
    role: 'Co-founder & CEO',
    bio: 'Former GTM leader at enterprise AI scale-ups. Obsessed with attribution that unlocks budget.',
  },
  {
    name: 'Jules Martínez',
    role: 'Co-founder & CTO',
    bio: 'Previously built knowledge graphs powering conversational AI. Loves clean data and clean UI.',
  },
  {
    name: 'Mira Chen',
    role: 'Head of Intelligence',
    bio: 'Led insights at a top search intelligence firm. Brings the prompts, methods, and rigor.',
  },
];

const faqs = [
  {
    question: 'How does CORE capture AI answers?',
    answer:
      'We orchestrate trusted prompts across leading LLM endpoints and emulate end-user experiences. Responses are normalized and scored against your taxonomy.',
  },
  {
    question: 'Can I integrate CORE with my analytics stack?',
    answer:
      'Yes. Connect your BI warehouse or export enriched CSVs. Webhooks ship opportunity data straight into the tools your teams already use.',
  },
  {
    question: 'Is there a way to try the product without a contract?',
    answer:
      'Run an ungated demo that scans a sample set of prompts. When you are ready, we tailor coverage and automations to your brand.',
  },
];

export default function LandingPage() {
  return (
    <div className="relative bg-white">
      <section className="border-b border-gray-200 relative overflow-hidden bg-white">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[600px] bg-purple-300/30 rounded-full blur-[120px] animate-blob" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 pb-40 pt-32 text-center sm:pb-48 sm:pt-36 relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-[10px] font-medium tracking-wide text-purple-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-600" />
            AI attribution, built for growth and comms teams
          </div>
          <h1 className="text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
            Increase your brand&apos;s attribution inside AI answers.
          </h1>
          <p className="max-w-2xl text-base text-gray-700 sm:text-lg">
            Run a radar across leading LLMs, measure citations, and uncover where you can replace competitor links with
            yours. Launch a live demo—no integrations required.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Launch the guided demo
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/templates"
              className="text-xs font-medium text-gray-700 underline-offset-8 transition hover:text-purple-600 hover:underline"
            >
              Explore enablement templates
            </Link>
          </div>
          <p className="text-xs text-gray-500">No signup • No code • No risk to your stack</p>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-purple-50/30 py-16 sm:py-20 relative overflow-hidden">
        <div className="mx-auto max-w-full px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 text-center mb-6">Powered by leading AI models</p>
          <div className="relative">
            {/* Gradient fade sur les bords */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-purple-50/30 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-50/30 to-transparent z-10 pointer-events-none" />
            
            <div className="flex min-w-max items-center gap-16 animate-marquee py-4">
              {[...companies, ...companies].map((company, index) => (
                <img
                  key={`${company.name}-${index}`}
                  src={company.logo}
                  alt={company.name}
                  className="h-8 w-auto opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-xl space-y-4">
            <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Position your brand inside AI answers.</h2>
            <p className="text-base text-gray-700">
              From monitoring to activation, CORE compresses your AI attribution workflow into a collaborative product.
              Every feature is built so growth teams can move faster with confidence.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-purple-50/30 p-8 transition hover:border-purple-300 hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">{feature.accent}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-purple-50/30 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:flex-row md:items-center">
          <div className="md:w-1/2 flex items-center justify-center">
            <img
              src="/img/logo-noir.png"
              alt="CORE"
              className="w-full max-w-lg h-auto opacity-30"
            />
          </div>
          <div className="md:w-1/2">
            <p className="text-xs uppercase tracking-[0.4em] text-purple-600">Live workspace</p>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-4xl">
              From prompt-level insights to executive-ready proof.
            </h2>
            <ul className="mt-8 space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-600" />
                <span>Slice coverage by topic, geography, or channel in seconds.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-600" />
                <span>Write-back suggested replacements directly to content teams.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-600" />
                <span>Trigger updates when share-of-answer shifts in your favor.</span>
              </li>
            </ul>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-purple-300 px-5 py-3 text-sm font-semibold text-purple-700 transition hover:border-purple-600 hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Dive into the dashboard
              </Link>
              <a
                href="mailto:hello@core.ai"
                className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-gray-700 underline-offset-8 transition hover:text-purple-600 hover:underline"
              >
                Talk to an analyst →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-purple-50/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-3 md:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-purple-600">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold text-gray-900">Put AI attribution on autopilot.</h2>
              <p className="mt-4 max-w-sm text-sm text-gray-700">
                Collaborate with cross-functional teams, keep leadership aligned, and shift share faster with a tight
                workflow from insight to proof.
              </p>
            </div>
            <div className="md:col-span-2">
              <ol className="space-y-6">
                {process.map((step) => (
                  <li
                    key={step.heading}
                    className="rounded-3xl border border-gray-200 bg-white p-6 transition hover:border-purple-300 hover:shadow-md"
                  >
                    <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">{step.heading}</p>
                    <p className="mt-4 text-sm leading-relaxed text-gray-700">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-purple-50/30 p-8 transition hover:border-purple-300 hover:shadow-md">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-600">Customers</p>
              <blockquote className="mt-6 space-y-6">
                <p className="text-2xl font-medium leading-relaxed text-gray-900">
                  "CORE helped us move from vague 'LLM visibility' conversations to quantifiable revenue conversations in
                  under a month. We now show up where buying journeys actually start."
                </p>
                <footer className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Harper Singh</span> · VP Growth, Flux Analytics
                </footer>
              </blockquote>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-purple-50/30 p-8 transition hover:border-purple-300 hover:shadow-md">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-600">FAQ</p>
              <div className="mt-6 space-y-6">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-purple-50/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-purple-600">Team</p>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">Operators who have lived the attribution gap.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="rounded-3xl border border-gray-200 bg-white p-6 text-center transition hover:border-purple-300 hover:shadow-md"
              >
                <p className="text-xl font-semibold text-gray-900">{member.name}</p>
                <p className="mt-1 text-sm text-purple-600">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl rounded-[36px] border border-purple-200 bg-gradient-to-br from-purple-100 via-white to-purple-50/30 px-6 py-16 text-center shadow-md sm:px-12">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-700">Ready to reclaim your answers?</p>
          <h2 className="mt-6 text-3xl font-semibold text-gray-900 sm:text-4xl">
            Launch a live CORE radar in under five minutes.
          </h2>
          <p className="mt-4 text-sm text-gray-700">
            Bring a list of prompts or keywords. We will surface coverage, opportunities, and proof instantly.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Create workspace
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </Link>
            <a
              href="mailto:hello@core.ai"
              className="text-sm font-medium text-gray-700 underline-offset-8 transition hover:text-purple-600 hover:underline"
            >
              Book an analyst call
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
