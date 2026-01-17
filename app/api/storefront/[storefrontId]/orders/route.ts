/**
 * Orders API for Storefronts
 * 
 * POST: Create a new order
 * GET: Get orders for a storefront (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { collection, doc, setDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
}

interface CustomerInfo {
    email: string;
    phone: string;
    name: string;
    address: string;
    city: string;
    note?: string;
    isGuest: boolean;
    uid?: string;
}

interface OrderData {
    items: OrderItem[];
    subtotal: number;
    customer: CustomerInfo;
    storefrontId: string;
}

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}

/**
 * POST /api/storefront/[storefrontId]/orders
 * Create a new order
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ storefrontId: string }> }
) {
    try {
        const { storefrontId } = await params;
        const body: OrderData = await request.json();

        // Validate request
        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: 'Order must contain at least one item' },
                { status: 400 }
            );
        }

        if (!body.customer?.email || !body.customer?.phone || !body.customer?.name) {
            return NextResponse.json(
                { error: 'Customer email, phone, and name are required' },
                { status: 400 }
            );
        }

        // Calculate totals
        const subtotal = body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = body.items.reduce((sum, item) => sum + item.quantity, 0);

        // Generate order ID
        const orderId = generateOrderId();

        // Create order document
        const order = {
            id: orderId,
            storefrontId,
            items: body.items,
            itemCount,
            subtotal,
            total: subtotal, // Can add tax/shipping later
            customer: {
                email: body.customer.email,
                phone: body.customer.phone,
                name: body.customer.name,
                address: body.customer.address || '',
                city: body.customer.city || '',
                note: body.customer.note || '',
                isGuest: body.customer.isGuest ?? true,
                uid: body.customer.uid || null,
            },
            status: 'pending',
            paymentStatus: 'unpaid',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // Save to Firestore
        const ordersRef = collection(db, 'storefronts', storefrontId, 'orders');
        await setDoc(doc(ordersRef, orderId), order);

        // Also save to a global orders collection for easy querying
        const globalOrdersRef = collection(db, 'orders');
        await setDoc(doc(globalOrdersRef, orderId), {
            ...order,
            storefrontId,
        });

        console.log(`✅ Order ${orderId} created for storefront ${storefrontId}`);

        return NextResponse.json({
            success: true,
            orderId,
            message: 'Order placed successfully',
        });

    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order', message: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/storefront/[storefrontId]/orders
 * Get orders for a storefront (requires authentication)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ storefrontId: string }> }
) {
    try {
        const { storefrontId } = await params;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        // Get orders from Firestore
        const ordersRef = collection(db, 'storefronts', storefrontId, 'orders');
        let q = query(ordersRef, orderBy('createdAt', 'desc'));

        if (status) {
            q = query(ordersRef, where('status', '==', status), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const orders = snapshot.docs.slice(0, limit).map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));

        return NextResponse.json({
            success: true,
            orders,
            count: orders.length,
        });

    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders', message: error.message },
            { status: 500 }
        );
    }
}
