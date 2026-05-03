import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { ChefHat, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await login(email, password);

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--paper-bg)] font-serif flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-[var(--border-ink)] bg-white mb-6 shadow-[4px_4px_0px_0px_var(--border-ink)]">
                        <ChefHat className="w-10 h-10 text-[#9b2226]" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-tighter italic">Library Login</h1>
                    <p className="text-gray-600 mt-2 font-serif italic tracking-tight">Access your personal recipe collection</p>
                </div>

                {/* Login Form */}
                <div className="cookbook-card py-10 px-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white"
                                    placeholder="you@cookbook.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 font-sans">
                                Secret Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-[var(--border-ink)] focus:ring-1 focus:ring-[#9b2226] outline-none font-serif bg-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex items-center justify-end">
                            <Link to="/reset-password" async className="text-xs text-[#9b2226] hover:underline font-bold uppercase tracking-widest font-sans">
                                Lost Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full cookbook-button py-3 uppercase tracking-[0.2em] text-xs font-bold font-sans disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-600 mt-10 italic border-t border-dashed border-[var(--border-ink)] pt-6">
                        New to the kitchen?{' '}
                        <Link to="/signup" className="text-[#9b2226] font-bold not-italic hover:underline uppercase tracking-widest text-xs ml-1 font-sans">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
