import { apiRequest } from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'tour_agent' | 'admin';
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function register(
  username: string,
  email: string,
  password: string,
  role: string = 'user',
) {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, role }),
  });
}
