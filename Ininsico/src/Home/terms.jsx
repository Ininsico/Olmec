import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Header from './Header';
import EliteFooter from './footer';

function TermsPage() {
    return (
        <div className="relative overflow-hidden">
            <Termer />
            <EliteFooter />
        </div>
    );
}

const Termer = () => {
    const containerRef = useRef(null);
    const floatingLightsRef = useRef(null);

    // Floating lights animation
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!floatingLightsRef.current) return;

            const { clientX, clientY } = e;
            const { left, top, width, height } = containerRef.current.getBoundingClientRect();

            const x = (clientX - left) / width * 100;
            const y = (clientY - top) / height * 100;

            floatingLightsRef.current.style.setProperty('--x', `${x}%`);
            floatingLightsRef.current.style.setProperty('--y', `${y}%`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden" ref={containerRef}>
            {/* Floating Dynamic Lights */}
            <div
                ref={floatingLightsRef}
                className="pointer-events-none fixed inset-0 z-0 transition duration-300"
                style={{
                    background: `
                        radial-gradient(
                            circle at var(--x, 50%) var(--y, 50%),
                            rgba(42, 195, 222, 0.1) 0%,
                            transparent 70%
                        )
                    `,
                }}
            />

            {/* Glow Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-900/20 blur-[100px] opacity-70" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-900/20 blur-[100px] opacity-70" />

            <main className="relative z-10 flex-grow">
                <div className="container mx-auto px-6 py-20 max-w-5xl">
                    {/* Hero Section */}
                    <motion.section
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 text-center"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            Terms of Service
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </motion.section>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        {[
                            {
                                title: "Acceptance of Terms",
                                content: (
                                    <>
                                        <p>By accessing ININSICO's platform ("Service"), you agree to these Terms. These apply to all users.</p>
                                        <p><strong>Restricted Uses:</strong> Strictly prohibited:</p>
                                        <ul>
                                            <li>Military/defense applications</li>
                                            <li>Weapons development</li>
                                            <li>Illegal/harmful content</li>
                                        </ul>
                                    </>
                                ),
                            },
                            {
                                title: "License & Ownership",
                                content: (
                                    <>
                                        <p><strong>Your Content:</strong> You retain full ownership.</p>
                                        <p><strong>AI Output:</strong> Royalty-free except for:</p>
                                        <ul>
                                            <li>NFTs $1M valuation</li>
                                            <li>Mass production (1000+ units)</li>
                                        </ul>
                                    </>
                                ),
                            },
                            {
                                title: "User Responsibilities",
                                content: (
                                    <>
                                        <p><strong>Account Security:</strong> You're responsible for credentials.</p>
                                        <p><strong>Content Standards:</strong> No:</p>
                                        <ul>
                                            <li>Copyright infringement</li>
                                            <li>Malicious code</li>
                                            <li>Illegal/harmful material</li>
                                        </ul>
                                    </>
                                ),
                            },
                            {
                                title: "Payments & Subscriptions",
                                content: (
                                    <>
                                        <p><strong>Fees:</strong> Certain features require payment.</p>
                                        <p><strong>Renewals:</strong> Auto-renew unless canceled.</p>
                                        <p><strong>Refunds:</strong> 14-day window for unused credits.</p>
                                    </>
                                ),
                            },
                            {
                                title: "Termination",
                                content: (
                                    <>
                                        <p>We may terminate accounts for violations.</p>
                                        <p>Upon termination, service access ends immediately.</p>
                                    </>
                                ),
                            },
                        ].map((section, index) => (
                            <motion.section
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                whileHover={{
                                    y: -5,
                                    boxShadow: "0 25px 50px -12px rgba(74, 222, 255, 0.2)"
                                }}
                                className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-cyan-400/30 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                <div className="flex items-start gap-6">
                                    <motion.div
                                        className="text-cyan-400 text-3xl font-bold"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        {index + 1}
                                    </motion.div>
                                    <div>
                                        <motion.h2
                                            className="text-2xl font-bold text-white mb-4"
                                            whileHover={{ x: 5 }}
                                        >
                                            {section.title}
                                        </motion.h2>
                                        <div className="space-y-4 text-gray-300">
                                            {section.content}
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        ))}

                        {/* Contact Card (3D Hover Effect) */}
                        <motion.div
                            initial={{ scale: 0.95 }}
                            whileInView={{ scale: 1 }}
                            whileHover={{
                                y: -10,
                                boxShadow: "0 20px 50px -10px rgba(42, 195, 222, 0.4)"
                            }}
                            className="mt-16 p-8 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all"
                        >
                            <h3 className="text-2xl font-bold text-white mb-4">Need legal clarification?</h3>
                            <p className="text-gray-300 mb-6 max-w-2xl">
                                Contact our compliance team for custom licensing or questions.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <motion.a
                                    href="mailto:legal@ininsico.com"
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium text-center"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Email Legal Team
                                </motion.a>
                                <motion.a
                                    href="/contact"
                                    className="px-6 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-900/30 rounded-lg font-medium text-center"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Request Callback
                                </motion.a>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default TermsPage;