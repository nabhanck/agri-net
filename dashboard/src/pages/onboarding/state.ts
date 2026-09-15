import type { CropEntity, FarmEntity } from "@/types/farm";
import type { OnBoardingErrorResponse, OnBoardingPaginationResponse } from "./responses";

export type OnBoardingState = {
  farm?: FarmEntity | null;
  crops?: CropEntity[] | null;
  pagination?: OnBoardingPaginationResponse;
  pageIndex?: number;
  pageSize?: number;
  sorting?: { id: string; desc: boolean }[];
  isLoading: boolean;
  error?: OnBoardingErrorResponse | null;
};

export const initialOnBoardingState: OnBoardingState = {
  farm: null,
  crops: null,
  isLoading: false,
  error: null,
};