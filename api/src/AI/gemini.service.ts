// gemini.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(`${process.env.GEMINI_API_KEY}`);
    // Use gemini-1.5-flash for lowest latency and free tier support
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  }

  /**
   * Translates rule outputs and weather metrics into simple farmer advisories.
   */
  async generateAdvisory(payload: {
    cropName: string;
    stage: string;
    triggeredRules: any[];
    weather: any;
    preferredLanguage?: string;
  }): Promise<string> {
    const language = payload.preferredLanguage || 'English';

    // Build a structured, domain-specific prompt
    // const prompt = `
    //   You are an expert Indian agronomist assisting small and marginal farmers. 
    //   Synthesize the following data into an easy-to-understand, empathetic, and actionable advisory.

    //   ### FARM CONTEXT:
    //   - Crop: ${payload.cropName}
    //   - Growth Stage: ${payload.stage}
    //   - Target Response Language: ${language}

    //   ### REAL-TIME WEATHER:
    //   - Current Temp: ${payload.weather.current?.temperature_2m}°C
    //   - Humidity: ${payload.weather.current?.relative_humidity_2m}%
    //   - Precipitation: ${payload.weather.current?.precipitation} mm

    //   ### TRIGGERED RISK RULES:
    //   ${JSON.stringify(payload.triggeredRules, null, 2)}

    //   ### INSTRUCTIONS:
    //   1. Explain the immediate danger/risk in simple, non-technical language.
    //   2. Provide 2-3 immediate organic or low-cost remediation steps the farmer can take.
    //   3. Respond strictly in the target language (${language}). Keep it short and readable on a basic mobile phone screen.
    // `;

    const prompt = `
      You are an expert Indian agronomist assisting small and marginal farmers.
      Synthesize the following data into an easy-to-understand, empathetic, and actionable advisory.

      ### FARM CONTEXT:
      - Crop: ${payload.cropName}
      - Growth Stage: ${payload.stage}
      - Target Response Language: ${language}

      ### CURRENT CONDITIONS (right now):
      - Temp: ${payload.weather.current?.temperature_2m ?? 'unavailable'}°C
      - Humidity: ${payload.weather.current?.relative_humidity_2m ?? 'unavailable'}%
      - Precipitation: ${payload.weather.current?.precipitation ?? 'unavailable'} mm

      ### RISKS DETECTED IN THE 7-DAY FORECAST:
      Each entry below lists a risk and the exact times (with temperature/humidity at that time)
      when conditions matched the risk. Use these times to tell the farmer WHEN to act
      (e.g. "tonight," "tomorrow morning," "over the next two days") rather than implying
      the risk is happening right now unless it appears under CURRENT CONDITIONS.

      ${JSON.stringify(payload.triggeredRules, null, 2)}

      ### STRICT RULES:
      - Only use the numbers (temperature, humidity, dates/times) given above. NEVER invent,
        estimate, or assume any value not explicitly present in this data.
      - Do NOT mention a crop variety unless it was explicitly given in FARM CONTEXT.
      - If current conditions show no active risk but the forecast does, say so clearly
        (e.g. "conditions right now are fine, but risk is expected on [date/time]").

      ### INSTRUCTIONS:
      1. Explain the danger/risk in simple, non-technical language, referencing WHEN it applies.
      2. Provide 2-3 immediate organic or low-cost remediation steps the farmer can take.
      3. Respond strictly in the target language (${language}). Keep it short and readable on a basic mobile phone screen.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('Failed to generate response from Gemini API', error);
      throw error;
    }
  }
}