import { useState, useEffect } from 'react';

export default function QuestionsStep({ onBack, brandData, onComplete }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const { brandName, keywords, competitors } = brandData;

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

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
            content: 'You are an expert at generating search queries that potential customers naturally ask when looking for solutions in a specific industry. Focus on questions that would lead people to discover and compare companies in that sector.'
          }, {
            role: 'user',
            content: `Generate exactly 30 strategic questions that potential customers or stakeholders would ask when researching solutions in the following sector:

Brand Context: ${brandName}
Sector/Activities: ${keywords}
Competitors in space: ${competitors.join(', ')}

CRITICAL Guidelines:
1. DO NOT mention "${brandName}" or any competitor names (${competitors.join(', ')}) in the questions
2. Questions should be discovery-oriented - what people ask when looking for solutions in this space
3. Focus on questions that would naturally lead to company recommendations or comparisons
4. Include questions about:
   - Best companies/platforms/solutions in this sector
   - Who are the leaders/top providers for [specific use case]
   - Recommendations for [specific problem this sector solves]
   - Comparisons between different approaches in the sector
   - "Which tool/platform/company for [use case]"
5. Make questions specific enough that an AI would mention company names in answers
6. Questions should span: vendor selection, product comparison, market leaders, solution recommendations

Good example: "What are the best AI attribution platforms for marketing teams?"
Good example: "Which companies provide LLM monitoring tools?"
Bad example: "What is artificial intelligence?" (too broad, no company mentions expected)
Bad example: "How does machine learning work?" (technical, not solution-seeking)

Output ONLY the questions, numbered 1-30, one per line.

Format:
1. [Question]
2. [Question]
...
30. [Question]`
          }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the questions from the response
      const questionList = content
        .split('\n')
        .filter(line => line.trim() && /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      setQuestions(questionList);
      setProgress(100);
      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err.message);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700 mb-4">
          Step 3 of 3
        </div>
        <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight mb-3">
          Generating <span className="text-purple-600 font-medium">questions</span>
        </h2>
        <p className="text-gray-600 font-light leading-relaxed">
          Creating 30 relevant questions about {keywords.split(',')[0]} sector...
        </p>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Analyzing sector and generating questions...</span>
              <span className="text-purple-600 font-semibold">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600 pt-4">
              <svg className="h-5 w-5 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-light">Using DeepSeek AI to craft relevant questions...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-md mb-6">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-red-900 font-medium mb-1">Error generating questions</p>
              <p className="text-red-700 text-sm font-light">{error}</p>
              <button
                onClick={generateQuestions}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Questions */}
      {questions.length > 0 && (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Generated Questions</h3>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {questions.length} questions
            </span>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {questions.map((question, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-purple-50/30 hover:border-purple-300 transition"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-semibold flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-800 font-light leading-relaxed pt-1">{question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 mb-6">
        <div className="flex items-start gap-3">
          <svg className="h-6 w-6 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">How these questions are used</p>
            <p className="text-sm text-gray-700 font-light leading-relaxed">
              These questions will be used to query multiple LLMs and analyze if <span className="font-medium text-purple-700">{brandName}</span> appears in their responses. 
              We'll compare your visibility against {competitors.filter(c => c).length} competitor(s) across different AI models.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7-7-7 7-7" />
          </svg>
          Back
        </button>
        
        {questions.length > 0 && (
          <button
            type="button"
            onClick={() => onComplete({ questions })}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
          >
            Continue to Analysis
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
