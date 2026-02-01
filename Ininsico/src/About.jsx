import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from './Home/Header';
import EliteFooter from './Home/footer';
const About = () => {
    return (
        <div>
            <Header />
            <Aboutpage />
            <EliteFooter />
        </div>
    )
}

const Aboutpage = () => {
    // Scroll animations with better tracking
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Header visibility state
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Handle header visibility on scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Scrolling down
                setIsHeaderVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolling up
                setIsHeaderVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Smoother transform values
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.5]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const visionY = useTransform(scrollYProgress, [0.1, 0.3], ["30%", "0%"]);
    const visionOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
    const timelineScale = useTransform(scrollYProgress, [0.3, 0.4, 0.5], [0.9, 1, 0.9]);
    const timelineOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);
    const tutorialRotate = useTransform(scrollYProgress, [0.5, 0.65], [0, 3]);
    const teamScale = useTransform(scrollYProgress, [0.65, 0.75], [0.8, 1]);
    const techOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1]);

    // Text animation
    const [displayText, setDisplayText] = useState("");
    const fullText = "Ininsico - 3D Design Revolution";

    // Video references
    const tutorialVideoRef = useRef(null);
    const makingOfVideoRef = useRef(null);
    const [isTutorialPlaying, setIsTutorialPlaying] = useState(false);
    const [isMakingOfPlaying, setIsMakingOfPlaying] = useState(false);

    // Text animation
    useEffect(() => {
        let charIndex = 0;
        const typeText = () => {
            if (charIndex < fullText.length) {
                setDisplayText(fullText.substring(0, charIndex + 1));
                charIndex++;
                setTimeout(typeText, Math.random() * 50 + 50);
            }
        };
        typeText();
    }, []);

    // Simplified Mouse Distortion Component
    const MouseDistortion = ({ children }) => {
        return (
            <motion.div
                style={{
                    transformOrigin: 'center',
                    transition: 'transform 0.5s ease-out'
                }}
                whileHover={{
                    scale: 1.02,
                    rotateY: [0, 2, -2, 0],
                    transition: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                }}
            >
                {children}
            </motion.div>
        );
    };

    // Optimized Team Member Component
    const TeamMember = ({ name, role, delay, color }) => {
        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                    delay: delay / 1000
                }}
                className={`relative rounded-2xl p-6 shadow-2xl w-64 h-64 flex flex-col items-center justify-center ${color} cursor-pointer`}
                whileHover={{ scale: 1.05, zIndex: 10 }}
            >
                <div className="w-24 h-24 bg-white/20 rounded-full mb-4 border-2 border-white/30"></div>
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <p className="text-white/80">{role}</p>
                <div className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none"></div>
            </motion.div>
        );
    };

    // Optimized Tech Orbiter
    const TechOrbiter = () => {
        const techItems = [
            { name: 'Blender', color: 'bg-orange-600' },
            { name: 'Maya', color: 'bg-blue-500' },
            { name: 'ZBrush', color: 'bg-gray-700' },
            { name: 'Substance', color: 'bg-yellow-400' },
            { name: 'Unreal', color: 'bg-gray-800' },
            { name: 'Unity', color: 'bg-gray-300' }
        ];

        return (
            <div className="relative w-64 h-64 mx-auto my-12">
                {techItems.map((tech, index) => {
                    const angle = (index * (360 / techItems.length)) * (Math.PI / 180);
                    const radius = 120;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                        <motion.div
                            key={tech.name}
                            className={`absolute w-16 h-16 rounded-full ${tech.color} flex items-center justify-center text-white font-bold text-xs shadow-lg`}
                            style={{
                                x,
                                y,
                                left: 'calc(50% - 32px)',
                                top: 'calc(50% - 32px)'
                            }}
                            animate={{
                                x,
                                y,
                                transition: {
                                    type: 'spring',
                                    stiffness: 50,
                                    damping: 10,
                                    delay: index * 0.1
                                }
                            }}
                            whileHover={{ scale: 1.2, zIndex: 10 }}
                        >
                            {tech.name}
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    // Optimized Video Player
    const VideoPlayer = ({ src, title, isPlaying, setIsPlaying, videoRef }) => {
        return (
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-auto"
                    controls={isPlaying}
                    onClick={() => {
                        if (!isPlaying) {
                            videoRef.current.play();
                            setIsPlaying(true);
                        }
                    }}
                />
                {!isPlaying && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                        onClick={() => {
                            videoRef.current.play();
                            setIsPlaying(true);
                        }}
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 className="absolute bottom-6 left-6 text-white text-xl font-bold">{title}</h3>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-x-hidden bg-black text-white"
        >
            {/* Hero Section */}
            <motion.section
                className="relative h-screen flex items-center justify-center overflow-hidden"
                style={{ scale: heroScale, opacity: heroOpacity }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90"></div>

                <MouseDistortion>
                    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                        <motion.h1
                            className="text-6xl md:text-8xl font-bold mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            style={{
                                background: 'linear-gradient(45deg, #ffffff, #3b82f6, #ffffff)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent'
                            }}
                        >
                            {displayText}
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            Redefining 3D design with intuitive tools and revolutionary workflows
                        </motion.p>

                        <motion.div
                            className="animate-bounce mt-20"
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="w-8 h-14 border-4 border-white/50 rounded-full mx-auto relative">
                                <motion.div
                                    className="absolute top-1 left-1/2 w-2 h-2 bg-white rounded-full"
                                    initial={{ y: 0, opacity: 0, x: '-50%' }}
                                    animate={{ y: 24, opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </MouseDistortion>
            </motion.section>

            {/* Origin Story Section */}
            <motion.section
                className="min-h-screen py-20 px-4 relative"
                style={{
                    y: visionY,
                    opacity: visionOpacity,
                    background: 'linear-gradient(to bottom, #000000, #0a0a1a)'
                }}
            >
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        className="text-4xl md:text-6xl font-bold mb-16 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        style={{
                            background: 'linear-gradient(45deg, #ffffff, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        Our Origin Story
                    </motion.h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <MouseDistortion>
                            <motion.div
                                className="relative bg-gray-900/80 rounded-xl p-8 h-full border border-gray-800 backdrop-blur-sm"
                                initial={{ x: -100, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl opacity-20 blur"></div>
                                <h3 className="text-2xl font-bold text-white mb-6">The Spark</h3>
                                <p className="text-lg text-white/80 leading-relaxed mb-6">
                                    Two months ago, our founder Arslan Rathore laid the foundational stone of the company to be founded,He always wanted to break into quantum computing and Armory devleopement so he came up with the idea of ininsico
                                </p>
                                <p className="text-lg text-white/80 leading-relaxed mb-6">
                                    Within a week, we had a team of passionate designers and engineers ready to rethink 3D modeling from the ground up.
                                </p>
                                <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-white/90 italic">"We don't just make tools - we remove barriers between imagination and creation."</p>
                                </div>
                            </motion.div>
                        </MouseDistortion>

                        <motion.div
                            className="relative h-96"
                            initial={{ x: 100, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black/80 rounded-2xl border border-gray-800/50 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <div className="text-5xl font-bold text-white mb-4">2 Months</div>
                                        <div className="text-xl text-blue-300">From concept to revolution</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Development Timeline Section */}
            <motion.section
                className="min-h-screen py-20 px-4 relative"
                style={{
                    scale: timelineScale,
                    opacity: timelineOpacity,
                    background: 'linear-gradient(to bottom, #0a0a1a, #000000)'
                }}
            >
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        className="text-4xl md:text-6xl font-bold mb-16 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        style={{
                            background: 'linear-gradient(45deg, #ffffff, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        Rapid Innovation Timeline
                    </motion.h2>

                    <div className="relative">
                        <div className="absolute left-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-300 -translate-x-1/2"></div>

                        <div className="space-y-32">
                            {[
                                {
                                    date: "8 Weeks Ago",
                                    title: "Lightbulb Moment",
                                    content: "Initial concept born from Sheer Determination and A a spark of Innovation",
                                    milestone: "💡",
                                    color: "from-blue-900/50 to-blue-900/20"
                                },
                                {
                                    date: "6 Weeks Ago",
                                    title: "Prototype Phase",
                                    content: "First functional prototype built in just 14 days",
                                    milestone: "🚀",
                                    color: "from-blue-800/50 to-blue-800/20"
                                },
                                {
                                    date: "4 Weeks Ago",
                                    title: "Design Iteration",
                                    content: "Complete UI overhaul based on artist feedback",
                                    milestone: "🎨",
                                    color: "from-blue-700/50 to-blue-700/20"
                                },
                                {
                                    date: "2 Weeks Ago",
                                    title: "Beta Launch",
                                    content: "Selected artists began testing in real workflows",
                                    milestone: "🔧",
                                    color: "from-blue-600/50 to-blue-600/20"
                                },
                                {
                                    date: "Now",
                                    title: "Public Release",
                                    content: "Ininsico available to all creators worldwide",
                                    milestone: "🌍",
                                    color: "from-blue-500/50 to-blue-500/20"
                                }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className={`relative flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                >
                                    <div className={`w-full md:w-1/2 p-6 rounded-2xl bg-gradient-to-b ${item.color} border border-blue-900/50 backdrop-blur-sm relative overflow-hidden`}>
                                        <div className="absolute -right-10 -top-10 text-8xl opacity-10">{item.milestone}</div>
                                        <div className="absolute top-6 -ml-14 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-300 flex items-center justify-center shadow-lg z-10">
                                            <div className="w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                        <div className="text-sm font-bold text-blue-300 mb-2">{item.date}</div>
                                        <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                                        <p className="text-white/80 relative z-10">{item.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Tutorial Section */}
            <motion.section
                className="min-h-screen py-20 px-4 relative bg-black"
                style={{ rotate: tutorialRotate }}
            >
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        className="text-4xl md:text-6xl font-bold mb-16 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        style={{
                            background: 'linear-gradient(45deg, #ffffff, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        Learn Ininsico
                    </motion.h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            className="relative"
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <VideoPlayer
                                src="/videos/tutorial.mp4"
                                title="Ininsico Tutorial"
                                isPlaying={isTutorialPlaying}
                                setIsPlaying={setIsTutorialPlaying}
                                videoRef={tutorialVideoRef}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <h3 className="text-3xl font-bold text-white mb-6">Interactive 3D Design Tutorials</h3>
                            <ul className="space-y-4">
                                {[
                                    "Step-by-step modeling workflows",
                                    "Real-time feedback on your designs",
                                    "Contextual help when you need it",
                                    "Customizable learning paths",
                                    "Community-created tutorials"
                                ].map((feature, i) => (
                                    <motion.li
                                        key={i}
                                        className="flex items-start"
                                        initial={{ x: 20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                    >
                                        <div className="flex-shrink-0 mt-1 mr-3 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <span className="text-white/90">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Making of section */}
                    <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="order-last lg:order-first"
                        >
                            <h3 className="text-3xl font-bold text-white mb-6">Behind the Scenes</h3>
                            <p className="text-white/80 mb-6">
                                See how we built Ininsico from the ground up, overcoming technical challenges to create a seamless 3D design experience.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Our development philosophy",
                                    "Technical breakthroughs",
                                    "Design decisions explained",
                                    "Team collaboration process",
                                    "Future roadmap"
                                ].map((feature, i) => (
                                    <motion.li
                                        key={i}
                                        className="flex items-start"
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                    >
                                        <div className="flex-shrink-0 mt-1 mr-3 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <span className="text-white/90">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <VideoPlayer
                                src="/videos/making-of.mp4"
                                title="Making of Ininsico"
                                isPlaying={isMakingOfPlaying}
                                setIsPlaying={setIsMakingOfPlaying}
                                videoRef={makingOfVideoRef}
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Team Section */}
            <motion.section
                className="min-h-screen py-20 px-4 relative overflow-hidden"
                style={{
                    scale: teamScale,
                    background: 'linear-gradient(to bottom, #000000, #0a0a1a)'
                }}
            >
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        className="text-4xl md:text-6xl font-bold mb-16 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        style={{
                            background: 'linear-gradient(45deg, #ffffff, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        The Ininsico Team
                    </motion.h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[60vh]">
                        <TeamMember
                            name="Arslan Rathore"
                            role="Founder & Lead Developer"
                            delay={0}
                            color="bg-gradient-to-br from-gray-800 to-black"
                        />
                        <TeamMember
                            name="Ayyan Chugttai"
                            role="3D Artist"
                            delay={200}
                            color="bg-gradient-to-br from-gray-700 to-gray-900"
                        />
                        <TeamMember
                            name="Huzaifa Safdar"
                            role="UX Designer"
                            delay={400}
                            color="bg-gradient-to-br from-gray-600 to-gray-800"
                        />
                        <TeamMember
                            name="Arslan Rathore"
                            role="Animator"
                            delay={600}
                            color="bg-gradient-to-br from-gray-500 to-gray-700"
                        />
                        <TeamMember
                            name="Huzaifa Safdar"
                            role="Engineer"
                            delay={800}
                            color="bg-gradient-to-br from-gray-400 to-gray-600"
                        />
                        <TeamMember
                            name="Ahmedullah"
                            role="Community Manager"
                            delay={1000}
                            color="bg-gradient-to-br from-gray-300 to-gray-500"
                        />
                    </div>
                </div>
            </motion.section>

            {/* Tech Stack Section */}
            <motion.section
                className="min-h-screen py-20 px-4 relative"
                style={{
                    opacity: techOpacity,
                    background: 'linear-gradient(to bottom, #0a0a1a, #000000)'
                }}
            >
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        className="text-4xl md:text-6xl font-bold mb-16 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        style={{
                            background: 'linear-gradient(45deg, #ffffff, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        Powered By
                    </motion.h2>

                    <TechOrbiter />

                    <motion.div
                        className="max-w-2xl mx-auto text-center"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <p className="text-xl text-white/80 mb-8">
                            Ininsico integrates with industry-standard tools while providing a unified, streamlined interface that eliminates context switching.
                        </p>
                        <motion.button
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-lg"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore Our Integrations
                        </motion.button>
                    </motion.div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <section className="min-h-screen py-20 px-4 relative bg-black flex items-center justify-center">
                <MouseDistortion>
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h2
                            className="text-4xl md:text-6xl font-bold mb-8"
                            initial={{ opacity: 0, y: -50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, margin: "-100px" }}
                            style={{
                                background: 'linear-gradient(45deg, #ffffff, #3b82f6)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                color: 'transparent'
                            }}
                        >
                            Ready to Transform Your 3D Workflow?
                        </motion.h2>

                        <motion.p
                            className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            Join the revolution in 3D design with Ininsico's intuitive platform.
                        </motion.p>

                        <motion.div
                            className="max-w-md mx-auto"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <motion.div className="mb-4" whileHover={{ scale: 1.02 }}>
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full px-6 py-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                            </motion.div>
                            <motion.button
                                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-bold text-lg shadow-lg"
                                whileHover={{
                                    scale: 1.02,
                                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Get Early Access
                            </motion.button>
                        </motion.div>
                    </div>
                </MouseDistortion>
            </section>
        </div>
    );
};

export default About;