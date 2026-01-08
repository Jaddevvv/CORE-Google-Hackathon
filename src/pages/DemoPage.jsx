import { Link } from 'react-router-dom';

const demoSteps = [
  {
    title: 'Choose your prompts',
    description:
      'Select from curated prompt packs or drop in your own. We instantly generate test runs across each AI channel.',
  },
  {
    title: 'Review the answer sets',
    description:
      'Inspect how each LLM references your brand. Toggle context modes, sources, and follow-ups to see deeper coverage.',
  },
  {
    title: 'Prioritize opportunities',
    description:
      'CORE assigns a displacement score and recommended action. Share a link or push directly into your task manager.',
  },
];

const highlights = [
  'Zero setup — runs in the browser using demo datasets.',
  'Live benchmark of your brand vs. two competitors.',
  'Ability to download a branded insights PDF at the end.',
  'See opportunity scoring, alerts, and report automation in action.',
];

export default function DemoPage() {
  return (
    <div className="border-b border-gray-200 bg-white pb-20 pt-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700">
            Guided experience
          </p>
          <h1 className="mt-6 text-4xl font-light text-gray-900 tracking-tight leading-tight">Preview <span className="text-purple-600 font-medium">CORE</span> without touching your stack.</h1>
          <p className="mt-4 text-base text-gray-600 font-light leading-relaxed">
            The interactive demo mirrors the full workspace. Follow the checklist and experience the <span className="font-medium text-gray-900">radar</span>, <span className="font-medium text-gray-900">opportunity
            engine</span>, and <span className="font-medium text-gray-900">proof workflows</span> end to end.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {demoSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-gray-200 bg-purple-50/30 p-6 transition hover:border-purple-300 hover:shadow-md"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
                Step {index + 1}
              </p>
              <h3 className="mt-3 text-xl font-light text-gray-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 font-light">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[32px] border border-gray-200 bg-purple-50/30 p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-purple-600">What&apos;s inside</p>
              <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight">See where your brand is <span className="text-purple-600 font-medium">missing</span> from AI answers.</h2>
              <ul className="mt-6 space-y-4 text-sm text-gray-700 font-light">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] border border-purple-200 bg-gradient-to-br from-purple-100 via-white to-purple-50 p-8 text-sm text-gray-700 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-600">Demo timeline</p>
              <ul className="mt-6 space-y-4 font-light">
                <li>
                  <p className="font-medium text-gray-900">Step 1 — Define your brand</p>
                  <p className="text-gray-600">Enter your brand name to start the analysis.</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">Step 2 — Add competitors</p>
                  <p className="text-gray-600">List the competitors you want to benchmark against.</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">Step 3 — Select questions</p>
                  <p className="text-gray-600">Choose the prompts to test across AI models.</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">Step 4 — Choose AI models</p>
                  <p className="text-gray-600">Pick up to 3 LLMs for comparison analysis.</p>
                </li>
                <li>
                  <p className="font-medium text-gray-900">Step 5 — View results</p>
                  <p className="text-gray-600">Compare brand visibility and download your report.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
          <Link
            to="/demo/interactive"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Start Interactive Demo
          </Link>
          <p className="text-xs text-gray-500">No credit card • Switch to production when you are ready</p>
        </div>
      </div>
    </div>
  );
}
