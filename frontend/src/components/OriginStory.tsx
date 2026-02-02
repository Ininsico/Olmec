import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const OriginStory: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20%" });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
        }
    };

    const logoVariants = {
        hidden: { opacity: 0, scale: 0.9, rotate: -5 },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }
        }
    };

    return (
        <section
            ref={ref}
            className="relative min-h-[80vh] w-full flex items-center bg-[#FDFBF7] overflow-hidden py-24"
        >
            <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-2 gap-4 md:gap-12 lg:gap-24 items-center">

                    {/* Left Column: Text Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        className=""
                    >
                        {/* Decorative Line & Meta */}
                        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] w-8 lg:w-12 bg-richred-700/30" />
                            <span className="text-[10px] lg:text-sm font-semibold tracking-widest text-richred-700 uppercase">
                                Est. 2024 — COMSATS Abbottabad
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h2
                            variants={itemVariants}
                            className="text-3xl md:text-5xl lg:text-7xl font-bold text-slate-900 mb-4 lg:mb-8 leading-[0.95] tracking-tight"
                        >
                            Forged in the <br />
                            <span className="font-serif italic text-richred-700 font-normal">
                                Dorm Rooms.
                            </span>
                        </motion.h2>

                        {/* Narrative */}
                        <motion.div variants={itemVariants} className="space-y-6 max-w-lg">
                            <p className="text-sm md:text-xl text-slate-600 leading-relaxed font-medium">
                                No corporate funding. Just raw ambition.
                            </p>
                            <p className="text-xs md:text-lg text-slate-500 leading-relaxed hidden sm:block">
                                What started as a Semester Competiton Project between lectures has evolved into a relentless pursuit of perfection. We stripped away the noise to focus on what matters: pure, unadulterated innovation built from the ground up.
                            </p>
                        </motion.div>

                        {/* CTA / Signature */}
                        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-richred-700">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                                        <path d="M10 8h4a1 1 0 0 1 1 1v7" />
                                        <path d="M14 12h-4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Ininsico Team</p>
                                    <p className="text-xs text-slate-500">Builders & Dreamers</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Logo Visual */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        className="flex justify-center lg:justify-end relative"
                    >
                        {/* Abstract background element for the logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 bg-gradient-to-tr from-richred-50/50 to-transparent rounded-full blur-3xl -z-10"
                        />

                        <motion.div variants={logoVariants} className="relative w-full max-w-md aspect-square flex items-center justify-center">
                            <img
                                src="/Comsats.png"
                                alt="Ininsico Emblem"
                                className="w-[80%] h-[80%] object-contain drop-shadow-2xl"
                            />
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default OriginStory;
