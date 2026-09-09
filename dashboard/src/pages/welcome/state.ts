import type { LoginResponse, WelcomePageErrorResponse } from "./responses";

type WelcomePageState = {
  login?: LoginResponse;
  isLoading: boolean;
  error?: WelcomePageErrorResponse | null;
};

export type {
  WelcomePageState,
};