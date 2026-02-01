import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Hero.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
                <Link to="/"> 
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-2xl font-black text-white cursor-pointer"
                    >
                        ININSICO
                    </motion.div>
                </Link>
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


                {/* MODIFIED CTA BUTTON (ONLY CHANGE MADE) */}
                <motion.button
                    whileHover="hover"
                    whileTap="tap"
                    className="hidden md:block relative px-8 py-2.5 bg-transparent text-white text-xs uppercase tracking-widest font-medium overflow-hidden group rounded-full border border-white/30"
                    onClick={() => navigate('/login')}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Login
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
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-full"
                        variants={{
                            hover: { opacity: 0.1 },
                            tap: { opacity: 0.05 }
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
                            {/* MODIFIED MOBILE CTA BUTTON (ONLY CHANGE MADE) */}
                            <motion.button
                                whileHover={{
                                    backgroundColor: "#fff",
                                    color: "#000"
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 bg-transparent border border-white text-white text-xs uppercase tracking-widest font-medium w-full mt-4 rounded-full"
                                onClick={() => {
                                    navigate('/login');
                                    setMenuOpen(false);
                                }}
                            >
                                Login
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
export default Header