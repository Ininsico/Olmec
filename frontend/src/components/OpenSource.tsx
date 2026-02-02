import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, Heart, GitBranch, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const OpenSource: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

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



    return (
        <section
            ref={ref}
            className="relative w-full py-32 bg-white overflow-hidden text-slate-900"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="container mx-auto px-4 lg:px-12 relative z-10">

                {/* Mobile View: Overlay Card (Single Section, High Quality) */}
                <div className="lg:hidden relative w-full bg-slate-900 rounded-[2rem] overflow-hidden p-8 py-12 text-center border border-slate-800 shadow-2xl">
                    {/* Abstract Background Code */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none font-mono text-[10px] leading-relaxed text-left p-4 text-emerald-400 overflow-hidden select-none">
                        {Array(20).fill(0).map((_, i) => (
                            <div key={i}>
                                <span className="text-blue-400">const</span> <span className="text-yellow-300">transparency</span> = <span className="text-orange-300">true</span>;<br />
                                <span className="text-slate-500">// We build in public</span><br />
                                <span className="text-purple-400">if</span> (user.wantsToBuild) {'{'}<br />
                                &nbsp;&nbsp;fork(repo);<br />
                                {'}'}<br />
                            </div>
                        ))}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />

                    {/* Content Overlay */}
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                            <GitBranch size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300">
                                MIT License
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold mb-4 leading-tight text-white">
                            Transparency is <br />
                            <span className="font-serif italic font-normal text-emerald-400">
                                only policy.
                            </span>
                        </h2>

                        <p className="text-sm text-slate-300 mb-8 leading-relaxed max-w-xs mx-auto">
                            Ininsico is 100% open source. Audit, fork, or contribute.
                        </p>

                        <a href="https://github.com/Ininsico/olmec" target="_blank" rel="noopener noreferrer" className="w-full max-w-[200px]">
                            <Button variant="primary" size="lg" className="w-full gap-2 text-sm bg-white text-slate-900 hover:bg-slate-200 border-none">
                                <Github size={18} />
                                Star Repo
                            </Button>
                        </a>
                    </motion.div>
                </div>


                {/* Desktop Layout: Side-by-Side (Hidden on Mobile) */}
                <div className="hidden lg:grid grid-cols-2 gap-16 items-center">

                    {/* Left: Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        className="text-left"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-8">
                            <GitBranch size={16} className="text-richred-700" />
                            <span className="text-xs font-mono tracking-wider uppercase text-slate-600">
                                MIT License
                            </span>
                        </motion.div>

                        <motion.h2 variants={itemVariants} className="text-6xl font-bold mb-6 leading-tight text-slate-900">
                            Transparency is our <br />
                            <span className="font-serif italic font-normal text-richred-700">
                                only policy.
                            </span>
                        </motion.h2>

                        <motion.p variants={itemVariants} className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                            We believe 3D creation tools should be accessible to everyone. That's why Ininsico is 100% open source.
                            Audit our code, contribute a feature, or fork it and build something entirely new.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex gap-4 justify-start">
                            <a href="https://github.com/Ininsico/olmec" target="_blank" rel="noopener noreferrer">
                                <Button variant="dark" size="lg" className="gap-3 px-8 shadow-xl shadow-slate-900/20">
                                    <Github size={20} />
                                    Star on GitHub
                                    <span className="ml-2 px-2 py-0.5 rounded-md bg-white/20 text-xs font-mono">1.2k</span>
                                </Button>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="lg" className="gap-2 border-slate-300 hover:bg-slate-50 text-slate-700">
                                    <Heart size={20} className="text-richred-600" />
                                    Sponsor Project
                                </Button>
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Right: Terminal / Contribute Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-lg"
                    >
                        <div className="relative bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-800 overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                            {/* Glow Effect */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-richred-500/10 rounded-full blur-[80px]" />

                            {/* Header / Tabs */}
                            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                </div>
                                <div className="ml-4 px-3 py-1 rounded bg-white/10 text-[10px] font-mono text-slate-400">
                                    bash — 80x24
                                </div>
                            </div>

                            {/* Main Content: Command */}
                            <div className="space-y-6">
                                {/* Command Line Visual */}
                                <div className="font-mono text-sm space-y-2">
                                    <div className="flex gap-2">
                                        <span className="text-emerald-400">➜</span>
                                        <span className="text-blue-400">~</span>
                                        <span className="text-slate-300">git clone https://github.com/ininsico/olmec.git</span>
                                    </div>
                                    <div className="text-slate-500 pl-4 border-l-2 border-slate-800 ml-1">
                                        Cloning into 'olmec'...<br />
                                        Remote: Enumerating objects: 1024, done.<br />
                                        Remote: Total 1024 (delta 342), reused 0 (delta 0)<br />
                                        Receiving objects: 100% (1024/1024), 2.45 MiB | 5.20 MiB/s, done.<br />
                                        Resolving deltas: 100% (342/342), done.
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-emerald-400">➜</span>
                                        <span className="text-blue-400">olmec</span>
                                        <span className="text-slate-300">ls -la</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-slate-400 pl-4 text-xs opacity-80">
                                        <span>drwxr-xr-x  src</span>
                                        <span>-rw-r--r--  package.json</span>
                                        <span>drwxr-xr-x  public</span>
                                        <span>-rw-r--r--  README.md</span>
                                        <span>drwxr-xr-x  components</span>
                                        <span>-rw-r--r--  tsconfig.json</span>
                                    </div>
                                    <div className="flex gap-2 animate-pulse mt-4">
                                        <span className="text-emerald-400">➜</span>
                                        <span className="text-blue-400">olmec</span>
                                        <span className="text-slate-300">npm install_</span>
                                    </div>
                                </div>

                                {/* Call to Action in Terminal */}
                                <a
                                    href="https://github.com/Ininsico/olmec"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-8 pt-6 border-t border-white/10 group-hover:border-richred-500/30 transition-colors"
                                >
                                    <div className="flex items-center justify-between text-slate-400 group-hover:text-white transition-colors">
                                        <span className="font-mono text-xs uppercase tracking-widest">Ready to build?</span>
                                        <div className="flex items-center gap-2 text-sm font-bold text-richred-400">
                                            Contribute now <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default OpenSource;
