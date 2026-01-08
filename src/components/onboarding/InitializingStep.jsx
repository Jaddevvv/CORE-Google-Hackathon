export default function InitializingStep() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
        </div>
        
        <h1 className="text-4xl font-light text-gray-900 tracking-tight">
          Setting up your <span className="text-purple-600 font-medium">workspace</span>
        </h1>
        
        <p className="mt-4 text-base text-gray-600 font-light">
          We're preparing your CORE environment...
        </p>
        
        <div className="mt-12 space-y-4 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Creating your workspace</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Configuring your brand</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Initializing analyses</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-purple-600 font-medium">
            <div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
            </div>
            <span>Finalizing...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
