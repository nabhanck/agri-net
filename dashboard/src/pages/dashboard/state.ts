import type { DashboardErrorResponse, DashboardPaginationResponse } from "./responses";
import type { UserEntity } from "../welcome/responses";
import type { FarmProfile, FarmAdvisory, UserProfile } from "../../types";

type DashboardState = {
    user?: UserEntity | UserProfile | null;
    farm?: FarmProfile | null;
    advisories?: FarmAdvisory[] | null;
    pagination?: DashboardPaginationResponse;
    pageIndex: number;
    pageSize: number;
    sorting?: { id: string; desc: boolean }[];
    isLoading: boolean;
    error?: DashboardErrorResponse | null;
};

export type { DashboardState };