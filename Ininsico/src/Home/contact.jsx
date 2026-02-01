import EliteFooter from './footer'

const contact = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
         
            <div className="flex-grow">
          
                <div className="bg-black text-white py-20 px-6 sm:px-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            LET'S BUILD TOGETHER
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Reach out for partnerships, technical support, or NFT marketplace inquiries
                        </p>
                    </div>
                </div>

       
                <div className="max-w-2xl mx-auto py-16 px-6 sm:px-8">
                    <form className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                Subject
                            </label>
                            <select
                                id="subject"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                                <option>General Inquiry</option>
                                <option>3D Modeling Support</option>
                                <option>NFT Marketplace</option>
                                <option>Technical Issues</option>
                                <option>Business Partnership</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                Message
                            </label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Your message..."
                            ></textarea>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-900 transition-colors duration-300 font-medium text-lg"
                            >
                                SEND MESSAGE
                            </button>
                        </div>
                    </form>
                </div>

                {/* Direct Contact Info */}
                <div className="bg-gray-100 py-16">
                    <div className="max-w-4xl mx-auto px-6 sm:px-10">
                        <h2 className="text-2xl font-bold text-center mb-12">OTHER WAYS TO CONNECT</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    ),
                                    title: "Email",
                                    content: "contact@ininsico.com",
                                    action: "mailto:contact@ininsico.com"
                                },
                                {
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    ),
                                    title: "Phone",
                                    content: "+1 (555) 123-4567",
                                    action: "tel:+15551234567"
                                },
                                {
                                    icon: (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    ),
                                    title: "Live Chat",
                                    content: "Available 24/7",
                                    action: "#chat"
                                }
                            ].map((item, index) => (
                                <a
                                    key={index}
                                    href={item.action}
                                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center flex flex-col items-center"
                                >
                                    <div className="text-black mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.content}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preserved Footer */}
            <EliteFooter />
        </div>
    )
}

export default contact