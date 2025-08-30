/**
 * API Configuration for Las Tortillas Frontend
 * Handles connection to backend deployed on Render
 */

// Environment-based API URL configuration
const getApiUrl = (): string => {
  // Production: Use environment variable set in Vercel
  if (process.env.NODE_ENV === 'production') {
    return import.meta.env.VITE_API_URL || 'https://las-tortillas-backend.onrender.com';
  }
  
  // Development: Use local backend or environment variable
  return import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:3001';
};

export const API_BASE_URL = getApiUrl();

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    user: '/api/auth/user',
    admin: {
      users: '/api/auth/admin/users'
    }
  },
  
  // Menu management
  menu: {
    items: '/api/menu/items',
    categories: '/api/menu/categories'
  },
  
  // Orders
  orders: {
    create: '/api/orders/create',
    list: '/api/orders',
    update: '/api/orders',
    delete: '/api/orders'
  },
  
  // Tables
  tables: {
    list: '/api/tables',
    create: '/api/tables/create',
    update: '/api/tables'
  },
  
  // Reservations
  reservations: {
    create: '/api/reservations/create'
  },
  
  // Upload
  upload: '/api/upload',
  
  // SSE (Server-Sent Events)
  sse: {
    kitchen: '/api/sse/kitchen-updates',
    orders: '/api/sse/order-updates'
  },
  
  // Health check
  health: '/api/health'
} as const;

// Helper function to create full API URL
export const createApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// API request helper with proper error handling
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = createApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for cookies/sessions
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    // Handle different content types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text() as unknown as T;
  } catch (error) {
    console.error('API Request failed:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      options: defaultOptions
    });
    throw error;
  }
};

// Specific API functions
export const api = {
  // Authentication
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
  register: (userData: { email: string; password: string; name: string; role?: string }) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  logout: () =>
    apiRequest('/api/auth/logout', { method: 'POST' }),
    
  getCurrentUser: () =>
    apiRequest('/api/auth/user'),
    
  // Menu
  getMenuItems: () =>
    apiRequest('/api/menu/items'),
    
  createMenuItem: (item: any) =>
    apiRequest('/api/menu/items', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
    
  updateMenuItem: (id: string, item: any) =>
    apiRequest(`/api/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
    
  deleteMenuItem: (id: string) =>
    apiRequest(`/api/menu/items/${id}`, { method: 'DELETE' }),
    
  getMenuCategories: () =>
    apiRequest('/api/menu/categories'),
    
  // Orders
  createOrder: (order: any) =>
    apiRequest('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
    
  getOrders: () =>
    apiRequest('/api/orders'),
    
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
    
  // Tables
  getTables: () =>
    apiRequest('/api/tables'),
    
  createTable: (table: any) =>
    apiRequest('/api/tables/create', {
      method: 'POST',
      body: JSON.stringify(table),
    }),
    
  updateTable: (id: string, table: any) =>
    apiRequest(`/api/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(table),
    }),
    
  // Upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiRequest('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it with boundary
    });
  },
  
  // Health check
  healthCheck: () =>
    apiRequest('/api/health'),
};

// Helper for Server-Sent Events
export const createSSEConnection = (endpoint: string): EventSource => {
  const url = createApiUrl(endpoint);
  return new EventSource(url, { withCredentials: true });
};

// Connection test utility
export const testApiConnection = async (): Promise<boolean> => {
  try {
    await api.healthCheck();
    console.log('✅ API connection successful');
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

// Debug information
export const getApiDebugInfo = () => {
  return {
    apiUrl: API_BASE_URL,
    environment: process.env.NODE_ENV,
    envVars: {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_API_URL_LOCAL: import.meta.env.VITE_API_URL_LOCAL,
    }
  };
};