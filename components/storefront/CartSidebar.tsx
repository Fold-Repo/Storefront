'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: string;
}

interface CartSidebarProps {
    storefrontId: string;
    onCheckout: () => void;
    primaryColor?: string;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
    storefrontId,
    onCheckout,
    primaryColor = '#3B82F6'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        // Load cart from localStorage
        const loadCart = () => {
            try {
                const data = localStorage.getItem(`storefront_cart_${storefrontId}`);
                if (data) {
                    const parsed = JSON.parse(data);
                    setItems(parsed.items || []);
                    const count = (parsed.items || []).reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
                    setCartCount(count);
                }
            } catch (e) {
                console.error('Failed to load cart:', e);
            }
        };

        loadCart();

        // Listen for cart updates
        const handleCartUpdate = () => loadCart();
        window.addEventListener('cart:updated', handleCartUpdate);
        window.addEventListener('storage', handleCartUpdate);

        return () => {
            window.removeEventListener('cart:updated', handleCartUpdate);
            window.removeEventListener('storage', handleCartUpdate);
        };
    }, [storefrontId]);

    const updateQuantity = (productId: string, newQuantity: number, variant?: string) => {
        if (typeof window !== 'undefined' && (window as any).StorefrontCart) {
            (window as any).StorefrontCart.updateQuantity(productId, newQuantity, variant);
            window.dispatchEvent(new CustomEvent('cart:updated'));
        }
    };

    const removeItem = (productId: string, variant?: string) => {
        if (typeof window !== 'undefined' && (window as any).StorefrontCart) {
            (window as any).StorefrontCart.remove(productId, variant);
            window.dispatchEvent(new CustomEvent('cart:updated'));
        }
    };

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <>
            {/* Cart Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl hover:bg-gray-800 transition-all"
                style={{ backgroundColor: primaryColor }}
            >
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="font-semibold">Cart</span>
                {cartCount > 0 && (
                    <span className="bg-white text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartCount}
                    </span>
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Your Cart ({cartCount})</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingCartIcon className="w-16 h-16 text-gray-300 mb-4" />
                                <p className="text-gray-500 font-medium">Your cart is empty</p>
                                <p className="text-gray-400 text-sm mt-1">Add some products to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={`${item.id}-${item.variant || ''}-${index}`} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded-lg bg-white"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                            {item.variant && (
                                                <p className="text-sm text-gray-500">{item.variant}</p>
                                            )}
                                            <p className="font-bold mt-1" style={{ color: primaryColor }}>
                                                ${item.price.toFixed(2)}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100"
                                                >
                                                    <MinusIcon className="w-4 h-4" />
                                                </button>
                                                <span className="font-medium w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeItem(item.id, item.variant)}
                                                    className="ml-auto w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-xl font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onCheckout();
                                }}
                                className="w-full py-4 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartSidebar;
