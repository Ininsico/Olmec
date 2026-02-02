import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero: React.FC = () => {
    const targetRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    // Move freely to the right as you scroll
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

    return (
        <section ref={targetRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
            {/* Background Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <h1 className="text-[25vw] font-bold text-transparent tracking-tighter select-none"
                    style={{ WebkitTextStroke: '2px #1a1a1a' }}>
                    ININSICO
                </h1>
            </div>

            {/* 2D Circle Logo */}
            <motion.div
                style={{ x, rotate }}
                className="relative z-10 w-64 h-64 flex items-center justify-center"
            >
                <img
                    src="/Ininsicologo.png"
                    alt="Ininsico Logo"
                    className="w-full h-full object-contain"
                />
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-[#8B0000] pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex flex-col items-center"
                >
                    <span className="text-xs mb-1 font-bold tracking-widest opacity-80">SCROLL</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.div>
            </motion.div>
        </section>
    )
}
export default Hero;
