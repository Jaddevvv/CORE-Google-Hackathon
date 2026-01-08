import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getProjectById,
  getBrandById,
  getQueriesByProjectId,
  getResultsByProjectId,
  getProjectAnalytics,
  getCompetitorsByBrandId
} from '../utils/db';

export default function DashboardOverviewPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project_id');

  const [project, setProject] = useState(null);
  const [brand, setBrand] = useState(null);
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (!projectId) {
      navigate('/app/dashboard');
      return;
    }

    // Load project data
    const proj = getProjectById(parseInt(projectId));
    if (!proj) {
      navigate('/app/dashboard');
      return;
    }
    setProject(proj);

    // Load brand
    const brandData = getBrandById(proj.brandId);
    setBrand(brandData);

    // Load queries
    const queriesData = getQueriesByProjectId(proj.id);
    setQueries(queriesData);

    // Load results
    const resultsData = getResultsByProjectId(proj.id);
    setResults(resultsData);

    // Load analytics
    const analyticsData = getProjectAnalytics(proj.id);
    setAnalytics(analyticsData);

    // Load competitors
    if (brandData) {
      const comps = getCompetitorsByBrandId(brandData.id);
      setCompetitors(comps);
    }

    // Generate insights
    if (analyticsData && resultsData.length > 0) {
      generateInsights(analyticsData, queriesData, resultsData);
    }
  }, [projectId, navigate]);

  const generateInsights = (analytics, queries, results) => {
    const insightsList = [];

    // Insight 1: Best/worst performing engine
    const engineMentions = {};
    results.forEach(r => {
      if (!engineMentions[r.llmEngine]) {
        engineMentions[r.llmEngine] = { total: 0, mentioned: 0 };
      }
      engineMentions[r.llmEngine].total++;
      if (r.analysis?.isBrandMentioned) {
        engineMentions[r.llmEngine].mentioned++;
      }
    });

    let bestEngine = null;
    let worstEngine = null;
    let bestRate = 0;
    let worstRate = 100;

    Object.entries(engineMentions).forEach(([engine, data]) => {
      const rate = (data.mentioned / data.total) * 100;
      if (rate > bestRate) {
        bestRate = rate;
        bestEngine = engine;
      }
      if (rate < worstRate) {
        worstRate = rate;
        worstEngine = engine;
      }
    });

    if (bestEngine && worstEngine && bestEngine !== worstEngine) {
      insightsList.push({
        icon: '📊',
        text: `You are most visible on ${bestEngine} (${Math.round(bestRate)}%) and least on ${worstEngine} (${Math.round(worstRate)}%)`
      });
    }

    // Insight 2: Branded queries performance
    const brandedQueries = queries.filter(q => q.type === 'branded');
    const brandedResults = results.filter(r => {
      const query = queries.find(q => q.id === r.queryId);
      return query && query.type === 'branded' && r.analysis?.isBrandMentioned;
    });
    const uniqueBrandedMentions = new Set(brandedResults.map(r => r.queryId)).size;

    if (brandedQueries.length > 0) {
      insightsList.push({
        icon: '🎯',
        text: `Your brand is mentioned in ${uniqueBrandedMentions}/${brandedQueries.length} branded queries`
      });
    }

    // Insight 3: Top competitor on category queries
    const categoryResults = results.filter(r => {
      const query = queries.find(q => q.id === r.queryId);
      return query && query.type === 'category';
    });

    const competitorCategoryMentions = {};
    categoryResults.forEach(r => {
      if (r.analysis?.mentionedCompetitors) {
        r.analysis.mentionedCompetitors.forEach(comp => {
          competitorCategoryMentions[comp] = (competitorCategoryMentions[comp] || 0) + 1;
        });
      }
    });

    const topCompetitor = Object.entries(competitorCategoryMentions)
      .sort((a, b) => b[1] - a[1])[0];

    if (topCompetitor) {
      insightsList.push({
        icon: '⚠️',
        text: `${topCompetitor[0]} appears more often in category queries (${topCompetitor[1]} mentions)`
      });
    }

    // Insight 4: Sentiment overview
    const sentiments = results
      .filter(r => r.analysis?.sentimentScore !== undefined)
      .map(r => r.analysis.sentimentScore);

    if (sentiments.length > 0) {
      const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
      const sentimentLabel = avgSentiment > 0.3 ? 'mostly positive' : avgSentiment < -0.3 ? 'mixed' : 'neutral';
      insightsList.push({
        icon: avgSentiment > 0 ? '😊' : '😐',
        text: `Overall sentiment toward your brand is ${sentimentLabel}`
      });
    }

    setInsights(insightsList.slice(0, 4));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!project || !brand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  const lastAnalysisDate = results.length > 0
    ? new Date(Math.max(...results.map(r => new Date(r.timestamp)))).toLocaleDateString()
    : 'No analysis yet';

  const enginesUsed = [...new Set(results.map(r => r.llmEngine))];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">CORE</div>
              <div className="text-xs text-gray-500">AI Visibility</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to={`/dashboard/overview?project_id=${projectId}`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Overview
          </Link>

          <Link
            to={`/dashboard/queries?project_id=${projectId}`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Queries
          </Link>

          <Link
            to={`/dashboard/competitors?project_id=${projectId}`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Competitors
          </Link>

          <Link
            to={`/dashboard/reports?project_id=${projectId}`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reports
          </Link>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-700 font-semibold text-sm">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Project Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {project.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700">
                      {brand.name.charAt(0)}
                    </span>
                    <span>{brand.name}</span>
                  </div>
                  <span>•</span>
                  <span>{brand.region}</span>
                  <span>•</span>
                  <span>{brand.language}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Last Analysis</div>
                <div className="text-lg font-semibold text-gray-900">{lastAnalysisDate}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {enginesUsed.length} engine{enginesUsed.length !== 1 ? 's' : ''} • {queries.length} queries
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Visibility Score */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Visibility Score
                </h3>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-1">
                {analytics?.visibilityScore || 0}
              </div>
              <div className="text-xs text-gray-500">
                Out of 100
              </div>
            </div>

            {/* Appearance Rate */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Appearance Rate
                </h3>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {analytics?.brandMentionRate || 0}%
              </div>
              <div className="text-xs text-gray-500">
                {queries.length} queries tracked
              </div>
            </div>

            {/* Share of Voice */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Share of Voice
                </h3>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-1">
                {Math.round((analytics?.brandMentionRate || 0) / (1 + competitors.length))}%
              </div>
              <div className="text-xs text-gray-500">
                vs {competitors.length} competitors
              </div>
            </div>

            {/* Average Sentiment */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Avg Sentiment
                </h3>
              </div>
              <div className="text-4xl font-bold text-amber-600 mb-1">
                {results.length > 0 ? '😊' : '—'}
              </div>
              <div className="text-xs text-gray-500">
                {results.length > 0 ? 'Positive' : 'No data'}
              </div>
            </div>
          </div>

          {/* Evolution Chart Placeholder */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Evolution Over Time
            </h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p className="text-sm text-gray-500">
                  Run more analyses to see trends over time
                </p>
              </div>
            </div>
          </div>

          {/* Top Insights */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Insights
              </h2>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                AI-Generated
              </span>
            </div>

            {insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-2xl">{insight.icon}</span>
                    <p className="text-sm text-gray-700 leading-relaxed pt-1">
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No insights available yet. Run an analysis to generate insights.</p>
            )}

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <Link
                to={`/dashboard/queries?project_id=${projectId}`}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-700 font-semibold hover:border-purple-300 hover:bg-purple-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Details by Query
              </Link>

              <Link
                to={`/dashboard/competitors?project_id=${projectId}`}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Explore Competitors
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
