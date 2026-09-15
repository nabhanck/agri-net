import type { OnBoardingAction } from "./action";
import type { OnBoardingState } from "./state";
import { initialOnBoardingState } from "./state";

const OnBoardingReducer = (
  state: OnBoardingState = initialOnBoardingState,
  action: OnBoardingAction
): OnBoardingState => {
  switch (action.type) {
    case 'CREATE_FARM_REQUEST':
      return { ...state, isLoading: true, error: null };

    case 'CREATE_FARM_REQUEST_SUCCESS': {
      const farmData = 'data' in action.payload ? action.payload.data : action.payload;
      return { ...state, isLoading: false, farm: farmData, error: null };
    }

    case 'CREATE_FARM_REQUEST_FAILED':
      return { ...state, isLoading: false, error: action.error };

    case 'GET_CROPS_LIST_REQUEST':
      return { ...state, isLoading: true, error: null };

    case 'GET_CROPS_LIST_REQUEST_SUCCESS':
      return { ...state, isLoading: false, crops: action.data, error: null };

    case 'GET_CROPS_LIST_REQUEST_FAILED':
      return { ...state, isLoading: false, error: action.error };

    case 'SET_PAGINATION':
      return { ...state, pageIndex: action.pageIndex, pageSize: action.pageSize };

    case 'SET_SORTING':
      return { ...state, sorting: action.sorting };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};

export { OnBoardingReducer, initialOnBoardingState };