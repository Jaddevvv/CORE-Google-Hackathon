import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUser } from '../utils/db';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est obligatoire';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Le nom de l\'entreprise est obligatoire';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create user
      const user = createUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.company
      );
      
      // Log in the user
      login(user);
      
      // Redirect to onboarding
      navigate('/onboarding');
      
    } catch (error) {
      console.error('Error creating account:', error);
      setErrors({ submit: error.message || 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-2xl rounded-[36px] border border-purple-200 bg-white p-10 shadow-lg">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-600">Créer un compte</p>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">Démarrez avec CORE</h1>
          <p className="mt-2 text-sm text-gray-600">
            Créez votre workspace d'attribution IA en quelques minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="md:col-span-1">
            <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700">
              Prénom
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Léo"
              className={`mt-2 w-full rounded-2xl border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>
          <div className="md:col-span-1">
            <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700">
              Nom
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Dupont"
              className={`mt-2 w-full rounded-2xl border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50`}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700">
              Email professionnel
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="vous@entreprise.com"
              className={`mt-2 w-full rounded-2xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="company" className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700">
              Entreprise
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              placeholder="CORE Labs"
              className={`mt-2 w-full rounded-2xl border ${errors.company ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50`}
            />
            {errors.company && (
              <p className="mt-1 text-xs text-red-600">{errors.company}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`mt-2 w-full rounded-2xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>
          
          {errors.submit && (
            <div className="md:col-span-2">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création...' : 'Créer mon compte'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Vous avez déjà un compte ?{' '}
          <Link className="font-semibold text-purple-600 hover:text-purple-700" to="/auth/signin">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
