// Tipos de autenticação
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Tipos de resposta das funções de autenticação
interface AuthError {
  message: string;
}

interface AuthResponse<T> {
  data: T;
  error: AuthError | null;
}

// Temporary stub implementations for auth - to be replaced with proper auth system
export const auth = {
  // Registrar usuário
  signUp: async (email: string, password: string, metadata?: { name?: string }): Promise<AuthResponse<{ user: AuthUser }>> => {
    // TODO: Implement proper authentication with PostgreSQL
    console.log('Auth signUp called for:', email);
    return { 
      data: { user: { id: '1', email, ...metadata } }, 
      error: null 
    };
  },

  // Login
  signIn: async (email: string, password: string): Promise<AuthResponse<{ user: AuthUser; session: any }>> => {
    // TODO: Implement proper authentication with PostgreSQL
    console.log('Auth signIn called for:', email);
    return { 
      data: { 
        user: { id: '1', email },
        session: { token: 'mock-session-token', expires: Date.now() + 3600000 }
      }, 
      error: null 
    };
  },

  // Logout
  signOut: async (): Promise<{ error: AuthError | null }> => {
    // TODO: Implement proper logout
    console.log('Auth signOut called');
    return { error: null };
  },

  // Obter usuário atual
  getCurrentUser: async (): Promise<{ user: AuthUser | null; error: AuthError | null }> => {
    // TODO: Implement proper user retrieval
    console.log('Auth getCurrentUser called');
    return { user: null, error: null };
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback: (user: any) => void) => {
    // TODO: Implement proper auth state listener
    console.log('Auth onAuthStateChange called');
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

// Utilitários administrativos para backend
export const adminAuth = {
  // Criar usuário administrativamente
  createUser: async (email: string, password: string, metadata?: any): Promise<AuthResponse<{ user: AuthUser }>> => {
    // TODO: Implement admin user creation with PostgreSQL
    console.log('Admin createUser called for:', email);
    return { 
      data: { user: { id: '1', email, ...metadata } }, 
      error: null 
    };
  },

  // Obter usuário por ID
  getUserById: async (userId: string): Promise<AuthResponse<{ user: AuthUser }>> => {
    // TODO: Implement admin user retrieval
    console.log('Admin getUserById called for:', userId);
    return { 
      data: { user: { id: userId, email: 'admin@example.com' } }, 
      error: null 
    };
  },

  // Listar usuários
  listUsers: async (): Promise<AuthResponse<{ users: AuthUser[] }>> => {
    // TODO: Implement admin user listing
    console.log('Admin listUsers called');
    return { 
      data: { users: [] }, 
      error: null 
    };
  },

  // Deletar usuário
  deleteUser: async (userId: string): Promise<{ data: null; error: AuthError | null }> => {
    // TODO: Implement admin user deletion
    console.log('Admin deleteUser called for:', userId);
    return { 
      data: null, 
      error: null 
    };
  }
};