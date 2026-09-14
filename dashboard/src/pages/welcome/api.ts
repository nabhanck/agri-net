import axios, { type AxiosResponse } from "axios";
import type { Login, SignUp } from "../../types/auth";
import type { LoginResponse, SignupResponse, WelcomePageErrorResponse } from "./responses";

export interface SignInResult {
  data?: LoginResponse | SignupResponse;
  error?: WelcomePageErrorResponse;
}

// Sign in API call to backend auth service
export const signIn = async (data: Login): Promise<SignInResult> => {
  try {
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
    const URL = `${BASE_URL}/auth/login`;

    const payload = {
      email: data.email,
      password: data.password,
    };

    const response: AxiosResponse<LoginResponse> = await axios.post(URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response && response.data) {
      return { data: response.data };
    } else {
      return { error: { code: 400, message: "Invalid response from authentication server" } };
    }
  } catch (error: any) {
    const status = error.response?.status || 401;
    const serverMessage = error.response?.data?.message;
    const message = Array.isArray(serverMessage)
      ? serverMessage.join(', ')
      : serverMessage || error.message || "Invalid username or password";

    return { error: { code: status, message } };
  }
};


// Sign up API call to backend auth service
export const signUp = async (data: SignUp): Promise<SignInResult> => {
  try {
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
    const URL = `${BASE_URL}/auth/signup`;

    const payload = {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phone_number,
      preferred_language: data.preferredLanguage || 'en',
      role: data.role || 'farmer',
    };

    const response: AxiosResponse<SignupResponse> = await axios.post(URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response && response.data) {
      return { data: response.data };
    } else {
      return { error: { code: 400, message: "Invalid response from authentication server" } };
    }
  } catch (error: any) {
    const status = error.response?.status || 400;
    const serverMessage = error.response?.data?.message;
    const message = Array.isArray(serverMessage)
      ? serverMessage.join(', ')
      : serverMessage || error.message || "Failed to create account";

    return { error: { code: status, message } };
  }
};