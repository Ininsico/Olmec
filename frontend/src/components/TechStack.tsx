import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Cpu, Globe, Layers } from 'lucide-react';

const TechStack: React.FC = () => {
    const ref = useRef(null);
    const mobileContainerRef = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    const { scrollYProgress } = useScroll({
        target: mobileContainerRef,
        offset: ["start start", "end end"]
    });

    const card1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.35], [1, 1, 0]);
    const card1Scale = useTransform(scrollYProgress, [0, 0.3, 0.35], [1, 1, 0.8]);

    const card2Opacity = useTransform(scrollYProgress, [0.3, 0.35, 0.65, 0.7], [0, 1, 1, 0]);
    const card2Scale = useTransform(scrollYProgress, [0.3, 0.35, 0.65, 0.7], [0.8, 1, 1, 0.8]);

    const card3Opacity = useTransform(scrollYProgress, [0.65, 0.7, 1], [0, 1, 1]);
    const card3Scale = useTransform(scrollYProgress, [0.65, 0.7, 1], [0.8, 1, 1]);

    const cardsTransforms = [
        { opacity: card1Opacity, scale: card1Scale },
        { opacity: card2Opacity, scale: card2Scale },
        { opacity: card3Opacity, scale: card3Scale }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
        }
    };

    const techItems = [
        {
            icon: <Globe className="w-8 h-8" />,
            title: "WebGL",
            description: "Bringing hardware-accelerated, professional-grade graphics directly to the DOM without plugins."
        },
        {
            icon: <Layers className="w-8 h-8" />,
            title: "WebAssembly",
            description: "Near-native performance allowing complex physics calculations and rendering engines to run in-browser."
        },
        {
            icon: <Cpu className="w-8 h-8" />,
            title: "GoLang",
            description: "Robust, concurrent backend infrastructure capable of handling massive multi-user 3D environments."
        }
    ];

    return (
        <section
            ref={ref}
            className="relative w-full py-12 md:py-32 bg-cream-50"
        >
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="max-w-5xl mx-auto"
                >
                    {/* Header (Desktop Only) */}
                    <motion.div variants={itemVariants} className="hidden md:block text-center mb-20 scroll-m-20">
                        <span className="text-sm font-semibold tracking-widest text-richred-700 uppercase mb-4 block">
                            The Architecture
                        </span>
                        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                            Blender power. <br />
                            <span className="font-serif italic font-normal text-richred-700">
                                Browser accessibility.
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            Passion shouldn't be gated by hardware. We're rebuilding the 3D pipeline to run on any device, anywhere.
                        </p>
                    </motion.div>

                    {/* Desktop Grid (Hidden on Mobile) */}
                    <div className="hidden md:grid md:grid-cols-3 gap-8">
                        {techItems.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group p-8 rounded-3xl bg-white border border-slate-200 hover:border-richred-200 hover:shadow-xl hover:shadow-richred-900/5 transition-all duration-500"
                            >
                                <div className="mb-6 mx-auto md:mx-0 w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center text-richred-700 group-hover:bg-richred-50 group-hover:scale-110 transition-all duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 font-serif">
                                    {item.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Sticky Scroll (Full Section Pinned) */}
                    <div ref={mobileContainerRef} className="md:hidden h-[300vh] relative">
                        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-4">

                            {/* Mobile Header (Pinned) */}
                            <div className="text-center mb-8 w-full max-w-sm">
                                <span className="text-xs font-semibold tracking-widest text-richred-700 uppercase mb-2 block">
                                    The Architecture
                                </span>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                                    Blender power. <br />
                                    <span className="font-serif italic font-normal text-richred-700">
                                        Browser accessibility.
                                    </span>
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Rebuilding the 3D pipeline for any device.
                                </p>
                            </div>

                            {/* Cards Stack */}
                            <div className="relative w-full h-[300px] flex items-center justify-center">
                                {techItems.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        style={{
                                            opacity: cardsTransforms[index].opacity,
                                            scale: cardsTransforms[index].scale,
                                            position: 'absolute',
                                            width: '100%',
                                            zIndex: index
                                        }}
                                        className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl"
                                    >
                                        <div className="mb-4 w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center text-richred-700">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                        <div className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest text-right">
                                            {index + 1} / {techItems.length}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Narrative Block */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-20 p-10 md:p-14 bg-slate-900 rounded-[2.5rem] text-center md:text-left relative overflow-hidden"
                    >
                        {/* Abstract BG */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-slate-800 to-transparent opacity-50 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1">
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    Breaking the Hardware Barrier
                                </h3>
                                <p className="text-slate-300 text-lg leading-relaxed">
                                    Majority of aspiring 3D artists are held back by expensive GPU requirements.
                                    By leveraging WebAssembly and authorized cloud computing, we offload the heavy lifting—giving a Chromebook the rendering capabilities of a workstation.
                                </p>
                            </div>
                            <div className="shrink-0">
                                <button className="px-8 py-4 bg-richred-700 text-white font-bold rounded-xl hover:bg-richred-600 transition-colors shadow-lg shadow-richred-900/20">
                                    View Documentation
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default TechStack;
