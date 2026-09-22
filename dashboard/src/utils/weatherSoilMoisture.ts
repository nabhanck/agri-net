export interface HourlySoilMoisture {
  time: string;
  soilMoisture0To1cm: number | null;
  soilMoisture1To3cm: number | null;
  soilMoisture3To9cm: number | null;
  soilMoisture9To27cm?: number | null;
  soilMoisture27To81cm?: number | null;
}

export interface CurrentSoilMoisture {
  index: number;
  time: string;
  soilMoisture0To1cm: number | null;
  soilMoisture1To3cm: number | null;
  soilMoisture3To9cm: number | null;
  soilMoisture9To27cm?: number | null;
  soilMoisture27To81cm?: number | null;
}

export interface ProcessedSoilMoistureResult {
  current: CurrentSoilMoisture | null;
  timeline: HourlySoilMoisture[];
}

/**
 * Processes weather API response to extract and time-map hourly soil moisture data
 * and identify the current soil moisture observation based on data.current.time.
 */
export function processSoilMoistureData(weatherApiResponse: any): ProcessedSoilMoistureResult {
  const data = weatherApiResponse?.data ?? weatherApiResponse;
  if (!data) {
    console.warn("processSoilMoistureData: No weather data provided in response");
    console.log("Current soil moisture:", null);
    console.log("Hourly soil moisture:", []);
    return { current: null, timeline: [] };
  }

  // Extract hourly and current sources (support parallel arrays, raw_response, or entity lists)
  const hourly = data.hourly || data.raw_response?.hourly;
  const current = data.current || data.raw_response?.current;

  let soilMoistureTimeline: HourlySoilMoisture[] = [];

  // 1. Create a time-mapped soil moisture list
  if (hourly && Array.isArray(hourly.time)) {
    soilMoistureTimeline = hourly.time.map((timeStr: string, index: number) => ({
      time: timeStr,
      soilMoisture0To1cm: hourly.soil_moisture_0_to_1cm?.[index] ?? null,
      soilMoisture1To3cm: hourly.soil_moisture_1_to_3cm?.[index] ?? null,
      soilMoisture3To9cm: hourly.soil_moisture_3_to_9cm?.[index] ?? null,
      soilMoisture9To27cm: hourly.soil_moisture_9_to_27cm?.[index] ?? null,
      soilMoisture27To81cm: hourly.soil_moisture_27_to_81cm?.[index] ?? null,
    }));
  } else if (Array.isArray(hourly)) {
    soilMoistureTimeline = hourly.map((item: any) => ({
      time:
        typeof item.forecast_time === 'string'
          ? item.forecast_time
          : item.forecast_time instanceof Date
            ? item.forecast_time.toISOString()
            : item.time || '',
      soilMoisture0To1cm: item.soil_moisture_0_to_1cm ?? null,
      soilMoisture1To3cm: item.soil_moisture_1_to_3cm ?? null,
      soilMoisture3To9cm: item.soil_moisture_3_to_9cm ?? null,
      soilMoisture9To27cm: item.soil_moisture_9_to_27cm ?? null,
      soilMoisture27To81cm: item.soil_moisture_27_to_81cm ?? null,
    }));
  }

  if (soilMoistureTimeline.length === 0) {
    console.warn("processSoilMoistureData: No hourly soil moisture data found in weather response");
    console.log("Current soil moisture:", null);
    console.log("Hourly soil moisture:", []);
    return { current: null, timeline: [] };
  }

  // 2. Find the current soil-moisture observation
  const currentTime = current?.time || current?.observed_at;
  let currentSoilMoisture: CurrentSoilMoisture | null = null;

  if (currentTime) {
    const normalizeTimestamp = (ts: any): string => {
      if (!ts) return '';
      if (typeof ts === 'string') {
        return ts.slice(0, 13);
      }
      if (ts instanceof Date) {
        return ts.toISOString().slice(0, 13);
      }
      return String(ts).slice(0, 13);
    };

    const targetHour = normalizeTimestamp(currentTime);

    // Exact string match check
    let currentIndex = soilMoistureTimeline.findIndex(
      (item) => item.time === currentTime
    );

    // Fallback hour match check (e.g. YYYY-MM-DDTHH)
    if (currentIndex === -1) {
      currentIndex = soilMoistureTimeline.findIndex(
        (item) => normalizeTimestamp(item.time) === targetHour
      );
    }

    if (currentIndex !== -1) {
      const match = soilMoistureTimeline[currentIndex];
      currentSoilMoisture = {
        index: currentIndex,
        time: match.time,
        soilMoisture0To1cm: match.soilMoisture0To1cm,
        soilMoisture1To3cm: match.soilMoisture1To3cm,
        soilMoisture3To9cm: match.soilMoisture3To9cm,
        soilMoisture9To27cm: match.soilMoisture9To27cm,
        soilMoisture27To81cm: match.soilMoisture27To81cm,
      };

      // 3. Console log the current soil moisture
      console.log("Current soil moisture:", {
        index: currentIndex,
        time: match.time,
        soilMoisture0To1cm: match.soilMoisture0To1cm,
        soilMoisture1To3cm: match.soilMoisture1To3cm,
        soilMoisture3To9cm: match.soilMoisture3To9cm,
      });
    } else {
      console.warn(
        `Warning: No matching hourly soil-moisture timestamp found for current weather time "${currentTime}"`
      );
      console.log("Current soil moisture:", null);
    }
  } else {
    console.warn("Warning: Current weather timestamp (data.current.time) is missing in API response.");
    console.log("Current soil moisture:", null);
  }

  // 3. Console log the complete time-mapped soil moisture list
  console.log("Hourly soil moisture:", soilMoistureTimeline);

  return {
    current: currentSoilMoisture,
    timeline: soilMoistureTimeline,
  };
}
