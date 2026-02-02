import React from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Printer,
    Users,
    Github,
    ArrowRight,
    Check,
    Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const Product: React.FC = () => {

    const FeatureSection = ({ title, description, icon: Icon, align = 'left', points }: any) => (
        <section className="py-24 lg:py-32 overflow-hidden">
            <div className="container mx-auto px-6 lg:px-8">
                <div className={`flex flex-col lg:flex-row items-center gap-16 ${align === 'right' ? 'lg:flex-row-reverse' : ''}`}>

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 space-y-8"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#B31212] flex items-center justify-center shadow-lg transform -rotate-3">
                            <Icon size={32} className="text-white" />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                            {title}
                        </h2>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            {description}
                        </p>
                        <ul className="space-y-4">
                            {points.map((point: string) => (
                                <li key={point} className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FADADA] flex items-center justify-center">
                                        <Check size={14} className="text-[#B31212]" />
                                    </div>
                                    <span className="text-lg text-slate-700 font-medium">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Visual Content Placeholder - We'll create abstract geometric compositions since we don't have screenshots */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 w-full"
                    >
                        <div className="relative aspect-square lg:aspect-[4/3] rounded-[40px] bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 overflow-hidden shadow-2xl p-8 flex items-center justify-center group">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                            {/* Animated Abstract UI Representation */}
                            <div className="relative z-10 w-full max-w-sm">
                                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 transform transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-[#FADADA] flex items-center justify-center">
                                            <Icon size={24} className="text-[#B31212]" />
                                        </div>
                                        <div>
                                            <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                                            <div className="h-3 w-20 bg-slate-100 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-slate-100 rounded"></div>
                                        <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                                        <div className="h-2 w-4/6 bg-slate-100 rounded"></div>
                                    </div>
                                    <div className="mt-6 flex gap-3">
                                        <div className="h-10 w-full bg-slate-900 rounded-lg"></div>
                                        <div className="h-10 w-12 bg-[#B31212] rounded-lg"></div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#B31212] rounded-2xl shadow-lg transform rotate-12 opacity-20 backdrop-blur-xl"></div>
                                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-slate-900 rounded-full shadow-lg opacity-5 backdrop-blur-xl"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white pt-32 pb-20">
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
                        <h1 className="text-6xl lg:text-8xl font-black mb-8 text-slate-900 tracking-tight">
                            Build. Print. <br />
                            <span className="text-[#B31212]">Collaborate.</span>
                        </h1>
                        <p className="text-xl lg:text-3xl text-slate-600 mb-10 leading-relaxed font-medium">
                            The first open-source ecosystem dedicated to democratizing 3D creation for everyone.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button variant="primary" className="px-10 py-8 text-xl bg-[#B31212] hover:bg-[#8B0000] text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                                    Start Building Now <ArrowRight className="ml-3" size={24} />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Feature 1: The Builder */}
            <FeatureSection
                title="Professional 3D Model Builder"
                description="Experience a powerful modeling engine right in your browser. Whether you're sculpting organic shapes or designing precision mechanical parts, our builder adapts to your workflow."
                icon={Box}
                align="left"
                points={[
                    "WebGL-powered real-time rendering",
                    "Procedural generation using standard code",
                    "Advanced material & texture editor",
                    "Instant export to .STL, .OBJ, and .GLTF"
                ]}
            />

            {/* Feature 2: Collaboration */}
            <div className="bg-cream-50">
                <FeatureSection
                    title="Real-Time Multiplayer"
                    description="Design doesn't have to be lonely. Invite your team, share a link, and start co-creating instantly. See cursors, changes, and chats in real-time."
                    icon={Users}
                    align="right"
                    points={[
                        "Live cursor tracking & presence",
                        "Voice & video chat built-in",
                        "Granular permission controls",
                        "Session recording and playback"
                    ]}
                />
            </div>

            {/* Feature 3: Printing */}
            <FeatureSection
                title="Direct-to-Print Integration"
                description="Skip the SD cards. Connect your 3D printers directly to ININSICO and manage your entire production farm from a single dashboard."
                icon={Printer}
                align="left"
                points={[
                    "Cloud slicing engine (Cura/Slic3r compatible)",
                    "Live webcam monitoring & timelapse",
                    "G-code analysis & optimization",
                    "Multi-printer queue management"
                ]}
            />

            {/* Feature 4: AI & Code */}
            <div className="bg-cream-50">
                <FeatureSection
                    title="AI-Assisted Workflow"
                    description="Let our intelligent assistants handle the tedious parts. Generate base meshes from text, optimize topology automatically, and write scripts faster."
                    icon={Cpu}
                    align="right"
                    points={[
                        "Text-to-3D model generation",
                        "Smart support structure generation",
                        "Python scripting for automation",
                        "Geometric error detection"
                    ]}
                />
            </div>

            {/* Open Source Manifesto Section */}
            <section className="py-32 bg-white text-slate-900 relative overflow-hidden border-t border-slate-200">
                <div className="container mx-auto px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-10">
                        <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-6 py-2 border border-slate-200">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-mono text-sm tracking-wider text-slate-600">MIT LICENSE · FREE FOREVER</span>
                        </div>

                        <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900">
                            Built by the Community, <br />
                            <span className="text-[#B31212]">For the Community.</span>
                        </h2>

                        <p className="text-2xl text-slate-600 leading-relaxed font-light">
                            ININSICO is an open-source initiative to democratize manufacturing. We are just getting started, and we need your help to build the future.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 pt-10">
                            {[
                                { label: "Project Status", value: "Public Beta" },
                                { label: "Roadmap", value: "Active Development" },
                                { label: "License", value: "MIT Open Source" }
                            ].map((stat) => (
                                <div key={stat.label} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                                    <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                                    <div className="text-slate-500 uppercase tracking-widest text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
                            <a href="https://github.com/ininsico/olmec" target="_blank" rel="noopener noreferrer">
                                <Button className="h-16 px-10 text-xl bg-slate-900 text-white hover:bg-slate-800 rounded-xl flex items-center gap-3">
                                    <Github size={24} />
                                    View on GitHub
                                </Button>
                            </a>
                            <Link to="/signup">
                                <Button className="h-16 px-10 text-xl bg-[#B31212] text-white hover:bg-[#8B0000] rounded-xl border border-transparent">
                                    Start Contributing
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Product;
