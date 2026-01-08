import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  createWorkspace,
  createBrand,
  createCompetitor,
  createProject,
  createQuery,
  createProjectSettings
} from '../utils/db';
import BrandSetupStep from '../components/onboarding/BrandSetupStep';
import CompetitorsSetupStep from '../components/onboarding/CompetitorsSetupStep';
import ProjectSetupStep from '../components/onboarding/ProjectSetupStep';
import QueriesSetupStep from '../components/onboarding/QueriesSetupStep';
import EnginesSetupStep from '../components/onboarding/EnginesSetupStep';
import InitializingStep from '../components/onboarding/InitializingStep';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setWorkspace, setCurrentBrand, setCurrentProject } = useWorkspace();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    // Step 1: Brand
    brandName: '',
    website: '',
    sector: '',
    country: 'France',
    language: 'Français',
    
    // Step 2: Competitors
    competitors: [],
    
    // Step 3: Project
    projectName: '',
    targetCountry: 'France',
    targetAudience: '',
    
    // Step 4: Queries
    queries: [],
    
    // Step 5: Engines
    selectedEngines: [],
    frequency: 'weekly'
  });

  const handleBrandNext = (data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleCompetitorsNext = (data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleProjectNext = (data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handleQueriesNext = (data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(5);
  };

  const handleEnginesComplete = async (data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep(6); // Show initializing step
    
    try {
      // Create workspace
      const workspace = createWorkspace(
        user.id,
        onboardingData.country,
        onboardingData.language
      );
      
      // Create brand
      const brand = createBrand(
        workspace.id,
        onboardingData.brandName,
        onboardingData.website,
        onboardingData.sector,
        onboardingData.country,
        onboardingData.language
      );
      
      // Create competitors
      onboardingData.competitors.forEach(comp => {
        if (comp.name) {
          createCompetitor(brand.id, comp.name, comp.url || '');
        }
      });
      
      // Create project
      const project = createProject(
        brand.id,
        onboardingData.projectName,
        onboardingData.targetCountry,
        onboardingData.targetAudience
      );
      
      // Create queries
      onboardingData.queries.forEach(query => {
        createQuery(
          project.id,
          query.text,
          query.type,
          onboardingData.language
        );
      });
      
      // Create project settings
      createProjectSettings(
        project.id,
        data.selectedEngines,
        data.frequency,
        100 // Default max queries per run
      );
      
      // Update context
      setWorkspace(workspace);
      setCurrentBrand(brand);
      setCurrentProject(project);
      
      // Wait a bit to show the initializing animation
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Une erreur est survenue lors de la configuration. Veuillez réessayer.');
    }
  };

  const handleBack = (step) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Indicator - Hide on Initializing page */}
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
                        {step === 1 && 'Marque'}
                        {step === 2 && 'Concurrents'}
                        {step === 3 && 'Projet'}
                        {step === 4 && 'Questions'}
                        {step === 5 && 'Moteurs'}
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
          <BrandSetupStep
            onNext={handleBrandNext}
            initialData={onboardingData}
          />
        )}
        {currentStep === 2 && (
          <CompetitorsSetupStep
            onNext={handleCompetitorsNext}
            onBack={() => handleBack(1)}
            initialData={onboardingData}
          />
        )}
        {currentStep === 3 && (
          <ProjectSetupStep
            onNext={handleProjectNext}
            onBack={() => handleBack(2)}
            initialData={onboardingData}
          />
        )}
        {currentStep === 4 && (
          <QueriesSetupStep
            onNext={handleQueriesNext}
            onBack={() => handleBack(3)}
            initialData={onboardingData}
          />
        )}
        {currentStep === 5 && (
          <EnginesSetupStep
            onComplete={handleEnginesComplete}
            onBack={() => handleBack(4)}
            initialData={onboardingData}
          />
        )}
        {currentStep === 6 && (
          <InitializingStep />
        )}
      </div>
    </div>
  );
}
