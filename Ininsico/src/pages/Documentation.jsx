import { motion } from "framer-motion";
import { useState } from "react";
import EliteFooter from "../Home/footer";
import Header from "../Home/Header";

const DeveloperPage = () => {
    const [activeTab, setActiveTab] = useState("frontend");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    const tabContent = {
        frontend: (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                <h3 className="text-2xl font-bold text-white">Frontend Magic ✨</h3>
                <p className="text-gray-300">
                    Crafted by Huzaifa, our frontend transforms complex 3D operations into intuitive interfaces.
                    Every pixel is optimized for performance and user delight.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TechCard
                        title="React Three Fiber"
                        description="Powering our 3D viewport with WebGL magic"
                        icon="🖥️"
                    />
                    <TechCard
                        title="Framer Motion"
                        description="Buttery smooth animations and transitions"
                        icon="🎬"
                    />
                    <TechCard
                        title="Tailwind CSS"
                        description="Rapid UI development with utility-first approach"
                        icon="🎨"
                    />
                </div>
            </motion.div>
        ),
        backend: (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                <h3 className="text-2xl font-bold text-white">Backend Engineering 🚀</h3>
                <p className="text-gray-300">
                    Architected by Arslan Rathore, our backend handles massive 3D computations,
                    simulations, and real-time collaboration without breaking a sweat.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TechCard
                        title="Node.js"
                        description="High-performance server environment"
                        icon="⚙️"
                    />
                    <TechCard
                        title="WebSockets"
                        description="Real-time model synchronization"
                        icon="🔌"
                    />
                    <TechCard
                        title="Cloud GPUs"
                        description="Hardware-accelerated rendering"
                        icon="💻"
                    />
                </div>
            </motion.div>
        ),
        features: (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                <h3 className="text-2xl font-bold text-white">3D Platform Features 🛠️</h3>
                <p className="text-gray-300">
                    Our platform combines both frontend elegance and backend power to deliver
                    the ultimate 3D modeling experience.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureCard
                        title="Physics Simulations"
                        description="Real-world physics applied to your 3D models"
                        icon="🌊"
                    />
                    <FeatureCard
                        title="AI-Assisted Modeling"
                        description="Generate complex shapes with simple prompts"
                        icon="🧠"
                    />
                    <FeatureCard
                        title="Collaborative Editing"
                        description="Work on models simultaneously with your team"
                        icon="👥"
                    />
                    <FeatureCard
                        title="Animation Timeline"
                        description="Keyframe animations with professional tools"
                        icon="⏱️"
                    />
                </div>
            </motion.div>
        )
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Meet the Architects
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        The brilliant minds behind our cutting-edge 3D modeling platform
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-center mb-12">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            onClick={() => setActiveTab("frontend")}
                            className={`px-6 py-3 text-sm font-medium rounded-l-lg ${activeTab === "frontend" ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
                        >
                            Frontend Wizardry
                        </button>
                        <button
                            onClick={() => setActiveTab("backend")}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === "backend" ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
                        >
                            Backend Powerhouse
                        </button>
                        <button
                            onClick={() => setActiveTab("features")}
                            className={`px-6 py-3 text-sm font-medium rounded-r-lg ${activeTab === "features" ? "bg-white text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
                        >
                            Platform Features
                        </button>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-16">
                    {tabContent[activeTab]}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                >
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Huzaifa</h2>
                        <p className="text-gray-400 text-lg">
                            Frontend Alchemist transforming React components into 3D wonders.
                            Specializes in making complex interactions feel effortless.
                        </p>
                        <div className="flex space-x-4">
                            <TechPill text="React" />
                            <TechPill text="Three.js" />
                            <TechPill text="WebGL" />
                            <TechPill text="GSAP" />
                        </div>
                    </div>
                    <div className="relative h-64 bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2IiBoZWlnaHQ9IjYiPgo8cmVjdCB3aWR0aD0iNiIgaGVpZ2h0PSI2IiBmaWxsPSIjMDAwMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMNiA2WiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2U9IiMxMTExMTEiPjwvcGF0aD4KPHBhdGggZD0iTTYgMEwwIDZaIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZT0iIzExMTExMSI+PC9wYXRoPgo8L3N2Zz4=')]"></div>
                        <motion.div
                            animate={{
                                rotateY: [0, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="text-8xl"
                        >
                            🧙‍♂️
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-24"
                >
                    <div className="relative h-64 bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center order-1 md:order-2">
                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2IiBoZWlnaHQ9IjYiPgo8cmVjdCB3aWR0aD0iNiIgaGVpZ2h0PSI2IiBmaWxsPSIjMDAwMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMNiA2WiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2U9IiMxMTExMTEiPjwvcGF0aD4KPHBhdGggZD0iTTYgMEwwIDZaIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZT0iIzExMTExMSI+PC9wYXRoPgo8L3N2Zz4=')]"></div>
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-8xl"
                        >
                            ⚡
                        </motion.div>
                    </div>
                    <div className="space-y-6 order-2 md:order-1">
                        <h2 className="text-3xl font-bold">Arslan Rathore</h2>
                        <p className="text-gray-400 text-lg">
                            Backend Sorcerer conjuring distributed systems that handle millions of 3D calculations per second.
                            Makes the impossible possible.
                        </p>
                        <div className="flex space-x-4 flex-wrap gap-2">
                            <TechPill text="Node.js" />
                            <TechPill text="Python" />
                            <TechPill text="C++" />
                            <TechPill text="WebAssembly" />
                            <TechPill text="Docker" />
                            <TechPill text="Kubernetes" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="mt-24 bg-gradient-to-r from-gray-900 to-black p-8 rounded-xl border border-gray-800"
                >
                    <h2 className="text-3xl font-bold mb-6 text-center">Our 3D Platform Stack</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StackItem name="React Three Fiber" category="Frontend" />
                        <StackItem name="WebGL 2.0" category="Rendering" />
                        <StackItem name="Node.js Cluster" category="Backend" />
                        <StackItem name="MongoDB" category="Database" />
                        <StackItem name="Redis" category="Caching" />
                        <StackItem name="WebAssembly" category="Performance" />
                        <StackItem name="WebSockets" category="Realtime" />
                        <StackItem name="AWS EC2" category="Infrastructure" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const TechCard = ({ title, description, icon }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-900 p-6 rounded-lg border border-gray-800"
        >
            <div className="text-4xl mb-4">{icon}</div>
            <h4 className="text-xl font-semibold mb-2">{title}</h4>
            <p className="text-gray-400">{description}</p>
        </motion.div>
    );
};

const FeatureCard = ({ title, description, icon }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex items-start space-x-4"
        >
            <div className="text-3xl">{icon}</div>
            <div>
                <h4 className="text-xl font-semibold mb-2">{title}</h4>
                <p className="text-gray-400">{description}</p>
            </div>
        </motion.div>
    );
};

const TechPill = ({ text }) => {
    return (
        <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-block bg-gray-800 rounded-full px-3 py-1 text-sm font-semibold text-gray-300"
        >
            {text}
        </motion.span>
    );
};

const StackItem = ({ name, category }) => {
    return (
        <motion.div
            whileHover={{ backgroundColor: "#1a1a1a" }}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
        >
            <h4 className="font-bold">{name}</h4>
            <p className="text-sm text-gray-400">{category}</p>
        </motion.div>
    );
};

const Dev = () => {
    return (
        <div>
            <Header />
            <DeveloperPage />
            <EliteFooter />
        </div>
    );
};
export default Dev