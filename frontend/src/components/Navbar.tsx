import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowUserMenu(false);
    };

    const navLinks = [
        { name: 'Product', href: '/product' },
        { name: 'Contact', href: '/contact' },
        { name: 'About', href: '/about' },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-[100] transition-all duration-500",
                scrolled ? "py-4" : "py-8"
            )}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div
                    className={cn(
                        "relative flex justify-between items-center px-8 py-4 rounded-[24px] transition-all duration-500",
                        scrolled ? "bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/50" : "bg-transparent"
                    )}
                >
                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center space-x-10">
                        <Link to="/product" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors tracking-tight">
                            Product
                        </Link>
                        <Link to="/contact" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors tracking-tight">
                            Contact
                        </Link>
                        <Link to="/about" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors tracking-tight">
                            About
                        </Link>
                    </div>

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <img
                            src="/Ininsicologo.png"
                            alt="Ininsico Logo"
                            className="w-10 h-10 object-contain group-hover:rotate-6 transition-transform"
                        />
                        <span className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-richred-700 transition-colors">
                            ININSICO
                        </span>
                    </Link>

                    {/* Controls */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated && user ? (
                            <div className="hidden md:flex items-center space-x-4 relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    {user.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-richred-500 flex items-center justify-center text-white font-bold text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-bold text-slate-900">{user.name}</span>
                                </button>

                                {/* User Dropdown Menu */}
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                                        >
                                            <div className="p-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2 mr-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">Sign In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="dark" size="sm">
                                        Start Free <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <button
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-900 bg-slate-100 rounded-xl hover:bg-slate-200"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="lg:hidden absolute top-full left-0 w-full p-6"
                    >
                        <div className="glass-panel rounded-[32px] p-8 shadow-2xl border border-slate-200/50 flex flex-col space-y-6">
                            {navLinks.map((link) => (
                                <Link key={link.name} to={link.href} className="text-xl font-bold text-slate-900">{link.name}</Link>
                            ))}
                            <hr className="border-slate-100" />

                            {isAuthenticated && user ? (
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center space-x-3 px-4 py-2">
                                        {user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-richred-500 flex items-center justify-center text-white font-bold">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} className="mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <Link to="/login" className="w-full">
                                        <Button variant="outline" className="w-full">Login</Button>
                                    </Link>
                                    <Link to="/signup" className="w-full">
                                        <Button variant="primary" className="w-full">Sign Up</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
};

export default Navbar;
