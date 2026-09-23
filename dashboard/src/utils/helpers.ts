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