import type { DashboardErrorResponse, DashboardPaginationResponse, WeatherResponseData } from "./responses";
import type { UserEntity } from "../welcome/responses";
import type { FarmProfile, FarmAdvisory, UserProfile } from "../../types";

type DashboardState = {
    user?: UserEntity | UserProfile | null;
    farm?: FarmProfile | null;
    advisories?: FarmAdvisory[] | null;
    weather?: WeatherResponseData | null;
    loading?: boolean;
    pagination?: DashboardPaginationResponse;
    pageIndex: number;
    pageSize: number;
    sorting?: { id: string; desc: boolean }[];
    isLoading: boolean;
    error?: DashboardErrorResponse | null;
};

export type { DashboardState };