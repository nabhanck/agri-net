import type { CropInfo, SoilType, IrrigationType, FarmingPractice, WeatherData, SatelliteNDVIData, FarmAdvisory, FarmProfile } from '../types';

export const POPULAR_CROPS: CropInfo[] = [
  {
    id: 'rice',
    name: 'Rice',
    localName: 'Paddy / Nel',
    category: 'cereal',
    icon: '🌾',
    popularVarieties: ['IR64', 'Jyothi', 'Uma', 'Swarna', 'Basmati 1121', 'Ponni', 'Other'],
    growthStages: [
      { stage: 'Seedling / Nursery', durationDays: 20, description: 'Emergence of first true leaves and root anchoring' },
      { stage: 'Tillering & Vegetative', durationDays: 35, description: 'Rapid leaf development and active tiller formation' },
      { stage: 'Panicle Initiation & Flowering', durationDays: 30, description: 'Stem elongation, flowering, and fertilization' },
      { stage: 'Grain Filling & Ripening', durationDays: 25, description: 'Grains develop starch, turn golden yellow' },
      { stage: 'Harvest Ready', durationDays: 10, description: 'Grain moisture reaches 18-20%, ready for combining' },
    ],
    waterRequirement: 'Very High',
    optimalPhRange: [5.5, 6.8],
    idealSoil: ['Clayey', 'Alluvial', 'Loamy'],
  },
  {
    id: 'corn',
    name: 'Corn',
    localName: 'Maize / Makka',
    category: 'cereal',
    icon: '🌽',
    popularVarieties: ['Pioneer 30V92', 'DKC 9108', 'HQPM-1', 'Syngenta NK6240', 'African Tall', 'Other'],
    growthStages: [
      { stage: 'Emergence & V4', durationDays: 18, description: 'Seedling emergence and root nodal establishment' },
      { stage: 'Rapid Vegetative (V6-V12)', durationDays: 30, description: 'Fast stem elongation and leaf area expansion' },
      { stage: 'Tasseling & Silking (R1)', durationDays: 20, description: 'Pollen shedding and ear fertilization' },
      { stage: 'Dough & Dent (R4-R5)', durationDays: 35, description: 'Kernel starch accumulation and hardening' },
      { stage: 'Physiological Maturity', durationDays: 15, description: 'Black layer formation, grain dry-down' },
    ],
    waterRequirement: 'Medium',
    optimalPhRange: [5.8, 7.0],
    idealSoil: ['Loamy', 'Alluvial', 'Black / Regur'],
  },
  {
    id: 'potato',
    name: 'Potato',
    localName: 'Aloo / Urulakizhangu',
    category: 'vegetable',
    icon: '🥔',
    popularVarieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Bahar', 'Kufri Chipsona', 'Atlantic', 'Other'],
    growthStages: [
      { stage: 'Sprout Development', durationDays: 15, description: 'Sprout emergence from seed tubers' },
      { stage: 'Vegetative Growth', durationDays: 25, description: 'Foliage and root system formation' },
      { stage: 'Tuber Initiation', durationDays: 20, description: 'Stolon tips swell to form miniature tubers' },
      { stage: 'Tuber Bulking', durationDays: 35, description: 'Rapid starch deposition and tuber expansion' },
      { stage: 'Maturation & Skin Set', durationDays: 15, description: 'Canopy senesces, tuber skin thickens for storage' },
    ],
    waterRequirement: 'Medium',
    optimalPhRange: [5.0, 6.5],
    idealSoil: ['Sandy Loam', 'Loamy', 'Alluvial'],
  },
  {
    id: 'wheat',
    name: 'Wheat',
    localName: 'Gehun / Gothambu',
    category: 'cereal',
    icon: '🌾',
    popularVarieties: ['HD 2967', 'HD 3086', 'PBW 550', 'Sharbati', 'Lok 1', 'Other'],
    growthStages: [
      { stage: 'Crown Root Initiation (CRI)', durationDays: 22, description: 'Crucial rooting phase 21 days after sowing' },
      { stage: 'Tillering & Jointing', durationDays: 35, description: 'Nodes form along the stem with multiple shoots' },
      { stage: 'Booting & Heading', durationDays: 25, description: 'Ear head emerges from the flag leaf sheath' },
      { stage: 'Milking & Dough', durationDays: 25, description: 'Grain development from milky liquid to firm dough' },
      { stage: 'Ripening', durationDays: 15, description: 'Straw turns golden, moisture drops under 14%' },
    ],
    waterRequirement: 'Medium',
    optimalPhRange: [6.0, 7.5],
    idealSoil: ['Loamy', 'Alluvial', 'Clay Loam'],
  },
  {
    id: 'cotton',
    name: 'Cotton',
    localName: 'Kapas / Paruthi',
    category: 'cash_crop',
    icon: '☁️',
    popularVarieties: ['Bt Cotton RCH-2', 'Bollgard II', 'DCH-32', 'MCU-5', 'Suraj', 'Other'],
    growthStages: [
      { stage: 'Germination & Seedling', durationDays: 20, description: 'Cotyledon emergence and deep taproot formation' },
      { stage: 'Square Formation (Squaring)', durationDays: 30, description: 'First floral buds (squares) develop' },
      { stage: 'Flowering & Boll Setting', durationDays: 45, description: 'White to pink flowers pollinated, bolls expand' },
      { stage: 'Boll Opening & Maturation', durationDays: 40, description: 'Bolls burst open revealing fluffy white lint' },
      { stage: 'Harvesting / Picking', durationDays: 25, description: 'Sequential manual or mechanical picking' },
    ],
    waterRequirement: 'Medium',
    optimalPhRange: [6.0, 8.0],
    idealSoil: ['Black / Regur', 'Alluvial', 'Deep Loam'],
  },
  {
    id: 'tomato',
    name: 'Tomato',
    localName: 'Tamatar / Thakkali',
    category: 'vegetable',
    icon: '🍅',
    popularVarieties: ['Arka Rakshak', 'Abhinav', 'US 440', 'Pusa Ruby', 'Himsona', 'Other'],
    growthStages: [
      { stage: 'Transplant & Establishment', durationDays: 15, description: 'Root acclimation after nursery transplantation' },
      { stage: 'Early Vegetative', durationDays: 25, description: 'Branching and foliage canopy building' },
      { stage: 'Flowering & Fruit Set', durationDays: 25, description: 'Yellow flower clusters set small green fruits' },
      { stage: 'Fruit Sizing & Breaker Stage', durationDays: 25, description: 'Green fruits expand and show first color break' },
      { stage: 'Continuous Harvesting', durationDays: 35, description: 'Deep red ripe fruits harvested at 3-day intervals' },
    ],
    waterRequirement: 'Medium',
    optimalPhRange: [6.0, 6.8],
    idealSoil: ['Loamy', 'Sandy Loam', 'Red Soil'],
  },
  {
    id: 'coffee',
    name: 'Coffee',
    localName: 'Kaapi',
    category: 'plantation',
    icon: '☕',
    popularVarieties: ['Arabica Selection 795', 'Robusta CxR', 'Cauvery (Catimor)', 'Chandragiri', 'Other'],
    growthStages: [
      { stage: 'Blossom & Fruit Set', durationDays: 30, description: 'White aromatic blossoms triggered by blossom showers' },
      { stage: 'Berry Development', durationDays: 120, description: 'Slow swelling of green pinhead berries to full size' },
      { stage: 'Berry Ripening', durationDays: 60, description: 'Berries transition from green to deep crimson cherry' },
      { stage: 'Harvest & Processing', durationDays: 45, description: 'Selective selective picking of crimson cherries' },
    ],
    waterRequirement: 'High',
    optimalPhRange: [5.5, 6.5],
    idealSoil: ['Laterite', 'Red Loam', 'Forest Clay Loam'],
  },
  {
    id: 'banana',
    name: 'Banana',
    localName: 'Kela / Vazha',
    category: 'plantation',
    icon: '🍌',
    popularVarieties: ['Grand Naine (G9)', 'Nendran', 'Robusta', 'Red Banana (Chenkadali)', 'Poovan', 'Other'],
    growthStages: [
      { stage: 'Vegetative Shoot Growth', durationDays: 90, description: 'Emergence of 30-40 large photosynthetic leaves' },
      { stage: 'Flower Bud Shooting', durationDays: 30, description: 'Heart-shaped purple inflorescence emerges through pseudostem' },
      { stage: 'Bunch Development', durationDays: 90, description: 'Hands of bananas swell and fill out with starch' },
      { stage: 'Harvest Readiness', durationDays: 20, description: 'Angles on fingers round off, light green sheen' },
    ],
    waterRequirement: 'Very High',
    optimalPhRange: [6.0, 7.5],
    idealSoil: ['Alluvial', 'Loamy', 'Clayey'],
  },
  {
    id: 'chili',
    name: 'Chili',
    localName: 'Mirch / Mulaku',
    category: 'vegetable',
    icon: '🌶️',
    popularVarieties: ['Guntur Sannam', 'Byadagi', 'Kanthari', 'Teja 4', 'Pusa Jwala', 'Other'],
    growthStages: [
      { stage: 'Transplanting & Rooting', durationDays: 15, description: 'Establishment of nursery seedlings in main bed' },
      { stage: 'Vegetative Branching', durationDays: 30, description: 'Bushy crown development and node multiplying' },
      { stage: 'Flowering & Pod Setting', durationDays: 25, description: 'White star flowers yield pungent slender green pods' },
      { stage: 'Pod Maturation & Harvest', durationDays: 50, description: 'Regular harvests of green or red ripe pods' },
    ],
    waterRequirement: 'Medium',
    optimalPhRange: [6.0, 7.0],
    idealSoil: ['Loamy', 'Black / Regur', 'Red Soil'],
  },
  {
    id: 'tea',
    name: 'Tea',
    localName: 'Chai / Thela',
    category: 'plantation',
    icon: '🌿',
    popularVarieties: ['Assamica', 'Camellia Sinensis', 'UPASI-9', 'AV2', 'TV-1', 'Other'],
    growthStages: [
      { stage: 'Pruning & Dormancy Recovery', durationDays: 45, description: 'Post-pruning bud burst and canopy renewal' },
      { stage: 'First Flush (Spring Rush)', durationDays: 60, description: 'Tender two-leaves-and-a-bud emergence' },
      { stage: 'Monsoon Flush', durationDays: 90, description: 'Fast continuous vegetative flush during rains' },
      { stage: 'Autumnal Flush', durationDays: 60, description: 'Slow-growing, aromatic premium leaf production' },
    ],
    waterRequirement: 'High',
    optimalPhRange: [4.5, 5.5],
    idealSoil: ['Laterite', 'Red Acidic Loam'],
  },
];

export const SOIL_PROFILES: { type: SoilType; description: string; waterRetention: string; bestFor: string; defaultPh: number; icon: string; color: string }[] = [
  {
    type: 'Clayey',
    description: 'Fine-grained soil with high moisture and nutrient retention. Ideal for water-intensive crops.',
    waterRetention: 'Very High',
    bestFor: 'Rice, Sugarcane, Cotton',
    defaultPh: 6.5,
    icon: '🧱',
    color: '#8b5a2b',
  },
  {
    type: 'Loamy',
    description: 'Optimal balance of sand, silt, and clay. Excellent aeration, drainage, and fertility.',
    waterRetention: 'Balanced (High)',
    bestFor: 'Wheat, Corn, Vegetables, Fruits',
    defaultPh: 6.8,
    icon: '🌱',
    color: '#654321',
  },
  {
    type: 'Sandy',
    description: 'Light, porous soil with rapid drainage. Warms up quickly in spring.',
    waterRetention: 'Low (Drains Fast)',
    bestFor: 'Groundnut, Watermelon, Root Crops',
    defaultPh: 6.2,
    icon: '🏖️',
    color: '#d4a373',
  },
  {
    type: 'Alluvial',
    description: 'Nutrient-rich river delta sediment with high organic matter and balanced minerals.',
    waterRetention: 'High',
    bestFor: 'Rice, Wheat, Jute, Oilseeds',
    defaultPh: 7.0,
    icon: '🌊',
    color: '#5c4033',
  },
  {
    type: 'Red Soil',
    description: 'Formed from crystalline granite rocks rich in iron oxides. Porous with moderate fertility.',
    waterRetention: 'Moderate',
    bestFor: 'Chili, Millets, Pulses, Tobacco',
    defaultPh: 6.0,
    icon: '🔴',
    color: '#b23a22',
  },
  {
    type: 'Black / Regur',
    description: 'Deep volcanic soil with self-ploughing cracks and extremely high clay moisture capacity.',
    waterRetention: 'Extremely High',
    bestFor: 'Cotton, Soybean, Sunflowers, Wheat',
    defaultPh: 7.8,
    icon: '⬛',
    color: '#2b2b2a',
  },
  {
    type: 'Laterite',
    description: 'Rich in iron and aluminum oxides with acidic pH, typical of heavy rainfall highland slopes.',
    waterRetention: 'Moderate to Low',
    bestFor: 'Tea, Coffee, Rubber, Cashew, Cardamom',
    defaultPh: 5.2,
    icon: '⛰️',
    color: '#9e2a2b',
  },
  {
    type: 'Other',
    description: 'Mixed, saline, or customized organic soil composition.',
    waterRetention: 'Variable',
    bestFor: 'Custom cultivars',
    defaultPh: 6.5,
    icon: '🌍',
    color: '#708090',
  }
];

export const IRRIGATION_OPTIONS: { type: IrrigationType; title: string; description: string; efficiency: string; icon: string }[] = [
  {
    type: 'Rainfed',
    title: 'Rainfed',
    description: 'Dependent on seasonal monsoon rainfall. Precision weather radar alerts are vital.',
    efficiency: '50-60%',
    icon: '🌧️',
  },
  {
    type: 'Canal',
    title: 'Canal',
    description: 'Gravity-fed community canal water network regulated by reservoir release schedules.',
    efficiency: '60-70%',
    icon: '🌊',
  },
  {
    type: 'Borewell',
    title: 'Borewell',
    description: 'Groundwater extracted via submersible pumps. Direct control over watering frequency.',
    efficiency: '75%',
    icon: '💧',
  },
  {
    type: 'Drip',
    title: 'Drip Irrigation',
    description: 'Micro-irrigation delivering precise moisture and fertigation directly to the root zone.',
    efficiency: '90-95%',
    icon: '🚿',
  },
  {
    type: 'Sprinkler',
    title: 'Sprinkler System',
    description: 'Overhead pressurized spray creating simulated rain for uniform ground coverage.',
    efficiency: '80-85%',
    icon: '💦',
  },
  {
    type: 'Other',
    title: 'Other / Sub-surface',
    description: 'River lift, furrow, micro-jet or traditional flood basin systems.',
    efficiency: 'Variable',
    icon: '⚙️',
  },
];

export const FARMING_PRACTICES: { practice: FarmingPractice; title: string; description: string; badge: string; icon: string }[] = [
  {
    practice: 'Conventional',
    title: 'Conventional Farming',
    description: 'Standard crop management utilizing synthetic fertilizers (NPK) and targeted crop protection chemicals.',
    badge: 'High Yield Focus',
    icon: '🚜',
  },
  {
    practice: 'Organic',
    title: 'Organic Farming',
    description: 'Zero chemical inputs. Reliance on bio-fertilizers, neem extracts, composting, and biological pest control.',
    badge: 'Eco Certified',
    icon: '🌿',
  },
  {
    practice: 'Regenerative',
    title: 'Regenerative Agriculture',
    description: 'Focus on soil health restoration, cover cropping, minimum tillage, and carbon sequestration.',
    badge: 'Soil Rebuilding',
    icon: '🔄',
  },
  {
    practice: 'Mixed / Integrated',
    title: 'Mixed / Integrated Farming',
    description: 'Combination of crops with livestock, agroforestry, bio-gas, and integrated pest management (IPM).',
    badge: 'Holistic Model',
    icon: '🌾',
  },
  {
    practice: 'Not sure',
    title: 'Not sure / Exploring',
    description: 'AgriNet AI will evaluate your farm setup and suggest the optimal transition path.',
    badge: 'AI Guidance',
    icon: '❓',
  },
];

// Helper to generate localized mock weather for the given location
export function getMockWeatherForLocation(locationName: string, state: string): WeatherData {
  const isKerala = locationName.toLowerCase().includes('ernakulam') || state.toLowerCase().includes('kerala');
  
  if (isKerala) {
    return {
      temp: 29,
      feelsLike: 34,
      condition: 'Tropical Humid & Scattered Showers',
      icon: '🌦️',
      humidity: 84,
      windSpeedKmH: 14,
      rainProbability: 65,
      forecastSummary: 'Scattered afternoon showers expected tomorrow (12-18mm). High atmospheric humidity favorable for early vegetative growth.',
      hourly: [
        { time: '14:00', temp: 30, icon: '⛅', pop: 20 },
        { time: '16:00', temp: 29, icon: '🌦️', pop: 60 },
        { time: '18:00', temp: 27, icon: '🌧️', pop: 75 },
        { time: '20:00', temp: 26, icon: '☁️', pop: 40 },
        { time: '22:00', temp: 25, icon: '🌙', pop: 15 },
        { time: '06:00', temp: 24, icon: '🌤️', pop: 10 },
      ],
      daily: [
        { day: 'Today', high: 31, low: 24, condition: 'Scattered Rain', icon: '🌦️', rainChance: 65 },
        { day: 'Sun', high: 30, low: 24, condition: 'Thunderstorm', icon: '⛈️', rainChance: 80 },
        { day: 'Mon', high: 32, low: 25, condition: 'Partly Cloudy', icon: '⛅', rainChance: 35 },
        { day: 'Tue', high: 33, low: 25, condition: 'Sunny & Humid', icon: '☀️', rainChance: 20 },
        { day: 'Wed', high: 31, low: 24, condition: 'Light Rain', icon: '🌧️', rainChance: 55 },
      ]
    };
  }

  return {
    temp: 31,
    feelsLike: 33,
    condition: 'Partly Sunny',
    icon: '🌤️',
    humidity: 62,
    windSpeedKmH: 11,
    rainProbability: 25,
    forecastSummary: 'Optimal sunny intervals with gentle breezes. Low precipitation risk for next 48 hours.',
    hourly: [
      { time: '14:00', temp: 32, icon: '☀️', pop: 10 },
      { time: '16:00', temp: 31, icon: '🌤️', pop: 15 },
      { time: '18:00', temp: 29, icon: '⛅', pop: 20 },
      { time: '20:00', temp: 27, icon: '🌙', pop: 10 },
      { time: '22:00', temp: 26, icon: '✨', pop: 5 },
      { time: '06:00', temp: 23, icon: '🌅', pop: 5 },
    ],
    daily: [
      { day: 'Today', high: 33, low: 23, condition: 'Clear Sky', icon: '☀️', rainChance: 15 },
      { day: 'Sun', high: 34, low: 24, condition: 'Partly Cloudy', icon: '⛅', rainChance: 25 },
      { day: 'Mon', high: 32, low: 23, condition: 'Isolated Showers', icon: '🌦️', rainChance: 40 },
      { day: 'Tue', high: 31, low: 22, condition: 'Mild Breeze', icon: '🌤️', rainChance: 10 },
      { day: 'Wed', high: 33, low: 24, condition: 'Sunny', icon: '☀️', rainChance: 15 },
    ]
  };
}

// Generate personalized Satellite telemetry
export function getMockSatelliteTelemetry(cropName: string, sizeHectares: number): SatelliteNDVIData {
  return {
    overallHealthScore: 88,
    vegetationIndex: 0.74,
    canopyDensity: 'Dense & Vigorous (92% canopy closure)',
    waterStressLevel: 'Low',
    satelliteLastPass: 'Sentinel-2A · 6 hours ago',
    ndviTrend: '+4.2% vs last week',
    heatmapZones: [
      { id: 'zone-a', name: 'Sector 1 (North-East)', health: 'Optimal', ndvi: 0.78 },
      { id: 'zone-b', name: 'Sector 2 (Central Canal)', health: 'Optimal', ndvi: 0.76 },
      { id: 'zone-c', name: 'Sector 3 (South Slope)', health: 'Attention', ndvi: 0.64 },
    ]
  };
}

// Generate real-time actionable advisories based on farm profile
export function generateFarmAdvisories(farm: FarmProfile): FarmAdvisory[] {
  const crop = farm.crop.cropName || 'Rice';
  const variety = farm.crop.variety || 'Jyothi';
  const stage = farm.crop.growthStage || 'Tillering & Vegetative';
  const soil = farm.soil.soilType || 'Clayey';
  const ph = farm.soil.ph || 6.5;

  const advisories: FarmAdvisory[] = [
    {
      id: 'adv-1',
      category: 'weather',
      priority: 'high',
      title: 'Rain Warning: Postpone Foliar Spraying',
      description: 'Localized precipitation (15mm) is forecasted for tomorrow afternoon in your area. Avoid applying foliar fertilizers or pesticides today to prevent chemical wash-off.',
      actionableStep: 'Schedule any pesticide or micronutrient spray for Tuesday morning when skies clear.',
      timeframe: 'Next 24 Hours',
      icon: '🌦️',
    },
    {
      id: 'adv-2',
      category: 'crop_stage',
      priority: 'high',
      title: `${crop} (${variety}) - Second Split Nitrogen Top Dressing`,
      description: `Your crop is currently at the ${stage} stage (${farm.crop.daysSincePlanting || 12} days after planting). Tillering rate will peak in the next 7 days.`,
      actionableStep: `Apply Urea @ 35 kg/hectare alongside maintaining a 3-5 cm standing water layer in the field.`,
      timeframe: 'Target Window: Days 14 - 18',
      icon: '🌾',
    },
    {
      id: 'adv-3',
      category: 'soil_nutrition',
      priority: 'medium',
      title: `Soil pH Optimization (${ph} - ${ph < 6.0 ? 'Slightly Acidic' : 'Optimal'})`,
      description: `${soil} soil with pH ${ph} shows good base cation saturation. Micronutrient zinc (Zn) uptake can be maximized by avoiding excessive waterlogging during the panicle initiation phase.`,
      actionableStep: 'Apply Zinc Sulphate (25 kg/ha) if leaf tip chlorosis appears on younger leaves.',
      timeframe: 'This Week',
      icon: '🌱',
    },
    {
      id: 'adv-4',
      category: 'pest_radar',
      priority: 'medium',
      title: 'Stem Borer & Leaf Folder Early Radar Alert',
      description: 'Regional weather pattern (high humidity >80% and warm 29°C temperatures) creates favorable breeding conditions for Yellow Stem Borer.',
      actionableStep: 'Install 5 Pheromone traps per hectare to monitor adult moth population threshold.',
      timeframe: 'Next 3 Days',
      icon: '🛰️',
    },
    {
      id: 'adv-5',
      category: 'irrigation',
      priority: 'low',
      title: `Irrigation Management for ${farm.irrigation || 'Rainfed'}`,
      description: `Current soil moisture level is at 78% of field capacity. Predicted rainfall will adequately replenish the root zone for the next 4 days.`,
      actionableStep: 'Ensure bunds are closed to harvest runoff water and save pumping costs.',
      timeframe: 'Continuous',
      icon: '💧',
    }
  ];

  return advisories;
}
