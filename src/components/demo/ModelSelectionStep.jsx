import { useState } from 'react';
import { getAllModels } from '../../services/llmService';

export default function ModelSelectionStep({ onNext, onBack, initialData }) {
  const [selectedModels, setSelectedModels] = useState(initialData?.selectedModels || []);
  const allModels = getAllModels();

  const handleToggleModel = (modelId, isAvailable) => {
    if (!isAvailable) return; // Can't select locked models
    
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    } else {
      if (selectedModels.length < 3) {
        setSelectedModels([...selectedModels, modelId]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedModels.length > 0) {
      onNext({ selectedModels });
    }
  };

  const isValid = selectedModels.length > 0 && selectedModels.length <= 3;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700 mb-4">
          Step 4 of 5
        </div>
        <h2 className="text-3xl font-light text-gray-900 tracking-tight leading-tight mb-3">
          Choose your <span className="text-purple-600 font-medium">AI models</span>
        </h2>
        <p className="text-gray-600 font-light leading-relaxed">
          Select up to 3 LLMs to query with your questions. Compare brand visibility across different AI platforms.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium text-purple-600">{selectedModels.length}/3</span>
          <span className="font-light">models selected</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Model Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allModels.map((model) => {
            const isSelected = selectedModels.includes(model.id);
            const canSelect = model.available || isSelected;
            
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => handleToggleModel(model.id, model.available)}
                disabled={!canSelect}
                className={`relative rounded-3xl border-2 p-6 text-left transition ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : canSelect
                    ? 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Lock Icon for unavailable */}
                {!model.available && (
                  <div className="absolute top-4 right-4">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                )}
                
                {/* Checkmark for selected */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Model Logo */}
                <div className="mb-4 flex items-center justify-center">
                  <img
                    src={model.logo}
                    alt={model.name}
                    className={`h-12 w-auto object-contain transition ${
                      canSelect ? 'opacity-100' : 'opacity-40 grayscale'
                    }`}
                    onError={(e) => {
                      console.error(`Failed to load logo for ${model.name}:`, model.logo);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Model Name */}
                <h3 className={`text-lg font-medium text-center ${
                  canSelect ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {model.name}
                </h3>

                {/* Status Badge */}
                <div className="mt-3 flex justify-center">
                  {model.available ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Premium
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        {selectedModels.length > 0 && (
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Analysis Strategy</p>
                <p className="text-sm text-gray-700 font-light leading-relaxed">
                  Your questions will be sent in parallel to {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''}, 
                  then we'll analyze which models mention your brand and competitors in their responses.
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={!isValid}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Analysis
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
