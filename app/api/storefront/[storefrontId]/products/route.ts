/**
 * Products API for Storefronts
 * 
 * GET: Fetch products with search, filter, and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit as firestoreLimit, startAfter, doc, getDoc } from 'firebase/firestore';

interface ProductFilter {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'name' | 'price-asc' | 'price-desc' | 'newest';
    page?: number;
    limit?: number;
}

/**
 * GET /api/storefront/[storefrontId]/products
 * Fetch products with filters
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ storefrontId: string }> }
) {
    try {
        const { storefrontId } = await params;
        const { searchParams } = new URL(request.url);

        // Parse filters from query params
        const filters: ProductFilter = {
            search: searchParams.get('search') || undefined,
            category: searchParams.get('category') || undefined,
            minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
            maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
            sort: (searchParams.get('sort') as ProductFilter['sort']) || 'newest',
            page: parseInt(searchParams.get('page') || '1', 10),
            limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 100),
        };

        // Get storefront config to find userId
        const storefrontRef = doc(db, 'storefronts', storefrontId);
        const storefrontDoc = await getDoc(storefrontRef);

        if (!storefrontDoc.exists()) {
            return NextResponse.json(
                { error: 'Storefront not found' },
                { status: 404 }
            );
        }

        const storefrontData = storefrontDoc.data();
        const userId = storefrontData.userId;

        // Build query for products
        const productsRef = collection(db, 'products');
        let constraints: any[] = [where('userId', '==', userId), where('status', '==', 'active')];

        // Category filter
        if (filters.category) {
            constraints.push(where('categoryId', '==', filters.category));
        }

        // Price range filters
        if (filters.minPrice !== undefined) {
            constraints.push(where('price', '>=', filters.minPrice));
        }
        if (filters.maxPrice !== undefined) {
            constraints.push(where('price', '<=', filters.maxPrice));
        }

        // Sorting
        switch (filters.sort) {
            case 'name':
                constraints.push(orderBy('name', 'asc'));
                break;
            case 'price-asc':
                constraints.push(orderBy('price', 'asc'));
                break;
            case 'price-desc':
                constraints.push(orderBy('price', 'desc'));
                break;
            case 'newest':
            default:
                constraints.push(orderBy('createdAt', 'desc'));
                break;
        }

        // Pagination
        constraints.push(firestoreLimit(filters.limit!));

        const q = query(productsRef, ...constraints);
        const snapshot = await getDocs(q);

        let products: any[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        }));

        // Client-side search filter (Firestore doesn't support full-text search)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            products = products.filter((p: any) =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower) ||
                p.sku?.toLowerCase().includes(searchLower)
            );
        }

        // Get categories for filter UI
        const categoriesRef = collection(db, 'categories');
        const categoriesQuery = query(categoriesRef, where('userId', '==', userId));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            slug: doc.data().slug,
        }));

        return NextResponse.json({
            success: true,
            products,
            categories,
            pagination: {
                page: filters.page,
                limit: filters.limit,
                total: products.length,
                hasMore: products.length === filters.limit,
            },
            filters: {
                search: filters.search,
                category: filters.category,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                sort: filters.sort,
            }
        });

    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products', message: error.message },
            { status: 500 }
        );
    }
}
