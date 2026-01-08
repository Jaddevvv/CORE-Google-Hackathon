import { useState } from 'react';
import { querySingleLLM } from '../../services/llmService';

const QUERY_TYPES = [
  { id: 'branded', label: 'Branded Questions', example: 'What is [Brand]?' },
  { id: 'category', label: 'Category/Problem Questions', example: 'Best [category] software' },
  { id: 'comparative', label: 'Comparative Questions', example: '[Brand] vs [Competitor]' }
];

export default function QueriesSetupStep({ onNext, onBack, initialData }) {
  const [queries, setQueries] = useState(
    initialData.queries.length > 0
      ? initialData.queries
      : [{ text: '', type: 'branded' }]
  );
  
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState('');

  const handleChange = (index, field, value) => {
    const newQueries = [...queries];
    newQueries[index][field] = value;
    setQueries(newQueries);
    setErrors('');
  };

  const addQuery = () => {
    setQueries([...queries, { text: '', type: 'branded' }]);
  };

  const removeQuery = (index) => {
    if (queries.length > 1) {
      const newQueries = queries.filter((_, i) => i !== index);
      setQueries(newQueries);
    }
  };

  const generateQuestions = async () => {
    setGenerating(true);
    setErrors('');
    
    try {
      const brandName = initialData.brand?.name || initialData.brandName || 'the brand';
      const sector = initialData.brand?.sector || initialData.sector || 'technology';
      const region = initialData.brand?.region || 'Global';
      const competitorNames = initialData.competitors?.map(c => c.name).filter(Boolean).join(', ') || 'competitors';

      const prompt = `You are an expert at generating search queries that potential customers naturally ask when looking for solutions in a specific industry. Focus on questions that would lead people to discover and compare companies in that sector.

Generate exactly 30 strategic questions that potential customers or stakeholders would ask when researching solutions in the following sector:

Brand Context: ${brandName}
Sector/Activities: ${sector}
Region: ${region}
Competitors in space: ${competitorNames}

CRITICAL Guidelines:
1. DO NOT mention "${brandName}" or any competitor names (${competitorNames}) in the questions
2. Questions should be discovery-oriented - what people ask when looking for solutions in this space
3. Focus on questions that would naturally lead to company recommendations or comparisons
4. Make questions specific enough that an AI would mention company names in answers

Divide the 30 questions into 3 categories:
- BRANDED (10 questions): Questions about specific companies/platforms in the sector
- CATEGORY (10 questions): Questions about the sector, solutions, or problems the sector solves
- COMPARATIVE (10 questions): Comparison questions between different approaches or solutions

Good examples:
- "What are the best AI attribution platforms for marketing teams?" (CATEGORY)
- "Which companies provide LLM monitoring tools?" (BRANDED)
- "How do enterprise SaaS platforms compare for analytics?" (COMPARATIVE)

Bad examples:
- "What is artificial intelligence?" (too broad, no company mentions expected)
- "How does machine learning work?" (technical, not solution-seeking)

Output format:
BRANDED:
1. [Question]
2. [Question]
...
10. [Question]

CATEGORY:
1. [Question]
2. [Question]
...
10. [Question]

COMPARATIVE:
1. [Question]
2. [Question]
...
10. [Question]`;

      const response = await querySingleLLM('deepseek-chat', prompt);
      
      // Parse the response by category
      const sections = response.split(/(?:BRANDED|CATEGORY|COMPARATIVE):/i);
      const brandedSection = sections[1] || '';
      const categorySection = sections[2] || '';
      const comparativeSection = sections[3] || '';
      
      const parseSection = (text, type) => {
        return text
          .split('\n')
          .map(q => q.trim())
          .filter(q => q.length > 10 && /^\d+\./.test(q))
          .map(q => ({
            text: q.replace(/^\d+\.\s*/, '').trim(),
            type: type
          }));
      };
      
      const brandedQueries = parseSection(brandedSection, 'branded').slice(0, 10);
      const categoryQueries = parseSection(categorySection, 'category').slice(0, 10);
      const comparativeQueries = parseSection(comparativeSection, 'comparative').slice(0, 10);
      
      const allQueries = [...brandedQueries, ...categoryQueries, ...comparativeQueries];

      if (allQueries.length > 0) {
        setQueries(allQueries);
      } else {
        setErrors('Unable to generate queries. Please enter them manually.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setErrors('Error generating queries. Please try again or enter them manually.');
    } finally {
      setGenerating(false);
    }
  };

  const validate = () => {
    const filledQueries = queries.filter(q => q.text.trim());
    
    if (filledQueries.length === 0) {
      setErrors('Please add at least one query');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const filledQueries = queries.filter(q => q.text.trim());
      onNext({ queries: filledQueries });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700">
          Step 4 of 5
        </p>
        <h1 className="mt-6 text-4xl font-light text-gray-900 tracking-tight">
          Define your <span className="text-purple-600 font-medium">queries</span> to track
        </h1>
        <p className="mt-4 text-base text-gray-600 font-light">
          These queries will be regularly analyzed to measure your visibility.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Generate with AI Button */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Generate with AI</h3>
              <p className="text-xs text-gray-600 mt-1">
                AI can automatically generate relevant queries based on your brand information
              </p>
            </div>
            <button
              type="button"
              onClick={generateQuestions}
              disabled={generating}
              className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : '✨ Generate'}
            </button>
          </div>
        </div>

        {/* Query Type Legend */}
        <div className="grid grid-cols-3 gap-3">
          {QUERY_TYPES.map(type => (
            <div key={type.id} className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-900">{type.label}</p>
              <p className="text-xs text-gray-500 mt-1">{type.example}</p>
            </div>
          ))}
        </div>

        {/* Queries List */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
          {queries.map((query, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Query {index + 1}
                </h3>
                {queries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuery(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label htmlFor={`query-type-${index}`} className="block text-xs font-medium text-gray-700 mb-2">
                  Query Type
                </label>
                <select
                  id={`query-type-${index}`}
                  value={query.type}
                  onChange={(e) => handleChange(index, 'type', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {QUERY_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={`query-text-${index}`} className="block text-xs font-medium text-gray-700 mb-2">
                  Query {index === 0 && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id={`query-text-${index}`}
                  value={query.text}
                  onChange={(e) => handleChange(index, 'text', e.target.value)}
                  placeholder="Enter your query..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          ))}

          {errors && (
            <p className="text-sm text-red-600">{errors}</p>
          )}

          {queries.length < 50 && (
            <button
              type="button"
              onClick={addQuery}
              className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600"
            >
              + Add another query
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-full bg-purple-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
