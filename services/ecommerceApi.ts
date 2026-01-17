import apiClient from "@/lib/apiClient";
import { ENDPOINT } from "@/constants";

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface ProductPayload {
    name: string;
    description: string;
    sku: string;
    barcodeSymbology: string;
    category_id: number;
    brand_id?: number;
    product_unit: number;
    quantityLimit: number;
    expiryDate?: string;
    status: "Active" | "Inactive";
    note?: string;
    productType: "Simple" | "Variation";
    productCost?: number;
    productPrice?: number;
    stockAlert?: number;
    tax?: {
        amount: number;
        type: "exclusive" | "inclusive";
    };
    images?: Array<{ url: string; public_id: string }>;
    variations?: any[];
}

export const ecommerceApi = {
    // Products
    getProducts: async (params?: PaginationParams) => {
        const response = await apiClient.get(ENDPOINT.PRODUCTS, { params });
        return response.data;
    },
    getProductById: async (id: string | number) => {
        const response = await apiClient.get(`${ENDPOINT.PRODUCTS}/${id}`);
        return response.data;
    },
    createProduct: async (payload: ProductPayload) => {
        const response = await apiClient.post(ENDPOINT.PRODUCTS, payload);
        return response.data;
    },
    updateProduct: async (id: string | number, payload: Partial<ProductPayload>) => {
        const response = await apiClient.patch(`${ENDPOINT.PRODUCTS}/${id}`, payload);
        return response.data;
    },
    deleteProduct: async (id: string | number) => {
        const response = await apiClient.delete(`${ENDPOINT.PRODUCTS}/${id}`);
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await apiClient.get(ENDPOINT.CATEGORIES);
        return response.data;
    },
    createCategory: async (payload: any) => {
        const response = await apiClient.post(ENDPOINT.CATEGORIES, payload);
        return response.data;
    },

    // Brands
    getBrands: async () => {
        const response = await apiClient.get(ENDPOINT.BRANDS);
        return response.data;
    },
    createBrand: async (payload: any) => {
        const response = await apiClient.post(ENDPOINT.BRANDS, payload);
        return response.data;
    },

    // Units
    getUnits: async () => {
        const response = await apiClient.get(ENDPOINT.UNITS);
        return response.data;
    },
    createUnit: async (payload: any) => {
        const response = await apiClient.post(ENDPOINT.UNITS, payload);
        return response.data;
    },

    // Variations
    getVariations: async () => {
        const response = await apiClient.get(ENDPOINT.VARIATIONS);
        return response.data;
    },
    createVariation: async (payload: any) => {
        const response = await apiClient.post(ENDPOINT.VARIATIONS, payload);
        return response.data;
    },

    // Sales
    getSales: async (params?: PaginationParams) => {
        const response = await apiClient.get(ENDPOINT.SALES, { params });
        return response.data;
    },
    getSaleById: async (id: string | number) => {
        const response = await apiClient.get(`${ENDPOINT.SALES}/${id}`);
        return response.data;
    },
    updateSaleStatus: async (id: string | number, status: string) => {
        const response = await apiClient.patch(`${ENDPOINT.SALES}/${id}/status`, { status });
        return response.data;
    },

    updateShippingDetails: async (id: string | number, payload: { courier: string; tracking_number: string }) => {
        const response = await apiClient.patch(`${ENDPOINT.SALES}/${id}/shipping`, payload);
        return response.data;
    },

    // Connectivity check disabled - backend hibernates on Render
    // checkConnectivity: async () => {
    //     try {
    //         const response = await apiClient.get("/");
    //         return response.status === 200;
    //     } catch (error) {
    //         console.error("Connectivity check failed:", error);
    //         return false;
    //     }
    // },
};
