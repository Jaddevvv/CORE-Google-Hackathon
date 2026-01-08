import { useState } from 'react';
import BrandStep from './BrandStep';
import CompetitorsStep from './CompetitorsStep';
import QuestionsStep from './QuestionsStep';
import ModelSelectionStep from './ModelSelectionStep';
import AnalysisStep from './AnalysisStep';
import ResultsStep from './ResultsStep';

export default function DemoWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [demoData, setDemoData] = useState({
    brandName: '',
    keywords: '',
    competitors: [],
    questions: [],
    selectedModels: [],
    analysisResults: null
  });

  const handleBrandNext = (data) => {
    setDemoData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleCompetitorsNext = (data) => {
    setDemoData(prev => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleQuestionsComplete = (data) => {
    setDemoData(prev => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handleModelSelectionNext = (data) => {
    setDemoData(prev => ({ ...prev, ...data }));
    setCurrentStep(5);
  };

  const handleAnalysisComplete = (data) => {
    setDemoData(prev => ({ ...prev, ...data }));
    setCurrentStep(6);
  };

  const handleBack = (step) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Indicator - Hide on Results page */}
      {currentStep <= 5 && (
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-4xl px-4 py-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                      currentStep > step
                        ? 'bg-purple-600 text-white'
                        : currentStep === step
                        ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step === 1 && 'Brand Info'}
                      {step === 2 && 'Competitors'}
                      {step === 3 && 'Questions'}
                      {step === 4 && 'Models'}
                      {step === 5 && 'Analysis'}
                    </p>
                  </div>
                </div>
                {step < 5 && (
                  <div
                    className={`mx-4 h-0.5 flex-1 transition ${
                      currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-12 px-4">
        {currentStep === 1 && (
          <BrandStep
            onNext={handleBrandNext}
            initialData={demoData}
          />
        )}
        {currentStep === 2 && (
          <CompetitorsStep
            onNext={handleCompetitorsNext}
            onBack={() => handleBack(1)}
            initialData={demoData}
            brandName={demoData.brandName}
          />
        )}
        {currentStep === 3 && (
          <QuestionsStep
            onBack={() => handleBack(2)}
            brandData={demoData}
            onComplete={handleQuestionsComplete}
          />
        )}
        {currentStep === 4 && (
          <ModelSelectionStep
            onNext={handleModelSelectionNext}
            onBack={() => handleBack(3)}
            initialData={demoData}
          />
        )}
        {currentStep === 5 && (
          <AnalysisStep
            data={demoData}
            onComplete={handleAnalysisComplete}
          />
        )}
        {currentStep === 6 && (
          <ResultsStep
            data={demoData}
          />
        )}
      </div>
    </div>
  );
}
