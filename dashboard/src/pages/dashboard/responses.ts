type DashboardPaginationResponse = {
    total: number;
    pageSize: number;
    current: number;
};

type DashboardErrorResponse = {
    code: number;
    message: string;
};

type WeatherData = {
    current: CurrentWeatherResponse;
    daily: DailyWeatherResponse[];
    fetchId: number;
    hourly: HourlyWeatherResponse[];
}

type WeatherResponseData = {
    weather: WeatherData;
    hourlySoilMoisture: SoilMoistureResponse[];
    currentSoilMoisture: SoilMoistureResponse | null;
}

type SoilMoistureResponse = {
    index?: number;
    soilMoisture0To1cm?: number | null;
    soilMoisture1To3cm?: number | null;
    soilMoisture3To9cm?: number | null;
    soilMoisture9To27cm?: number | null;
    soilMoisture27To81cm?: number | null;
    time: string;
}

type HourlyWeatherResponse = {
    forecast_time: string;
    id: number;
    precipitation: number;
    precipitation_probability: number;
    rain: number;
    relative_humidity_2m: number;
    soil_moisture_0_to_1cm: number;
    soil_moisture_1_to_3cm: number;
    soil_moisture_3_to_9cm: number;
    soil_moisture_9_to_27cm: number;
    soil_moisture_27_to_81cm: number;
    temperature_2m: number;
    wind_speed_10m: number;
}

type CurrentWeatherResponse = {
    id: number;
    observed_at: string;
    precipitation: number;
    rain: number;
    relative_humidity_2m: number;
    temperature_2m: number;
    wind_speed_10m: number;
}

type DailyWeatherResponse = {
    forecast_date: string;
    id: number;
    precipitation_probability_max: number;
    precipitation_sum: number;
    temperature_2m_max: number;
    temperature_2m_min: number;
}

type RuleEvaluation = {
    ruleId: number | null;
    ruleCode: string;
    riskLevel: string;
    riskType: string | null;
    category: string | null;
    priority: number | null;
    message: string;
};

type RuleOccurrence = {
    ruleCode: string;
    riskLevel: string;
    riskType: string | null;
    category: string | null;
    message: string;
    occurrences: { time: string; temperature: number; humidity: number }[];
};

type CurrentDataEvaluation = {
    temperature: number;
    humidity: number;
    evaluation: RuleEvaluation[] | null;
};

type HourlyDataEvaluation = {
    time: string;
    temperature: number;
    humidity: number;
    evaluation: RuleEvaluation[] | null;
};

type CropEvaluation = {
    cropId: number | undefined;
    growthStage: string;
    current: CurrentDataEvaluation | null;
    hourly: HourlyDataEvaluation[];
    daily: any[];
    triggeredRisks: RuleOccurrence[];
    advisory: string | null;
};

type FarmIntelligenceResponse = {
    farmId: number;
    farmName: string;
    results: CropEvaluation[];
};

export type {
    WeatherData,
    WeatherResponseData,
    SoilMoistureResponse,
    HourlyWeatherResponse,
    CurrentWeatherResponse,
    DailyWeatherResponse,
    DashboardPaginationResponse,
    DashboardErrorResponse,
    RuleEvaluation,
    RuleOccurrence,
    CurrentDataEvaluation,
    HourlyDataEvaluation,
    CropEvaluation,
    FarmIntelligenceResponse
};