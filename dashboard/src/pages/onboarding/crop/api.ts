import type { GrowthStageEntity } from "@/types/farm";
import type { AxiosResponse } from "axios";
import axios from "axios";





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