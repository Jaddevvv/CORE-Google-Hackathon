import { useState } from 'react';

const TARGET_AUDIENCES = [
  'SMB (Small & Medium Business)',
  'Enterprise',
  'Freelancers / Independent Professionals',
  'Startups',
  'General Public (B2C)',
  'Business Professionals (B2B)',
  'Other'
];

export default function ProjectSetupStep({ onNext, onBack, initialData }) {
  const [formData, setFormData] = useState({
    projectName: initialData.projectName || '',
    targetAudience: initialData.targetAudience || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    if (!formData.targetAudience) {
      newErrors.targetAudience = 'Please select a target audience';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-4 py-1 text-xs font-medium tracking-wide text-purple-700">
          Step 3 of 5
        </p>
        <h1 className="mt-6 text-4xl font-light text-gray-900 tracking-tight">
          Create your first <span className="text-purple-600 font-medium">project</span>
        </h1>
        <p className="mt-4 text-base text-gray-600 font-light">
          Projects help you organize tracking by market or segment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-8 space-y-6">
        {/* Project Name */}
        <div>
          <label htmlFor="projectName" className="block text-sm font-semibold text-gray-900 mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="e.g., US - SMB - Billing Product"
            className={`w-full rounded-xl border ${errors.projectName ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          />
          {errors.projectName && (
            <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Choose a descriptive name to easily identify this project
          </p>
        </div>

        {/* Target Audience */}
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-semibold text-gray-900 mb-2">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <select
            id="targetAudience"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            className={`w-full rounded-xl border ${errors.targetAudience ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          >
            <option value="">Select a target audience</option>
            {TARGET_AUDIENCES.map(audience => (
              <option key={audience} value={audience}>{audience}</option>
            ))}
          </select>
          {errors.targetAudience && (
            <p className="mt-1 text-sm text-red-600">{errors.targetAudience}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💡 Tip:</span> You can create multiple projects to track different markets or segments.
          </p>
        </div>

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
