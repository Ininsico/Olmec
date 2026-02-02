import React from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    Heart,
    Lightbulb,
    Users,
    Globe,
    Zap,
    Shield,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const About: React.FC = () => {
    const values = [
        {
            icon: Heart,
            title: 'Creator-First',
            description: 'Every feature we build is designed with creators in mind. Your workflow, your needs, our priority.'
        },
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'We push the boundaries of what\'s possible in 3D modeling with cutting-edge technology.'
        },
        {
            icon: Users,
            title: 'Community',
            description: 'Building a global community of 3D creators who learn, share, and grow together.'
        },
        {
            icon: Shield,
            title: 'Trust & Security',
            description: 'Your models and data are protected with enterprise-grade security and encryption.'
        }
    ];

    const milestones = [
        {
            year: '2024',
            title: 'The Vision',
            description: 'ININSICO was born from a simple idea: 3D modeling should be accessible, collaborative, and integrated.'
        },
        {
            year: '2025',
            title: 'Platform Launch',
            description: 'Released our first beta with core 3D modeling tools and cloud storage capabilities.'
        },
        {
            year: '2026',
            title: 'Real-Time Collaboration',
            description: 'Introduced live collaboration features, allowing multiple creators to work together seamlessly.'
        },
        {
            year: 'Future',
            title: 'AI-Powered Creation',
            description: 'Developing AI-assisted modeling tools and expanding 3D printer integration worldwide.'
        }
    ];

    const team = [
        {
            role: 'Platform',
            description: 'Building the most powerful 3D creation platform',
            stats: '50+ Features'
        },
        {
            role: 'Community',
            description: 'Growing a global network of 3D creators',
            stats: 'Open Beta'
        },
        {
            role: 'Innovation',
            description: 'Pushing boundaries with cutting-edge tech',
            stats: '24/7 Development'
        }
    ];

    return (
        <div className="min-h-screen bg-cream-100">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white pt-32 pb-12 lg:pt-48 lg:pb-20">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                </div>

                <div className="container mx-auto px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl lg:text-7xl font-black mb-6 text-slate-900">
                            Empowering <span className="text-richred-600">3D Creators</span> Worldwide
                        </h1>
                        <p className="text-xl lg:text-2xl text-slate-600 mb-8">
                            We're building the future of 3D creation—a platform where imagination meets innovation, and creators collaborate without boundaries.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-12 lg:py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center space-x-2 bg-richred-100 text-richred-700 px-4 py-2 rounded-full mb-6">
                                <Target size={20} />
                                <span className="font-bold">Our Mission</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
                                Democratizing 3D Creation
                            </h2>
                            <p className="text-lg text-slate-600 mb-6">
                                ININSICO was founded on the belief that powerful 3D modeling tools shouldn't be locked behind expensive software or steep learning curves. We're making professional-grade 3D creation accessible to everyone.
                            </p>
                            <p className="text-lg text-slate-600 mb-6">
                                Our platform combines intuitive design with advanced features, enabling both beginners and professionals to bring their 3D visions to life. From concept to creation to collaboration, we're with you every step of the way.
                            </p>
                            <Link to="/product">
                                <Button variant="primary" className="bg-richred-600 hover:bg-richred-700 text-white">
                                    Explore Our Platform <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-white rounded-3xl p-12 shadow-2xl border border-slate-200">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="text-4xl lg:text-5xl font-black mb-2 text-slate-900">Beta</div>
                                        <div className="text-slate-600 font-medium">Status</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl lg:text-5xl font-black mb-2 text-slate-900">Fast</div>
                                        <div className="text-slate-600 font-medium">Performance</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl lg:text-5xl font-black mb-2 text-slate-900">Global</div>
                                        <div className="text-slate-600 font-medium">Access</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl lg:text-5xl font-black mb-2 text-slate-900">Secure</div>
                                        <div className="text-slate-600 font-medium">Platform</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 lg:py-32 bg-slate-50">
                <div className="container mx-auto px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            The principles that guide everything we do at ININSICO.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-shadow"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-richred-500 to-richred-700 flex items-center justify-center mb-6">
                                        <Icon size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                                    <p className="text-slate-600">{value.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Journey/Timeline Section */}
            <section className="py-20 lg:py-32 bg-white">
                <div className="container mx-auto px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
                            Our Journey
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            From a simple idea to a global platform for 3D creators.
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={milestone.year}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative pl-8 pb-12 border-l-4 border-richred-600 last:pb-0"
                            >
                                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-richred-600 border-4 border-white" />
                                <div className="bg-slate-50 rounded-2xl p-6 ml-6">
                                    <div className="text-sm font-bold text-richred-600 mb-2">{milestone.year}</div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{milestone.title}</h3>
                                    <p className="text-slate-600">{milestone.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="py-20 lg:py-32 bg-cream-50">
                <div className="container mx-auto px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl lg:text-5xl font-black mb-4 text-slate-900">
                            What We're Building
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            A complete ecosystem for 3D creation, collaboration, and production.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((item, index) => (
                            <motion.div
                                key={item.role}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-shadow"
                            >
                                <div className="text-4xl font-black text-richred-600 mb-4">{item.stats}</div>
                                <h3 className="text-2xl font-bold mb-3 text-slate-900">{item.role}</h3>
                                <p className="text-slate-600">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section className="py-20 lg:py-32 bg-white">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
                                Powered by Cutting-Edge Technology
                            </h2>
                            <p className="text-lg text-slate-600 mb-6">
                                We leverage the latest web technologies to deliver a seamless, high-performance 3D creation experience directly in your browser.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#B31212] flex items-center justify-center flex-shrink-0">
                                        <Zap size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">WebGL Rendering</h4>
                                        <p className="text-slate-600">Real-time 3D graphics with 60fps performance</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#B31212] flex items-center justify-center flex-shrink-0">
                                        <Globe size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">Cloud Infrastructure</h4>
                                        <p className="text-slate-600">Scalable, secure, and always available</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#B31212] flex items-center justify-center flex-shrink-0">
                                        <Sparkles size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">AI Integration</h4>
                                        <p className="text-slate-600">Smart tools that enhance your creativity</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl p-8 shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Platform Capabilities</h3>
                            <div className="space-y-4">
                                {[
                                    'Real-time 3D rendering with Three.js',
                                    'WebRTC for live collaboration',
                                    'Cloud-based model storage & sync',
                                    'G-code generation for 3D printing',
                                    'Procedural modeling with code',
                                    'Real-time chat & video calls',
                                    'Version control & history',
                                    'API for custom integrations'
                                ].map((capability) => (
                                    <div key={capability} className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-[#FADADA] flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-[#B31212]" />
                                        </div>
                                        <span className="text-slate-700">{capability}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white border-t border-slate-200">
                <div className="container mx-auto px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-black mb-6 text-slate-900">
                            Join the ININSICO Community
                        </h2>
                        <p className="text-xl mb-8 text-slate-600 max-w-2xl mx-auto">
                            Be part of a growing community of creators pushing the boundaries of 3D design.
                        </p>
                        <Link to="/signup">
                            <Button variant="primary" className="px-8 py-6 text-lg bg-[#B31212] hover:bg-[#8B0000] text-white">
                                Start Creating Today <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
