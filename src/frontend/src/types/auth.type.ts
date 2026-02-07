export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuthState {
  user: AuthResponse["user"] | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}
