const DEFAULT_API_URL = "https://shorp-epos-backend.onrender.com/api/v1";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

export const ENDPOINT = {
    AUTH: {
        ROLE_PERMISSIONS: '/role-permissions',
        LOGIN: '/auth/login',
        GOOGLE_SIGNIN: '/auth/google/signin',
        GOOGLE_SIGNUP: '/auth/google/signup',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/signout',
        REQUEST_OTP: '/auth/reset',
        VERIFY_ACCOUNT: '/auth/verify-account',
        RESET_PASSWORD: '/auth/reset',
        VERIFY_OTP: '/auth/verify-account',
        REFRESH_TOKEN: '/auth/refresh-token',
        PERMISSIONS: '/roles/me/permission',
        ROLES: '/roles',
        ROLE_PERMISSION_DETAILS: '/roles', // Will be used as /roles/{id}/permission
    },

    ADDRESS: {
        AUTOCOMPLETE: '/autocomplete',
        GET: '/get',
    },

    STORES: {
        BASE: '/stores',
    },

    UPLOADS: {
        MULTIPLE: '/uploads/mulitple',
        DELETE: '/uploads/delete',
    },

    SUBSCRIPTION: {
        PLANS: '/subscription-plans',
    },

    VARIATIONS: '/variations',
    UNITS: '/units',
    CATEGORIES: '/categories',
    BRANDS: '/brands',
    SUPPLIERS: '/suppliers',
    PRODUCTS: '/products',
    SALES: '/sales',
    ADJUSTMENTS: '/adjustments',

} as const;
