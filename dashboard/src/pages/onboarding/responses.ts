import type { FarmEntity } from "@/types/farm";

export type CreateFarmResponse = {
  message: string;
  data: FarmEntity;
};

export type OnBoardingPaginationResponse = {
  total: number;
  pageSize: number;
  current: number;
};

export type OnBoardingErrorResponse = {
  code: number;
  message: string;
};