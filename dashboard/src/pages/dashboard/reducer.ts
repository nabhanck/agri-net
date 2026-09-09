import type { DashboardAction } from "./action";
import type { DashboardState } from "./state";

const initialDashboardState: DashboardState = {
    user: null,
    farm: null,
    advisories: null,
    pageIndex: 0,
    pageSize: 10,
    sorting: [],
    isLoading: false,
    error: null,
};

const DashboardReducer = (
    state: DashboardState = initialDashboardState,
    action: DashboardAction
): DashboardState => {
    switch (action.type) {
        case 'SET_USER_DATA':
            return { ...state, user: action.payload };

        case 'SET_MY_FARM_DATA':
            return { ...state, farm: action.payload };

        case 'SET_ALERT_DATA':
            return { ...state, advisories: action.payload };

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

export { DashboardReducer, initialDashboardState };