import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AnalysisCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project_id');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/dashboard/overview?project_id=${projectId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, projectId]);

  const handleViewDashboard = () => {
    navigate(`/dashboard/overview?project_id=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center animate-bounce">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Analysis Ready! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Your first AI visibility scan is complete.<br />
            We've analyzed your brand across multiple LLMs.
          </p>

          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">30</div>
              <div className="text-xs text-gray-600">Queries Analyzed</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">3+</div>
              <div className="text-xs text-gray-600">LLM Engines</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleViewDashboard}
            className="w-full rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 mb-4"
          >
            View Your Dashboard →
          </button>

          {/* Auto-redirect message */}
          <p className="text-sm text-gray-500">
            Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>

        {/* Bottom hint */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 You'll see your visibility score, competitor analysis, and detailed insights
          </p>
        </div>
      </div>
    </div>
  );
}
