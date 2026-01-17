/**
 * Customer Registration API for Storefronts
 * 
 * Registers storefront visitors as customers with restricted role
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

interface RegisterCustomerRequest {
    email: string;
    name: string;
    storefrontId?: string;
}

/**
 * Verify Firebase ID token (simplified - in production use Firebase Admin SDK)
 */
async function verifyToken(token: string): Promise<{ uid: string; email: string } | null> {
    // In production, use Firebase Admin SDK:
    // import { auth } from '@/lib/firebaseAdmin';
    // const decodedToken = await auth.verifyIdToken(token);
    // return { uid: decodedToken.uid, email: decodedToken.email || '' };

    // For now, decode the JWT payload (not secure for production!)
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        return {
            uid: decoded.user_id || decoded.sub,
            email: decoded.email || ''
        };
    } catch {
        return null;
    }
}

/**
 * POST /api/auth/register-customer
 * Register a customer from storefront login
 */
export async function POST(request: NextRequest) {
    try {
        // Get authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization required' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = await verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const body: RegisterCustomerRequest = await request.json();

        // Check if user already exists
        const userRef = doc(db, 'users', decoded.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            // User already exists, return their data
            const userData = userDoc.data();
            return NextResponse.json({
                success: true,
                exists: true,
                role: userData.role,
                message: 'User already registered'
            });
        }

        // Create new customer user
        const newUser = {
            uid: decoded.uid,
            email: body.email || decoded.email,
            name: body.name || '',
            role: 'customer', // Fixed role for storefront users
            permissions: ['view_orders', 'place_orders'],
            source: 'storefront',
            storefrontId: body.storefrontId || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await setDoc(userRef, newUser);

        console.log(`✅ Customer ${decoded.uid} registered from storefront`);

        return NextResponse.json({
            success: true,
            exists: false,
            role: 'customer',
            message: 'Customer registered successfully'
        });

    } catch (error: any) {
        console.error('Error registering customer:', error);
        return NextResponse.json(
            { error: 'Failed to register customer', message: error.message },
            { status: 500 }
        );
    }
}
