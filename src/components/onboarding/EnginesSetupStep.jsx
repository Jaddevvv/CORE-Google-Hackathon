import { useState } from 'react';
import { getAllModels } from '../../services/llmService';

const FREQUENCIES = [
  { id: 'daily', label: 'Daily', description: 'Analysis every day' },
  { id: 'twice_weekly', label: '2× per week', description: 'Monday and Thursday' },
  { id: 'weekly', label: 'Weekly', description: 'Every Monday' }
];

export default function EnginesSetupStep({ onComplete, onBack, initialData }) {
  const allModels = getAllModels();
  
  const [selectedEngines, setSelectedEngines] = useState(
    initialData.selectedEngines.length > 0
      ? initialData.selectedEngines
      : []
  );
  
  const [frequency, setFrequency] = useState(initialData.frequency || 'weekly');
  const [errors, setErrors] = useState('');

  const toggleEngine = (engineId) => {
    if (selectedEngines.includes(engineId)) {
      setSelectedEngines(selectedEngines.filter(id => id !== engineId));
    } else {
      setSelectedEngines([...selectedEngines, engineId]);
    }
    setErrors('');
  };

  const validate = () => {
    if (selectedEngines.length === 0) {
      setErrors('Please select at least one LLM engine');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onComplete({ selectedEngines, frequency });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700">
          Step 5 of 5
        </p>
        <h1 className="mt-6 text-4xl font-light text-gray-900 tracking-tight">
          Choose your <span className="text-purple-600 font-medium">LLM engines</span>
        </h1>
        <p className="mt-4 text-base text-gray-600 font-light">
          Select the LLMs to monitor and the analysis frequency.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LLM Selection */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available LLM Engines
          </h2>
          
          <div className="grid gap-3">
            {allModels.map(model => (
              <button
                key={model.id}
                type="button"
                onClick={() => model.available && toggleEngine(model.id)}
                disabled={!model.available}
                className={`flex items-center justify-between rounded-xl border-2 p-4 transition ${
                  selectedEngines.includes(model.id)
                    ? 'border-purple-600 bg-purple-50'
                    : model.available
                    ? 'border-gray-200 bg-white hover:border-purple-300'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4">
                  {model.logo && (
                    <img 
                      src={model.logo} 
                      alt={model.name} 
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{model.name}</p>
                    {!model.available && (
                      <p className="text-xs text-gray-500">Coming soon</p>
                    )}
                  </div>
                </div>
                
                {model.available && (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedEngines.includes(model.id)
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedEngines.includes(model.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          {errors && (
            <p className="mt-4 text-sm text-red-600">{errors}</p>
          )}
        </div>

        {/* Frequency Selection */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Analysis Frequency
          </h2>
          
          <div className="grid gap-3">
            {FREQUENCIES.map(freq => (
              <button
                key={freq.id}
                type="button"
                onClick={() => setFrequency(freq.id)}
                className={`flex items-center justify-between rounded-xl border-2 p-4 transition ${
                  frequency === freq.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{freq.label}</p>
                  <p className="text-sm text-gray-600">{freq.description}</p>
                </div>
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  frequency === freq.id
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-gray-300'
                }`}>
                  {frequency === freq.id && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💡 Note:</span> You can modify these settings anytime from your dashboard.
          </p>
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
            Complete Setup
          </button>
        </div>
      </form>
    </div>
  );
}
