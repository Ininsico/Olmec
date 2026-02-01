import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import anime from 'animejs';

const PolyMart = () => {
    const [showCart, setShowCart] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Simple animation for hero section
        if (typeof window !== 'undefined' && window.anime) {
            anime({
                targets: '.gradient-text',
                backgroundPosition: ['0% 50%', '100% 50%'],
                easing: 'easeInOutQuad',
                duration: 8000,
                direction: 'alternate',
                loop: true
            });
        }

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

    return (
        <div className="min-h-screen bg-gray-50">
            <AnimatedBackground />
            <Header cartItems={cartItems} setShowCart={setShowCart} />
            <main className="relative z-10 container mx-auto px-4 py-8">
                <HeroSection viewProductDetails={viewProductDetails} />
                <HowItWorks />
                <ModelCategories />
                <Testimonials />
                <CallToAction />
            </main>
            <Footer />

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div
                        className="product-detail-container bg-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative h-80 md:h-full">
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={closeProductDetails}
                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                                <p className="text-gray-600 mb-6">{selectedProduct.description}</p>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Fully rigged and textured
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>+
                                            Multiple LODs included
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Compatible with major 3D software
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <span className="text-2xl font-bold text-gray-900">${selectedProduct.price}</span>
                                        <span className="ml-2 text-sm text-gray-500">+ royalty-free license</span>
                                    </div>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                            </svg>
                                        ))}
                                        <span className="ml-1 text-sm text-gray-500">(24)</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        closeProductDetails();
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-lg"
                                >
                                    Add to Cart - ${selectedProduct.price}
                                </button>

                                <div className="mt-4 text-center">
                                    <button className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                                        View License Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shopping Cart Sidebar */}
            {showCart && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowCart(false)}
                    ></div>
                    <div className="absolute inset-y-0 right-0 max-w-full flex">
                        <div className="relative w-screen max-w-md">
                            <div className="h-full flex flex-col bg-white shadow-xl">
                                <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                                    <div className="flex items-start justify-between">
                                        <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                                        <button
                                            onClick={() => setShowCart(false)}
                                            className="p-2 text-gray-400 hover:text-gray-500"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mt-8">
                                        <div className="flow-root">
                                            {cartItems.length > 0 ? (
                                                <ul className="-my-6 divide-y divide-gray-200">
                                                    {cartItems.map((item, index) => (
                                                        <li key={index} className="py-6 flex">
                                                            <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>

                                                            <div className="ml-4 flex-1 flex flex-col">
                                                                <div>
                                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                                        <h3>{item.name}</h3>
                                                                        <p className="ml-4">${item.price}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 flex items-end justify-between text-sm">
                                                                    <button
                                                                        type="button"
                                                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                                                        onClick={() => {
                                                                            const newCart = [...cartItems];
                                                                            newCart.splice(index, 1);
                                                                            setCartItems(newCart);
                                                                            localStorage.setItem('polymartCart', JSON.stringify(newCart));
                                                                        }}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
                                                    <p className="mt-1 text-gray-500">Start adding some 3D assets to your cart</p>
                                                    <div className="mt-6">
                                                        <button
                                                            onClick={() => {
                                                                setShowCart(false);
                                                                navigate('/browsemodel');
                                                            }}
                                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
                                                        >
                                                            Browse Models
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {cartItems.length > 0 && (
                                    <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <p>Subtotal</p>
                                            <p>${cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</p>
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                                        <div className="mt-6">
                                            <button
                                                onClick={() => {
                                                    setShowCart(false);
                                                    navigate('/checkout');
                                                }}
                                                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Checkout
                                            </button>
                                        </div>
                                        <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                                            <p>
                                                or{' '}
                                                <button
                                                    type="button"
                                                    className="text-indigo-600 font-medium hover:text-indigo-500"
                                                    onClick={() => setShowCart(false)}
                                                >
                                                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
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
                                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-3/4 transition-all duration-300"></span>
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

const HeroSection = ({ viewProductDetails }) => {
    const cyberpunkPack = {
        name: "Cyberpunk Character Pack",
        description: "Fully rigged & textured character models with multiple LODs included. Perfect for game development and animation projects.",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    };

    return (
        <section className="mb-16">
            <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                        Discover & Sell <span className="gradient-text">Premium 3D Assets</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-6 max-w-lg">
                        The ultimate marketplace for 3D artists, game devs, and creators. Download, tweak, and integrate
                        ready-made assets into your projects.
                    </p>
                    <div className="flex space-x-4">
                        <Link
                            to="/browsemodel"
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-200"
                        >
                            Browse Models
                        </Link>
                        <Link
                            to="/how-it-works"
                            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            How It Works
                        </Link>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="flex items-center">
                            <div className="flex -space-x-2">
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/12.jpg" alt="" />
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
                                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
                            </div>
                            <span className="ml-3 text-sm text-gray-600">Join over 10,000+ creators</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <span className="ml-1 text-sm text-gray-600">4.9/5 (2,345 reviews)</span>
                        </div>
                    </div>
                </div>
                <div className="md:w-1/2 relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                        <img src={cyberpunkPack.image} alt="Cyberpunk Character Pack" className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{cyberpunkPack.name}</h3>
                            <p className="text-gray-200 mb-4 line-clamp-2">{cyberpunkPack.description}</p>
                            <button
                                onClick={() => viewProductDetails(cyberpunkPack)}
                                className="w-full py-2 bg-white/90 text-gray-900 font-medium rounded-lg hover:bg-white transition-colors duration-200"
                            >
                                View Details - ${cyberpunkPack.price}
                            </button>
                        </div>
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500 rounded-xl opacity-20 blur-xl -z-10"></div>
                    <div className="absolute -top-4 -right-4 w-32 h-32 bg-indigo-500 rounded-xl opacity-20 blur-xl -z-10"></div>
                </div>
            </div>
        </section>
    );
};

const HowItWorks = () => {
    const steps = [
        {
            title: "Browse & Discover",
            description: "Explore thousands of high-quality 3D models, textures, and assets across various categories.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
            )
        },
        {
            title: "Purchase & Download",
            description: "Get instant access to your purchased assets with one-click downloads and license details.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            )
        },
        {
            title: "Integrate & Create",
            description: "Use the assets in your projects with confidence thanks to our royalty-free license.",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        }
    ];
    return (
        <section className="py-12 mb-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How PolyMart Works</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Simple steps to find, purchase, and use high-quality 3D assets in your projects</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

const ModelCategories = () => {
    const categories = [
        {
            name: "Characters",
            count: 1245,
            image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
            name: "Environments",
            count: 876,
            image: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
            name: "Props",
            count: 1567,
            image: "https://images.unsplash.com/photo-1581092921461-39b2f2f8a6b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
            name: "Vehicles",
            count: 543,
            image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        }
    ];
    return (
        <section className="py-12 mb-16">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
                <Link to="/categories" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    View All Categories →
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                    <Link
                        key={index}
                        to={`/browsemodel?category=${category.name.toLowerCase()}`}
                        className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-64"
                    >
                        <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6">
                            <h3 className="text-xl font-bold text-white">{category.name}</h3>
                            <p className="text-gray-200">{category.count} models</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

const Testimonials = () => {
    const testimonials = [
        {
            quote: "PolyMart has completely transformed my workflow. The quality of assets is unmatched and saves me countless hours of modeling.",
            author: "Sarah Johnson",
            role: "Game Developer at Nova Studios",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            quote: "As a freelance 3D artist, I've both purchased and sold assets on PolyMart. The platform is fair, easy to use, and the community is fantastic.",
            author: "Miguel Rodriguez",
            role: "3D Artist & Seller",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            quote: "The variety of models available for architectural visualization has helped me deliver projects faster than ever before.",
            author: "Emma Chen",
            role: "Architectural Visualizer",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg"
        }
    ];
    return (
        <section className="py-12 mb-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Join thousands of creators who have accelerated their projects with PolyMart</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className="w-5 h-5 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                            ))}
                        </div>
                        <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                        <div className="flex items-center">
                            <img
                                src={testimonial.avatar}
                                alt={testimonial.author}
                                className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                                <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                                <p className="text-sm text-gray-600">{testimonial.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const CallToAction = () => {
    return (
        <section className="py-16 mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl text-center">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Elevate Your 3D Projects?</h2>
                <p className="text-xl text-indigo-100 mb-8">Join thousands of creators who are saving time and creating better work with PolyMart assets.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/signup" className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg" >
                        Start Exploring
                    </Link>
                    <Link to="/sell" className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors duration-200" >
                        Become a Seller
                    </Link>
                </div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 22V12h6v10" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">PolyMart</span>
                        </div>
                        <p className="mb-4">The premier marketplace for high-quality 3D assets, textures, and tools.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Marketplace</h3>
                        <ul className="space-y-2">
                            <li><Link to="/browsemodel" className="hover:text-white transition-colors">3D Models</Link></li>
                            <li><Link to="/textures" className="hover:text-white transition-colors">Textures</Link></li>
                            <li><Link to="/tools" className="hover:text-white transition-colors">Tools</Link></li>
                            <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                            <li><Link to="/new-releases" className="hover:text-white transition-colors">New Releases</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link to="/tutorials" className="hover:text-white transition-colors">Tutorials</Link></li>
                            <li><Link to="/license" className="hover:text-white transition-colors">License</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Privacy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-sm text-center">
                    <p>© {new Date().getFullYear()} PolyMart. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const InstagramDesktop = () =>{
    return (
        <div>
            <PolyMart />
        </div>
    )
}
export default InstagramDesktop;