import { useRef, useState, useEffect, Suspense } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF, Float, Sphere, Text, Center, useTexture, Loader } from '@react-three/drei'
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';
import { useNavigate } from 'react-router-dom';


gsap.registerPlugin(ScrollTrigger);

// Preload the texture to avoid pop-in
// Preload the texture to avoid pop-in
useTexture.preload('/Ininsicologo.png')

const TexturedGlobe = () => {
    const texture = useTexture('/Ininsicologo.png')
    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <Sphere args={[1.5, 32, 32]} rotation={[0, 4.7, 0]}>
                <meshStandardMaterial
                    map={texture}
                    color="#ffffff"
                    roughness={0.5}
                    metalness={0}
                />
            </Sphere>
        </Float>
    )
}

const ScrollScene = () => {
    const globeRef = useRef()

    useFrame(() => {
        if (globeRef.current) {
            const scrollY = window.scrollY
            const height = window.innerHeight
            // progress: 0 at top, 1 at end of first section
            const progress = Math.min(scrollY / height, 1)

            // Move to right (x: 0 -> 4)
            // You can adjust the easing or exact value
            globeRef.current.position.x = progress * 4
        }
    })

    return (
        <group ref={globeRef}>
            <TexturedGlobe />
        </group>
    )
}

const LuxuryAgencyWebsite = () => {
    return (
        <div className="relative">
            {/* Global Fixed 3D Background */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-white">
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <ambientLight intensity={2} />
                    <spotLight position={[10, 10, 10]} intensity={2} angle={0.2} penumbra={1} />
                    <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ffd1d1" />

                    <Suspense fallback={null}>
                        <ScrollScene />
                    </Suspense>
                </Canvas>
                <Loader
                    initialState={(active) => active}
                    dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
                    containerStyles={{ background: '#ffffff' }}
                    innerStyles={{ border: '1px solid #c4302b' }}
                    barStyles={{ background: '#c4302b' }}
                    dataStyles={{ color: '#000000', fontSize: '1rem', fontFamily: 'monospace' }}
                />
            </div>

            {/* Content Sections (Transparent Backgrounds) */}
            <div className="relative z-10">
                {/* <Header /> Replaced by global Navbar */}
                <Hero />
                <Features />
                <ShowcaseDemo />
                <Testimonials />
                <CaseStudies />
                <EliteClients />
                <EliteFooter />
            </div>
        </div>
    )
}
const EliteClients = () => {
    const clients = [
        {
            name: "Lockheed Martin",
            logo: "/jet.png",  // Replace with your actual path
            category: "Aerospace & Defense"
        },
        {
            name: "Northrop Grumman",
            logo: "/raptor.png",  // Replace with your actual path
            category: "Defense Systems"
        },
        {
            name: "SpaceX",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/SpaceX_logo_black.svg/1200px-SpaceX_logo_black.svg.png",
            category: "Space Technologies"
        },
        {
            name: "Feadship",
            logo: "/ship.png",  // Replace with your actual path
            category: "Luxury Yachts"
        },
        {
            name: "Rolls-Royce",
            logo: "/RR.png",  // Replace with your actual path
            category: "Aviation & Marine"
        },
        {
            name: "Boeing Defense",
            logo: "/Boeing.png",  // Replace with your actual path
            category: "Aerospace"
        },
        {
            name: "Lürssen",
            logo: "/pilsen.png",  // Replace with your actual path
            category: "Superyachts"
        },
        {
            name: "NASA",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1200px-NASA_logo.svg.png",
            category: "Space Exploration"
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-gray-950 to-black">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Trusted by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Best of the Best</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Partnering with global leaders in aerospace, defense, and luxury engineering
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {clients.map((client, i) => (
                        <div
                            key={i}
                            className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 hover:border-cyan-400/30 transition-all group"
                        >
                            <div className="h-24 flex items-center justify-center mb-4">
                                <img
                                    src={client.logo}
                                    alt={client.name}
                                    className="max-h-16 w-auto grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://via.placeholder.com/150x75.png/333333/cccccc?text=${client.name.replace(/\s+/g, '+')}`;
                                    }}
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-white mb-1">{client.name}</h3>
                                <p className="text-xs text-gray-400">{client.category}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-gray-900/50 border border-gray-800 rounded-full">
                        <span className="text-white font-medium">Want to work with us?</span>
                        <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-white font-bold group">
                            Contact Elite Team
                            <span className="group-hover:rotate-45 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};


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
        { name: 'Work', path: '#' },
        { name: 'Expertise', path: '#' },
        { name: 'Approach', path: '#' },
        { name: 'Insights', path: '#' },
        { name: 'Case Studies', path: '#' }
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
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Comsat Abbobatad</p>
                                <p className="text-gray-400">SF Boys Hostel,First Floor,Iqbal Block</p>
                                <p className="text-gray-400">Room Number 172</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Contact</p>
                                <a href="mailto:contact@ininsico.com" className="text-gray-400 hover:text-white transition-colors">
                                    contact@ininsico.com
                                </a>
                                <p className="text-gray-400">+92 (331) 5821144</p>
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


const CaseStudies = () => {
    const projects = [
        {
            title: "F-35 Lightning II Interactive Training",
            client: "Lockheed Martin",
            stats: "↓70% training time",
            image: "/F-35.jpg",
            tags: ["3D Simulation", "Procedural Damage", "WebXR"],
            bgColor: "bg-gradient-to-br from-blue-900/80 to-gray-900"
        },
        {
            title: "Luxury Yacht Configurator",
            client: "Feadship",
            stats: "↑350% lead conversion",
            image: "/YACHT.jpg",
            tags: ["Real-time Rendering", "Material Editor", "AR Preview"],
            bgColor: "bg-gradient-to-br from-amber-900/80 to-gray-900"
        },
        {
            title: "SpaceX Mission Visualization",
            client: "NASA Collab",
            stats: "5M+ impressions",
            image: "/spacex.jpg",
            tags: ["Physics Simulation", "Data Visualization", "WebGL"],
            bgColor: "bg-gradient-to-br from-purple-900/80 to-gray-900"
        }
    ];

    return (
        <section className="relative py-32 bg-black overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:60px_60px] animate-grid-scroll"></div>
            </div>

            {/* Floating lights */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-900/20 blur-[100px]"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-900/20 blur-[100px]"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20">
                    <div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="inline-block px-4 py-2 mb-4 text-sm font-mono tracking-widest bg-gray-900 rounded-full text-cyan-400 border border-gray-800"
                        >
                            MILESTONE PROJECTS
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-5xl md:text-6xl font-bold text-white max-w-2xl"
                        >
                            Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Precision</span> Meets Innovation
                        </motion.h2>
                    </div>
                    <motion.button
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group mt-8 lg:mt-0 flex items-center gap-3 px-6 py-3 bg-transparent border border-gray-700 rounded-full text-white hover:bg-gray-900/50 transition-all"
                    >
                        All Case Studies
                        <span className="group-hover:rotate-45 transition-transform">→</span>
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {projects.map((project, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="group relative h-[500px] rounded-2xl overflow-hidden"
                        >
                            {/* Background overlay */}
                            <div className={`absolute inset-0 ${project.bgColor} opacity-90 z-10`}></div>

                            {/* Project image */}
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>

                            {/* Content */}
                            <div className="relative z-20 h-full flex flex-col justify-between p-8">
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tags.map((tag, j) => (
                                            <span key={j} className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white border border-gray-700">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                                    <p className="text-gray-300 font-medium">{project.client}</p>
                                </div>

                                <div className="mt-auto">
                                    <div className="text-cyan-400 text-lg font-bold mb-2">{project.stats}</div>
                                    <button className="flex items-center gap-2 text-white group">
                                        Explore Project
                                        <span className="group-hover:rotate-45 transition-transform">→</span>
                                    </button>
                                </div>
                            </div>

                            {/* Hover effect */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400/50 rounded-2xl z-30 pointer-events-none transition-all duration-500"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
const Testimonials = () => {
    const sectionRef = useRef(null);
    const testimonialRefs = useRef([]);
    const [isMobile, setIsMobile] = useState(false);

    // Initialize refs array and check mobile
    useEffect(() => {
        testimonialRefs.current = [];
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // GSAP animations
    useEffect(() => {
        if (!sectionRef.current) return;

        const cards = testimonialRefs.current.filter(Boolean);
        if (cards.length === 0) return;

        const ctx = gsap.context(() => {
            // Animate each testimonial card
            cards.forEach((card, index) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        toggleActions: "play none none none",
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: "back.out(1.7)",
                });

                // 3D tilt effect (desktop only)
                if (!isMobile) {
                    const handleMouseMove = (e) => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const angleX = (y - centerY) / 20;
                        const angleY = (centerX - x) / 20;

                        gsap.to(card, {
                            rotationX: angleX,
                            rotationY: angleY,
                            transformPerspective: 1000,
                            ease: "power2.out",
                            duration: 0.5,
                        });
                    };

                    const handleMouseLeave = () => {
                        gsap.to(card, {
                            rotationX: 0,
                            rotationY: 0,
                            duration: 1,
                            ease: "elastic.out(1, 0.5)",
                        });
                    };

                    card.addEventListener("mousemove", handleMouseMove);
                    card.addEventListener("mouseleave", handleMouseLeave);

                    // Return cleanup function for this card
                    return () => {
                        card.removeEventListener("mousemove", handleMouseMove);
                        card.removeEventListener("mouseleave", handleMouseLeave);
                    };
                }
            });
        }, sectionRef); // scope the context to the section

        return () => ctx.revert(); // cleanup all GSAP animations and ScrollTriggers
    }, [isMobile]);

    // Testimonial data
    const testimonials = [
        {
            name: "Mubashir",
            role: "3D Artist",
            quote: "This tool transformed my workflow. My renders went from amateur to pro-level in days!",
            rating: 5,
            glowColor: "hover:shadow-cyan-500/50",
        },
        {
            name: "Ayyan",
            role: "VFX Specialist",
            quote: "The lighting automation saved me hours. Never going back to manual tweaking!",
            rating: 5,
            glowColor: "hover:shadow-purple-500/50",
        },
        {
            name: "Ahmedullah",
            role: "Game Developer",
            quote: "Unreal how much time this saves. The auto-texturing is a game-changer!",
            rating: 5,
            glowColor: "hover:shadow-amber-500/50",
        },
        {
            name: "Hanzala",
            role: "Core-Commander Pak Army",
            quote: "Making Models and Designing NEXT GEN Fighter Jets - this truly changes everything!",
            rating: 4,
            glowColor: "hover:shadow-emerald-500/50",
        },
    ];

    return (
        <section
            ref={sectionRef}
            className="py-24 bg-gradient-to-b from-gray-100 to-white"
        >
            <div className="container mx-auto px-6 max-w-7xl">
                <h2 className="text-4xl font-bold text-center text-gray-900 relative inline-block mx-auto mb-4">
                    What the Pros Say
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
                </h2>
                <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
                    Don't take our word for it—here's what the legends think.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.name}
                            ref={el => testimonialRefs.current[index] = el}
                            className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${testimonial.glowColor} hover:-translate-y-2`}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <div className="flex mb-4 text-yellow-400 text-xl">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </div>
                            <p className="text-gray-700 italic text-lg mb-6">"{testimonial.quote}"</p>
                            <div className="mt-auto">
                                <h3 className="font-bold text-gray-900 text-xl">{testimonial.name}</h3>
                                <p className="text-gray-500 text-sm">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ShowcaseDemo = () => {
    const sliderRef = useRef(null);
    const beforeRef = useRef(null);
    const afterRef = useRef(null);
    const handleRef = useRef(null);
    const sectionRef = useRef(null);
    const containerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // GSAP Animations + Slider Logic + 3D Tilt Effect
    useEffect(() => {
        // Scroll-triggered animations
        gsap.from(".showcase-title", {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
        });

        gsap.from(".showcase-subtitle", {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 70%",
                toggleActions: "play none none none",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 0.3,
            ease: "power2.out",
        });

        gsap.from(".cta-button", {
            scrollTrigger: {
                trigger: sliderRef.current,
                start: "bottom 80%",
                toggleActions: "play none none none",
            },
            scale: 0.5,
            opacity: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
        });

        // Before/After Slider Drag Logic
        let isDragging = false;
        const slider = sliderRef.current;
        const before = beforeRef.current;
        const after = afterRef.current;
        const handle = handleRef.current;

        const moveSlider = (e) => {
            if (!isDragging) return;
            const rect = slider.getBoundingClientRect();
            let x = e.clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percent = (x / rect.width) * 100;

            gsap.to(after, { width: `${percent}%`, duration: 0.1 });
            gsap.to(handle, { left: `${percent}%`, duration: 0.1 });
        };

        // For touch devices
        const moveSliderTouch = (e) => {
            if (!isDragging) return;
            const rect = slider.getBoundingClientRect();
            let x = e.touches[0].clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            const percent = (x / rect.width) * 100;

            gsap.to(after, { width: `${percent}%`, duration: 0.1 });
            gsap.to(handle, { left: `${percent}%`, duration: 0.1 });
        };

        handle.addEventListener("mousedown", () => (isDragging = true));
        handle.addEventListener("touchstart", () => (isDragging = true), { passive: true });
        window.addEventListener("mouseup", () => (isDragging = false));
        window.addEventListener("touchend", () => (isDragging = false));
        slider.addEventListener("mousemove", moveSlider);
        slider.addEventListener("touchmove", moveSliderTouch, { passive: false });

        // 3D Tilt Effect
        if (!isMobile && containerRef.current) {
            const container = containerRef.current;

            const handleTilt = (e) => {
                const { left, top, width, height } = container.getBoundingClientRect();
                const centerX = left + width / 2;
                const centerY = top + height / 2;
                const posX = e.clientX - centerX;
                const posY = e.clientY - centerY;
                const tiltX = (posY / height) * 10; // Swapped X/Y for more natural tilt
                const tiltY = -(posX / width) * 10;

                gsap.to(container, {
                    rotationX: tiltX,
                    rotationY: tiltY,
                    transformPerspective: 1000,
                    ease: "power2.out",
                    duration: 0.5
                });
            };

            const resetTilt = () => {
                gsap.to(container, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 1,
                    ease: "elastic.out(1, 0.5)"
                });
            };

            container.addEventListener("mousemove", handleTilt);
            container.addEventListener("mouseleave", resetTilt);

            return () => {
                slider.removeEventListener("mousemove", moveSlider);
                slider.removeEventListener("touchmove", moveSliderTouch);
                if (container) {
                    container.removeEventListener("mousemove", handleTilt);
                    container.removeEventListener("mouseleave", resetTilt);
                }
            };
        } else {
            return () => {
                slider.removeEventListener("mousemove", moveSlider);
                slider.removeEventListener("touchmove", moveSliderTouch);
            };
        }
    }, [isMobile]);

    return (
        <section className="showcase" ref={sectionRef}>
            <div className="container" ref={containerRef}>
                <h2 className="showcase-title">
                    From <span className="text-messy">Messy</span> to{" "}
                    <span className="text-masterpiece">Masterpiece</span>
                </h2>
                <p className="showcase-subtitle">
                    See how our tool transforms raw models into stunning 3D art.
                </p>

                {/* Before & After Slider */}
                <div className="before-after-slider" ref={sliderRef}>
                    <div className="before" ref={beforeRef}>
                        <img src="/before.png" alt="Raw 3D Model" />
                    </div>
                    <div className="after" ref={afterRef}>
                        <img src="/after.png" alt="Rendered 3D Model" />
                    </div>
                    <div className="slider-handle" ref={handleRef}>
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path d="M8 5l5 5-5 5z" fill="currentColor" />
                            <path d="M16 5l5 5-5 5z" fill="currentColor" />
                        </svg>
                    </div>
                </div>

                <button className="cta-button">Try It Yourself →</button>
            </div>
        </section>
    );
};

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed w-full z-50 py-4 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md py-3' : 'bg-transparent'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-2xl font-black text-white cursor-pointer"
                >
                    ININSICO
                </motion.div>

                <nav className="hidden md:flex gap-12">
                    {[
                        { label: "About", href: "/about" },
                        { label: "Developers", href: "/developers" },
                        { label: "Documentation", href: "/documentation" },
                        { label: "Register", href: "/signup" },
                    ].map(({ label, href }) => (
                        <motion.a
                            key={label}
                            href={href}
                            className="text-xs uppercase tracking-widest text-white relative group"
                            whileHover={{ y: -2 }}
                        >
                            {label}
                            <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300"></span>
                        </motion.a>
                    ))}
                </nav>


                <div className="hidden md:flex gap-4">
                    {/* NEW TRY DEMO BUTTON WITH PROPER HOVER STATES */}
                    <motion.button
                        whileHover="hover"
                        whileTap="tap"
                        className="relative px-8 py-2.5 bg-transparent text-white text-xs uppercase tracking-widest font-medium overflow-hidden group rounded-full border border-white/30"
                        onClick={() => navigate('/editor')}
                    >
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors duration-300">
                            Try Demo
                            <motion.span
                                variants={{
                                    hover: { x: 2 },
                                    tap: { x: 0 }
                                }}
                                className="inline-block"
                            >
                                ↗
                            </motion.span>
                        </span>

                        <motion.div
                            className="absolute inset-0 border border-white opacity-0 group-hover:opacity-100 rounded-full"
                            variants={{
                                hover: { opacity: 1 },
                                tap: { opacity: 0.8 }
                            }}
                        />

                        <motion.div
                            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"
                            variants={{
                                hover: { opacity: 1 },
                                tap: { opacity: 0.8 }
                            }}
                        />

                        <motion.div
                            className="absolute bottom-0 left-0 w-full h-0 bg-white origin-bottom rounded-full"
                            variants={{
                                hover: { height: "100%" },
                                tap: { height: "85%" }
                            }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </motion.button>

                    {/* EXISTING CONTACT BUTTON WITH PROPER HOVER STATES */}
                    <motion.button
                        whileHover="hover"
                        whileTap="tap"
                        className="relative px-8 py-2.5 bg-transparent text-white text-xs uppercase tracking-widest font-medium overflow-hidden group rounded-full border border-white/30"
                        onClick={() => navigate('/login')}
                    >
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors duration-300">
                            Login Page
                            <motion.span
                                variants={{
                                    hover: { x: 2 },
                                    tap: { x: 0 }
                                }}
                                className="inline-block"
                            >
                                ↗
                            </motion.span>
                        </span>

                        <motion.div
                            className="absolute inset-0 border border-white opacity-0 group-hover:opacity-100 rounded-full"
                            variants={{
                                hover: { opacity: 1 },
                                tap: { opacity: 0.8 }
                            }}
                        />

                        <motion.div
                            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"
                            variants={{
                                hover: { opacity: 1 },
                                tap: { opacity: 0.8 }
                            }}
                        />

                        <motion.div
                            className="absolute bottom-0 left-0 w-full h-0 bg-white origin-bottom rounded-full"
                            variants={{
                                hover: { height: "100%" },
                                tap: { height: "85%" }
                            }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </motion.button>
                </div>

                <motion.button
                    className="md:hidden text-white"
                    onClick={() => setMenuOpen(!menuOpen)}
                    whileTap={{ scale: 0.9 }}
                >
                    <div className="w-6 flex flex-col gap-1.5">
                        <motion.span
                            animate={menuOpen ? { rotate: 45, y: 7 } : {}}
                            className="h-0.5 bg-white block"
                        />
                        <motion.span
                            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                            className="h-0.5 bg-white block"
                        />
                        <motion.span
                            animate={menuOpen ? { rotate: -45, y: -7 } : {}}
                            className="h-0.5 bg-white block"
                        />
                    </div>
                </motion.button>
            </div>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden bg-black/90 backdrop-blur-md w-full absolute top-full left-0 py-4 px-6"
                    >
                        <div className="flex flex-col gap-6">
                            {['Work', 'Expertise', 'Approach', 'Insights'].map((item) => (
                                <motion.a
                                    key={item}
                                    href="#"
                                    className="text-white uppercase text-sm tracking-wider"
                                    onClick={() => setMenuOpen(false)}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {item}
                                </motion.a>
                            ))}
                            {/* NEW MOBILE TRY DEMO BUTTON WITH PROPER HOVER STATES */}
                            <motion.button
                                whileHover={{
                                    backgroundColor: "#fff",
                                    color: "#000"
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 bg-transparent border border-white text-white text-xs uppercase tracking-widest font-medium w-full rounded-full hover:text-black transition-colors duration-300"
                                onClick={() => {
                                    navigate('/editor');
                                    setMenuOpen(false);
                                }}
                            >
                                Try Demo
                            </motion.button>
                            {/* EXISTING MOBILE CONTACT BUTTON WITH PROPER HOVER STATES */}
                            <motion.button
                                whileHover={{
                                    backgroundColor: "#fff",
                                    color: "#000"
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 bg-transparent border border-white text-white text-xs uppercase tracking-widest font-medium w-full rounded-full hover:text-black transition-colors duration-300"
                                onClick={() => {
                                    navigate('/login');
                                    setMenuOpen(false);
                                }}
                            >
                                Contact
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};



const Hero = () => {
    return (
        <section className="relative w-full h-screen bg-transparent overflow-hidden">
            {/* Static Background Text "Wire Shark" Style (Outline) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <h1
                    className="text-[25vw] font-bold text-transparent tracking-tighter select-none"
                    style={{ WebkitTextStroke: '2px #1a1a1a' }}
                >
                    ININSICO
                </h1>
            </div>

            {/* Scroll Indicator (Dark/Red) */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-richred-700 pointer-events-none z-20"
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


const Features = () => {
    const features = [
        {
            title: "Next-Gen 3D Modeling",
            description: "Studio-grade modeling with AI-assisted workflows, real-time rendering, and precision tools—all in the browser.",
            icon: "🖥️",
            color: "from-purple-500 to-indigo-600",
            hoverEffect: "hover:shadow-[0_20px_50px_-10px_rgba(124,58,237,0.3)]"
        },
        {
            title: "Cinematic Animation",
            description: "Advanced keyframing, motion graphs, and physics-based simulations for Hollywood-grade animations.",
            icon: "🎬",
            color: "from-blue-500 to-cyan-600",
            hoverEffect: "hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.3)]"
        },
        {
            title: "Game Engine Ready",
            description: "One-click export to Unity, Unreal, or Godot with optimized meshes, materials, and LODs.",
            icon: "🕹️",
            color: "from-emerald-500 to-teal-600",
            hoverEffect: "hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.3)]"
        },
        {
            title: "React-Powered",
            description: "Built on react-three-fiber for seamless integration with React, Next.js, and React Native.",
            icon: "⚛️",
            color: "from-cyan-500 to-sky-600",
            hoverEffect: "hover:shadow-[0_20px_50px_-10px_rgba(6,182,212,0.3)]"
        },
        {
            title: "Live Collaboration",
            description: "Multiplayer editing, version control, and cloud sync—work together in real time.",
            icon: "👥",
            color: "from-amber-500 to-orange-600",
            hoverEffect: "hover:shadow-[0_20px_50px_-10px_rgba(245,158,11,0.3)]"
        },
        {
            title: "Procedural AI Tools",
            description: "Generate infinite variations with AI-driven parametric modeling and texture synthesis.",
            icon: "🧠",
            color: "from-violet-500 to-fuchsia-600",
            hoverEffect: "hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.3)]"
        }
    ];

    const techStack = [
        { name: "React-Three-Fiber", logo: "R3F" },
        { name: "Three.js", logo: "THREE" },
        { name: "WebGL 3.0", logo: "WEBGL3" },
        { name: "Blender", logo: "BLENDER" },
        { name: "GSAP", logo: "GSAP" },
        { name: "Cannon.js", logo: "PHYSICS" }
    ];

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <section
            ref={containerRef}
            className="relative py-32 bg-transparent overflow-hidden"
        >
            {/* **Animated Background Elements** */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 opacity-20 pointer-events-none"
            >
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600 blur-[120px]"></div>
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-600 blur-[100px]"></div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* **Hero Title with Staggered Text Animation** */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-24"
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-2 mb-6 text-sm font-medium bg-gray-800 rounded-full text-cyan-400 border border-gray-700"
                    >
                        THE FUTURE OF 3D CREATION
                    </motion.span>

                    <motion.h2
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Anything</span> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Imaginable</span>
                    </motion.h2>

                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        A fully browser-based 3D suite with professional tools, AI assistance, and real-time collaboration.
                    </motion.p>
                </motion.div>

                {/* **Feature Grid with Floating & Glow Effects** */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 60, rotateX: -10 }}
                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: i * 0.1,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            viewport={{ once: true, margin: "-50px" }}
                            whileHover={{
                                y: -10,
                                scale: 1.03,
                            }}
                            className={`p-8 rounded-2xl bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 transition-all duration-300 ${feature.hoverEffect}`}
                        >
                            <div className={`text-5xl mb-6 w-20 h-20 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* **Tech Stack with Floating Badges** */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <motion.h3
                        className="text-3xl font-bold mb-16 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cutting-Edge Tech</span>
                    </motion.h3>

                    <div className="flex flex-wrap justify-center gap-4">
                        {techStack.map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.05,
                                    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.3)"
                                }}
                                className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-medium flex items-center gap-3 transition-all hover:bg-gray-700/50"
                            >
                                <span className="text-xs font-mono bg-gray-900 px-2 py-1 rounded-md text-cyan-400">
                                    {tech.logo}
                                </span>
                                {tech.name}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};


export default LuxuryAgencyWebsite