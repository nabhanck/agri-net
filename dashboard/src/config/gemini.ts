import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VoiceFormField } from '../context/VoiceScopeContext';
import type { OnboardingSlotStep } from './onboardingSteps';

export interface FormFieldUpdate {
  target: string;
  value: string | number | boolean;
}

export interface VoiceAudioIntentResult {
  transcript: string;
  action: 'NAVIGATE' | 'FILL_FORM' | 'REJECT' | 'NEXT_STEP' | 'PREV_STEP' | 'SUBMIT' | 'CUSTOM' | 'UNKNOWN';
  target?: string;
  value?: string | number | boolean;
  updates?: FormFieldUpdate[];
  spokenFeedback: string;
}

export interface VoiceScreenContext {
  screen: string;
  scopeCategory?: string;
  allowedActions: string[];
  availableFields?: VoiceFormField[] | string[];
  currentRoute?: string;
  language?: string;
  customInstructions?: string;
}

export interface ConversationalSlotExtractionResult {
  transcript: string;
  extractedValue: string | number | boolean | null;
  additionalSlots?: Record<string, string | number | boolean>;
  spokenConfirmation: string;
  isConfidenceHigh: boolean;
}

const apiKey = `${import.meta.env.VITE_GEMINI_API_KEY}` || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Multimodal Audio Intent Parsing with Gemini.
 * Scopes intent resolution strictly based on the active screen context.
 */
export async function parseVoiceAudioWithGemini(
  base64Audio: string,
  mimeType: string = 'audio/webm',
  screenContext: VoiceScreenContext,
  language: string = 'en-IN'
): Promise<VoiceAudioIntentResult> {
  const isHindi = language.toLowerCase().startsWith('hi');

  if (!base64Audio || !base64Audio.trim()) {
    return {
      transcript: '',
      action: 'UNKNOWN',
      spokenFeedback: isHindi
        ? 'कोई ऑडियो प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।'
        : 'No audio detected. Please try speaking again.',
    };
  }

  if (!genAI || !apiKey) {
    console.warn('VITE_GEMINI_API_KEY is not configured in environment variables.');
    return {
      transcript: 'Audio recording',
      action: 'UNKNOWN',
      spokenFeedback: isHindi
        ? 'माफ़ कीजिए, Gemini API कुंजी कॉन्फ़िगर नहीं है।'
        : 'Sorry, Gemini API key is not configured.',
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const languageInstruction = isHindi
      ? `Preferred Voice Response Language: Hindi (Devanagari script).
Provide "spokenFeedback": A short, natural, friendly 1-sentence confirmation spoken back in Hindi (Devanagari script) confirming what was done. If multiple fields were filled, summarize all of them in one sentence.`
      : `Preferred Voice Response Language: English (Indian / Global English).
Provide "spokenFeedback": A short, natural, friendly 1-sentence confirmation spoken back in English confirming what was done (e.g. "Opening Dashboard", "Selected Rice crop", "Updated farm size to 5 acres", "Set irrigation to Drip", "Saved your name, email and phone number"). If multiple fields were filled, summarize all of them in one sentence.`;

    const promptText = `You are an intelligent multimodal voice assistant for AgriNet, an Indian smart agriculture web application.
Listen to the provided audio command carefully. The user may speak in English, Hindi, Indian English, Hinglish, or regional agricultural terms with Indian accents.

---
ACTIVE SCREEN CONTEXT:
- Screen Identifier: "${screenContext.screen}"
- Scope Category: "${screenContext.scopeCategory || 'GLOBAL'}"
- Allowed Actions: ${JSON.stringify(screenContext.allowedActions)}
- Active Form Fields Available on this Screen: ${JSON.stringify(screenContext.availableFields || [])}
- Current URL Route: "${screenContext.currentRoute || '/'}"
${screenContext.customInstructions ? `- Screen Instructions: ${screenContext.customInstructions}` : ''}

---
CRITICAL SCOPE & ACTION RULES:
1. ONLY execute actions that are listed in 'Allowed Actions' (${JSON.stringify(screenContext.allowedActions)}).
2. NAVIGATION ISOLATION:
   - If the user asks to navigate away (e.g. "go to dashboard", "open settings", "open home") while on 'ONBOARDING_FORM' or 'REGISTER_FORM' and 'NAVIGATE' is not allowed, you MUST return action: 'REJECT'.
   - When returning 'REJECT', set spokenFeedback explaining politely that they must complete the current step/form first (e.g., in English: "Please complete your farm setup before opening the dashboard.", in Hindi: "कृपया डैशबोर्ड खोलने से पहले अपना फार्म सेटअप पूरा करें।").
3. FORM FILLING:
   - If the user provides information matching any of the 'Active Form Fields Available on this Screen', return action: 'FILL_FORM'.
   - If multiple fields are mentioned (e.g. "My name is X, phone is Y"), extract all of them into the "updates" array.
4. WIZARD STEP NAVIGATION:
   - If the user says "Next", "Continue", "Proceed", "Submit", "Aage badho" and 'NEXT_STEP' or 'SUBMIT' is in Allowed Actions, return action: 'NEXT_STEP' or 'SUBMIT'.
   - If the user says "Back", "Previous", "Peechhe jao" and 'PREV_STEP' is in Allowed Actions, return action: 'PREV_STEP'.
5. SPOKEN FEEDBACK:
   - ${languageInstruction}

---
Return ONLY a strict JSON object with this exact shape:
{
  "transcript": "<What the user said>",
  "action": "NAVIGATE" | "FILL_FORM" | "REJECT" | "NEXT_STEP" | "PREV_STEP" | "SUBMIT" | "CUSTOM" | "UNKNOWN",
  "target": "<route_path, if action is NAVIGATE>",
  "updates": [
    { "target": "<field_name>", "value": "<value_to_fill>" }
  ],
  "spokenFeedback": "<Short confirmation or explanation sentence>"
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: base64Audio,
        },
      },
      {
        text: promptText,
      },
    ]);

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanJson) as VoiceAudioIntentResult;

    const defaultSuccess = isHindi ? 'आदेश निष्पादित किया गया।' : 'Command executed.';
    const updates = Array.isArray(parsed.updates) ? parsed.updates : undefined;

    return {
      transcript: parsed.transcript || '',
      action: parsed.action || 'UNKNOWN',
      target: parsed.target ?? updates?.[0]?.target,
      value: parsed.value ?? updates?.[0]?.value,
      updates,
      spokenFeedback: parsed.spokenFeedback || defaultSuccess,
    };
  } catch (error: any) {
    console.error('Gemini Multimodal Audio Processing Error:', error);
    return {
      transcript: '',
      action: 'UNKNOWN',
      spokenFeedback: isHindi
        ? 'माफ़ कीजिए, ऑडियो संसाधित करने में त्रुटि हुई। कृपया पुनः बोलें।'
        : 'Sorry, there was an error processing the audio. Please try again.',
    };
  }
}

/**
 * Conversational Turn-by-Turn Slot Extraction with Gemini 3.6 Flash.
 * Extracts the value for a specific interview question slot, plus any additional slots mentioned.
 */
export async function extractConversationalSlotWithGemini(
  base64Audio: string,
  mimeType: string = 'audio/webm',
  currentSlot: OnboardingSlotStep,
  allSlots: OnboardingSlotStep[],
  alreadyFilled: Record<string, any> = {},
  language: string = 'hi-IN'
): Promise<ConversationalSlotExtractionResult> {
  const isHindi = language.toLowerCase().startsWith('hi');

  if (!base64Audio || !base64Audio.trim()) {
    return {
      transcript: '',
      extractedValue: null,
      spokenConfirmation: isHindi
        ? 'कोई उत्तर प्राप्त नहीं हुआ। कृपया पुनः बोलें।'
        : 'No answer detected. Please speak again.',
      isConfidenceHigh: false,
    };
  }

  if (!genAI || !apiKey) {
    console.warn('VITE_GEMINI_API_KEY is not configured in environment variables.');
    return {
      transcript: 'Audio recording',
      extractedValue: null,
      spokenConfirmation: isHindi
        ? 'Gemini API कुंजी कॉन्फ़िगर नहीं है।'
        : 'Gemini API key is not configured.',
      isConfidenceHigh: false,
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const questionAsked = isHindi ? currentSlot.question.hi : currentSlot.question.en;
    const slotLabel = isHindi ? currentSlot.label.hi : currentSlot.label.en;

    const promptText = `You are a conversational voice interviewer for AgriNet, helping Indian farmers onboard step-by-step through voice.
Listen carefully to the farmer's audio response. The farmer may speak in Hindi, Indian English, Hinglish, or regional terms.

INTERVIEW STATE:
- Current Target Slot: "${currentSlot.key}" (${slotLabel})
- Slot Type: "${currentSlot.type}"
- Question Asked: "${questionAsked}"
- Already Answered Slots: ${JSON.stringify(alreadyFilled)}
- All Onboarding Slots in System: ${JSON.stringify(
      allSlots.map((s) => ({
        key: s.key,
        label: isHindi ? s.label.hi : s.label.en,
        type: s.type,
      }))
    )}

YOUR TASK:
1. Accurately transcribe what the farmer said in "transcript".
2. Extract the clean, normalized value for the target slot "${currentSlot.key}" into "extractedValue".
   - If slot is "fullName": clean name (e.g. "Ravi Kumar")
   - If slot is "phone": 10-digit number string (e.g. "9876543210")
   - If slot is "acreage": numeric value in acres (e.g. 5, 2.5)
   - If slot is "crop": normalized crop name (e.g. "Rice", "Wheat", "Corn", "Cotton", "Potato", "Tomato", "Coffee", "Banana", "Chili", "Tea")
   - If slot is "soil": normalized soil type (e.g. "Clayey", "Loamy", "Sandy", "Alluvial", "Red Soil", "Black / Regur", "Laterite")
   - If slot is "irrigation": normalized method (e.g. "Rainfed", "Canal", "Borewell", "Drip", "Sprinkler")
   - If slot is "location": city or district name (e.g. "Ernakulam", "Thrissur", "Ludhiana")
3. MULTI-SLOT CAPTURE: If the farmer provided answers for ANY OTHER slots in the same audio (e.g., "Mera naam Ramesh hai, 5 acre zameen me gehun ugata hu"), extract those other slots in the "additionalSlots" map (key-value pairs).
4. Provide "spokenConfirmation": A short, warm, encouraging 1-sentence confirmation acknowledging the captured value(s) in ${isHindi ? 'Hindi (Devanagari script)' : 'clear English'
      }. (e.g. in Hindi: "बहुत बढ़िया, आपका नाम रवि कुमार दर्ज कर लिया गया है।" or in English: "Great, full name saved as Ravi Kumar.")

Return ONLY a strict JSON object:
{
  "transcript": "<What the user said>",
  "extractedValue": <extracted_value_or_null>,
  "additionalSlots": {
    "<other_slot_key>": <extracted_value>
  },
  "spokenConfirmation": "<Short warm confirmation sentence in ${isHindi ? 'Hindi Devanagari' : 'English'}>",
  "isConfidenceHigh": true | false
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: base64Audio,
        },
      },
      {
        text: promptText,
      },
    ]);

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanJson) as ConversationalSlotExtractionResult;

    return {
      transcript: parsed.transcript || '',
      extractedValue: parsed.extractedValue ?? null,
      additionalSlots: parsed.additionalSlots || {},
      spokenConfirmation:
        parsed.spokenConfirmation ||
        (isHindi ? 'जानकारी दर्ज कर ली गई है।' : 'Information saved.'),
      isConfidenceHigh: parsed.isConfidenceHigh ?? true,
    };
  } catch (error: any) {
    console.error('Gemini Conversational Slot Extraction Error:', error);
    return {
      transcript: '',
      extractedValue: null,
      spokenConfirmation: isHindi
        ? 'माफ़ कीजिए, उत्तर समझने में त्रुटि हुई। कृपया पुनः बोलें।'
        : 'Sorry, could not process the response. Please speak again.',
      isConfidenceHigh: false,
    };
  }
}

export interface AgronomistChatContext {
  farmName?: string;
  cropName?: string;
  variety?: string;
  growthStage?: string;
  soilType?: string;
  soilPh?: number;
  size?: number;
  sizeUnit?: string;
  irrigation?: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  rainProbability?: number;
  currentRain?: number;
  soilMoisture?: number;
  triggeredRisks?: any[];
  language?: string;
}

/**
 * Direct Agronomist Chat Assistant powered by Gemini.
 * Takes live farm and telemetry context to generate personalized, actionable farming advice.
 */
export async function askAgronomistWithGemini(
  userMessage: string,
  chatHistory: Array<{ sender: 'ai' | 'user'; text: string }>,
  context: AgronomistChatContext
): Promise<string> {
  if (!apiKey || !genAI) {
    console.warn('VITE_GEMINI_API_KEY is not configured in environment variables.');
    return "Gemini API key is not configured in your environment. Please set VITE_GEMINI_API_KEY.";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
    });

    const systemPrompt = `You are the AgriNet AI Agronomist, an expert Indian crop consultant providing empathetic, scientifically accurate, and actionable agricultural guidance based on ICAR, TNAU, and agronomic extension guidelines.

### ACTIVE FARM & TELEMETRY PROFILE:
- Farm Name: ${context.farmName || 'Farm'}
- Primary Crop: ${context.cropName || 'Rice'}
- Variety: ${context.variety || 'Active'}
- Growth Stage: ${context.growthStage || 'Vegetative'}
- Soil Profile: ${context.soilType || 'Clayey'}${context.soilPh ? ` (pH: ${context.soilPh})` : ''}
- Plot Size: ${context.size ? `${context.size} ${context.sizeUnit || 'acres'}` : 'Not specified'}
- Irrigation Method: ${context.irrigation || 'Rainfed'}
- Live Weather: ${context.temperature != null ? `${context.temperature}°C` : 'N/A'}, ${context.humidity != null ? `${context.humidity}% Humidity` : 'N/A'}, Wind: ${context.windSpeed != null ? `${context.windSpeed} km/h` : 'N/A'}
- Rain Risk: ${context.rainProbability != null ? `${context.rainProbability}%` : 'N/A'}${context.currentRain ? `, Precipitation: ${context.currentRain}mm` : ''}
- Soil Moisture Saturation: ${context.soilMoisture != null ? `${context.soilMoisture}%` : 'N/A'}
${context.triggeredRisks && context.triggeredRisks.length > 0 ? `- Active Agronomic Risk Warnings: ${JSON.stringify(context.triggeredRisks)}` : ''}

### GUIDELINES FOR YOUR RESPONSE:
1. Provide practical, step-by-step answers directly relevant to the farmer's crop, soil type, growth stage, and current weather.
2. If discussing fertilizers, specify recommended dosage per hectare or acre (e.g. Urea, DAP, Potash, organic compost).
3. If discussing spraying or chemical applications, factor in current rainfall probabilities and wind speed.
4. Keep the response readable, encouraging, well-structured, and concise for mobile viewing.
5. If the user writes in Hindi or another Indian language, respond in that language.`;

    const recentHistory = chatHistory.slice(-6);
    const formattedHistory = recentHistory
      .map((m) => `${m.sender === 'user' ? 'Farmer' : 'AI Agronomist'}: ${m.text}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\n### CONVERSATION HISTORY:\n${formattedHistory}\n\nFarmer: ${userMessage}\nAI Agronomist:`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    return responseText.trim();
  } catch (error: any) {
    console.error('Agronomist Gemini Chat Error:', error);
    return `Sorry, I encountered an issue connecting to the agronomic model: ${error.message || 'Please try again.'}`;
  }
}

export interface PlantDiseaseDiagnosticResult {
  diseaseName: string;
  scientificName?: string;
  confidence: number;
  severity: 'HEALTHY' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  isHealthy: boolean;
  affectedPart?: string;
  symptoms: string[];
  causes: string[];
  immediateAction: string;
  organicRemedies: string[];
  chemicalTreatments: string[];
  preventiveMeasures: string[];
  summary: string;
}

export interface DiseaseDiagnosticContext {
  farmName?: string;
  cropName?: string;
  variety?: string;
  growthStage?: string;
  soilType?: string;
  temperature?: number;
  humidity?: number;
  language?: string;
}

/**
 * Multimodal Visual Plant Pathology & Disease Diagnostic with Gemini.
 * Evaluates uploaded/captured plant or leaf images in the context of farm telemetry.
 */
export async function diagnosePlantDiseaseWithGemini(
  base64Image: string,
  mimeType: string = 'image/jpeg',
  context: DiseaseDiagnosticContext = {}
): Promise<PlantDiseaseDiagnosticResult> {
  if (!apiKey || !genAI) {
    throw new Error('Gemini API key is not configured in your environment. Please set VITE_GEMINI_API_KEY.');
  }

  // Strip potential data URI header
  const cleanBase64 = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1]
    : base64Image;

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const language = context.language || 'English';
  const isHindi = language.toLowerCase().startsWith('hi');
  const isMalayalam = language.toLowerCase().startsWith('ml');
  const langPrompt = isHindi
    ? 'All descriptive text (symptoms, causes, immediateAction, organicRemedies, chemicalTreatments, preventiveMeasures, summary) MUST be in Hindi (Devanagari script).'
    : isMalayalam
    ? 'All descriptive text (symptoms, causes, immediateAction, organicRemedies, chemicalTreatments, preventiveMeasures, summary) MUST be in Malayalam (മലയാളം script).'
    : 'All descriptive text must be in clear, farmer-friendly English.';

  const promptText = `You are the AgriNet AI Plant Pathologist & Visual Crop Disease Diagnostic Specialist.
Examine this plant / leaf / crop photograph carefully in the context of the farmer's field:

### FARM CONTEXT:
- Target Crop: ${context.cropName || 'Unspecified'}
- Variety: ${context.variety || 'Unspecified'}
- Growth Stage: ${context.growthStage || 'Unspecified'}
- Soil Type: ${context.soilType || 'Unspecified'}
- Weather: ${context.temperature != null ? `${context.temperature}°C` : 'N/A'}, ${context.humidity != null ? `${context.humidity}% Humidity` : 'N/A'}

### DIAGNOSIS INSTRUCTIONS:
1. Visually diagnose whether the plant is healthy or suffering from fungal, bacterial, viral infection, pest infestation, or nutrient deficiency.
2. If healthy, set isHealthy: true, diseaseName: "Healthy Crop", severity: "HEALTHY".
3. If diseased, identify the exact disease or pest name (with scientific binomial name if applicable).
4. Provide confidence percentage (50-99).
5. Specify severity: "HEALTHY" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL".
6. Specify affectedPart (e.g. "Leaves", "Stem", "Panicle / Grain", "Fruit", "Whole Plant").
7. List 2-4 observed visual symptoms.
8. List 1-3 root causes.
9. Provide 1 immediate actionable emergency step for the farmer.
10. Provide 2-3 organic / bio-control remedies (e.g., Neem oil spray, Trichoderma harzianum, Pseudomonas fluorescens, cow urine decoction, improved drainage).
11. Provide 1-2 chemical treatment options with safe dosage/dilution only if appropriate (e.g., Tricyclazole 75% WP @ 0.6g/L, Mancozeb @ 2g/L).
12. List 2-3 preventive cultural/agronomic practices for the next cycle.
13. ${langPrompt}

Return ONLY a strict JSON object with this exact schema:
{
  "diseaseName": "<Name of disease or pest or 'Healthy Crop'>",
  "scientificName": "<Scientific binomial name or ''>",
  "confidence": <integer number between 50 and 99>,
  "severity": "HEALTHY" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "isHealthy": <boolean>,
  "affectedPart": "<string>",
  "symptoms": ["<symptom 1>", "<symptom 2>"],
  "causes": ["<cause 1>", "<cause 2>"],
  "immediateAction": "<Immediate step for the farmer>",
  "organicRemedies": ["<organic remedy 1>", "<organic remedy 2>"],
  "chemicalTreatments": ["<chemical remedy with dosage>"],
  "preventiveMeasures": ["<preventive measure 1>", "<preventive measure 2>"],
  "summary": "<1-2 sentence overview for the farmer>"
}`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    },
    {
      text: promptText,
    },
  ]);

  const responseText = result.response.text();
  const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson) as PlantDiseaseDiagnosticResult;
}