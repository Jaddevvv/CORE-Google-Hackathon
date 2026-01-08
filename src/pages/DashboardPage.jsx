import { Link } from 'react-router-dom';

const dashboardModules = [
  {
    name: 'Overview',
    title: 'Monitor Your AI Visibility',
    description: 'Track your brand presence across AI models in real-time. Get instant insights into how often your brand appears in AI responses.',
    image: '/img/Dash_Overview.jpg',
    features: [
      'Real-time visibility tracking across multiple LLMs',
      'Brand vs competitor mention comparison',
      'Historical trend analysis and performance metrics',
    ],
  },
  {
    name: 'Queries',
    title: 'Analyze Question Performance',
    description: 'Deep dive into which questions trigger brand mentions. Understand the context where your brand appears or is missing.',
    image: '/img/Dash_Queries.jpg',
    features: [
      'Question-by-question breakdown with citation status',
      'Filter by model, brand, and citation presence',
      'Full AI response analysis for each query',
    ],
  },
  {
    name: 'Opportunities',
    title: 'Identify Growth Areas',
    description: 'Discover where competitors are mentioned instead of you. Prioritize opportunities to improve your AI attribution.',
    image: '/img/Dash_Opportunity.jpg',
    features: [
      'Competitor displacement opportunities scored',
      'Gap analysis showing where you are missing',
      'Actionable recommendations for content strategy',
    ],
  },
  {
    name: 'Reports',
    title: 'Share Insights Instantly',
    description: 'Generate branded PDF reports for stakeholders. Export data and prove ROI with executive-ready documentation.',
    image: '/img/Dash_Reports.jpg',
    features: [
      'Branded PDF reports with your logo and colors',
      'Comprehensive analysis with charts and tables',
      'One-click download and sharing capabilities',
    ],
  },
];

const stats = [
  { 
    label: 'Models Analyzed', 
    value: 'OpenAI, Gemini, DeepSeek & more',
    sublabel: 'Multi-model comparison'
  },
  { 
    label: 'Real-Time Tracking', 
    value: 'Live Visibility Metrics',
    sublabel: 'Brand vs competitor mentions'
  },
  { 
    label: 'Export Ready', 
    value: 'Branded PDF Reports',
    sublabel: 'Executive summaries'
  },
];

export default function DashboardPage() {
  return (
    <div className="bg-gray-50 pb-20 pt-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700 mb-6">
            Product Overview
          </div>
          <h1 className="text-5xl font-light text-gray-900 tracking-tight leading-tight mb-4">
            Your AI Attribution <span className="text-purple-600 font-medium">Command Center</span>
          </h1>
          <p className="text-lg text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
            CORE centralizes how marketing, growth, and communications teams monitor, analyze, and prove their brand coverage inside AI answers. Explore the core modules below.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-purple-200 bg-white p-8 shadow-sm hover:shadow-md transition"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-purple-600 mb-2">
                {stat.label}
              </p>
              <p className="text-xl font-medium text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 font-light">{stat.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Modules */}
        <div className="space-y-20">
          {dashboardModules.map((module, index) => (
            <div
              key={module.name}
              className={`grid gap-10 md:grid-cols-2 md:items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 mb-4">
                  {module.name}
                </div>
                <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight mb-4">
                  {module.title}
                </h2>
                <p className="text-base text-gray-600 font-light leading-relaxed mb-6">
                  {module.description}
                </p>
                <ul className="space-y-3">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600 flex-shrink-0">
                        ✓
                      </span>
                      <span className="font-light">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-lg hover:shadow-xl transition">
                  <img
                    src={module.image}
                    alt={`${module.name} dashboard screenshot`}
                    className="w-full rounded-2xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 rounded-[32px] border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50 p-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-purple-600 mb-4">
            Next Step
          </p>
          <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight mb-6">
            Ready to make AI attribution your <span className="text-purple-600 font-medium">unfair advantage</span>?
          </h2>
          <p className="text-base text-gray-600 font-light mb-8 max-w-2xl mx-auto">
            Start analyzing your brand visibility across AI models in minutes. No credit card required.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/demo/interactive"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
            >
              Launch Interactive Demo
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full border-2 border-purple-600 px-8 py-4 text-sm font-semibold text-purple-600 transition hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
            >
              Start Free Trial
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-500 font-light">
            No signup required for demo · Full access in under 60 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
