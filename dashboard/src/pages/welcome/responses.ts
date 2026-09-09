type WelcomePageErrorResponse = {
  code: number;
  message: string;
};

type UserEntity = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role: 'farmer' | 'agronomist' | 'admin';
  preferred_language?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
};

type LoginResponse = {
  message: string;
  access_token: string;
  user: UserEntity;
};

export type {
  WelcomePageErrorResponse,
  UserEntity,
  LoginResponse,
};