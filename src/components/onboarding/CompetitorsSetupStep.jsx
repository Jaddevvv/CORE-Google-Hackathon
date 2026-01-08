import { useState } from 'react';
import { querySingleLLM } from '../../services/llmService';

export default function CompetitorsSetupStep({ onNext, onBack, initialData }) {
  const brandName = initialData.brand?.name || initialData.brandName || '';
  const sector = initialData.brand?.sector || initialData.sector || '';
  const region = initialData.brand?.region || initialData.region || 'Global';

  const [competitors, setCompetitors] = useState(
    initialData.competitors.length > 0
      ? initialData.competitors
      : [
          { name: '', url: '' },
          { name: '', url: '' },
          { name: '', url: '' }
        ]
  );

  const [errors, setErrors] = useState('');
  const [generating, setGenerating] = useState(false);

  // Generate competitors using AI
  const generateCompetitors = async () => {
    if (!brandName || !sector) {
      setErrors('Please complete the brand information first');
      return;
    }

    setGenerating(true);
    setErrors('');

    try {
      const prompt = `You are a market research expert. Based on the following information:
- Brand: ${brandName}
- Sector: ${sector}
- Region: ${region}

Generate exactly 5 main competitors of this brand. These should be well-known companies or brands in the same sector and region.

IMPORTANT: Return ONLY the competitor names, one per line. No numbering, no descriptions, no extra text.

Example format:
Nike
Adidas
Under Armour
Puma
Reebok`;

      const response = await querySingleLLM('deepseek-chat', prompt, process.env.VITE_DEEPSEEK_API_KEY);
      
      const competitorNames = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^\d+[\.\)]/))
        .slice(0, 5);

      if (competitorNames.length === 0) {
        throw new Error('No competitors generated');
      }

      const newCompetitors = competitorNames.map(name => ({
        name: name.replace(/^[-•*]\s*/, ''),
        url: ''
      }));

      setCompetitors(newCompetitors);
    } catch (error) {
      console.error('Error generating competitors:', error);
      setErrors('Failed to generate competitors. Please add them manually.');
    } finally {
      setGenerating(false);
    }
  };

  const handleChange = (index, field, value) => {
    const newCompetitors = [...competitors];
    newCompetitors[index][field] = value;
    setCompetitors(newCompetitors);
    setErrors('');
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, { name: '', url: '' }]);
  };

  const removeCompetitor = (index) => {
    if (competitors.length > 1) {
      const newCompetitors = competitors.filter((_, i) => i !== index);
      setCompetitors(newCompetitors);
    }
  };

  const validate = () => {
    const filledCompetitors = competitors.filter(c => c.name.trim());
    
    if (filledCompetitors.length === 0) {
      setErrors('Please add at least one competitor');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Filter out empty competitors
      const filledCompetitors = competitors.filter(c => c.name.trim());
      onNext({ competitors: filledCompetitors });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700">
          Step 2 of 5
        </p>
        <h1 className="mt-6 text-4xl font-light text-gray-900 tracking-tight">
          Add your <span className="text-purple-600 font-medium">competitors</span>
        </h1>
        <p className="mt-4 text-base text-gray-600 font-light">
          We will compare your brand's visibility with your main competitors (3 to 5 recommended).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-8 space-y-6">
        {/* AI Generation Button */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI-Powered Competitor Discovery</h3>
              <p className="text-xs text-gray-600 mt-1">Let AI suggest competitors based on your brand information</p>
            </div>
            <button
              type="button"
              onClick={generateCompetitors}
              disabled={generating || !brandName || !sector}
              className="rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : '✨ Generate with AI'}
            </button>
          </div>
        </div>
        {competitors.map((competitor, index) => (
          <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Competitor {index + 1}
              </h3>
              {competitors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCompetitor(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label htmlFor={`competitor-name-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name {index === 0 && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id={`competitor-name-${index}`}
                value={competitor.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                placeholder="e.g., Competitor Corp"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div>
              <label htmlFor={`competitor-url-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                Website URL (optional)
              </label>
              <input
                type="url"
                id={`competitor-url-${index}`}
                value={competitor.url}
                onChange={(e) => handleChange(index, 'url', e.target.value)}
                placeholder="https://competitor.com"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>
        ))}

        {errors && (
          <p className="text-sm text-red-600">{errors}</p>
        )}

        {competitors.length < 10 && (
          <button
            type="button"
            onClick={addCompetitor}
            className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm font-medium text-gray-600 transition hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600"
          >
            + Add another competitor
          </button>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
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
