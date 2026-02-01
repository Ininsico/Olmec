import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Lock, Mail, User, Sun, Moon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const SignupPage = () => {
    const navigate = useNavigate();
    // State
    const [credentials, setCredentials] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [particles, setParticles] = useState([]);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Refs
    const usernameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const formRef = useRef();

    // Motion values for interactive background
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const backgroundX = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);
    const backgroundY = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);

    // Effects
    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            setCapsLockOn(e.getModifierState('CapsLock'));
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Particle animation for success state
    useEffect(() => {
        if (success) {
            const newParticles = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 8 + 4,
                color: `hsl(${Math.random() * 60 + 120}, 80%, 60%)`,
                life: 100,
                speed: Math.random() * 3 + 1
            }));
            setParticles(newParticles);

            const interval = setInterval(() => {
                setParticles(prev =>
                    prev.map(p => ({
                        ...p,
                        y: p.y - p.speed,
                        life: p.life - 2,
                        opacity: p.life / 100
                    })).filter(p => p.life > 0)
                );
            }, 50);

            return () => clearInterval(interval);
        }
    }, [success]);

    // Validation
    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

        if (!credentials.username) {
            newErrors.username = 'Username is required';
        } else if (!usernameRegex.test(credentials.username)) {
            newErrors.username = 'Username must be 3-20 characters (letters, numbers, _)';
        }

        if (!credentials.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(credentials.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!credentials.password) {
            newErrors.password = 'Password is required';
        } else if (credentials.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!credentials.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (credentials.password !== credentials.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!termsAccepted) {
            newErrors.terms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // Validate form
        if (!validate()) {
            setIsLoading(false);
            return;
        }

        try {
            // Prepare the data to send
            const { confirmPassword, ...userData } = credentials;

            // Make the API request
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Handle successful registration
            setSuccess(true);

            // Store the token (you might want to use a context or state management)
            localStorage.setItem('token', data.token);

            // Redirect after a delay
            setTimeout(() => {
                navigate('/login'); // Or wherever you want to redirect
            }, 2000);

        } catch (error) {
            console.error('Signup error:', error);
            setErrors({
                general: error.message || 'Registration failed. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const getPasswordStrength = () => {
        if (!credentials.password) return 0;

        let strength = 0;
        if (credentials.password.length >= 8) strength += 1;
        if (/[A-Z]/.test(credentials.password)) strength += 1;
        if (/[0-9]/.test(credentials.password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(credentials.password)) strength += 1;

        return strength;
    };

    const passwordStrength = getPasswordStrength();

    const handleMouseMove = (e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center transition-colors duration-1000 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}
            onMouseMove={handleMouseMove}
        >
            {/* Animated background elements */}
            <motion.div
                className="fixed inset-0 overflow-hidden pointer-events-none"
                style={{
                    x: backgroundX,
                    y: backgroundY,
                    transition: { type: 'spring', damping: 30 }
                }}
            >
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 300 + 100}px`,
                            height: `${Math.random() * 300 + 100}px`,
                            opacity: darkMode ? 0.03 : 0.1,
                            filter: 'blur(40px)'
                        }}
                        animate={{
                            x: [0, Math.random() * 100 - 50],
                            y: [0, Math.random() * 100 - 50],
                        }}
                        transition={{
                            duration: Math.random() * 30 + 20,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            ease: 'easeInOut'
                        }}
                    />
                ))}
            </motion.div>

            {/* Main Form Container */}
            <motion.div
                ref={formRef}
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                className={`w-full max-w-md mx-4 p-8 rounded-2xl shadow-xl z-10 ${darkMode ? 'bg-gray-800/90 backdrop-blur-md border border-gray-700/50' : 'bg-white/90 backdrop-blur-md border border-gray-100/50'} transition-all duration-500`}
                whileHover={{
                    boxShadow: darkMode ? '0 20px 50px -10px rgba(0, 0, 0, 0.3)' : '0 20px 50px -10px rgba(99, 102, 241, 0.2)',
                    y: -5
                }}
            >
                {/* Success State with Particles */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-4 rounded-lg bg-green-100/90 text-green-800 dark:bg-green-900/90 dark:text-green-200 flex items-center gap-3 relative overflow-hidden"
                        >
                            {particles.map(particle => (
                                <motion.div
                                    key={particle.id}
                                    className="absolute rounded-full"
                                    style={{
                                        left: `${particle.x}%`,
                                        top: `${particle.y}%`,
                                        width: `${particle.size}px`,
                                        height: `${particle.size}px`,
                                        backgroundColor: particle.color,
                                        opacity: particle.opacity
                                    }}
                                />
                            ))}
                            <CheckCircle className="flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold">Registration Successful!</h3>
                                <p className="text-sm">Redirecting you to your dashboard...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-4 rounded-lg bg-red-100/90 text-red-800 dark:bg-red-900/90 dark:text-red-200 flex items-center gap-3"
                        >
                            <AlertCircle className="flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold">Registration Failed</h3>
                                <p className="text-sm">{errors.general}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header with Logo */}
                <div className="text-center mb-10 relative">
                    <motion.div
                        className="absolute top-0 right-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-amber-300' : 'bg-gray-100 text-gray-700'}`}
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                    </motion.div>

                    <motion.div
                        className="flex justify-center mb-4"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                    >
                        <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-gradient-to-br from-indigo-100 to-purple-100'} shadow-lg`}>
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    y: [0, -5, 5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                    ease: 'easeInOut'
                                }}
                            >
                                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.h1
                        className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Create Your Account
                    </motion.h1>

                    <motion.p
                        className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Join us to get started
                    </motion.p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Username Input */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <label
                            htmlFor="username"
                            className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className={`h-5 w-5 ${focusedField === 'username' ? 'text-indigo-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            </div>
                            <motion.input
                                ref={usernameRef}
                                type="text"
                                id="username"
                                name="username"
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.username ? 'border-red-500' : focusedField === 'username' ? 'border-indigo-500' : darkMode ? 'border-gray-600' : 'border-gray-300'} ${darkMode ? 'bg-gray-700/50 text-white focus:ring-2 focus:ring-indigo-500/50' : 'bg-white/50 text-gray-800 focus:ring-2 focus:ring-indigo-500/50'} transition-all duration-300 focus:outline-none`}
                                placeholder="yourusername"
                                value={credentials.username}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                                autoComplete="username"
                                disabled={isLoading || success}
                                whileFocus={{
                                    boxShadow: darkMode
                                        ? '0 0 0 2px rgba(99, 102, 241, 0.5)'
                                        : '0 0 0 2px rgba(99, 102, 241, 0.3)'
                                }}
                            />
                            {errors.username && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                            )}
                        </div>
                        {errors.username && (
                            <motion.p
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {errors.username}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Email Input */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label
                            htmlFor="email"
                            className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className={`h-5 w-5 ${focusedField === 'email' ? 'text-indigo-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            </div>
                            <motion.input
                                ref={emailRef}
                                type="email"
                                id="email"
                                name="email"
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : focusedField === 'email' ? 'border-indigo-500' : darkMode ? 'border-gray-600' : 'border-gray-300'} ${darkMode ? 'bg-gray-700/50 text-white focus:ring-2 focus:ring-indigo-500/50' : 'bg-white/50 text-gray-800 focus:ring-2 focus:ring-indigo-500/50'} transition-all duration-300 focus:outline-none`}
                                placeholder="you@example.com"
                                value={credentials.email}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                autoComplete="email"
                                disabled={isLoading || success}
                                whileFocus={{
                                    boxShadow: darkMode
                                        ? '0 0 0 2px rgba(99, 102, 241, 0.5)'
                                        : '0 0 0 2px rgba(99, 102, 241, 0.3)'
                                }}
                            />
                            {errors.email && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                            )}
                        </div>
                        {errors.email && (
                            <motion.p
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {errors.email}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Password Input */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <label
                                htmlFor="password"
                                className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Password
                            </label>
                            <motion.button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`text-xs flex items-center gap-1 ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {showPassword ? (
                                    <>
                                        <EyeOff className="h-3 w-3" /> Hide
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-3 w-3" /> Show
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className={`h-5 w-5 ${focusedField === 'password' ? 'text-indigo-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            </div>
                            <motion.input
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className={`w-full pl-10 pr-10 py-3 rounded-lg border ${errors.password ? 'border-red-500' : focusedField === 'password' ? 'border-indigo-500' : darkMode ? 'border-gray-600' : 'border-gray-300'} ${darkMode ? 'bg-gray-700/50 text-white focus:ring-2 focus:ring-indigo-500/50' : 'bg-white/50 text-gray-800 focus:ring-2 focus:ring-indigo-500/50'} transition-all duration-300 focus:outline-none`}
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                autoComplete="new-password"
                                disabled={isLoading || success}
                                whileFocus={{
                                    boxShadow: darkMode
                                        ? '0 0 0 2px rgba(99, 102, 241, 0.5)'
                                        : '0 0 0 2px rgba(99, 102, 241, 0.3)'
                                }}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {capsLockOn && (
                                <motion.p
                                    className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <AlertCircle className="h-3 w-3" /> Caps Lock is on
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {errors.password && (
                            <motion.p
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {errors.password}
                            </motion.p>
                        )}

                        {/* Password Strength Meter */}
                        {credentials.password && (
                            <motion.div
                                className="mt-2"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex gap-1 h-1.5 mb-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.div
                                            key={i}
                                            className={`flex-1 rounded-full ${i <= passwordStrength ?
                                                (passwordStrength <= 2 ? 'bg-red-500' :
                                                    passwordStrength === 3 ? 'bg-yellow-500' : 'bg-green-500') :
                                                (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {passwordStrength <= 2 ? 'Weak password' :
                                        passwordStrength === 3 ? 'Good password' : 'Strong password'}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Confirm Password Input */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <label
                                htmlFor="confirmPassword"
                                className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Confirm Password
                            </label>
                            <motion.button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={`text-xs flex items-center gap-1 ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {showConfirmPassword ? (
                                    <>
                                        <EyeOff className="h-3 w-3" /> Hide
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-3 w-3" /> Show
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className={`h-5 w-5 ${focusedField === 'confirmPassword' ? 'text-indigo-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            </div>
                            <motion.input
                                ref={confirmPasswordRef}
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`w-full pl-10 pr-10 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : focusedField === 'confirmPassword' ? 'border-indigo-500' : darkMode ? 'border-gray-600' : 'border-gray-300'} ${darkMode ? 'bg-gray-700/50 text-white focus:ring-2 focus:ring-indigo-500/50' : 'bg-white/50 text-gray-800 focus:ring-2 focus:ring-indigo-500/50'} transition-all duration-300 focus:outline-none`}
                                placeholder="••••••••"
                                value={credentials.confirmPassword}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('confirmPassword')}
                                onBlur={() => setFocusedField(null)}
                                autoComplete="new-password"
                                disabled={isLoading || success}
                                whileFocus={{
                                    boxShadow: darkMode
                                        ? '0 0 0 2px rgba(99, 102, 241, 0.5)'
                                        : '0 0 0 2px rgba(99, 102, 241, 0.3)'
                                }}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <motion.button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        {errors.confirmPassword && (
                            <motion.p
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {errors.confirmPassword}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Terms and Conditions */}
                    <motion.div
                        className="flex items-start mb-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <div className="flex items-center h-5">
                            <motion.input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={() => setTermsAccepted(!termsAccepted)}
                                className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-indigo-500' : 'bg-white border-gray-300 text-indigo-600'} focus:ring-indigo-500 focus:ring-offset-0`}
                                whileTap={{ scale: 0.9 }}
                            />
                        </div>
                        <div className="ml-3">
                            <label
                                htmlFor="terms"
                                className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                                I agree to the{' '}
                                <motion.a
                                    href="#terms"
                                    className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                                    whileHover={{ textDecoration: 'underline' }}
                                >
                                    Terms and Conditions
                                </motion.a>
                            </label>
                            {errors.terms && (
                                <motion.p
                                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {errors.terms}
                                </motion.p>
                            )}
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className={`w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2 ${darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'} text-white font-medium shadow-lg transition-all duration-300 relative overflow-hidden`}
                        disabled={isLoading || success}
                        whileHover={{
                            scale: 1.02,
                            boxShadow: darkMode
                                ? '0 5px 15px -3px rgba(99, 102, 241, 0.4)'
                                : '0 5px 15px -3px rgba(99, 102, 241, 0.5)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                    >
                        {isLoading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </motion.div>
                                Creating account...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="h-5 w-5" />
                                Success!
                            </>
                        ) : (
                            <>
                                <span>Sign Up</span>
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                        {!isLoading && !success && (
                            <motion.span
                                className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 0.1 }}
                            />
                        )}
                    </motion.button>

                    {/* Login Link */}
                    <motion.div
                        className="mt-6 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                    >
                        <p onClick={() => navigate('/login')} className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Already have an account?{' '}
                            <motion.a
                                className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                                whileHover={{
                                    x: 2,
                                    textDecoration: 'underline'
                                }}
                            >
                                Sign in
                            </motion.a>
                        </p>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default SignupPage;