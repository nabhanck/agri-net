import axios, { type AxiosResponse } from "axios";
import type { Login } from "../../types/login";
import type { LoginResponse, WelcomePageErrorResponse } from "./responses";

export interface SignInResult {
  data?: LoginResponse;
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