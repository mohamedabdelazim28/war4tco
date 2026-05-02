export type Role = 'user' | 'mechanic' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatar_url?: string | null;
}

export interface AuthUser extends User {
  token: string;
}
