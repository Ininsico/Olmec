
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, GraduationCap, Gamepad2, Building2, ArrowRight, MonitorPlay, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Solutions: React.FC = () => {
    const industries = [
        {
            icon: <ShoppingBag className="w-8 h-8 text-richred-600" />,
            title: "E-Commerce",
            description: "Boost conversion rates with interactive 3D product configurators that load instantly on mobile."
        },
        {
            icon: <GraduationCap className="w-8 h-8 text-neutral-600" />,
            title: "Education",
            description: "Teach 3D modeling and geometry in schools without expensive workstations or software licenses."
        },
        {
            icon: <Gamepad2 className="w-8 h-8 text-richred-600" />,
            title: "Web Gaming",
            description: "Deploy lightweight, multiplayer 3D experiences that run natively in the browser via WebAssembly."
        },
        {
            icon: <Building2 className="w-8 h-8 text-neutral-600" />,
            title: "Architecture",
            description: "Share immersive walkthroughs with clients via a simple link. No plugins required."
        }
    ];

    return (
        <div className="pt-24 bg-cream-50 min-h-screen">
            {/* Hero Section */}
            <section className="py-20 container mx-auto px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-bold text-slate-900 mb-6"
                >
                    Solutions for <br />
                    <span className="font-serif italic text-richred-700">every dimension.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
                >
                    Whether you're selling products, teaching students, or building worlds,
                    Olmec provides the infrastructure to make it accessible.
                </motion.p>
            </section>

            {/* Industries Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {industries.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-10 rounded-[2rem] bg-cream-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-xl transition-all duration-500"
                            >
                                <div className="mb-6 w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {item.description}
                                </p>
                                <div className="flex items-center text-richred-700 font-semibold text-sm group-hover:gap-2 transition-all">
                                    Learn more <ArrowRight size={16} className="ml-1" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive Section */}
            <section className="py-24 bg-cream-50 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <span className="text-sm font-bold tracking-widest text-richred-600 uppercase mb-4 block">
                                Case Study
                            </span>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6">
                                The Future of E-Commerce
                            </h2>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                Static images are obsolete. Olmec enables brands to integrate fully interactive 3D viewers directly into their storefronts.
                                <br /><br />
                                Users can rotate, zoom, and customize products in real-time, leading to a <strong>40% increase in engagement</strong> and <strong>20% reduction in returns</strong>.
                            </p>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-richred-100 flex items-center justify-center">
                                        <MonitorPlay size={14} className="text-richred-700" />
                                    </div>
                                    <span className="font-medium">60FPS performance on mobile devices</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-richred-100 flex items-center justify-center">
                                        <Share2 size={14} className="text-richred-700" />
                                    </div>
                                    <span className="font-medium">One-click AR preview generation</span>
                                </li>
                            </ul>
                            <Button variant="primary">
                                View Demo Store
                            </Button>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="aspect-square bg-white rounded-[3rem] shadow-2xl p-8 relative z-10 flex flex-col items-center justify-center border border-slate-100">
                                {/* Abstract Product Visual */}
                                <div className="w-48 h-48 bg-gradient-to-tr from-richred-500 to-orange-400 rounded-full blur-2xl opacity-20 absolute" />
                                <div className="relative z-10 w-64 h-64 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                                    <ShoppingBag size={64} className="text-slate-300" />
                                </div>
                                <div className="mt-8 flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-richred-600 border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                                    <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                                </div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-richred-100 rounded-full -z-0" />
                            <div className="absolute -top-10 -left-10 w-24 h-24 bg-slate-200 rounded-full -z-0" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 bg-neutral-900 text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for scale.</h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto mb-10 text-lg">
                        Our infrastructure scales automatically to handle millions of simultaneous connections.
                        Focus on building; we handle the rendering.
                    </p>
                    <Button variant="outline" size="lg" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white">
                        Talk to an Enterprise Expert
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Solutions;
