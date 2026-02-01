import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '../Home/Header';
import EliteFooter from '../Home/footer';

const Developer = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

   
    const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
    const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
    const sectionY = useTransform(scrollYProgress, [0, 0.2], ["0%", "5%"]);
    const codeScale = useTransform(scrollYProgress, [0.2, 0.4], [0.95, 1]);

    const apiEndpoints = [
        {
            method: 'POST',
            path: '/api/models',
            description: 'Create a new 3D model',
            parameters: [
                { name: 'name', type: 'string', required: true },
                { name: 'vertices', type: 'array', required: true },
                { name: 'textures', type: 'object', required: false }
            ]
        },
        {
            method: 'GET',
            path: '/api/models/:id',
            description: 'Retrieve a specific model',
            parameters: [
                { name: 'id', type: 'string', required: true },
                { name: 'includeTextures', type: 'boolean', required: false }
            ]
        },
        {
            method: 'PUT',
            path: '/api/models/:id',
            description: 'Update an existing model',
            parameters: [
                { name: 'id', type: 'string', required: true },
                { name: 'vertices', type: 'array', required: false },
                { name: 'textures', type: 'object', required: false }
            ]
        },
        {
            method: 'DELETE',
            path: '/api/models/:id',
            description: 'Delete a model',
            parameters: [
                { name: 'id', type: 'string', required: true }
            ]
        }
    ];

    const CodeBlock = ({ code, language = 'javascript' }) => {
        return (
            <motion.div
                className="bg-gray-900 rounded-lg p-6 my-4 overflow-x-auto"
                whileHover={{ scale: 1.01 }}
            >
                <pre className="text-green-400 font-mono text-sm">
                    <code>{code}</code>
                </pre>
            </motion.div>
        );
    };

    const ApiEndpoint = ({ method, path, description, parameters }) => {
        const methodColor = {
            'GET': 'bg-blue-600',
            'POST': 'bg-green-600',
            'PUT': 'bg-yellow-600',
            'DELETE': 'bg-red-600'
        }[method];

        return (
            <motion.div
                className="bg-gray-900/80 rounded-xl p-6 mb-8 border border-gray-800 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
            >
                <div className="flex items-start mb-4">
                    <span className={`${methodColor} text-white px-3 py-1 rounded-md text-sm font-bold mr-4`}>
                        {method}
                    </span>
                    <span className="font-mono text-lg text-blue-300">{path}</span>
                </div>
                <p className="text-white/80 mb-6">{description}</p>

                <h4 className="text-white font-bold mb-3">Parameters</h4>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left text-white/80 py-2 px-4">Name</th>
                                <th className="text-left text-white/80 py-2 px-4">Type</th>
                                <th className="text-left text-white/80 py-2 px-4">Required</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parameters.map((param, index) => (
                                <tr key={index} className="border-b border-gray-800/50">
                                    <td className="py-3 px-4 font-mono text-white">{param.name}</td>
                                    <td className="py-3 px-4 text-blue-300">{param.type}</td>
                                    <td className="py-3 px-4">
                                        {param.required ? (
                                            <span className="text-red-400">Yes</span>
                                        ) : (
                                            <span className="text-green-400">No</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div
                ref={containerRef}
                className="relative bg-black text-white flex-grow"
            >
                <motion.main
                    className="max-w-7xl mx-auto px-6 py-20 pb-32"  // Increased top padding and added bottom padding
                    style={{ y: sectionY }}
                >
                    {/* Hero Section */}
                    <section className="mb-20">
                        <motion.h1
                            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Developer Documentation
                        </motion.h1>
                        <motion.p
                            className="text-xl text-gray-400 max-w-3xl mb-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Build amazing 3D applications with Ininsico's powerful API and SDKs.
                        </motion.p>

                        <motion.div
                            className="flex flex-wrap gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <motion.button
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-white font-bold"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Get API Key
                            </motion.button>
                            <motion.button
                                className="px-6 py-3 bg-gray-800 rounded-lg text-white font-bold border border-gray-700"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                View Quickstart
                            </motion.button>
                        </motion.div>
                    </section>

                    {/* Quick Start Section */}
                    <motion.section
                        className="mb-32"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-3xl font-bold mb-8 text-white flex items-center">
                            <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">1</span>
                            Quick Start
                        </h2>

                        <h3 className="text-xl font-bold mb-4 text-white">Installation</h3>
                        <CodeBlock code={`npm install ininsico-sdk`} />

                        <h3 className="text-xl font-bold mb-4 text-white mt-8">Basic Usage</h3>
                        <CodeBlock code={`import Ininsico from 'ininsico-sdk';\n\nconst client = new Ininsico({\n  apiKey: 'your-api-key',\n  environment: 'production'\n});\n\nconst cube = await client.models.create({\n  name: 'My First Cube',\n  vertices: [/* vertex data */]\n});`} />
                    </motion.section>

                    {/* API Reference Section */}
                    <motion.section
                        className="mb-32"
                        style={{ scale: codeScale }}
                    >
                        <h2 className="text-3xl font-bold mb-12 text-white flex items-center">
                            <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">2</span>
                            API Reference
                        </h2>

                        {apiEndpoints.map((endpoint, index) => (
                            <ApiEndpoint
                                key={index}
                                method={endpoint.method}
                                path={endpoint.path}
                                description={endpoint.description}
                                parameters={endpoint.parameters}
                            />
                        ))}
                    </motion.section>

                    {/* Examples Section */}
                    <motion.section
                        className="mb-32"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-3xl font-bold mb-12 text-white flex items-center">
                            <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">3</span>
                            Examples
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                className="bg-gray-900/80 rounded-xl p-6 border border-gray-800"
                                whileHover={{ y: -5 }}
                            >
                                <h3 className="text-xl font-bold mb-4 text-white">Importing OBJ Files</h3>
                                <CodeBlock code={`async function importOBJ(file) {\n  const response = await client.convert.obj({\n    file,\n    optimize: true\n  });\n  return response.model;\n}`} />
                            </motion.div>

                            <motion.div
                                className="bg-gray-900/80 rounded-xl p-6 border border-gray-800"
                                whileHover={{ y: -5 }}
                            >
                                <h3 className="text-xl font-bold mb-4 text-white">Real-time Collaboration</h3>
                                <CodeBlock code={`const subscription = client.realtime.subscribe(\n  'model-updates', \n  modelId,\n  (update) => {\n    console.log('Model updated:', update);\n  }\n);`} />
                            </motion.div>
                        </div>
                    </motion.section>

                    {/* SDKs Section */}
                    <motion.section
                        className="mb-20"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-3xl font-bold mb-12 text-white flex items-center">
                            <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">4</span>
                            SDKs & Libraries
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    name: 'JavaScript',
                                    version: 'v2.1.4',
                                    color: 'bg-yellow-500',
                                    description: 'Full browser and Node.js support'
                                },
                                {
                                    name: 'Python',
                                    version: 'v1.8.2',
                                    color: 'bg-blue-500',
                                    description: 'For data processing and automation'
                                },
                                {
                                    name: 'Unity',
                                    version: 'v0.9.3',
                                    color: 'bg-gray-500',
                                    description: 'Game engine integration'
                                }
                            ].map((sdk, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 flex flex-col h-full"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center mb-4">
                                        <div className={`w-10 h-10 ${sdk.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                                            {sdk.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{sdk.name}</h3>
                                            <p className="text-gray-400 text-sm">Latest version: {sdk.version}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 mb-6 flex-grow">{sdk.description}</p>
                                    <motion.button
                                        className="w-full py-2 bg-gray-800 rounded-lg text-white font-medium border border-gray-700 mt-auto"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        View Documentation
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                </motion.main>
            </div>

            <EliteFooter />
        </div>
    );
};

export default Developer;