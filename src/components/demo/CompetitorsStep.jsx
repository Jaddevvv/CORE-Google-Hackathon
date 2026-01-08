import { useState } from 'react';

export default function CompetitorsStep({ onNext, onBack, initialData, brandName }) {
  const [competitors, setCompetitors] = useState(initialData?.competitors || ['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const handleCompetitorChange = (index, value) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setUseAI(true);
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'system',
            content: 'You are an expert market analyst specializing in competitive intelligence. You identify real, well-known competitors in specific industries based on company descriptions.'
          }, {
            role: 'user',
            content: `Identify the 3 most relevant and well-known competitors for the following company:

Company Name: ${brandName}
Sector/Activity: ${initialData.keywords}

Important criteria:
1. Find REAL, existing companies that are direct competitors
2. Consider companies of similar size and market position
3. Focus on the specific sector and activities described
4. Choose well-established competitors that operate in the same space
5. Prioritize companies that would compete for the same customers

Return ONLY the 3 competitor company names, one per line, without numbering or additional text.

Format:
Competitor Company 1
Competitor Company 2
Competitor Company 3`
          }],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse competitor names from response
      const generated = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim())
        .slice(0, 3);
      
      setCompetitors(generated.length === 3 ? generated : ['', '', '']);
      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating competitors:', err);
      // Fallback to empty on error
      setCompetitors(['', '', '']);
      setIsGenerating(false);
      setUseAI(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validCompetitors = competitors.filter(c => c.trim());
    if (validCompetitors.length > 0) {
      onNext({ competitors: validCompetitors });
    }
  };

  const hasValidCompetitors = competitors.some(c => c.trim());

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700 mb-4">
          Step 2 of 3
        </div>
        <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight mb-3">
          Add your <span className="text-purple-600 font-medium">competitors</span>
        </h2>
        <p className="text-gray-600 font-light leading-relaxed">
          Add up to 3 competitors manually, or let AI suggest them based on <span className="font-medium text-gray-900">{brandName}</span>'s activity.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
          <div className="space-y-6">
            {/* AI Generate Button */}
            <div className="flex justify-center pb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-full border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-white px-6 py-3 text-sm font-semibold text-purple-700 transition hover:border-purple-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    Generate Competitors with AI
                  </>
                )}
              </button>
            </div>

            {/* Manual Inputs */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 text-center">Or add them manually</p>
              {competitors.map((competitor, index) => (
                <div key={index}>
                  <label htmlFor={`competitor-${index}`} className="block text-sm font-medium text-gray-900 mb-2">
                    Competitor {index + 1} {index === 0 && <span className="text-gray-500 font-light">(at least one required)</span>}
                  </label>
                  <input
                    id={`competitor-${index}`}
                    type="text"
                    value={competitor}
                    onChange={(e) => handleCompetitorChange(index, e.target.value)}
                    placeholder={`e.g., Competitor ${index + 1}`}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-6 py-3 text-base text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition"
                  />
                </div>
              ))}
            </div>

            {useAI && competitors.some(c => c.trim()) && (
              <div className="mt-4 p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <p className="text-sm text-purple-800 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">AI-generated competitors based on your brand activity</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="submit"
            disabled={!hasValidCompetitors}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Questions
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
