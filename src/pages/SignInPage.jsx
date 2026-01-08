import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authenticateUser } from '../utils/db';

export default function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const user = authenticateUser(formData.email, formData.password);
      login(user);
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md rounded-[32px] border border-purple-200 bg-white p-10 shadow-lg">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-600">Bienvenue</p>
          <h1 className="mt-4 text-3xl font-semibold text-gray-900">Connexion à CORE</h1>
          <p className="mt-2 text-sm text-gray-600">
            Suivez vos analyses d'attribution IA et gérez vos opportunités.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="vous@entreprise.com"
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
            />
          </div>
          <div>
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
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
            />
          </div>
          <div className="text-right">
            <Link
              to="/auth/password-recovery"
              className="text-xs font-semibold text-purple-600 transition hover:text-purple-700"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Nouveau sur CORE ?{' '}
          <Link className="font-semibold text-purple-600 hover:text-purple-700" to="/auth/signup">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
