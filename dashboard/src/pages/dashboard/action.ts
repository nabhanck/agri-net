

import type { FarmProfile, FarmAdvisory, UserProfile } from "../../types";
import type { UserEntity } from "../welcome/responses";

type DashboardAction =
    | { type: 'SET_USER_DATA'; payload: UserEntity | UserProfile | any }
    | { type: 'SET_MY_FARM_DATA'; payload: FarmProfile | any }
    | { type: 'SET_ALERT_DATA'; payload: FarmAdvisory[] | any }
    | { type: 'SET_PAGINATION'; pageIndex: number; pageSize: number }
    | { type: 'SET_SORTING'; sorting: { id: string; desc: boolean }[] }
    | { type: 'CLEAR_ERROR' };

export type {
    DashboardAction
};