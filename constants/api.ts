const BASE_URL = {
    development: "https://monitor.itexpay.com:4433/api/v1",
    production: "https://monitor.itexpay.com:4433/api/v1",
} as const;

type Env = keyof typeof BASE_URL;
const currentEnv: Env = (process.env.NODE_ENV as Env) || "development";

export const API_BASE_URL = BASE_URL[currentEnv];

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
