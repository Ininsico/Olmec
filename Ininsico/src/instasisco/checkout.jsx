import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import anime from 'animejs';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [activeStep, setActiveStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('binance');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        zip: '',
    });
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Load cart items from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('polymartCart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }

        // Cart empty? Redirect back
        if (!savedCart || JSON.parse(savedCart).length === 0) {
            navigate('/browsemodel');
        }

        // Initial animation
        anime({
            targets: '.checkout-container',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutQuint',
        });
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Calculate total price
    const subtotal = cartItems.reduce((total, item) => total + item.price, 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    // Proceed to next step
    const nextStep = () => {
        anime({
            targets: `.step-${activeStep}`,
            opacity: 0,
            translateX: -50,
            duration: 400,
            easing: 'easeInOutQuad',
            complete: () => {
                setActiveStep(activeStep + 1);
                anime({
                    targets: `.step-${activeStep + 1}`,
                    opacity: [0, 1],
                    translateX: [50, 0],
                    duration: 500,
                    easing: 'easeOutQuint',
                });
            },
        });
    };

    // Go back to previous step
    const prevStep = () => {
        anime({
            targets: `.step-${activeStep}`,
            opacity: 0,
            translateX: 50,
            duration: 400,
            easing: 'easeInOutQuad',
            complete: () => {
                setActiveStep(activeStep - 1);
                anime({
                    targets: `.step-${activeStep - 1}`,
                    opacity: [0, 1],
                    translateX: [-50, 0],
                    duration: 500,
                    easing: 'easeOutQuint',
                });
            },
        });
    };

    // Handle order submission
    const handleSubmitOrder = (e) => {
        e.preventDefault();

        // Simulate API call
        setTimeout(() => {
            setOrderSuccess(true);
            setShowConfetti(true);

            // Clear cart
            localStorage.removeItem('polymartCart');

            // Hide confetti after 5s
            setTimeout(() => setShowConfetti(false), 5000);
        }, 1500);
    };

    // 3D card flip animation
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    const flipCard = () => {
        anime({
            targets: '.order-summary-card',
            rotateY: isCardFlipped ? 0 : 180,
            duration: 600,
            easing: 'easeInOutQuad',
        });
        setIsCardFlipped(!isCardFlipped);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 checkout-container opacity-0">
            {/* Confetti explosion */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={500}
                />
            )}

            <div className="max-w-6xl mx-auto">
                {/* Checkout header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        {orderSuccess ? '🎉 Order Successful!' : 'Secure Checkout'}
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        {orderSuccess
                            ? 'Your order has been placed successfully!'
                            : 'Complete your purchase in just a few steps.'}
                    </p>
                </motion.div>

                {/* Progress steps */}
                {!orderSuccess && (
                    <div className="flex justify-center mb-12">
                        <div className="w-full max-w-md">
                            <div className="flex items-center">
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep >= step
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                                } transition-colors duration-300`}
                                        >
                                            {step}
                                        </div>
                                        {step < 3 && (
                                            <div
                                                className={`flex-1 h-1 mx-2 ${activeStep > step ? 'bg-indigo-600' : 'bg-gray-200'
                                                    } transition-colors duration-300`}
                                            ></div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-sm text-gray-600">
                                <span className={activeStep >= 1 ? 'text-indigo-600 font-medium' : ''}>
                                    Shipping
                                </span>
                                <span className={activeStep >= 2 ? 'text-indigo-600 font-medium' : ''}>
                                    Payment
                                </span>
                                <span className={activeStep >= 3 ? 'text-indigo-600 font-medium' : ''}>
                                    Confirm
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main checkout content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left side - Checkout form */}
                    <div className="lg:w-2/3">
                        {!orderSuccess ? (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                {/* Step 1: Shipping Info */}
                                <div
                                    className={`p-6 sm:p-8 step-1 ${activeStep !== 1 ? 'hidden' : ''}`}
                                >
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                        Shipping Information
                                    </h2>
                                    <form>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="address"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="city"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    id="city"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="zip"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    ZIP Code
                                                </label>
                                                <input
                                                    type="text"
                                                    id="zip"
                                                    name="zip"
                                                    value={formData.zip}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                                            >
                                                Continue to Payment
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Step 2: Payment Method */}
                                <div
                                    className={`p-6 sm:p-8 step-2 ${activeStep !== 2 ? 'hidden' : ''}`}
                                >
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                        Payment Method
                                    </h2>
                                    <div className="space-y-4">
                                        <div
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'binance'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setPaymentMethod('binance')}
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center mr-4">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6 text-gray-800"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        Binance Pay (Crypto)
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Pay with USDT, BTC, or other cryptocurrencies
                                                    </p>
                                                </div>
                                                {paymentMethod === 'binance' && (
                                                    <div className="ml-auto text-indigo-600">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-6 w-6"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'card'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6 text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        Credit/Debit Card
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Visa, Mastercard, American Express
                                                    </p>
                                                </div>
                                                {paymentMethod === 'card' && (
                                                    <div className="ml-auto text-indigo-600">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-6 w-6"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'paypal'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setPaymentMethod('paypal')}
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-400 flex items-center justify-center mr-4">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6 text-white"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M7.5 11.5c0 .833.75 1.5 1.75 1.5h3.5c.583 0 1.167-.25 1.583-.667.333-.333.5-.833.5-1.333 0-.583-.25-1.083-.667-1.5-.5-.417-1.083-.5-1.583-.5h-3.75c-.25 0-.5.083-.75.25-.25.167-.417.417-.417.75zm-1.5 0c0-1.25.917-2.333 2.25-2.583V7.5h3.75c1.083 0 2 .417 2.667 1.083.667.667 1 1.5 1 2.417 0 1-.333 1.917-1 2.583-.667.667-1.584 1-2.667 1h-3.5v1.5h-1.5v-6.5z" />
                                                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 19c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        PayPal
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Pay with your PayPal account
                                                    </p>
                                                </div>
                                                {paymentMethod === 'paypal' && (
                                                    <div className="ml-auto text-indigo-600">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-6 w-6"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {paymentMethod === 'binance' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                                        >
                                            <h4 className="font-medium text-yellow-800 mb-2">
                                                Binance Pay Instructions
                                            </h4>
                                            <p className="text-sm text-yellow-700">
                                                After placing your order, you'll be redirected to Binance to complete the payment with crypto.
                                            </p>
                                        </motion.div>
                                    )}

                                    <div className="mt-8 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-all duration-300"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                                        >
                                            Review Order
                                        </button>
                                    </div>
                                </div>

                                {/* Step 3: Order Review */}
                                <div
                                    className={`p-6 sm:p-8 step-3 ${activeStep !== 3 ? 'hidden' : ''}`}
                                >
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                        Review Your Order
                                    </h2>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            Shipping Information
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{formData.name}</p>
                                            <p className="text-gray-700">{formData.address}</p>
                                            <p className="text-gray-700">
                                                {formData.city}, {formData.zip}
                                            </p>
                                            <p className="text-gray-700">{formData.email}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            Payment Method
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            {paymentMethod === 'binance' && (
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center mr-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-gray-800"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <span className="text-gray-700">Binance Pay (Crypto)</span>
                                                </div>
                                            )}
                                            {paymentMethod === 'card' && (
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-white"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <span className="text-gray-700">Credit/Debit Card</span>
                                                </div>
                                            )}
                                            {paymentMethod === 'paypal' && (
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center mr-3">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-white"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M7.5 11.5c0 .833.75 1.5 1.75 1.5h3.5c.583 0 1.167-.25 1.583-.667.333-.333.5-.833.5-1.333 0-.583-.25-1.083-.667-1.5-.5-.417-1.083-.5-1.583-.5h-3.75c-.25 0-.5.083-.75.25-.25.167-.417.417-.417.75zm-1.5 0c0-1.25.917-2.333 2.25-2.583V7.5h3.75c1.083 0 2 .417 2.667 1.083.667.667 1 1.5 1 2.417 0 1-.333 1.917-1 2.583-.667.667-1.584 1-2.667 1h-3.5v1.5h-1.5v-6.5z" />
                                                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 19c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-gray-700">PayPal</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-sm transition-all duration-300"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmitOrder}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg flex items-center"
                                        >
                                            Place Order
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 ml-2"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Order Success Screen */
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center"
                            >
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Thank you for your order!
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Your order has been placed successfully. You'll receive a confirmation email shortly.
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                                    <h3 className="font-medium text-gray-800 mb-2">
                                        Order Summary
                                    </h3>
                                    <ul className="divide-y divide-gray-200">
                                        {cartItems.map((item) => (
                                            <li key={item.id} className="py-3 flex justify-between">
                                                <div className="flex items-center">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-12 h-12 rounded-md object-cover mr-3"
                                                    />
                                                    <div>
                                                        <p className="text-gray-800">{item.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            ${item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="pt-4 mt-4 border-t border-gray-200">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="text-gray-800">${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Tax</span>
                                            <span className="text-gray-800">${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-lg mt-4">
                                            <span className="text-gray-800">Total</span>
                                            <span className="text-indigo-600">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button
                                        onClick={() => navigate('/browsemodel')}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all duration-300"
                                    >
                                        Continue Shopping
                                    </button>
                                    <button
                                        onClick={() => navigate('/userprofile/orders')}
                                        className="px-6 py-3 bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-600 rounded-lg shadow-sm transition-all duration-300"
                                    >
                                        View Order History
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right side - Order summary */}
                    {!orderSuccess && (
                        <div className="lg:w-1/3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8"
                            >
                                <div
                                    className="order-summary-card relative h-full"
                                    style={{ perspective: '1000px' }}
                                >
                                    {/* Front side of card */}
                                    <div
                                        className="front p-6"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                                            Order Summary
                                        </h2>
                                        <div className="space-y-4 mb-6">
                                            {cartItems.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex justify-between">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-10 h-10 rounded-md object-cover mr-3"
                                                        />
                                                        <span className="text-gray-700 line-clamp-1">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-800">
                                                        ${item.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                            {cartItems.length > 3 && (
                                                <div className="text-center text-sm text-gray-500">
                                                    +{cartItems.length - 3} more items
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="text-gray-800">${subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-600">Tax</span>
                                                <span className="text-gray-800">${tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-lg mt-4">
                                                <span className="text-gray-800">Total</span>
                                                <span className="text-indigo-600">${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={flipCard}
                                            className="mt-6 w-full text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                            View details
                                        </button>
                                    </div>

                                    {/* Back side of card (flipped) */}
                                    <div
                                        className="back absolute top-0 left-0 w-full h-full p-6 bg-gray-50"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                        }}
                                    >
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                                            Order Details
                                        </h2>
                                        <ul className="divide-y divide-gray-200 mb-6">
                                            {cartItems.map((item) => (
                                                <li key={item.id} className="py-3">
                                                    <div className="flex justify-between">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-12 h-12 rounded-md object-cover mr-3"
                                                            />
                                                            <div>
                                                                <p className="text-gray-800">{item.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    ${item.price.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={flipCard}
                                            className="w-full text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                            Back to summary
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;

