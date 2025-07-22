// src/types/auth.d.ts
export interface AuthUser {
  sub: string;
  email: string;
  name?: string;
}

export interface SessionCheckResponse {
  authenticated: boolean;
}

export interface TokenSet {
  access_token: {
    token: string;
  };
  refresh_token: {
    token: string;
  };
}