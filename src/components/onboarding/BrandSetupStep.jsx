import { useState } from 'react';

const SECTORS = [
  'SaaS',
  'E-commerce',
  'Banking & Finance',
  'Insurance',
  'Healthcare',
  'Education',
  'Real Estate',
  'Travel & Hospitality',
  'Marketing & Advertising',
  'Consulting',
  'Retail',
  'Manufacturing',
  'Other'
];

const REGIONS = [
  'EMEA',
  'North America',
  'Asia Pacific',
  'Europe',
  'Latin America',
  'Middle East',
  'Africa'
];

const LANGUAGES = [
  'English',
  'French',
  'Spanish',
  'German',
  'Italian',
  'Dutch',
  'Japanese',
  'Chinese'
];

export default function BrandSetupStep({ onNext, initialData }) {
  const [formData, setFormData] = useState({
    brandName: initialData.brandName || '',
    website: initialData.website || '',
    sector: initialData.sector || '',
    region: initialData.region || 'North America',
    language: initialData.language || 'English'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required';
    }
    
    if (!formData.sector) {
      newErrors.sector = 'Please select a sector';
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
          Step 1 of 5
        </p>
        <h1 className="mt-6 text-4xl font-light text-gray-900 tracking-tight">
          Define your <span className="text-purple-600 font-medium">brand</span>
        </h1>
        <p className="mt-4 text-base text-gray-600 font-light">
          This information will help us analyze your presence in LLM responses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-8 space-y-6">
        {/* Brand Name */}
        <div>
          <label htmlFor="brandName" className="block text-sm font-semibold text-gray-900 mb-2">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="brandName"
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            placeholder="e.g., Stripe"
            className={`w-full rounded-xl border ${errors.brandName ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          />
          {errors.brandName && (
            <p className="mt-1 text-sm text-red-600">{errors.brandName}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-semibold text-gray-900 mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourcompany.com"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Sector */}
        <div>
          <label htmlFor="sector" className="block text-sm font-semibold text-gray-900 mb-2">
            Industry Sector <span className="text-red-500">*</span>
          </label>
          <select
            id="sector"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className={`w-full rounded-xl border ${errors.sector ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          >
            <option value="">Select a sector</option>
            {SECTORS.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          {errors.sector && (
            <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
          )}
        </div>

        {/* Region */}
        <div>
          <label htmlFor="region" className="block text-sm font-semibold text-gray-900 mb-2">
            Target Region <span className="text-red-500">*</span>
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            This will be used across all your projects and analyses
          </p>
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-semibold text-gray-900 mb-2">
            Target Language
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {LANGUAGES.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
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
