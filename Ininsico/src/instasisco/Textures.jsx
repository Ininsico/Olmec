import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import anime from 'animejs';

const BrowseTextures = () => {
    const [showCart, setShowCart] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeCategory, setActiveCategory] = useState('pbr');
    const [sortOption, setSortOption] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Sample texture data
    const textureCategories = {
        pbr: [
            {
                id: 1,
                name: "Rusty Metal PBR",
                description: "High-resolution PBR metal texture with rust, scratches and weathering effects.",
                price: 19.99,
                image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "8K",
                rating: 4.9,
                downloads: 2543,
                tags: ["metal", "rust", "industrial", "8K"]
            },
            {
                id: 2,
                name: "Brick Wall PBR Set",
                description: "10 different brick wall textures with normal, roughness and displacement maps.",
                price: 29.99,
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.8,
                downloads: 1987,
                tags: ["brick", "wall", "architecture", "4K"]
            },
            {
                id: 3,
                name: "Wood Planks Collection",
                description: "15 realistic wood plank textures with seasonal variations.",
                price: 24.99,
                image: "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "8K",
                rating: 4.7,
                downloads: 1765,
                tags: ["wood", "planks", "flooring", "8K"]
            },
            {
                id: 4,
                name: "Sci-Fi Panel Textures",
                description: "50 modular sci-fi panel textures with emissive options.",
                price: 39.99,
                image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.9,
                downloads: 2132,
                tags: ["scifi", "panels", "future", "4K"]
            },
            {
                id: 5,
                name: "Concrete & Asphalt Pack",
                description: "20 high-quality concrete and asphalt textures with cracks and wear.",
                price: 27.99,
                image: "https://images.unsplash.com/photo-1581093450021-4a7360e9a9e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "8K",
                rating: 4.6,
                downloads: 1543,
                tags: ["concrete", "asphalt", "urban", "8K"]
            },
            {
                id: 6,
                name: "Fabric & Leather Set",
                description: "30 fabric and leather textures with various patterns and wear.",
                price: 22.99,
                image: "https://images.unsplash.com/photo-1563170351-82e9f0678ae6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.5,
                downloads: 1321,
                tags: ["fabric", "leather", "upholstery", "4K"]
            },
            {
                id: 7,
                name: "Nature Ground Textures",
                description: "Collection of 25 ground textures including dirt, mud, grass and sand.",
                price: 34.99,
                image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "8K",
                rating: 4.7,
                downloads: 1876,
                tags: ["nature", "ground", "terrain", "8K"]
            },
            {
                id: 8,
                name: "Tile & Mosaic Pack",
                description: "40 decorative tile and mosaic patterns for floors and walls.",
                price: 29.99,
                image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.6,
                downloads: 1432,
                tags: ["tile", "mosaic", "decorative", "4K"]
            }
        ],
        seamless: [
            {
                id: 11,
                name: "Seamless Wood Collection",
                description: "50 seamless wood textures perfect for tiling and large surfaces.",
                price: 32.99,
                image: "https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "8K",
                rating: 4.8,
                downloads: 1987,
                tags: ["wood", "seamless", "tiling", "8K"]
            },
            {
                id: 12,
                name: "Seamless Fabric Patterns",
                description: "100 seamless fabric patterns for clothing and upholstery.",
                price: 27.99,
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.7,
                downloads: 1654,
                tags: ["fabric", "seamless", "patterns", "4K"]
            },
            {
                id: 13,
                name: "Seamless Metal Plates",
                description: "30 seamless metal plate textures with various finishes.",
                price: 24.99,
                image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "8K",
                rating: 4.6,
                downloads: 1432,
                tags: ["metal", "seamless", "plates", "8K"]
            },
            {
                id: 14,
                name: "Seamless Stone Walls",
                description: "20 seamless stone wall textures for architectural projects.",
                price: 22.99,
                image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.5,
                downloads: 1321,
                tags: ["stone", "seamless", "walls", "4K"]
            },
            {
                id: 15,
                name: "Seamless Ground Textures",
                description: "15 seamless ground textures including dirt, grass and sand.",
                price: 19.99,
                image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "8K",
                rating: 4.7,
                downloads: 1543,
                tags: ["ground", "seamless", "nature", "8K"]
            }
        ],
        decals: [
            {
                id: 21,
                name: "Grunge Decal Pack",
                description: "200 high-resolution grunge decals for adding wear and tear.",
                price: 24.99,
                image: "https://images.unsplash.com/photo-1519752441410-d3ca70ecb937?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.8,
                downloads: 1876,
                tags: ["grunge", "decals", "wear", "4K"]
            },
            {
                id: 22,
                name: "Sci-Fi Decals & Stickers",
                description: "150 sci-fi themed decals for futuristic designs.",
                price: 22.99,
                image: "https://images.unsplash.com/photo-1635070040809-4c8c2da5d09c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.7,
                downloads: 1654,
                tags: ["scifi", "decals", "stickers", "4K"]
            },
            {
                id: 23,
                name: "Military Decal Collection",
                description: "120 military-themed decals including numbers, symbols and insignias.",
                price: 19.99,
                image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.6,
                downloads: 1432,
                tags: ["military", "decals", "symbols", "4K"]
            },
            {
                id: 24,
                name: "Street Art & Graffiti",
                description: "80 street art and graffiti decals for urban environments.",
                price: 17.99,
                image: "https://images.unsplash.com/photo-1509198397868-475647b2a044?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "4K",
                rating: 4.5,
                downloads: 1321,
                tags: ["graffiti", "street", "art", "4K"]
            }
        ],
        procedural: [
            {
                id: 31,
                name: "Procedural Metal Generator",
                description: "Substance Designer graph for generating infinite metal variations.",
                price: 49.99,
                image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "Procedural",
                rating: 4.9,
                downloads: 2132,
                tags: ["procedural", "metal", "generator", "substance"]
            },
            {
                id: 32,
                name: "Procedural Wood Generator",
                description: "Substance Designer graph for creating realistic wood textures.",
                price: 44.99,
                image: "https://images.unsplash.com/photo-1605773527852-c546a8584ea9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "Procedural",
                rating: 4.8,
                downloads: 1876,
                tags: ["procedural", "wood", "generator", "substance"]
            },
            {
                id: 33,
                name: "Procedural Fabric Generator",
                description: "Create endless fabric variations with this Substance Designer graph.",
                price: 39.99,
                image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "Procedural",
                rating: 4.7,
                downloads: 1654,
                tags: ["procedural", "fabric", "generator", "substance"]
            },
            {
                id: 34,
                name: "Procedural Terrain Generator",
                description: "Generate realistic terrain textures with full control over parameters.",
                price: 54.99,
                image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                resolution: "Procedural",
                rating: 4.9,
                downloads: 1987,
                tags: ["procedural", "terrain", "generator", "substance"]
            }
        ]
    };

    useEffect(() => {
        // Initialize cart from localStorage
        const savedCart = localStorage.getItem('polymartCart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    const addToCart = (product) => {
        const newCart = [...cartItems, product];
        setCartItems(newCart);
        localStorage.setItem('polymartCart', JSON.stringify(newCart));
        setShowCart(true);

        // Trigger cart animation
        anime({
            targets: '.cart-notification',
            scale: [1.5, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .5)'
        });
    };

    const viewProductDetails = (product) => {
        setSelectedProduct(product);
        document.body.style.overflow = 'hidden';

        // Animation for product details
        anime({
            targets: '.product-detail-container',
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 400,
            easing: 'easeOutQuad'
        });
    };

    const closeProductDetails = () => {
        anime({
            targets: '.product-detail-container',
            opacity: [1, 0],
            scale: [1, 0.9],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                setSelectedProduct(null);
                document.body.style.overflow = 'auto';
            }
        });
    };

    const removeFromCart = (index) => {
        const newCart = [...cartItems];
        newCart.splice(index, 1);
        setCartItems(newCart);
        localStorage.setItem('polymartCart', JSON.stringify(newCart));
    };

    const filteredTextures = textureCategories[activeCategory].filter(texture =>
        texture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        texture.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const sortedTextures = [...filteredTextures].sort((a, b) => {
        switch (sortOption) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'downloads':
                return b.downloads - a.downloads;
            case 'newest':
                return b.id - a.id;
            default: // 'popular' (default)
                return (b.rating * 100 + b.downloads) - (a.rating * 100 + a.downloads);
        }
    });

    const Header = ({ cartItems, setShowCart }) => {
        const [dropdownOpen, setDropdownOpen] = useState(false);
        const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
        const [userData, setUserData] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchUserData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    const response = await fetch('http://localhost:5000/api/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data.user);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        }, []);

        const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
        const closeDropdown = (e) => {
            if (!e.target.closest('#user-menu-button') && !e.target.closest('#user-dropdown')) {
                setDropdownOpen(false);
            }
        };

        const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

        useEffect(() => {
            document.addEventListener('click', closeDropdown);
            return () => document.removeEventListener('click', closeDropdown);
        }, []);

        const handleLogout = () => {
            localStorage.removeItem('token');
            window.location.href = '/login';
        };

        if (loading) {
            return (
                <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/80 shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></div>
                    </div>
                </header>
            );
        }

        return (
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/80 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Mobile menu button */}
                        <div className="flex md:hidden">
                            <button
                                onClick={toggleMobileMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none transition-all"
                            >
                                <svg
                                    className={`h-6 w-6 ${mobileMenuOpen ? 'hidden' : 'block'}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <svg
                                    className={`h-6 w-6 ${mobileMenuOpen ? 'block' : 'hidden'}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Logo and Home Button */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 22V12h6v10" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">PolyMart</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-8 flex-1 justify-center">
                            <div className="flex-1 max-w-xl mx-4">
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        placeholder="Search 3D models, textures, tools..."
                                        className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <nav className="hidden lg:flex items-center space-x-6">
                                <Link to="/browsemodel" className="px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 group relative">
                                    Models
                                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-3/4 transition-all duration-300"></span>
                                </Link>
                                <Link to="/textures" className="px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 group relative">
                                    Textures
                                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-indigo-600 transition-all duration-300"></span>
                                </Link>
                                <Link to="/sell" className="px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 group relative">
                                    Sell
                                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-3/4 transition-all duration-300"></span>
                                </Link>
                            </nav>
                        </div>

                        {/* Right side icons */}
                        <div className="flex items-center space-x-4">
                            {/* Cart */}
                            <button
                                onClick={() => setShowCart(true)}
                                className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartItems.length > 0 && (
                                    <span className="cart-notification absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItems.length}
                                    </span>
                                )}
                            </button>

                            {/* User Profile Dropdown */}
                            {userData ? (
                                <div className="relative">
                                    <button
                                        id="user-menu-button"
                                        onClick={toggleDropdown}
                                        className="flex items-center space-x-2 focus:outline-none group"
                                    >
                                        {userData.profile?.photo ? (
                                            <img
                                                src={userData.profile.photo}
                                                alt={userData.username}
                                                className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                                {userData.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="hidden lg:inline-block font-medium text-gray-700">
                                            {userData.profile?.profession || userData.username}
                                        </span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-5 w-5 text-gray-500 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownOpen && (
                                        <div
                                            id="user-dropdown"
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200/80 animate-fade-in"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{userData.username}</p>
                                                <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                                            </div>
                                            <Link
                                                to={`/userprofile/${userData.username}`}
                                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>Your Profile</span>
                                            </Link>
                                            <Link to="/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572-1.065c-.426-1.756-2.924-1.756-3.35 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>Settings</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex space-x-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                        <div className="px-3 mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <Link
                            to="/browsemodel"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                        >
                            Models
                        </Link>
                        <Link
                            to="/textures"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                        >
                            Textures
                        </Link>
                        <Link
                            to="/sell"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                        >
                            Sell
                        </Link>
                        {!userData && (
                            <Link
                                to="/login"
                                className="block w-full px-4 py-2 mt-2 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>
        );
    };

    const AnimatedBackground = () => (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-100 opacity-20 blur-3xl animate-float"></div>
            <div
                className="absolute top-3/4 right-1/4 w-72 h-72 rounded-full bg-indigo-100 opacity-20 blur-3xl animate-float"
                style={{ animationDelay: '2s' }}
            ></div>
            <div
                className="absolute bottom-1/3 left-1/2 w-80 h-80 rounded-full bg-pink-100 opacity-20 blur-3xl animate-float"
                style={{ animationDelay: '4s' }}
            ></div>
        </div>
    );

    const Footer = () => {
        return (
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 22V12h6v10" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PolyMart</span>
                            </div>
                            <p className="text-sm mb-4">The marketplace for high-quality 3D assets, textures, and tools for creators.</p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Marketplace</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">3D Models</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Textures</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Plugins</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tools</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Free Assets</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm mb-4 md:mb-0">© 2023 PolyMart. All rights reserved.</p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-sm hover:text-white transition-colors">Terms</a>
                            <a href="#" className="text-sm hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="text-sm hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        );
    };

    const CartSidebar = ({ showCart, setShowCart, cartItems, removeFromCart }) => {
        const calculateTotal = () => {
            return cartItems.reduce((total, item) => total + item.price, 0).toFixed(2);
        };

        return (
            <div
                className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform ${showCart ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Your Cart ({cartItems.length})</h2>
                        <button
                            onClick={() => setShowCart(false)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
                                <p className="text-gray-500 mb-6">Browse our textures and add some to your cart!</p>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-md object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">${calculateTotal()}</span>
                            </div>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md font-medium"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ProductDetailModal = ({ product, onClose }) => {
        if (!product) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-black opacity-70" onClick={onClose}></div>
                    </div>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                    <div className="product-detail-container inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-2">{product.name}</h3>
                                        <button
                                            onClick={onClose}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mt-4 flex flex-col lg:flex-row gap-6">
                                        <div className="lg:w-1/2">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-64 sm:h-80 object-cover rounded-lg shadow-md"
                                            />
                                        </div>
                                        <div className="lg:w-1/2">
                                            <p className="text-gray-600 mb-4">{product.description}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div>
                                                    <p className="text-sm text-gray-500">Resolution</p>
                                                    <p className="font-medium">{product.resolution}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Rating</p>
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="ml-1">{product.rating}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Downloads</p>
                                                    <p className="font-medium">{product.downloads.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Price</p>
                                                    <p className="font-medium text-indigo-600">${product.price.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <p className="text-sm text-gray-500 mb-2">Tags</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.tags.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => {
                                                        addToCart(product);
                                                        onClose();
                                                    }}
                                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md font-medium"
                                                >
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AnimatedBackground />
            <Header cartItems={cartItems} setShowCart={setShowCart} />

            <main className="container mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Textures</h1>
                        <p className="text-gray-600">High-quality textures for your 3D projects</p>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <div className="relative">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="appearance-none bg-white pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
                            >
                                <option value="popular">Sort by: Popular</option>
                                <option value="rating">Sort by: Rating</option>
                                <option value="downloads">Sort by: Downloads</option>
                                <option value="price-low">Sort by: Price (Low to High)</option>
                                <option value="price-high">Sort by: Price (High to Low)</option>
                                <option value="newest">Sort by: Newest</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setActiveCategory('pbr')}
                            className={`px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === 'pbr' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors duration-200 shadow-sm`}
                        >
                            PBR Textures
                        </button>
                        <button
                            onClick={() => setActiveCategory('seamless')}
                            className={`px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === 'seamless' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors duration-200 shadow-sm`}
                        >
                            Seamless Textures
                        </button>
                        <button
                            onClick={() => setActiveCategory('decals')}
                            className={`px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === 'decals' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors duration-200 shadow-sm`}
                        >
                            Decals
                        </button>
                        <button
                            onClick={() => setActiveCategory('procedural')}
                            className={`px-4 py-2 rounded-full whitespace-nowrap ${activeCategory === 'procedural' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors duration-200 shadow-sm`}
                        >
                            Procedural
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedTextures.map((texture) => (
                        <div
                            key={texture.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                        >
                            <div className="relative">
                                <img
                                    src={texture.image}
                                    alt={texture.name}
                                    className="w-full h-48 object-cover cursor-pointer"
                                    onClick={() => viewProductDetails(texture)}
                                />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                                    {texture.resolution}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3
                                        className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                                        onClick={() => viewProductDetails(texture)}
                                    >
                                        {texture.name}
                                    </h3>
                                    <span className="font-medium text-indigo-600">${texture.price.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{texture.description}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="ml-1 text-sm">{texture.rating}</span>
                                        <span className="mx-2 text-gray-300">•</span>
                                        <span className="text-sm text-gray-500">{texture.downloads.toLocaleString()} downloads</span>
                                    </div>
                                    <button
                                        onClick={() => addToCart(texture)}
                                        className="p-2 rounded-full bg-gray-100 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {sortedTextures.length === 0 && (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No textures found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </main>

            <Footer />
            <CartSidebar showCart={showCart} setShowCart={setShowCart} cartItems={cartItems} removeFromCart={removeFromCart} />
            {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={closeProductDetails} />}
        </div>
    );
}
export default BrowseTextures;