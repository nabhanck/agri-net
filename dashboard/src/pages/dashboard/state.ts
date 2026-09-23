import type { DashboardErrorResponse, DashboardPaginationResponse, FarmIntelligenceResponse, WeatherResponseData } from "./responses";
import type { UserEntity } from "../welcome/responses";
import type { FarmProfile, FarmAdvisory, UserProfile } from "../../types";
import type { FarmEntity } from "@/types/farm";

type DashboardState = {
    user?: UserEntity | UserProfile | null;
    farm?: (FarmEntity & { crop?: any }) | FarmProfile | null | any;
    advisories?: FarmAdvisory[] | null;
    weather?: WeatherResponseData | null;
    intelligence?: FarmIntelligenceResponse | null;
    intelligenceLoading?: boolean;
    loading?: boolean;
    pagination?: DashboardPaginationResponse;
    pageIndex: number;
    pageSize: number;
    sorting?: { id: string; desc: boolean }[];
    isLoading: boolean;
    error?: DashboardErrorResponse | null;
};

export type { DashboardState };