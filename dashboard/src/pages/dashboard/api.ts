import type { Farm, GrowthStageEntity } from "@/types/farm";
import type { AxiosResponse } from "axios";
import axios from "axios";

export const getFarms = async (userId: number) => {
    try {
        const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        const URL = `${BASE_URL}/farm/user/${userId}`;

        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response: AxiosResponse<Farm[]> = await axios.get(URL, { headers });

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
            : serverMessage || error.message || "Unable to fetch farms";

        return { error: { code: status, message } };
    }
};

export const getFarmDetails = async (farmId: number) => {
    try {
        const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        const URL = `${BASE_URL}/farm/${farmId}`;

        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response: AxiosResponse<Farm> = await axios.get(URL, { headers });

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
            : serverMessage || error.message || "Unable to fetch farm details";

        return { error: { code: status, message } };
    }
};

export interface FarmCropEvaluationResult {
    farmCropId: number;
    farmId: number;
    cropId: number;
    cropName: string;
    plantingDate: string | Date | null;
    daysSincePlanting: number | null;
    previousStage: { id: number | null; name: string | null; order?: number };
    newStage: { id: number; name: string; order: number } | null;
    changed: boolean;
    skipped: boolean;
    skipReason?: string;
}

export const evaluateCropGrowth = async (farmCropId: number, dateStr?: string) => {
    try {
        const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        const URL = `${BASE_URL}/crop-growth/evaluate/${farmCropId}${dateStr ? `?date=${encodeURIComponent(dateStr)}` : ''}`;

        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response: AxiosResponse<{ message: string; data: FarmCropEvaluationResult }> = await axios.post(URL, {}, { headers });

        if (response && response.data) {
            return { data: response.data.data };
        } else {
            return { error: { code: 400, message: "Invalid response from server" } };
        }
    } catch (error: any) {
        const status = error.response?.status || 400;
        const serverMessage = error.response?.data?.message;
        const message = Array.isArray(serverMessage)
            ? serverMessage.join(', ')
            : serverMessage || error.message || "Unable to evaluate crop growth";

        return { error: { code: status, message } };
    }
};

export const getCropGrowthStages = async (cropId: number) => {
    try {
        const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        const URL = `${BASE_URL}/crops-growth-stages/crop/${cropId}`;

        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response: AxiosResponse<GrowthStageEntity[]> = await axios.get(URL, { headers });

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
            : serverMessage || error.message || "Unable to fetch growth stages";

        return { error: { code: status, message } };
    }
};

export const getWeather = async (latitude: number, longitude: number, farmId: number) => {
    try {
        const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        const URL = `${BASE_URL}/weather?latitude=${latitude}&longitude=${longitude}&farmId=${farmId}`;

        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response: AxiosResponse<any> = await axios.get(URL, { headers });

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
            : serverMessage || error.message || "Unable to fetch weather data";

        return { error: { code: status, message } };
    }
};