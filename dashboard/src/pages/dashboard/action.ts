

import type { FarmProfile, FarmAdvisory, UserProfile } from "../../types";
import type { UserEntity } from "../welcome/responses";
import type { FarmIntelligenceResponse, WeatherResponseData } from "./responses";

type DashboardAction =
    | { type: 'SET_USER_DATA'; payload: UserEntity | UserProfile | any }
    | { type: 'SET_MY_FARM_DATA'; payload: FarmProfile | any }
    | { type: 'SET_ALERT_DATA'; payload: FarmAdvisory[] | any }

    | { type: 'LOAD_WEATHER_DATA'; loading: true }
    | { type: 'LOAD_WEATHER_DATA_SUCCESSFULL'; payload: WeatherResponseData | any }
    | { type: 'LOAD_WEATHER_DATA_FAILED'; error: any }

    | { type: 'LOAD_FARM_INTELLIGENCE'; loading: true }
    | { type: 'LOAD_FARM_INTELLIGENCE_SUCCESSFULL'; payload: FarmIntelligenceResponse }
    | { type: 'LOAD_FARM_INTELLIGENCE_FAILED'; error: any }

    | { type: 'SET_PAGINATION'; pageIndex: number; pageSize: number }
    | { type: 'SET_SORTING'; sorting: { id: string; desc: boolean }[] }
    | { type: 'CLEAR_ERROR' };

export type {
    DashboardAction
};