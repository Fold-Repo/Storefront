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

    ANALYTICS: {
        TRENDS: (businessId: string | number) => `/analytics/business/${businessId}/trends`,
        SUMMARY: (businessId: string | number) => `/analytics/business/${businessId}/summary`,
    },

    WHATSAPP: {
        BASE: '/whatsapp',
        OVERVIEW: (businessId: string | number) => `/whatsapp/business/${businessId}/overview`,
        NUMBERS: {
            LIST: (businessId: string | number) => `/whatsapp/business/${businessId}/numbers`,
            CONNECT: (businessId: string | number) => `/whatsapp/business/${businessId}/numbers/connect`,
            UPDATE_TOKEN: (businessId: string | number, id: number) => `/whatsapp/business/${businessId}/numbers/${id}/token`,
            DELETE: (businessId: string | number, id: number) => `/whatsapp/business/${businessId}/numbers/${id}`,
        },
        SETTINGS: {
            GET: (businessId: string | number) => `/whatsapp/business/${businessId}/settings`,
            UPDATE: (businessId: string | number) => `/whatsapp/business/${businessId}/settings`,
        },
        SESSIONS: {
            LIST: (businessId: string | number) => `/whatsapp/business/${businessId}/sessions`,
            GET: (sessionId: string) => `/whatsapp/sessions/${sessionId}`,
            CART: (sessionId: string) => `/whatsapp/sessions/${sessionId}/cart`,
        },
        MARKETING: {
            SUBSCRIBERS: {
                LIST: '/whatsapp/marketing/subscribers',
                CREATE: '/whatsapp/marketing/subscribers',
                UPDATE: (id: number) => `/whatsapp/marketing/subscribers/${id}`,
                IMPORT: '/whatsapp/marketing/subscribers/import',
            },
            CAMPAIGNS: {
                LIST: '/whatsapp/marketing/campaigns',
                CREATE: '/whatsapp/marketing/campaigns',
                GET: (id: number) => `/whatsapp/marketing/campaigns/${id}`,
                RUN: (id: number) => `/whatsapp/marketing/campaigns/${id}/run`,
            },
        },
        SERVICE_TOKENS: {
            LIST: '/whatsapp/service-tokens',
            CREATE: '/whatsapp/service-tokens',
            SCOPES: '/whatsapp/service-tokens/scopes',
            REVOKE: (id: number) => `/whatsapp/service-tokens/${id}/revoke`,
            DELETE: (id: number) => `/whatsapp/service-tokens/${id}`,
        },
    },

} as const;
