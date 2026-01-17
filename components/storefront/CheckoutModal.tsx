'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, ShoppingBagIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    storefrontId: string;
    primaryColor?: string;
}

interface CustomerInfo {
    email: string;
    phone: string;
    name: string;
    address: string;
    city: string;
    note: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen,
    onClose,
    storefrontId,
    primaryColor = '#3B82F6'
}) => {
    const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [items, setItems] = useState<CartItem[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState('');
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        email: '',
        phone: '',
        name: '',
        address: '',
        city: '',
        note: ''
    });

    useEffect(() => {
        if (isOpen) {
            // Load cart items
            try {
                const data = localStorage.getItem(`storefront_cart_${storefrontId}`);
                if (data) {
                    const parsed = JSON.parse(data);
                    setItems(parsed.items || []);
                    const total = (parsed.items || []).reduce(
                        (sum: number, item: CartItem) => sum + (item.price * item.quantity), 0
                    );
                    setSubtotal(total);
                }
            } catch (e) {
                console.error('Failed to load cart:', e);
            }

            // Check authentication state
            checkAuthState();
        }
    }, [isOpen, storefrontId]);

    const checkAuthState = async () => {
        if (typeof window !== 'undefined' && (window as any).firebase) {
            const firebase = (window as any).firebase;
            const user = firebase.auth().currentUser;
            if (user) {
                setIsAuthenticated(true);
                setUserEmail(user.email || '');
                setCustomerInfo(prev => ({ ...prev, email: user.email || '' }));
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleGoogleSignIn = async () => {
        if (typeof window !== 'undefined' && (window as any).firebase) {
            try {
                const firebase = (window as any).firebase;
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await firebase.auth().signInWithPopup(provider);

                if (result.user) {
                    setIsAuthenticated(true);
                    setUserEmail(result.user.email || '');
                    setCustomerInfo(prev => ({
                        ...prev,
                        email: result.user.email || '',
                        name: result.user.displayName || ''
                    }));

                    // Register as customer
                    await fetch('/api/auth/register-customer', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${await result.user.getIdToken()}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: result.user.email,
                            name: result.user.displayName,
                            storefrontId
                        })
                    });
                }
            } catch (error: any) {
                console.error('Google sign-in error:', error);
                setError('Failed to sign in with Google');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setStep('processing');

        try {
            const orderData = {
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    variant: item.variant
                })),
                subtotal,
                customer: {
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                    name: customerInfo.name,
                    address: customerInfo.address,
                    city: customerInfo.city,
                    note: customerInfo.note,
                    isGuest: !isAuthenticated
                },
                storefrontId
            };

            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Add auth token if authenticated
            if (typeof window !== 'undefined' && (window as any).firebase) {
                const user = (window as any).firebase.auth().currentUser;
                if (user) {
                    const token = await user.getIdToken();
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`/api/storefront/${storefrontId}/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }

            const result = await response.json();
            setOrderId(result.orderId || result.id);

            // Clear cart
            if (typeof window !== 'undefined' && (window as any).StorefrontCart) {
                (window as any).StorefrontCart.clear();
                window.dispatchEvent(new CustomEvent('cart:updated'));
            }

            setStep('success');
        } catch (error: any) {
            console.error('Checkout error:', error);
            setError(error.message || 'Failed to place order. Please try again.');
            setStep('form');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10"
                >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>

                {step === 'form' && (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                {items.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span className="text-gray-600">{item.name} × {item.quantity}</span>
                                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <p className="text-gray-400 text-xs">+{items.length - 3} more items</p>
                                )}
                            </div>
                            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                                <span>Total</span>
                                <span style={{ color: primaryColor }}>${subtotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Auth Options */}
                        {!isAuthenticated && (
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-4 text-sm text-gray-500">or checkout as guest</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAuthenticated && (
                            <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span className="text-sm">Signed in as {userEmail}</span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Checkout Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={customerInfo.email}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isAuthenticated}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={customerInfo.address}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={customerInfo.city}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Note (optional)</label>
                                <textarea
                                    name="note"
                                    value={customerInfo.note}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Place Order - ${subtotal.toFixed(2)}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Processing your order...</h3>
                        <p className="text-gray-500">Please wait while we confirm your order.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircleIcon className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h3>
                        <p className="text-gray-500 mb-4">Thank you for your order.</p>
                        {orderId && (
                            <p className="text-sm text-gray-400 mb-6">Order ID: {orderId}</p>
                        )}
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-xl font-semibold text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;
