import EliteFooter from "./footer";
function SecurityPage() {
    return (
        <div>
            <Security />
            <EliteFooter />
        </div>
    );
}

const Security = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            {/* Main Container */}
            <div className="max-w-6xl mx-auto bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-blue-700/30">

                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-blue-900/70 to-gray-900/90 px-8 py-12 sm:px-12 sm:py-16 border-b border-blue-800/50">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-blue-100 mb-4 tracking-tight">
                            Ininsico Security Center
                        </h1>
                        <p className="text-lg text-blue-300 max-w-3xl mx-auto">
                            Protecting your 3D assets, transactions, and creative work with military-grade security
                        </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8 p-8 sm:p-10">

                    {/* Encryption Section */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-900/50 p-3 rounded-lg mr-4">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-100">Asset Encryption</h2>
                        </div>
                        <p className="text-blue-200 mb-4">
                            Every 3D model, NFT, and creative work is encrypted with AES-256 both at rest and in transit. Your intellectual property stays locked down.
                        </p>
                        <ul className="space-y-2 text-blue-300">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>End-to-end encryption for all file transfers</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Blockchain-verified ownership records</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Automated backup with version control</span>
                            </li>
                        </ul>
                    </div>

                    {/* Marketplace Security */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-900/50 p-3 rounded-lg mr-4">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-100">Marketplace Protection</h2>
                        </div>
                        <p className="text-blue-200 mb-4">
                            Our NFT-style marketplace uses smart contracts and fraud detection to ensure safe transactions for both buyers and creators.
                        </p>
                        <ul className="space-y-2 text-blue-300">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Escrow payments for all transactions</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>AI-powered fraud detection</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>DMCA protection for your creations</span>
                            </li>
                        </ul>
                    </div>

                    {/* AI Security */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-900/50 p-3 rounded-lg mr-4">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-100">AI Tools Security</h2>
                        </div>
                        <p className="text-blue-200 mb-4">
                            Our AI modeling assistants and content generators operate with strict data isolation to protect your creative inputs and outputs.
                        </p>
                        <ul className="space-y-2 text-blue-300">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Training data never stored or reused</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Private AI sessions for enterprise users</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Content watermarking for AI generations</span>
                            </li>
                        </ul>
                    </div>

                    {/* Account Protection */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-900/50 p-3 rounded-lg mr-4">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-100">Account Security</h2>
                        </div>
                        <p className="text-blue-200 mb-4">
                            Multi-layered protection for your Ininsico account with enterprise-grade authentication and monitoring.
                        </p>
                        <ul className="space-y-2 text-blue-300">
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Mandatory 2FA for all accounts</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Device authorization management</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Real-time suspicious activity alerts</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Compliance Section */}
                <div className="bg-gradient-to-r from-blue-900/70 to-gray-900/90 px-8 py-10 sm:px-12 border-t border-blue-800/50">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-blue-100 mb-6">Compliance & Certifications</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-blue-800/30 flex flex-col items-center">
                                <div className="bg-blue-900/20 p-3 rounded-full mb-3">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="text-blue-200 font-medium text-center">GDPR Compliant</span>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-blue-800/30 flex flex-col items-center">
                                <div className="bg-blue-900/20 p-3 rounded-full mb-3">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="text-blue-200 font-medium text-center">SOC 2 Type II</span>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-blue-800/30 flex flex-col items-center">
                                <div className="bg-blue-900/20 p-3 rounded-full mb-3">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="text-blue-200 font-medium text-center">CCPA Ready</span>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-blue-800/30 flex flex-col items-center">
                                <div className="bg-blue-900/20 p-3 rounded-full mb-3">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="text-blue-200 font-medium text-center">ISO 27001</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="relative bg-gradient-to-r from-blue-900/70 to-gray-900/90 px-8 py-12 sm:px-12 sm:py-16 border-t border-blue-800/50">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-blue-100 mb-4">
                            Secure Your Creative Future
                        </h2>
                        <p className="text-lg text-blue-300 max-w-3xl mx-auto mb-8">
                            Join thousands of 3D artists and developers building the future with confidence
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                            Get Started Securely
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPage;