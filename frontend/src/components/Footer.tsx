
import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Button } from './ui/Button';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-neutral-900 text-neutral-300 py-20 border-t border-neutral-800">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-richred-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold font-serif italic text-xl">I</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Ininsico</span>
                        </div>
                        <p className="text-neutral-400 leading-relaxed">
                            Democratizing 3D creation with the power of the web. Built for the future, accessible to everyone.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-white transition-colors">Editor</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Playground</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Collaboration</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Asset Library</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Showcase</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                        <p className="text-neutral-400 mb-4">
                            Get the latest updates on features and releases.
                        </p>
                        <div className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-richred-700 focus:ring-1 focus:ring-richred-700 transition-all"
                            />
                            <Button variant="primary" className="w-full">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
                    <div>
                        &copy; {currentYear} Ininsico. All rights reserved.
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Made with</span>
                        <Heart size={14} className="text-richred-600 fill-richred-600" />
                        <span>by the Community</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
