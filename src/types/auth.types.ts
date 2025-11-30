// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword?: string;
  name?: string;
}

export interface AuthError {
  field?: string;
  message: string;
}

export interface AuthState {
  isLoading: boolean;
  errors: Record<string, string>;
  serverError: string | null;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
}

export interface AuthResponse {
  session: AuthSession | null;
  error: string | null;
}