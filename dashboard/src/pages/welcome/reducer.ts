import type { WelcomePageAction } from "./action";
import type { WelcomePageState } from "./state";

const initialWelcomePageState: WelcomePageState = {
  isLoading: false,
  error: null,
};

const WelcomePageReducer = (
  state: WelcomePageState = initialWelcomePageState,
  action: WelcomePageAction,
): WelcomePageState => {
  switch (action.type) {
    case 'SIGN_IN_REQUEST':
      return { ...state, isLoading: true, error: null };

    case 'SIGN_IN_REQUEST_SUCCESS':
      return { ...state, isLoading: false, login: action.login, error: null };

    case 'SIGN_IN_REQUEST_FAILED':
      return { ...state, isLoading: false, error: action.error };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};

export {
  WelcomePageReducer,
  initialWelcomePageState,
};