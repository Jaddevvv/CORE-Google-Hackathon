import { useState, useEffect } from 'react';
import { analyzeQuestionsAcrossModels, getAllModels } from '../../services/llmService';

export default function AnalysisStep({ data, onComplete }) {
  const [progress, setProgress] = useState({ current: 0, total: 0, currentQuestion: '' });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const allModels = getAllModels();
  const selectedModels = allModels.filter(m => data.selectedModels.includes(m.id));

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setIsAnalyzing(true);
        setError(null);

        const analysisResults = await analyzeQuestionsAcrossModels(
          data.selectedModels,
          data.questions,
          data.brandName,
          data.competitors,
          (progressData) => {
            setProgress(progressData);
          }
        );

        setResults(analysisResults);
        setIsAnalyzing(false);
        
        // Auto-advance after 1.5 seconds
        setTimeout(() => {
          onComplete({ analysisResults });
        }, 1500);
      } catch (err) {
        console.error('Analysis error:', err);
        setError(err.message || 'An error occurred during analysis');
        setIsAnalyzing(false);
      }
    };

    runAnalysis();
  }, [data, onComplete]);

  const progressPercentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700 mb-4">
          Step 5 of 5
        </div>
        <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight mb-3">
          {isAnalyzing ? 'Analyzing' : 'Analysis Complete'} <span className="text-purple-600 font-medium">AI Responses</span>
        </h2>
        <p className="text-gray-600 font-light leading-relaxed">
          {isAnalyzing 
            ? 'Querying multiple LLMs in parallel and tracking brand mentions...'
            : 'Your analysis is ready! Generating detailed results...'}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-3xl border-2 border-red-300 bg-red-50 p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900 mb-1">Analysis Error</p>
              <p className="text-sm text-red-700 font-light">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Card */}
      <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-white to-purple-50 p-8 shadow-lg">
        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">Overall Progress</span>
            <span className="text-sm font-semibold text-purple-600">{progressPercentage}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              {isAnalyzing && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" 
                     style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }}></div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600 font-light text-center">
            {progress.current} of {progress.total} questions analyzed
          </div>
        </div>

        {/* Current Question */}
        {isAnalyzing && progress.currentQuestion && (
          <div className="mb-8 rounded-2xl border border-purple-200 bg-white p-4">
            <p className="text-xs font-medium text-purple-600 mb-2">Currently analyzing:</p>
            <p className="text-sm text-gray-700 font-light italic">"{progress.currentQuestion}"</p>
          </div>
        )}

        {/* Model Progress Indicators */}
        <div className="space-y-4">
          {selectedModels.map((model) => {
            const modelProgress = results?.byModel?.[model.id];
            const isComplete = !isAnalyzing && modelProgress;
            const brandCount = modelProgress?.totalBrandMentions || 0;
            const competitorMentions = modelProgress?.totalCompetitorMentions || {};
            const competitorCount = Object.values(competitorMentions).reduce((sum, count) => sum + count, 0);

            return (
              <div key={model.id} className="flex items-center gap-4">
                {/* Model Logo */}
                <div className="flex-shrink-0">
                  <img src={model.logo} alt={model.name} className="h-10 w-auto" />
                </div>

                {/* Model Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{model.name}</p>
                  {isComplete && (
                    <p className="text-xs text-gray-600 font-light">
                      <span className="text-purple-600 font-medium">{brandCount}</span> brand mentions · 
                      <span className="text-gray-500 ml-1">{competitorCount}</span> competitor mentions
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Message */}
        {!isAnalyzing && !error && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Analysis Complete!</p>
                <p className="text-xs text-green-700 font-light mt-1">Generating detailed comparison report...</p>
              </div>
              <div className="flex-shrink-0">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Preview */}
        {!isAnalyzing && results && !error && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {results.summary?.totalBrandMentions || 0}
              </div>
              <div className="text-xs text-gray-600 font-light mt-1">Total Brand Mentions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-500">
                {results.summary?.totalCompetitorMentions || 0}
              </div>
              <div className="text-xs text-gray-600 font-light mt-1">Competitor Mentions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {results.summary?.brandAppearanceRate 
                  ? `${Math.round(results.summary.brandAppearanceRate * 100)}%`
                  : '0%'}
              </div>
              <div className="text-xs text-gray-600 font-light mt-1">Brand Visibility</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
