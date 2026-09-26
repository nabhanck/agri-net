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

export const getFarmIntelligence = async (farmId: number) => {
    try {
        const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        const URL = `${BASE_URL}/farm/${farmId}/intelligence`;

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
            : serverMessage || error.message || "Unable to fetch farm intelligence";

        return { error: { code: status, message } };
    }
};

export const getAdvisoryRules = async () => {
    try {
        const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        const URL = `${BASE_URL}/advisory-rules`;

        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response: AxiosResponse<any[]> = await axios.get(URL, { headers });

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
            : serverMessage || error.message || "Unable to fetch advisory rules";

        return { error: { code: status, message } };
    }
};

export interface MarketPriceRecord {
    id?: number;
    farm_id?: number;
    crop_id?: number;
    farm_crop_id?: number;
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety?: string;
    grade?: string;
    arrival_date?: string;
    min_price?: number;
    max_price?: number;
    modal_price: number;
    currency?: string;
    fetched_at?: string;
}

export interface MarketPriceResponse {
    status: string;
    source: 'live_government_api' | 'cache' | 'fallback_db' | 'unavailable';
    commodity: string;
    total: number;
    count: number;
    unit: string;
    averageModalPrice: number;
    minModalPrice: number;
    maxModalPrice: number;
    marketsCount: number;
    statesCovered: string[];
    records: MarketPriceRecord[];
    message?: string;
}

export interface FetchMarketPriceParams {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    farm_id?: number;
    crop_id?: number;
    farm_crop_id?: number;
    limit?: number;
    force_refresh?: boolean;
}

export const getMarketPrices = async (params: FetchMarketPriceParams = {}) => {
    try {
        const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const queryParams = new URLSearchParams();
        if (params.commodity) queryParams.append('commodity', params.commodity);
        if (params.farm_id) queryParams.append('farm_id', String(params.farm_id));
        if (params.crop_id) queryParams.append('crop_id', String(params.crop_id));
        if (params.farm_crop_id) queryParams.append('farm_crop_id', String(params.farm_crop_id));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.force_refresh) queryParams.append('force_refresh', 'true');

        const queryString = queryParams.toString();
        const URL = `${BASE_URL}/market-price${queryString ? `?${queryString}` : ''}`;
        const response: AxiosResponse<MarketPriceResponse> = await axios.get(URL, { headers });

        if (response && response.data) {
            return { data: response.data };
        } else {
            return { error: { code: 400, message: 'Invalid response from server' } };
        }
    } catch (error: any) {
        const status = error.response?.status || 400;
        const serverMessage = error.response?.data?.message;
        const message = Array.isArray(serverMessage)
            ? serverMessage.join(', ')
            : serverMessage || error.message || 'Unable to fetch market prices';

        return { error: { code: status, message } };
    }
};