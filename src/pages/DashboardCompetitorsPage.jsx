import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getProjectById,
  getBrandById,
  getQueriesByProjectId,
  getResultsByProjectId,
  getCompetitorsByBrandId
} from '../utils/db';

export default function DashboardCompetitorsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project_id');

  const [project, setProject] = useState(null);
  const [brand, setBrand] = useState(null);
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [competitorStats, setCompetitorStats] = useState({});

  useEffect(() => {
    if (!projectId) {
      navigate('/app/dashboard');
      return;
    }

    const proj = getProjectById(parseInt(projectId));
    if (!proj) {
      navigate('/app/dashboard');
      return;
    }
    setProject(proj);

    const brandData = getBrandById(proj.brandId);
    setBrand(brandData);

    const queriesData = getQueriesByProjectId(proj.id);
    setQueries(queriesData);

    const resultsData = getResultsByProjectId(proj.id);
    setResults(resultsData);

    if (brandData) {
      const comps = getCompetitorsByBrandId(brandData.id);
      setCompetitors(comps);

      // Calculate stats for each competitor
      const stats = {};
      comps.forEach(comp => {
        const mentions = resultsData.filter(r =>
          r.analysis?.mentionedCompetitors?.includes(comp.name)
        );

        const categoryMentions = mentions.filter(r => {
          const query = queriesData.find(q => q.id === r.queryId);
          return query && query.type === 'category';
        });

        const comparativeMentions = mentions.filter(r => {
          const query = queriesData.find(q => q.id === r.queryId);
          return query && query.type === 'comparative';
        });

        stats[comp.name] = {
          totalMentions: mentions.length,
          categoryMentions: categoryMentions.length,
          comparativeMentions: comparativeMentions.length,
          mentionRate: resultsData.length > 0 ? Math.round((mentions.length / resultsData.length) * 100) : 0
        };
      });

      setCompetitorStats(stats);
    }
  }, [projectId, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate brand's own stats
  const brandMentions = results.filter(r => r.analysis?.isBrandMentioned).length;
  const brandMentionRate = results.length > 0 ? Math.round((brandMentions / results.length) * 100) : 0;

  // Calculate Share of Voice
  const totalMentions = brandMentions + Object.values(competitorStats).reduce((sum, stat) => sum + stat.totalMentions, 0);
  const brandSOV = totalMentions > 0 ? Math.round((brandMentions / totalMentions) * 100) : 0;

  if (!project || !brand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
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

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to={`/dashboard/overview?project_id=${projectId}`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 font-medium"
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Competitor Analysis
            </h1>
            <p className="text-sm text-gray-600">
              Tracking {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} across {results.length} responses
            </p>
          </div>

          {/* Share of Voice Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Share of Voice
            </h2>

            {/* Your Brand */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-700 font-semibold text-sm">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{brand.name}</div>
                    <div className="text-xs text-gray-500">Your Brand</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{brandSOV}%</div>
                  <div className="text-xs text-gray-500">{brandMentions} mentions</div>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{ width: `${brandSOV}%` }}
                />
              </div>
            </div>

            {/* Competitors List */}
            <div className="space-y-4">
              {competitors
                .sort((a, b) => (competitorStats[b.name]?.totalMentions || 0) - (competitorStats[a.name]?.totalMentions || 0))
                .map((competitor) => {
                  const stats = competitorStats[competitor.name] || { totalMentions: 0, mentionRate: 0 };
                  const sov = totalMentions > 0 ? Math.round((stats.totalMentions / totalMentions) * 100) : 0;

                  return (
                    <div key={competitor.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-700 font-semibold text-sm">
                              {competitor.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{competitor.name}</div>
                            {competitor.website && (
                              <a
                                href={competitor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {competitor.website}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{sov}%</div>
                          <div className="text-xs text-gray-500">{stats.totalMentions} mentions</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gray-400 rounded-full transition-all"
                          style={{ width: `${sov}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Detailed Competitor Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitors.map((competitor) => {
              const stats = competitorStats[competitor.name] || {
                totalMentions: 0,
                categoryMentions: 0,
                comparativeMentions: 0,
                mentionRate: 0
              };

              return (
                <div key={competitor.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                  {/* Competitor Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-700 font-bold text-lg">
                        {competitor.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                        {competitor.name}
                      </h3>
                      {competitor.website && (
                        <a
                          href={competitor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 hover:underline truncate block"
                        >
                          {competitor.website}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Total Mentions</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalMentions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Mention Rate</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.mentionRate}%</div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category Queries</span>
                      <span className="font-semibold text-gray-900">{stats.categoryMentions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Comparative Queries</span>
                      <span className="font-semibold text-gray-900">{stats.comparativeMentions}</span>
                    </div>
                  </div>

                  {/* Description if available */}
                  {competitor.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {competitor.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {competitors.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No competitors configured for this brand.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
