import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    TrendingUp,
    Network,
    LogOut,
    Calendar,
    Activity,
    ArrowRight,
    Box,
    Upload,
    FolderOpen,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Plus,
    HardDrive,
    Clock,
    FileText,
    Zap,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState('overview');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const modules = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'builder', name: '3D Model Builder', icon: Box },
        { id: 'models', name: 'My Models', icon: FolderOpen },
        { id: 'printer', name: '3D Printer', icon: Upload },
        { id: 'chat', name: 'Community Chat', icon: Network },
        { id: 'collaborate', name: 'Live Collaboration', icon: Activity },
        { id: 'code', name: 'Code Editor', icon: TrendingUp },
        { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    ];

    const getCurrentDate = () => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date().toLocaleDateString('en-US', options);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return 'Good Morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good Afternoon';
        } else if (hour >= 17 && hour < 21) {
            return 'Good Evening';
        } else {
            return 'Good Night';
        }
    };

    const handleModuleClick = (moduleId: string) => {
        setActiveModule(moduleId);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cream-50 to-slate-100 flex">
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Desktop */}
            <motion.aside
                animate={{ width: isCollapsed ? '80px' : '256px' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden lg:flex bg-white border-r border-slate-200 flex-col relative"
            >
                {/* Collapse Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Profile Section */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-slate-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <button
                                    onClick={() => navigate('/edit-profile')}
                                    className="w-full flex items-center space-x-3 hover:bg-slate-50 rounded-xl p-2 -m-2 transition-colors"
                                >
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-richred-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border-2 border-slate-200">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="text-left overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-slate-500 whitespace-nowrap">
                                            Edit Profile
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Modules */}
                <nav className="flex-1 p-4">
                    <div className="mb-4">
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3"
                                >
                                    Analysis Modules
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <div className="space-y-1">
                            {modules.map((module) => {
                                const Icon = module.icon;
                                const isActive = activeModule === module.id;
                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => setActiveModule(module.id)}
                                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-slate-900 text-white shadow-lg'
                                            : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        title={isCollapsed ? module.name : ''}
                                    >
                                        <Icon size={20} className="flex-shrink-0" />
                                        <AnimatePresence>
                                            {!isCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="font-medium text-sm whitespace-nowrap overflow-hidden"
                                                >
                                                    {module.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        {isActive && !isCollapsed && (
                                            <ArrowRight size={16} className="ml-auto flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all`}
                        title={isCollapsed ? 'End Session' : ''}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="font-medium text-sm whitespace-nowrap overflow-hidden"
                                >
                                    End Session
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-50 lg:hidden"
                    >
                        {/* Mobile Header */}
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900">Menu</h2>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile Section */}
                        <div className="p-6 border-b border-slate-200">
                            <button
                                onClick={() => {
                                    navigate('/edit-profile');
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-3 hover:bg-slate-50 rounded-xl p-2 -m-2 transition-colors"
                            >
                                {user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-slate-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-richred-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border-2 border-slate-200">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Edit Profile
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
                                Analysis Modules
                            </p>
                            <div className="space-y-1">
                                {modules.map((module) => {
                                    const Icon = module.icon;
                                    const isActive = activeModule === module.id;
                                    return (
                                        <button
                                            key={module.id}
                                            onClick={() => handleModuleClick(module.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                ? 'bg-slate-900 text-white shadow-lg'
                                                : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span className="font-medium text-sm">{module.name}</span>
                                            {isActive && <ArrowRight size={16} className="ml-auto" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-slate-200">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                                <LogOut size={20} />
                                <span className="font-medium text-sm">End Session</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                                    {getGreeting()}, <span className="text-richred-600 italic">{user?.name || 'User'}</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="hidden sm:flex items-center space-x-2 text-slate-600 bg-slate-100 px-3 sm:px-4 py-2 rounded-xl">
                                <Calendar size={18} />
                                <span className="text-xs sm:text-sm font-medium">{getCurrentDate()}</span>
                            </div>
                            <button className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <span className="text-lg">🔔</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {activeModule === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-8"
                        >
                            {/* Top Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Box size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Projects</p>
                                        <h3 className="text-2xl font-black text-slate-900">0</h3>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <HardDrive size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Storage Used</p>
                                        <h3 className="text-2xl font-black text-slate-900">0% <span className="text-sm font-medium text-slate-400">/ 5GB</span></h3>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Render Hours</p>
                                        <h3 className="text-2xl font-black text-slate-900">--</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Projects & Actions */}
                                <div className="lg:col-span-2 space-y-8">

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <button
                                                onClick={() => setActiveModule('builder')}
                                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-richred-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-richred-600/20 group-hover:scale-110 transition-transform">
                                                    <Plus size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">New Project</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveModule('upload')}
                                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                                    <Upload size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">Import File</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveModule('collaborate')}
                                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform">
                                                    <Users size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">Collaborate</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveModule('code')}
                                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center mb-3 shadow-lg shadow-slate-800/20 group-hover:scale-110 transition-transform">
                                                    <FileText size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">Scripting</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Recent Projects */}
                                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm min-h-[300px]">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
                                            <button
                                                onClick={() => setActiveModule('models')}
                                                className="text-sm font-bold text-richred-600 hover:text-richred-700"
                                            >
                                                View All
                                            </button>
                                        </div>

                                        {/* Empty State */}
                                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[200px]">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <FolderOpen size={32} className="text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No recent projects</h3>
                                            <p className="text-sm text-slate-500 mb-4">Start creating to see your work here.</p>
                                            <button
                                                onClick={() => setActiveModule('builder')}
                                                className="text-richred-600 font-bold text-sm hover:underline"
                                            >
                                                Create your first project &rarr;
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Sidebar Widgets */}
                                <div className="space-y-8">
                                    {/* System Status */}
                                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="relative">
                                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                                <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75" />
                                            </div>
                                            <span className="font-bold tracking-wide text-sm">SYSTEM STATUS</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                                <span className="text-slate-400">Rendering Engine</span>
                                                <span className="text-emerald-400 font-bold">Online</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                                <span className="text-slate-400">Storage API</span>
                                                <span className="text-emerald-400 font-bold">Online</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Collaboration</span>
                                                <span className="text-emerald-400 font-bold">Online</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Latest Updates */}
                                    <div className="bg-gradient-to-br from-cream-50 to-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Zap size={18} className="text-amber-500" />
                                            What's New
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="text-sm group cursor-pointer">
                                                <p className="font-bold text-slate-800 group-hover:text-richred-600 transition-colors">Ininsico v1.0.2 Released</p>
                                                <p className="text-slate-500 mt-1">Improved rendering performance for glass materials.</p>
                                            </div>
                                            <div className="text-sm group cursor-pointer pt-4 border-t border-slate-100">
                                                <p className="font-bold text-slate-800 group-hover:text-richred-600 transition-colors">Community Challenge</p>
                                                <p className="text-slate-500 mt-1">Participate in the "Cyberpunk City" build-off.</p>
                                            </div>
                                        </div>
                                        <button className="w-full mt-6 py-2 text-xs font-bold text-slate-400 hover:text-richred-600 uppercase tracking-widest transition-colors">
                                            View Changelog
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeModule === 'builder' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-slate-200 p-8 min-h-[60vh] flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center mb-8">
                                <Box size={48} className="text-richred-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to Create?</h2>
                            <p className="text-xl text-slate-500 mb-12 max-w-lg">
                                Launch the advanced 3D editor to start building your masterpiece.
                                Optimized for WebGL 2.0.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                                <button
                                    onClick={() => navigate('/builder')}
                                    className="group relative overflow-hidden bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-8 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Plus size={64} />
                                    </div>
                                    <div className="relative z-10 flex flex-col items-start h-full justify-between">
                                        <div className="p-3 rounded-lg bg-white/10 mb-4">
                                            <Plus size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-xl font-bold mb-1">New Project</h3>
                                            <p className="text-slate-400 text-sm">Start from scratch</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    className="group relative overflow-hidden bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl p-8 transition-all hover:scale-105 active:scale-95 hover:shadow-lg"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Box size={64} />
                                    </div>
                                    <div className="relative z-10 flex flex-col items-start h-full justify-between">
                                        <div className="p-3 rounded-lg bg-slate-100 mb-4">
                                            <Box size={24} className="text-slate-700" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-xl font-bold mb-1">Templates</h3>
                                            <p className="text-slate-500 text-sm">Browse 50+ starters</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeModule === 'upload' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-slate-200 p-6 lg:p-8"
                        >
                            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-4 lg:mb-6">Upload 3D Model</h2>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center">
                                <Upload size={48} className="mx-auto text-slate-400 mb-4" />
                                <h3 className="text-base lg:text-lg font-bold text-slate-900 mb-2">Drag and drop your model here</h3>
                                <p className="text-xs lg:text-sm text-slate-600 mb-4">or click to browse files</p>
                                <button className="bg-richred-600 hover:bg-richred-700 text-white font-bold py-2 lg:py-3 px-4 lg:px-6 rounded-xl transition-all text-sm lg:text-base">
                                    Choose File
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeModule === 'models' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-slate-200 p-6 lg:p-8"
                        >
                            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-4 lg:mb-6">My Models</h2>
                            <div className="text-center py-12">
                                <Box size={64} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 text-sm lg:text-base">No models uploaded yet</p>
                            </div>
                        </motion.div>
                    )}

                    {activeModule === 'analytics' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-slate-200 p-6 lg:p-8"
                        >
                            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-4 lg:mb-6">Analytics Dashboard</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                                    <p className="text-xs lg:text-sm font-bold text-blue-600 mb-2">Total Views</p>
                                    <p className="text-2xl lg:text-3xl font-black text-blue-900">0</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                                    <p className="text-xs lg:text-sm font-bold text-green-600 mb-2">Total Likes</p>
                                    <p className="text-2xl lg:text-3xl font-black text-green-900">0</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                                    <p className="text-xs lg:text-sm font-bold text-purple-600 mb-2">Total Models</p>
                                    <p className="text-2xl lg:text-3xl font-black text-purple-900">0</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
