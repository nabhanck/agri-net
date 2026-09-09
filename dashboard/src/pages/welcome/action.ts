import type { LoginResponse, WelcomePageErrorResponse } from "./responses";

type WelcomePageAction =
  | { type: 'SIGN_IN_REQUEST' }
  | { type: 'SIGN_IN_REQUEST_SUCCESS'; login: LoginResponse }
  | { type: 'SIGN_IN_REQUEST_FAILED'; error: WelcomePageErrorResponse }
  | { type: 'CLEAR_ERROR' };

export type {
  WelcomePageAction,
};