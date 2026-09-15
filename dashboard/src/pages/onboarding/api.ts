import axios, { type AxiosResponse } from "axios";
import type { CreateFarmDto, CropEntity } from "@/types/farm";
import type { CreateFarmResponse, OnBoardingErrorResponse } from "./responses";

export interface CreateFarmResult {
  data?: CreateFarmResponse;
  error?: OnBoardingErrorResponse;
}

export interface GetCropsResult {
  data?: CropEntity[];
  error?: OnBoardingErrorResponse;
}

// Fetch crop catalog from backend
export const getCrops = async (): Promise<GetCropsResult> => {
  try {
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
    const URL = `${BASE_URL}/crops`;

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response: AxiosResponse<CropEntity[]> = await axios.get(URL, { headers });

    if (response && response.data) {
      return { data: response.data };
    } else {
      return { error: { code: 400, message: "Invalid response from server" } };
    }
  } catch (error: any) {
    const status = error.response?.status || 400;
    const serverMessage = error.response?.data?.message;
    const message = Array.isArray(serverMessage)
      ? serverMessage.join(', ')
      : serverMessage || error.message || "Unable to fetch crops";

    return { error: { code: status, message } };
  }
};

// API for creating a farm
export const createFarm = async (data: CreateFarmDto): Promise<CreateFarmResult> => {
  try {
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
    const URL = `${BASE_URL}/farm`;

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload: CreateFarmDto = {
      user_id: Number(data.user_id),
      name: data.name,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      ...(data.crop_Ids && { crop_Ids: data.crop_Ids }),
      ...(data.crops && { crops: data.crops }),
      ...(data.area !== undefined && { area: Number(data.area) }),
      ...(data.soil_type && { soil_type: data.soil_type }),
      ...(data.soilPh !== undefined && { soilPh: Number(data.soilPh) }),
      ...(data.irrigation_type && { irrigation_type: data.irrigation_type }),
      ...(data.farming_practice && { farming_practice: data.farming_practice }),
    };

    const response: AxiosResponse<CreateFarmResponse> = await axios.post(URL, payload, {
      headers,
    });

    if (response && response.data) {
      return { data: response.data };
    } else {
      return { error: { code: 400, message: "Invalid response from server" } };
    }
  } catch (error: any) {
    const status = error.response?.status || 400;
    const serverMessage = error.response?.data?.message;
    const message = Array.isArray(serverMessage)
      ? serverMessage.join(', ')
      : serverMessage || error.message || "Unable to create a farm";

    return { error: { code: status, message } };
  }
};