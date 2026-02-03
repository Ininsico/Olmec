import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, MapPin, Send, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { emailAPI } from '@/lib/api';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            await emailAPI.sendEmail(formData);
            setStatus('success');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                subject: 'General Inquiry',
                message: ''
            });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-20 lg:pt-32">
            <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 lg:mb-24"
                >
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                        Get in <span className="text-[#B31212]">Touch</span>
                    </h1>
                    <p className="text-xl lg:text-2xl text-slate-600 max-w-2xl mx-auto font-light">
                        Have a question, feedback, or just want to verify our open source status? We're here to help.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start pb-24">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-12"
                    >
                        <div className="bg-slate-50 rounded-[40px] p-8 lg:p-12 border border-slate-100">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h3>
                            <div className="space-y-8">
                                <div className="flex items-start space-x-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FADADA] flex items-center justify-center flex-shrink-0">
                                        <Mail size={24} className="text-[#B31212]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Email Us</p>
                                        <a href="mailto:ininsico@gmail.com" className="text-xl font-medium text-slate-900 hover:text-[#B31212] transition-colors">
                                            ininsico@gmail.com
                                        </a>
                                        <p className="text-slate-500 mt-1">For general inquiries and support</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FADADA] flex items-center justify-center flex-shrink-0">
                                        <Linkedin size={24} className="text-[#B31212]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Connect</p>
                                        <a href="https://www.linkedin.com/in/arslan-rathore-ininsico" target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-slate-900 hover:text-[#B31212] transition-colors">
                                            Arslan Rathore
                                        </a>
                                        <p className="text-slate-500 mt-1">Follow us on LinkedIn</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FADADA] flex items-center justify-center flex-shrink-0">
                                        <MapPin size={24} className="text-[#B31212]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Office</p>
                                        <p className="text-xl font-medium text-slate-900">
                                            COMSATS University
                                        </p>
                                        <p className="text-slate-500 mt-1">Abbottabad, Pakistan</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[40px] p-8 lg:p-12 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B31212] rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <h3 className="text-2xl font-bold mb-4">Open Source Contribution</h3>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Found a bug? Want to contribute to the codebase? The best way to get in touch effectively is via GitHub.
                            </p>
                            <a href="https://github.com/ininsico/olmec" target="_blank" rel="noopener noreferrer">
                                <Button className="bg-white text-slate-900 hover:bg-slate-200 border-none w-full py-4 text-lg">
                                    Open GitHub Issues <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </a>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-white rounded-[40px] p-8 lg:p-12 shadow-2xl border border-slate-100"
                    >
                        <h3 className="text-3xl font-black text-slate-900 mb-8">Send a Message</h3>

                        {status === 'success' && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-700">
                                <CheckCircle size={20} className="mr-2" />
                                Message sent successfully! We'll get back to you soon.
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
                                <AlertCircle size={20} className="mr-2" />
                                Failed to send message. Please try again later.
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B31212]/20 focus:border-[#B31212] transition-all text-slate-900 placeholder-slate-400"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B31212]/20 focus:border-[#B31212] transition-all text-slate-900 placeholder-slate-400"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B31212]/20 focus:border-[#B31212] transition-all text-slate-900 placeholder-slate-400"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Subject</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B31212]/20 focus:border-[#B31212] transition-all text-slate-900 appearance-none"
                                >
                                    <option>General Inquiry</option>
                                    <option>Support Request</option>
                                    <option>Partnership</option>
                                    <option>Bug Report</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B31212]/20 focus:border-[#B31212] transition-all text-slate-900 placeholder-slate-400 resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 text-xl bg-[#B31212] hover:bg-[#8B0000] text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Message <Send size={20} />
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
