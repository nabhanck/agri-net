import type { FarmEntity } from "@/types/farm";
import type { CreateFarmResponse, CropsListResponse, OnBoardingErrorResponse } from "./responses";

export type OnBoardingAction =
  | { type: 'CREATE_FARM_REQUEST' }
  | { type: 'CREATE_FARM_REQUEST_SUCCESS'; payload: FarmEntity | CreateFarmResponse }
  | { type: 'CREATE_FARM_REQUEST_FAILED'; error: OnBoardingErrorResponse }

  | { type: 'GET_CROPS_LIST_REQUEST' }
  | { type: 'GET_CROPS_LIST_REQUEST_SUCCESS'; data: CropsListResponse }
  | { type: 'GET_CROPS_LIST_REQUEST_FAILED'; error: OnBoardingErrorResponse }

  | { type: 'SET_PAGINATION'; pageIndex: number; pageSize: number }
  | { type: 'SET_SORTING'; sorting: { id: string; desc: boolean }[] }
  | { type: 'CLEAR_ERROR' };