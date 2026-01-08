import { useState } from 'react';

export default function BrandStep({ onNext, initialData }) {
  const [brandName, setBrandName] = useState(initialData?.brandName || '');
  const [keywords, setKeywords] = useState(initialData?.keywords || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (brandName.trim() && keywords.trim()) {
      onNext({ brandName: brandName.trim(), keywords: keywords.trim() });
    }
  };

  const isValid = brandName.trim() && keywords.trim();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700 mb-4">
          Step 1 of 3
        </div>
        <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight mb-3">
          Tell us about your <span className="text-purple-600 font-medium">brand</span>
        </h2>
        <p className="text-gray-600 font-light leading-relaxed">
          We'll use this information to analyze your AI visibility and generate relevant questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
          <div className="space-y-6">
            {/* Brand Name */}
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-gray-900 mb-2">
                Brand Name <span className="text-purple-600">*</span>
              </label>
              <input
                id="brandName"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., CORE, Acme Corp, TechStart"
                className="w-full rounded-2xl border border-gray-300 bg-white px-6 py-4 text-lg text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition"
                required
              />
            </div>

            {/* Keywords / Activity */}
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-900 mb-2">
                Activity & Keywords <span className="text-purple-600">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-3 font-light">
                Describe your sector, main activities, and key topics. This helps us generate relevant questions.
              </p>
              <textarea
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., AI attribution platform, knowledge management, LLM monitoring, competitive intelligence"
                rows={5}
                className="w-full rounded-2xl border border-gray-300 bg-white px-6 py-4 text-base text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Competitors
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
