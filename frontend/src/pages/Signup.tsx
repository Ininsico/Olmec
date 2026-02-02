
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.register(formData.name, formData.email, formData.password);
            login(response.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = () => {
        authAPI.googleAuth();
    };

    const handleGithubAuth = () => {
        authAPI.githubAuth();
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Column - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-cream-50">
                <div className="max-w-md w-full">
                    <div className="mb-10">
                        <Link to="/" className="inline-block mb-8 text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-2">
                            <span className="text-sm font-bold">← Back to Home</span>
                        </Link>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Create an account</h1>
                        <p className="text-slate-600">Enter your details below to get started.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 block">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-richred-500/20 focus:border-richred-500 transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-richred-500/20 focus:border-richred-500 transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 block">Password</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-richred-500/20 focus:border-richred-500 transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="Create a password"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters.</p>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full py-6 text-lg shadow-xl shadow-richred-900/20 flex items-center justify-center gap-2 text-black"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-cream-50 text-slate-500">Or sign up with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={handleGithubAuth}
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                            >
                                <Github size={20} />
                                GitHub
                            </button>
                            <button
                                type="button"
                                onClick={handleGoogleAuth}
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                            >
                                <span className="font-bold text-lg">G</span>
                                Google
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-slate-900 hover:text-richred-600 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Column - Visual (Inverse of Login) */}
            <div className="hidden lg:flex w-1/2 bg-neutral-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-neutral-900" />
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
                />

                <div className="relative z-10 max-w-lg text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Start building for free.
                        </h2>
                        <ul className="text-left space-y-4 text-neutral-400 mx-auto max-w-sm mb-8">
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-richred-500 flex items-center justify-center text-xs text-white">✓</div>
                                Unlimited public projects
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-richred-500 flex items-center justify-center text-xs text-white">✓</div>
                                Access to basic assets library
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-richred-500 flex items-center justify-center text-xs text-white">✓</div>
                                Community support
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
