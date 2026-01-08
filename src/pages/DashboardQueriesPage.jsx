import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getProjectById,
  getBrandById,
  getQueriesByProjectId,
  getResultsByProjectId
} from '../utils/db';

export default function DashboardQueriesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project_id');

  const [project, setProject] = useState(null);
  const [brand, setBrand] = useState(null);
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedQuery, setExpandedQuery] = useState(null);

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
  }, [projectId, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredQueries = filter === 'all'
    ? queries
    : queries.filter(q => q.type === filter);

  const getResultsForQuery = (queryId) => {
    return results.filter(r => r.queryId === queryId);
  };

  const getQueryStats = (queryId) => {
    const queryResults = getResultsForQuery(queryId);
    const totalEngines = queryResults.length;
    const mentionCount = queryResults.filter(r => r.analysis?.isBrandMentioned).length;
    const avgSentiment = queryResults
      .filter(r => r.analysis?.sentimentScore !== undefined)
      .reduce((sum, r, _, arr) => sum + r.analysis.sentimentScore / arr.length, 0);

    return {
      totalEngines,
      mentionCount,
      mentionRate: totalEngines > 0 ? Math.round((mentionCount / totalEngines) * 100) : 0,
      avgSentiment: isNaN(avgSentiment) ? 0 : avgSentiment
    };
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'branded':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'category':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'comparative':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'branded':
        return 'Branded';
      case 'category':
        return 'Category';
      case 'comparative':
        return 'Comparative';
      default:
        return 'General';
    }
  };

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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 font-medium"
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Queries Analysis
              </h1>
              <p className="text-sm text-gray-600">
                {filteredQueries.length} of {queries.length} queries
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                All ({queries.length})
              </button>
              <button
                onClick={() => setFilter('branded')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'branded'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Branded ({queries.filter(q => q.type === 'branded').length})
              </button>
              <button
                onClick={() => setFilter('category')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'category'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Category ({queries.filter(q => q.type === 'category').length})
              </button>
              <button
                onClick={() => setFilter('comparative')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'comparative'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Comparative ({queries.filter(q => q.type === 'comparative').length})
              </button>
            </div>
          </div>

          {/* Queries List */}
          <div className="space-y-4">
            {filteredQueries.map((query) => {
              const stats = getQueryStats(query.id);
              const queryResults = getResultsForQuery(query.id);
              const isExpanded = expandedQuery === query.id;

              return (
                <div key={query.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Query Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpandedQuery(isExpanded ? null : query.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(query.type)}`}>
                            {getTypeLabel(query.type)}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">{query.queryText}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg
                          className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Engines:</span>
                        <span className="font-semibold text-gray-900">{stats.totalEngines}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Mentions:</span>
                        <span className="font-semibold text-gray-900">
                          {stats.mentionCount}/{stats.totalEngines} ({stats.mentionRate}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Sentiment:</span>
                        <span className="font-semibold text-gray-900">
                          {stats.avgSentiment > 0 ? '😊 Positive' : stats.avgSentiment < 0 ? '😐 Negative' : '😶 Neutral'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Results */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6 space-y-4">
                        {queryResults.map((result) => (
                          <div key={result.id} className="bg-white rounded-xl border border-gray-200 p-5">
                            {/* Engine Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <span className="text-purple-700 font-semibold text-sm">
                                    {result.llmEngine.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{result.llmEngine}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(result.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              {result.analysis?.isBrandMentioned ? (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                  ✓ Mentioned
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                  Not Mentioned
                                </span>
                              )}
                            </div>

                            {/* Response Text */}
                            <div className="mb-4">
                              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                                {result.responseText}
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              {result.analysis?.citedUrls && result.analysis.citedUrls.length > 0 && (
                                <div>
                                  <div className="text-gray-500 mb-1">Cited URLs:</div>
                                  <div className="font-medium text-gray-900">
                                    {result.analysis.citedUrls.length} link{result.analysis.citedUrls.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              )}

                              {result.analysis?.rankPosition && (
                                <div>
                                  <div className="text-gray-500 mb-1">Rank Position:</div>
                                  <div className="font-medium text-gray-900">
                                    #{result.analysis.rankPosition}
                                  </div>
                                </div>
                              )}

                              {result.analysis?.sentimentScore !== undefined && (
                                <div>
                                  <div className="text-gray-500 mb-1">Sentiment:</div>
                                  <div className="font-medium text-gray-900">
                                    {result.analysis.sentimentScore > 0 ? 'Positive' : result.analysis.sentimentScore < 0 ? 'Negative' : 'Neutral'}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Cited URLs List */}
                            {result.analysis?.citedUrls && result.analysis.citedUrls.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-2">Referenced Sources:</div>
                                <div className="space-y-1">
                                  {result.analysis.citedUrls.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-xs text-purple-600 hover:text-purple-700 hover:underline truncate"
                                    >
                                      {url}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredQueries.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No queries found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
