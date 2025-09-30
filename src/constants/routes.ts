// Route constants for EcoVerify

export const ROUTES = {
  HOME: '/',
  SCAN: '/scan',
  PRODUCT: '/product/:id',
  PRODUCT_BY_ID: (id: string) => `/product/${id}`,
  COMPANY: '/company/:id',
  COMPANY_BY_ID: (id: string) => `/company/${id}`,
  SEARCH: '/search',
  HISTORY: '/history',
  ALTERNATIVES: '/alternatives/:productId',
  ALTERNATIVES_BY_ID: (productId: string) => `/alternatives/${productId}`,
  EDUCATION: '/education',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
} as const;

export type RouteKey = keyof typeof ROUTES;
