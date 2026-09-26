import type { HourlyWeatherResponse } from "@/pages/dashboard/responses"


export function CropIcon(slug: string) {
    switch (slug) {
        case "rice":
            return "🌾"
        case "wheat":
            return "🌾"
        case "corn":
            return "🌽"
        case "cotton":
            return "☁️"
        case "potato":
            return "🥔"
        case "tomato":
            return "🍅"
        case "coffee":
            return "☕️"
        case "banana":
            return "🍌"
        case "chili":
            return "🌶️"
        case "tea":
            return "🌿"
        default:
            return "🌾"
    }
}

export function getHourlyWeatherIcon(pop: number = 0, rain: number = 0, forecastTime?: string) {
    const d = forecastTime ? new Date(forecastTime) : null;
    const hour = d && !isNaN(d.getTime()) ? d.getHours() : 12;
    const isNight = hour < 6 || hour >= 19;

    if (rain > 2 || pop >= 75) return '🌧️';
    if (rain > 0 || pop >= 40) return '🌦️';
    if (pop >= 20) return isNight ? '☁️' : '⛅';
    if (isNight) return hour < 5 || hour >= 21 ? '🌙' : '✨';
    return hour >= 6 && hour < 9 ? '🌅' : hour > 16 ? '🌤️' : '☀️';
};

export function getCurrentWeatherIcon(
    observed_at?: string,
    temperature_2m?: number,
    rain: number = 0,
    precipitation: number = 0
) {
    let timeStr = observed_at;
    let temp = temperature_2m;
    if (typeof observed_at === 'number' && typeof temperature_2m === 'string') {
        temp = observed_at;
        timeStr = temperature_2m;
    }

    const d = timeStr ? new Date(timeStr) : new Date();
    const hour = !isNaN(d.getTime()) ? d.getHours() : new Date().getHours();
    const isNight = hour < 6 || hour >= 19;

    const totalRain = rain || precipitation || 0;
    if (totalRain > 2) return '🌧️';
    if (totalRain > 0) return '🌦️';

    if (isNight) {
        return hour < 5 || hour >= 21 ? '🌙' : '✨';
    }

    if (temp !== undefined && temp !== null) {
        if (temp >= 35) return '☀️';
        if (temp <= 10) return '❄️';
    }

    if (hour >= 6 && hour < 9) return '🌅';
    if (hour >= 17 && hour < 19) return '🌤️';
    return '☀️';
}


export function formatHourlyTime(forecastTime?: string) {
    if (!forecastTime) return '';
    try {
        const d = new Date(forecastTime);
        if (isNaN(d.getTime())) return forecastTime;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return forecastTime;
    }
};


export function getRainProbability(
    forecasts: HourlyWeatherResponse[],
    hours = 24
): number {
    if (!forecasts || forecasts.length === 0) return 0;
    return Math.max(
        ...forecasts
            .slice(0, hours)
            .map((forecast) => forecast.precipitation_probability)
    );
}

export function getRiskLevelBadgeColor(level: string) {
    switch (level?.toUpperCase()) {
        case 'CRITICAL':
            return 'bg-red-50 text-red-800 border border-red-300';
        case 'HIGH':
            return 'bg-orange-50 text-orange-800 border border-orange-300';
        case 'MEDIUM':
            return 'bg-yellow-50 text-yellow-800 border border-yellow-300';
        case 'LOW':
            return 'bg-green-50 text-green-800 border border-green-300';
        default:
            return 'bg-gray-50 text-gray-800 border border-gray-300';
    }
}

/**
 * Converts raw risk type strings like TEMPERATURE_STRESS or heat_stress into Title Case ("Temperature Stress")
 */
export function transformRiskType(type: string): string {
    if (!type) return '';
    return type
        .replace(/[-_]+/g, ' ')
        .trim()
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Returns formatted and optionally translated risk level / severity text
 */
export function getRiskLevelText(
    level: string,
    t?: (key: string, options?: any) => string
): string {
    if (!level) return '';
    const normalized = level.toLowerCase().trim();
    if (t) {
        const translated = t(`risk_levels.${normalized}`);
        if (translated && !translated.startsWith('risk_levels.')) {
            return translated;
        }
    }
    switch (level.toUpperCase()) {
        case 'CRITICAL':
            return 'Critical';
        case 'HIGH':
            return 'High';
        case 'MEDIUM':
            return 'Medium';
        case 'LOW':
            return 'Low';
        default:
            return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    }
}

/**
 * Returns formatted and optionally translated risk threat type text (e.g. TEMPERATURE_STRESS -> "Temperature Stress" / "तापमान तनाव")
 */
export function getRiskTypeText(
    type: string,
    t?: (key: string, options?: any) => string
): string {
    if (!type) return '';
    const normalized = type.toLowerCase().trim().replace(/[- ]+/g, '_');
    if (t) {
        const translated = t(`risk_types.${normalized}`);
        if (translated && !translated.startsWith('risk_types.')) {
            return translated;
        }
    }
    return transformRiskType(type);
}
