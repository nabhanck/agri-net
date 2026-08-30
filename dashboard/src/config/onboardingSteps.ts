export interface OnboardingSlotStep {
  key: string;
  label: {
    en: string;
    hi: string;
  };
  question: {
    en: string;
    hi: string;
  };
  type: 'text' | 'tel' | 'number' | 'select';
  options?: {
    value: string;
    label: {
      en: string;
      hi: string;
    };
  }[];
  example: {
    en: string;
    hi: string;
  };
  fieldCategory: 'user' | 'farm' | 'crop' | 'soil' | 'location';
}

export const ONBOARDING_STEPS: OnboardingSlotStep[] = [
  {
    key: 'fullName',
    label: {
      en: 'Full Name',
      hi: 'पूरा नाम',
    },
    question: {
      en: 'Hello! What is your full name?',
      hi: 'नमस्ते! आपका पूरा नाम क्या है?',
    },
    type: 'text',
    example: {
      en: 'Ravi Kumar',
      hi: 'रवि कुमार',
    },
    fieldCategory: 'user',
  },
  {
    key: 'phone',
    label: {
      en: 'Mobile Number',
      hi: 'मोबाइल नंबर',
    },
    question: {
      en: 'What is your 10-digit mobile number?',
      hi: 'आपका 10 अंकों का मोबाइल नंबर क्या है?',
    },
    type: 'tel',
    example: {
      en: '98765 43210',
      hi: '98765 43210',
    },
    fieldCategory: 'user',
  },
  {
    key: 'location',
    label: {
      en: 'Farm Location',
      hi: 'खेत का स्थान',
    },
    question: {
      en: 'Where is your farm located? For example, Ernakulam, Thrissur, Mandya, or Ludhiana.',
      hi: 'आपका खेत किस स्थान या जिले में है? जैसे एर्नाकुलम, त्रिशूर, मांड्या या लुधियाना।',
    },
    type: 'text',
    example: {
      en: 'Ernakulam, Kerala',
      hi: 'एर्नाकुलम, केरल',
    },
    fieldCategory: 'location',
  },
  {
    key: 'crop',
    label: {
      en: 'Primary Crop',
      hi: 'मुख्य फसल',
    },
    question: {
      en: 'What crop are you growing? Such as Rice, Wheat, Corn, Cotton, Potato, or Tomato.',
      hi: 'आप कौन सी फसल उगा रहे हैं? जैसे चावल, गेहूं, मक्का, कपास, आलू या टमाटर।',
    },
    type: 'select',
    options: [
      { value: 'Rice', label: { en: 'Rice / Paddy', hi: 'चावल / धान' } },
      { value: 'Wheat', label: { en: 'Wheat', hi: 'गेहूं' } },
      { value: 'Corn', label: { en: 'Corn / Maize', hi: 'मक्का' } },
      { value: 'Cotton', label: { en: 'Cotton', hi: 'कपास' } },
      { value: 'Potato', label: { en: 'Potato', hi: 'आलू' } },
      { value: 'Tomato', label: { en: 'Tomato', hi: 'टमाटर' } },
      { value: 'Coffee', label: { en: 'Coffee', hi: 'कॉफी' } },
      { value: 'Banana', label: { en: 'Banana', hi: 'केला' } },
      { value: 'Chili', label: { en: 'Chili', hi: 'मिर्च' } },
      { value: 'Tea', label: { en: 'Tea', hi: 'चाय' } },
    ],
    example: {
      en: 'Rice',
      hi: 'चावल',
    },
    fieldCategory: 'crop',
  },
  {
    key: 'acreage',
    label: {
      en: 'Land Size',
      hi: 'जमीन का आकार',
    },
    question: {
      en: 'What is the size of your farm in acres or hectares?',
      hi: 'आपकी जमीन कितने एकड़ या हेक्टेयर है?',
    },
    type: 'number',
    example: {
      en: '5 acres',
      hi: '5 एकड़',
    },
    fieldCategory: 'farm',
  },
  {
    key: 'soil',
    label: {
      en: 'Soil Type',
      hi: 'मिट्टी का प्रकार',
    },
    question: {
      en: 'What is your soil type? Such as Clayey, Loamy, Sandy, Alluvial, or Black soil.',
      hi: 'आपके खेत की मिट्टी कैसी है? जैसे चिकनी, दोमट, बलुई, जलोढ़ या काली मिट्टी।',
    },
    type: 'select',
    options: [
      { value: 'Clayey', label: { en: 'Clayey', hi: 'चिकनी मिट्टी' } },
      { value: 'Loamy', label: { en: 'Loamy', hi: 'दोमट मिट्टी' } },
      { value: 'Sandy', label: { en: 'Sandy', hi: 'बलुई मिट्टी' } },
      { value: 'Alluvial', label: { en: 'Alluvial', hi: 'जलोढ़ मिट्टी' } },
      { value: 'Red Soil', label: { en: 'Red Soil', hi: 'लाल मिट्टी' } },
      { value: 'Black / Regur', label: { en: 'Black / Regur', hi: 'काली / रेगुर मिट्टी' } },
      { value: 'Laterite', label: { en: 'Laterite', hi: 'लेटराइट मिट्टी' } },
    ],
    example: {
      en: 'Loamy',
      hi: 'दोमट',
    },
    fieldCategory: 'soil',
  },
  {
    key: 'irrigation',
    label: {
      en: 'Irrigation Method',
      hi: 'सिंचाई का साधन',
    },
    question: {
      en: 'How is your farm irrigated? Drip, Borewell, Canal, Sprinkler, or Rainfed?',
      hi: 'सिंचाई की क्या व्यवस्था है? जैसे ड्रिप, बोरवेल, नहर, स्प्रिंकलर या बारिश पर आधारित?',
    },
    type: 'select',
    options: [
      { value: 'Rainfed', label: { en: 'Rainfed (Monsoon)', hi: 'वर्षा आधारित' } },
      { value: 'Canal', label: { en: 'Canal', hi: 'नहर' } },
      { value: 'Borewell', label: { en: 'Borewell', hi: 'बोरवेल / ट्यूबवेल' } },
      { value: 'Drip', label: { en: 'Drip Irrigation', hi: 'ड्रिप सिंचाई' } },
      { value: 'Sprinkler', label: { en: 'Sprinkler System', hi: 'स्प्रिंकलर' } },
    ],
    example: {
      en: 'Drip',
      hi: 'ड्रिप',
    },
    fieldCategory: 'farm',
  },
];
