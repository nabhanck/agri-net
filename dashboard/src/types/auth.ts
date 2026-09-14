export type Login = {
  email: string;
  password: string;
};

export type SignUp = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone_number?: string;
  preferredLanguage?: string;
  role?: string;
};