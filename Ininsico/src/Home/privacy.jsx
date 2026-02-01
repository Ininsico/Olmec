
import EliteFooter from './footer'

const PrivacyPolicy = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Main Content */}
            <div className="flex-grow bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6 sm:p-10">
                <div className="max-w-5xl mx-auto">
                    {/* Premium Header */}
                    <div className="mb-16 text-center">
                        <div className="inline-block bg-gradient-to-r from-blue-400 to-cyan-300 p-1 rounded-lg mb-4">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gray-900 text-transparent bg-clip-text px-4 py-2">
                                PRIVACY POLICY
                            </h1>
                        </div>
                        <p className="text-blue-300 mt-4 text-lg">
                            Last Updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Elite Policy Sections */}
                    <div className="grid gap-8">
                        {[
                            {
                                title: "DATA COLLECTION",
                                content: "We collect essential information to power your 3D modeling experience and NFT transactions:",
                                items: [
                                    "Digital wallet addresses and transaction history",
                                    "3D model metadata and creation patterns",
                                    "AI training preferences and usage data",
                                    "Device specifications for optimal rendering"
                                ]
                            },
                            {
                                title: "DATA USAGE",
                                content: "Your information enables these premium features:",
                                items: [
                                    "Personalized 3D modeling tools",
                                    "Secure NFT marketplace transactions",
                                    "AI-assisted model generation",
                                    "Cross-platform synchronization"
                                ]
                            },
                            {
                                title: "DATA PROTECTION",
                                content: "We implement military-grade security measures:",
                                items: [
                                    "End-to-end blockchain encryption",
                                    "Zero-knowledge authentication",
                                    "Distributed storage architecture",
                                    "Regular third-party audits"
                                ]
                            }
                        ].map((section, i) => (
                            <div 
                                key={i}
                                className="group bg-gray-900/50 border border-blue-800/70 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20"
                            >
                                <div className="flex items-start">
                                    <div className="bg-blue-600 group-hover:bg-blue-500 text-white font-bold rounded-lg p-3 mr-4 transition-all duration-300">
                                        0{i+1}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-blue-300 group-hover:text-white mb-3 transition-colors duration-300">
                                            {section.title}
                                        </h2>
                                        <p className="text-blue-200 mb-4">{section.content}</p>
                                        <ul className="space-y-3">
                                            {section.items.map((item, j) => (
                                                <li 
                                                    key={j} 
                                                    className="flex items-start text-blue-100 group-hover:text-white transition-colors duration-200"
                                                >
                                                    <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-20 text-center">
                        <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-0.5">
                            <div className="bg-gray-900 rounded-md px-8 py-4">
                                <h3 className="text-xl font-bold text-blue-300 mb-2">QUESTIONS?</h3>
                                <a 
                                    href="mailto:privacy@ininsico.com" 
                                    className="text-blue-400 hover:text-white font-medium transition-colors duration-300"
                                >
                                    privacy@ininsico.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preserved Footer */}
            <EliteFooter />
        </div>
    )
}

export default PrivacyPolicy