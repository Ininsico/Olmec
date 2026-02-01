import { useState } from 'react'
import { motion } from 'framer-motion'
import './Hero.css';
const EliteFooter = () => {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Only these routes will actually navigate
    const functionalRoutes = {
        contact: '/contact',
        privacy: '/privacy',
        terms: '/terms',
        security: '/security'
    };

    // Navigation items (most are non-functional # links)
    const navItems = [
        { name: 'Work', path: '/' },
        { name: 'Expertise', path: '/' },
        { name: 'Approach', path: '/' },
        { name: 'Insights', path: '/' },
        { name: 'Case Studies', path: '/' }
    ];

    // Social media links (external)
    const socialLinks = [
        {
            name: 'LinkedIn',
            icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
            url: 'https://linkedin.com/company/ininsico'
        },
        {
            name: 'Twitter',
            icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
            url: 'https://twitter.com/ininsico'
        },
        {
            name: 'Instagram',
            icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
            url: 'https://instagram.com/ininsico'
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubscribed(true);
        setEmail('');
        setTimeout(() => setIsSubscribed(false), 3000);
    };

    return (
        <footer className="relative bg-black text-gray-300 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-[size:60px_60px] animate-grid-scroll"></div>
            </div>
            <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-blue-900/20 blur-[100px]"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-900/20 blur-[100px]"></div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 py-20 border-b border-gray-800">
                    {/* Newsletter */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold text-white mb-6">Join Our Inner Circle</h3>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Subscribe to receive exclusive insights on cutting-edge 3D technologies and elite project showcases.
                        </p>

                        {isSubscribed ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-6 py-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center gap-3"
                            >
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-green-300">You're now part of our elite network</span>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your professional email"
                                    className="flex-1 px-5 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
                                    required
                                />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg text-white font-bold whitespace-nowrap transition-all"
                                >
                                    Get Access
                                </motion.button>
                            </form>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6">Navigation</h3>
                        <ul className="space-y-3">
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.path}
                                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="group-hover:text-cyan-400 transition-colors">→</span>
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6">Connect</h3>
                        <address className="not-italic space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">New York HQ</p>
                                <p className="text-gray-400">SF BOYS HOSTEL</p>
                                <p className="text-gray-400">rOOM NUMBER 172</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Contact</p>
                                <a href="mailto:contact@ininsico.com" className="text-gray-400 hover:text-white transition-colors">
                                    contact@ininsico.com
                                </a>
                                <p className="text-gray-400">+92 3315821144</p>
                            </div>
                        </address>
                    </div>
                </div>

                {/* Bottom footer */}
                <div className="py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo and copyright */}
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-2xl font-black text-white hover:text-cyan-400 transition-colors">
                            ININSICO
                        </a>
                        <div className="h-6 w-px bg-gray-700"></div>
                        <p className="text-gray-500 text-sm">
                            © {currentYear} ININSICO. All rights reserved.
                        </p>
                    </div>

                    {/* Social and legal */}
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="flex gap-6">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    whileHover={{ y: -2 }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d={social.icon} />
                                    </svg>
                                </motion.a>
                            ))}
                        </div>

                        <div className="flex gap-6 text-sm">
                            <a
                                href={functionalRoutes.privacy}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                Privacy
                            </a>
                            <a
                                href={functionalRoutes.terms}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                Terms
                            </a>
                            <a
                                href={functionalRoutes.security}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                Security
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ultra-premium decorative element */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        </footer>
    );
};

export default EliteFooter