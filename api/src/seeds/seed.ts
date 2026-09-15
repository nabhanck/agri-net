import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { Crop } from '../crops/entities/crop.entity';
import { GrowthStage } from '../crops-growth-stages/entities/growth-stage.entity';
import { AdvisoryRule } from '../advisory-rules/entities/advisory-rule.entity';
import { User } from '../user/entities/user.entity';

// Load environment variables from api/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '',
  database: process.env.DB_NAME || 'agrinet',
  entities: [path.resolve(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: true,
});

export interface SeedGrowthStage {
  stage_order: number;
  stage_name: string;
  duration_days: number;
  description: string;
}

export interface SeedCrop {
  slug: string;
  name: string;
  varieties: string[];
  family: string;
  water_requirement: string;
  growing_season: string;
  maturity_days: number;
  scientific_name: string;
  optimal_ph_range: number[];
  growthStages: SeedGrowthStage[];
}

export const ALL_CROPS_DATA: SeedCrop[] = [
  {
    slug: 'rice',
    name: 'Rice',
    varieties: ['IR64', 'Jyothi', 'Uma', 'Swarna', 'Basmati 1121', 'Ponni', 'Other'],
    family: 'Poaceae',
    water_requirement: 'High',
    growing_season: 'Kharif',
    maturity_days: 120,
    scientific_name: 'Oryza sativa',
    optimal_ph_range: [5.5, 6.8],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Germination',
        duration_days: 10,
        description: 'Seed germination and seedling emergence stage (0–10 days)',
      },
      {
        stage_order: 2,
        stage_name: 'Tillering',
        duration_days: 25,
        description: 'Vegetative phase with tiller production and leaf development (11–35 days)',
      },
      {
        stage_order: 3,
        stage_name: 'Panicle Initiation',
        duration_days: 20,
        description: 'Reproductive transition and panicle development inside stem (36–55 days)',
      },
      {
        stage_order: 4,
        stage_name: 'Flowering',
        duration_days: 20,
        description: 'Anthesis and pollination stage (56–75 days)',
      },
      {
        stage_order: 5,
        stage_name: 'Grain Filling',
        duration_days: 25,
        description: 'Milky, dough, and ripening stages of grain development (76–100 days)',
      },
      {
        stage_order: 6,
        stage_name: 'Maturity',
        duration_days: 20,
        description: 'Grain reaches full maturity and harvest readiness (101–120 days)',
      },
    ],
  },
  {
    slug: 'corn',
    name: 'Corn',
    varieties: ['Pioneer 30V92', 'DKC 9108', 'HQPM-1', 'Syngenta NK6240', 'African Tall', 'Other'],
    family: 'Poaceae',
    water_requirement: 'Medium',
    growing_season: 'Kharif / Rabi',
    maturity_days: 118,
    scientific_name: 'Zea mays',
    optimal_ph_range: [5.8, 7.0],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Emergence & V4',
        duration_days: 18,
        description: 'Seedling emergence and root nodal establishment',
      },
      {
        stage_order: 2,
        stage_name: 'Rapid Vegetative (V6-V12)',
        duration_days: 30,
        description: 'Fast stem elongation and leaf area expansion',
      },
      {
        stage_order: 3,
        stage_name: 'Tasseling & Silking (R1)',
        duration_days: 20,
        description: 'Pollen shedding and ear fertilization',
      },
      {
        stage_order: 4,
        stage_name: 'Dough & Dent (R4-R5)',
        duration_days: 35,
        description: 'Kernel starch accumulation and hardening',
      },
      {
        stage_order: 5,
        stage_name: 'Physiological Maturity',
        duration_days: 15,
        description: 'Black layer formation, grain dry-down',
      },
    ],
  },
  {
    slug: 'potato',
    name: 'Potato',
    varieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Bahar', 'Kufri Chipsona', 'Atlantic', 'Other'],
    family: 'Solanaceae',
    water_requirement: 'Medium',
    growing_season: 'Rabi',
    maturity_days: 110,
    scientific_name: 'Solanum tuberosum',
    optimal_ph_range: [5.0, 6.5],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Sprout Development',
        duration_days: 15,
        description: 'Sprout emergence from seed tubers',
      },
      {
        stage_order: 2,
        stage_name: 'Vegetative Growth',
        duration_days: 25,
        description: 'Foliage and root system formation',
      },
      {
        stage_order: 3,
        stage_name: 'Tuber Initiation',
        duration_days: 20,
        description: 'Stolon tips swell to form miniature tubers',
      },
      {
        stage_order: 4,
        stage_name: 'Tuber Bulking',
        duration_days: 35,
        description: 'Rapid starch deposition and tuber expansion',
      },
      {
        stage_order: 5,
        stage_name: 'Maturation & Skin Set',
        duration_days: 15,
        description: 'Canopy senesces, tuber skin thickens for storage',
      },
    ],
  },
  {
    slug: 'wheat',
    name: 'Wheat',
    varieties: ['HD 2967', 'HD 3086', 'PBW 550', 'Sharbati', 'Lok 1', 'Other'],
    family: 'Poaceae',
    water_requirement: 'Medium',
    growing_season: 'Rabi',
    maturity_days: 122,
    scientific_name: 'Triticum aestivum',
    optimal_ph_range: [6.0, 7.5],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Crown Root Initiation (CRI)',
        duration_days: 22,
        description: 'Crucial rooting phase 21 days after sowing',
      },
      {
        stage_order: 2,
        stage_name: 'Tillering & Jointing',
        duration_days: 35,
        description: 'Nodes form along the stem with multiple shoots',
      },
      {
        stage_order: 3,
        stage_name: 'Booting & Heading',
        duration_days: 25,
        description: 'Ear head emerges from the flag leaf sheath',
      },
      {
        stage_order: 4,
        stage_name: 'Milking & Dough',
        duration_days: 25,
        description: 'Grain development from milky liquid to firm dough',
      },
      {
        stage_order: 5,
        stage_name: 'Ripening',
        duration_days: 15,
        description: 'Straw turns golden, moisture drops under 14%',
      },
    ],
  },
  {
    slug: 'cotton',
    name: 'Cotton',
    varieties: ['Bt Cotton RCH-2', 'Bollgard II', 'DCH-32', 'MCU-5', 'Suraj', 'Other'],
    family: 'Malvaceae',
    water_requirement: 'Medium',
    growing_season: 'Kharif',
    maturity_days: 160,
    scientific_name: 'Gossypium hirsutum',
    optimal_ph_range: [6.0, 8.0],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Germination & Seedling',
        duration_days: 20,
        description: 'Cotyledon emergence and deep taproot formation',
      },
      {
        stage_order: 2,
        stage_name: 'Square Formation (Squaring)',
        duration_days: 30,
        description: 'First floral buds (squares) develop',
      },
      {
        stage_order: 3,
        stage_name: 'Flowering & Boll Setting',
        duration_days: 45,
        description: 'White to pink flowers pollinated, bolls expand',
      },
      {
        stage_order: 4,
        stage_name: 'Boll Opening & Maturation',
        duration_days: 40,
        description: 'Bolls burst open revealing fluffy white lint',
      },
      {
        stage_order: 5,
        stage_name: 'Harvesting / Picking',
        duration_days: 25,
        description: 'Sequential manual or mechanical picking',
      },
    ],
  },
  {
    slug: 'tomato',
    name: 'Tomato',
    varieties: ['Arka Rakshak', 'Abhinav', 'US 440', 'Pusa Ruby', 'Himsona', 'Other'],
    family: 'Solanaceae',
    water_requirement: 'Medium',
    growing_season: 'Year-round / Rabi',
    maturity_days: 125,
    scientific_name: 'Solanum lycopersicum',
    optimal_ph_range: [6.0, 6.8],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Transplant & Establishment',
        duration_days: 15,
        description: 'Root acclimation after nursery transplantation',
      },
      {
        stage_order: 2,
        stage_name: 'Early Vegetative',
        duration_days: 25,
        description: 'Branching and foliage canopy building',
      },
      {
        stage_order: 3,
        stage_name: 'Flowering & Fruit Set',
        duration_days: 25,
        description: 'Yellow flower clusters set small green fruits',
      },
      {
        stage_order: 4,
        stage_name: 'Fruit Sizing & Breaker Stage',
        duration_days: 25,
        description: 'Green fruits expand and show first color break',
      },
      {
        stage_order: 5,
        stage_name: 'Continuous Harvesting',
        duration_days: 35,
        description: 'Deep red ripe fruits harvested at 3-day intervals',
      },
    ],
  },
  {
    slug: 'coffee',
    name: 'Coffee',
    varieties: ['Arabica Selection 795', 'Robusta CxR', 'Cauvery (Catimor)', 'Chandragiri', 'Other'],
    family: 'Rubiaceae',
    water_requirement: 'High',
    growing_season: 'Perennial',
    maturity_days: 255,
    scientific_name: 'Coffea arabica',
    optimal_ph_range: [5.5, 6.5],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Blossom & Fruit Set',
        duration_days: 30,
        description: 'White aromatic blossoms triggered by blossom showers',
      },
      {
        stage_order: 2,
        stage_name: 'Berry Development',
        duration_days: 120,
        description: 'Slow swelling of green pinhead berries to full size',
      },
      {
        stage_order: 3,
        stage_name: 'Berry Ripening',
        duration_days: 60,
        description: 'Berries transition from green to deep crimson cherry',
      },
      {
        stage_order: 4,
        stage_name: 'Harvest & Processing',
        duration_days: 45,
        description: 'Selective selective picking of crimson cherries',
      },
    ],
  },
  {
    slug: 'banana',
    name: 'Banana',
    varieties: ['Grand Naine (G9)', 'Nendran', 'Robusta', 'Red Banana (Chenkadali)', 'Poovan', 'Other'],
    family: 'Musaceae',
    water_requirement: 'Very High',
    growing_season: 'Perennial / Year-round',
    maturity_days: 230,
    scientific_name: 'Musa acuminata',
    optimal_ph_range: [6.0, 7.5],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Vegetative Shoot Growth',
        duration_days: 90,
        description: 'Emergence of 30-40 large photosynthetic leaves',
      },
      {
        stage_order: 2,
        stage_name: 'Flower Bud Shooting',
        duration_days: 30,
        description: 'Heart-shaped purple inflorescence emerges through pseudostem',
      },
      {
        stage_order: 3,
        stage_name: 'Bunch Development',
        duration_days: 90,
        description: 'Hands of bananas swell and fill out with starch',
      },
      {
        stage_order: 4,
        stage_name: 'Harvest Readiness',
        duration_days: 20,
        description: 'Angles on fingers round off, light green sheen',
      },
    ],
  },
  {
    slug: 'chili',
    name: 'Chili',
    varieties: ['Guntur Sannam', 'Byadagi', 'Kanthari', 'Teja 4', 'Pusa Jwala', 'Other'],
    family: 'Solanaceae',
    water_requirement: 'Medium',
    growing_season: 'Kharif / Rabi',
    maturity_days: 120,
    scientific_name: 'Capsicum annuum',
    optimal_ph_range: [6.0, 7.0],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Transplanting & Rooting',
        duration_days: 15,
        description: 'Establishment of nursery seedlings in main bed',
      },
      {
        stage_order: 2,
        stage_name: 'Vegetative Branching',
        duration_days: 30,
        description: 'Bushy crown development and node multiplying',
      },
      {
        stage_order: 3,
        stage_name: 'Flowering & Pod Setting',
        duration_days: 25,
        description: 'White star flowers yield pungent slender green pods',
      },
      {
        stage_order: 4,
        stage_name: 'Pod Maturation & Harvest',
        duration_days: 50,
        description: 'Regular harvests of green or red ripe pods',
      },
    ],
  },
  {
    slug: 'tea',
    name: 'Tea',
    varieties: ['Assamica', 'Camellia Sinensis', 'UPASI-9', 'AV2', 'TV-1', 'Other'],
    family: 'Theaceae',
    water_requirement: 'High',
    growing_season: 'Perennial',
    maturity_days: 255,
    scientific_name: 'Camellia sinensis',
    optimal_ph_range: [4.5, 5.5],
    growthStages: [
      {
        stage_order: 1,
        stage_name: 'Pruning & Dormancy Recovery',
        duration_days: 45,
        description: 'Post-pruning bud burst and canopy renewal',
      },
      {
        stage_order: 2,
        stage_name: 'First Flush (Spring Rush)',
        duration_days: 60,
        description: 'Tender two-leaves-and-a-bud emergence',
      },
      {
        stage_order: 3,
        stage_name: 'Monsoon Flush',
        duration_days: 90,
        description: 'Fast continuous vegetative flush during rains',
      },
      {
        stage_order: 4,
        stage_name: 'Autumnal Flush',
        duration_days: 60,
        description: 'Slow-growing, aromatic premium leaf production',
      },
    ],
  },
];

export const RICE_CROP_DATA = ALL_CROPS_DATA[0];
export const RICE_GROWTH_STAGES_DATA = ALL_CROPS_DATA[0].growthStages;

export const RICE_ADVISORY_RULES_DATA = [
  {
    rule_code: 'RICE_FLOWERING_TEMP',
    stage: 'flowering',
    risk_level: 'HIGH',
    risk_type: 'TEMPERATURE_STRESS',
    category: 'ICAR',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: '<',
          value: 16,
        },
      ],
      message: 'Temperature is below the critical range for rice flowering and fertilization.',
    },
  },
  {
    rule_code: 'RICE_FLOWERING_HEAT',
    stage: 'flowering',
    risk_level: 'HIGH',
    risk_type: 'HEAT_STRESS',
    category: 'ICAR',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: '>',
          value: 35,
        },
      ],
      message: 'Temperature above 35°C can negatively affect rice grain filling.',
    },
  },
  {
    rule_code: 'RICE_RIPENING_TEMP',
    stage: 'ripening',
    risk_level: 'MEDIUM',
    risk_type: 'TEMPERATURE_STRESS',
    category: 'ICAR',
    priority: 2,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: '<',
          value: 18,
        },
      ],
      message: 'Temperature is below the stated suitable range for rice ripening.',
    },
  },
  {
    rule_code: 'RICE_RIPENING_HEAT',
    stage: 'ripening',
    risk_level: 'MEDIUM',
    risk_type: 'HEAT_STRESS',
    category: 'ICAR',
    priority: 2,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: '>',
          value: 32,
        },
      ],
      message: 'Temperature is above the stated suitable range for rice ripening.',
    },
  },
  {
    rule_code: 'RICE_SOIL_PH_LOW',
    stage: '',
    risk_level: 'MEDIUM',
    risk_type: 'SOIL_CONDITION',
    category: 'ICAR',
    priority: 2,
    configuration: {
      conditions: [
        {
          field: 'soilPh',
          operator: '<',
          value: 5,
        },
      ],
      message: 'Soil pH is below the suitable range for normal rice growth.',
    },
  },
  {
    rule_code: 'RICE_SOIL_PH_HIGH',
    stage: '',
    risk_level: 'MEDIUM',
    risk_type: 'SOIL_CONDITION',
    category: 'ICAR',
    priority: 2,
    configuration: {
      conditions: [
        {
          field: 'soilPh',
          operator: '>',
          value: 8,
        },
      ],
      message: 'Soil pH is above the suitable range for normal rice growth.',
    },
  },
  {
    rule_code: 'RICE_FLOWERING_OPTIMAL',
    stage: 'flowering',
    risk_level: 'LOW',
    risk_type: 'TEMPERATURE',
    category: 'ICAR',
    priority: 3,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: 'between',
          value: [16, 20],
        },
      ],
      message: 'Temperature is within the stated critical mean range for rice flowering and fertilization.',
    },
  },
  {
    rule_code: 'RICE_GRAIN_FILLING_HEAT',
    stage: 'grain_filling',
    risk_level: 'HIGH',
    risk_type: 'GRAIN_FILLING',
    category: 'ICAR',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: '>',
          value: 35,
        },
      ],
      message: 'Temperature above 35°C can affect grain filling.',
    },
  },
  {
    rule_code: 'RICE_WATER_STRESS_REPRODUCTIVE',
    stage: '',
    risk_level: 'HIGH',
    risk_type: 'WATER_STRESS',
    category: 'IRRI',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'growthStage',
          operator: 'in',
          value: ['panicle_initiation', 'flowering', 'early_grain_development'],
        },
        {
          field: 'soilMoisturePercent',
          operator: '<',
          value: 75,
        },
      ],
      message: 'Soil moisture is below the preferred level during a water-sensitive reproductive stage.',
    },
  },
  {
    rule_code: 'RICE_FLOWERING_WATER',
    stage: 'flowering',
    risk_level: 'HIGH',
    risk_type: 'WATER_STRESS',
    category: 'IRRI',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'growthStage',
          operator: '==',
          value: 'flowering',
        },
        {
          field: 'daysFromFlowering',
          operator: 'between',
          value: [-7, 7],
        },
        {
          field: 'waterLevelCm',
          operator: '<',
          value: 0,
        },
      ],
      message: 'Water availability is inadequate during the flowering-sensitive period.',
    },
  },
  {
    rule_code: 'RICE_ESTABLISHMENT_WATER',
    stage: 'establishment',
    risk_level: 'HIGH',
    risk_type: 'WATER_STRESS',
    category: 'IRRI',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'growthStage',
          operator: '==',
          value: 'establishment',
        },
        {
          field: 'waterAvailable',
          operator: '==',
          value: false,
        },
      ],
      message: 'Adequate water availability is important during early rice establishment.',
    },
  },
  {
    rule_code: 'RICE_SHEATH_BLIGHT_RISK',
    stage: '',
    risk_level: 'HIGH',
    risk_type: 'DISEASE_RISK',
    category: 'IRRI',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: 'between',
          value: [28, 32],
        },
        {
          field: 'humidity',
          operator: '>=',
          value: 85,
        },
      ],
      message: 'Temperature and humidity conditions are favorable for sheath blight development.',
    },
  },
  {
    rule_code: 'RICE_BACTERIAL_BLIGHT_RISK',
    stage: '',
    risk_level: 'HIGH',
    risk_type: 'DISEASE_RISK',
    category: 'IRRI',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: 'between',
          value: [25, 34],
        },
        {
          field: 'humidity',
          operator: '>',
          value: 70,
        },
        {
          field: 'recentHeavyRain',
          operator: '==',
          value: true,
        },
      ],
      message: 'Current environmental conditions favor bacterial blight development and spread.',
    },
  },
  {
    rule_code: 'RICE_FALSE_SMUT_RISK',
    stage: 'flowering',
    risk_level: 'HIGH',
    risk_type: 'DISEASE_RISK',
    category: 'IRRI',
    priority: 1,
    configuration: {
      conditions: [
        {
          field: 'temperature',
          operator: 'between',
          value: [25, 35],
        },
        {
          field: 'humidity',
          operator: '>',
          value: 90,
        },
        {
          field: 'growthStage',
          operator: '==',
          value: 'flowering',
        },
      ],
      message: 'Environmental conditions are favorable for false smut during the flowering stage.',
    },
  },
];

export async function seed() {
  console.log('🌱 Connecting to database...');
  await AppDataSource.initialize();
  console.log('✅ Database connected.');

  const cropRepo = AppDataSource.getRepository(Crop);
  const growthStageRepo = AppDataSource.getRepository(GrowthStage);
  const advisoryRuleRepo = AppDataSource.getRepository(AdvisoryRule);

  // 1. Seed Crops and Growth Stages
  console.log(`\n🌾 Seeding ${ALL_CROPS_DATA.length} Crops & Growth Stages...`);
  let riceCrop: Crop | null = null;

  for (const cropData of ALL_CROPS_DATA) {
    let crop = await cropRepo.findOne({
      where: [{ slug: cropData.slug }, { name: cropData.name }],
    });

    if (!crop) {
      crop = cropRepo.create({
        name: cropData.name,
        slug: cropData.slug,
        varieties: cropData.varieties,
        family: cropData.family,
        water_requirement: cropData.water_requirement,
        growing_season: cropData.growing_season,
        maturity_days: cropData.maturity_days,
        scientific_name: cropData.scientific_name,
        optimal_ph_range: cropData.optimal_ph_range,
      });
      crop = await cropRepo.save(crop);
      console.log(`   + Created Crop: ${crop.name} (Slug: ${crop.slug}, Varieties: ${crop.varieties?.join(', ')}, ID: ${crop.id})`);
    } else {
      crop.name = cropData.name;
      crop.slug = cropData.slug;
      crop.varieties = cropData.varieties;
      crop.family = cropData.family;
      crop.water_requirement = cropData.water_requirement;
      crop.growing_season = cropData.growing_season;
      crop.maturity_days = cropData.maturity_days;
      crop.scientific_name = cropData.scientific_name;
      crop.optimal_ph_range = cropData.optimal_ph_range;
      crop = await cropRepo.save(crop);
      console.log(`   ✓ Updated Crop: ${crop.name} (Slug: ${crop.slug}, Varieties: ${crop.varieties?.join(', ')}, ID: ${crop.id})`);
    }

    if (crop.slug === 'rice') {
      riceCrop = crop;
    }

    // Seed Growth Stages for each crop
    for (const stageData of cropData.growthStages) {
      let stage = await growthStageRepo.findOne({
        where: [
          { crop_id: crop.id, stage_order: stageData.stage_order },
          { crop_id: crop.id, stage_name: stageData.stage_name },
        ],
      });

      if (!stage) {
        stage = growthStageRepo.create({
          stage_order: stageData.stage_order,
          stage_name: stageData.stage_name,
          duration_days: stageData.duration_days,
          description: stageData.description,
          crop: crop,
          crop_id: crop.id,
        });
        await growthStageRepo.save(stage);
      } else {
        stage.stage_name = stageData.stage_name;
        stage.stage_order = stageData.stage_order;
        stage.duration_days = stageData.duration_days;
        stage.description = stageData.description;
        await growthStageRepo.save(stage);
      }
    }
  }

  // 2. Seed Advisory Rules (Rice)
  if (riceCrop) {
    console.log('\n📋 Seeding Advisory Rules for Rice...');
    for (const ruleData of RICE_ADVISORY_RULES_DATA) {
      let rule = await advisoryRuleRepo.findOne({
        where: { rule_code: ruleData.rule_code },
      });

      if (!rule) {
        rule = advisoryRuleRepo.create({
          rule_code: ruleData.rule_code,
          crop: riceCrop,
          stage: ruleData.stage,
          risk_level: ruleData.risk_level,
          risk_type: ruleData.risk_type,
          category: ruleData.category,
          configuration: ruleData.configuration,
          priority: ruleData.priority,
        });
        await advisoryRuleRepo.save(rule);
        console.log(`   + Rule: ${ruleData.rule_code} [${ruleData.risk_level} - ${ruleData.risk_type}] (Stage: ${ruleData.stage || 'ALL'})`);
      } else {
        rule.crop = riceCrop;
        rule.stage = ruleData.stage;
        rule.risk_level = ruleData.risk_level;
        rule.risk_type = ruleData.risk_type;
        rule.category = ruleData.category;
        rule.configuration = ruleData.configuration;
        rule.priority = ruleData.priority;
        await advisoryRuleRepo.save(rule);
        console.log(`   ✓ Rule: ${ruleData.rule_code} [${ruleData.risk_level} - ${ruleData.risk_type}] (Stage: ${ruleData.stage || 'ALL'})`);
      }
    }
  }

  // 3. Seed Default Farmer User
  console.log('\n👤 Seeding Default Farmer User...');
  const userRepo = AppDataSource.getRepository(User);
  const demoEmail = 'farmer@agrinet.io';
  let demoUser = await userRepo.findOne({ where: { email: demoEmail } });
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    demoUser = userRepo.create({
      first_name: 'Ravi',
      last_name: 'Kumar',
      email: demoEmail,
      password: hashedPassword,
      phone_number: '+91 98765 43210',
      role: 'farmer',
      preferred_language: 'en',
    });
    await userRepo.save(demoUser);
    console.log(`   + User: ${demoEmail} (Password: password123)`);
  } else {
    console.log(`   ✓ User already exists: ${demoEmail}`);
  }

  console.log('\n🎉 Seeding completed successfully!');
  await AppDataSource.destroy();
}

export const seedRiceIR64 = seed;

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
