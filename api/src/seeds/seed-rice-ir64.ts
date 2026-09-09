import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Crop } from '../crops/entities/crop.entity';
import { GrowthStage } from '../crops-growth-stages/entities/growth-stage.entity';
import { AdvisoryRule } from '../advisory-rules/entities/advisory-rule.entity';

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

export const RICE_CROP_DATA = {
  name: 'Rice',
  slug: 'rice',
  variety: 'IR64',
  scientific_name: 'Oryza sativa',
};

export const RICE_GROWTH_STAGES_DATA = [
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
];

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

export async function seedRiceIR64() {
  console.log('🌱 Connecting to database...');
  await AppDataSource.initialize();
  console.log('✅ Database connected.');

  const cropRepo = AppDataSource.getRepository(Crop);
  const growthStageRepo = AppDataSource.getRepository(GrowthStage);
  const advisoryRuleRepo = AppDataSource.getRepository(AdvisoryRule);

  // 1. Seed Crop: Rice (IR64)
  console.log('\n🌾 Seeding Crop: Rice / IR64...');
  let riceCrop = await cropRepo.findOne({
    where: [{ slug: RICE_CROP_DATA.slug }, { name: RICE_CROP_DATA.name }],
  });

  if (!riceCrop) {
    riceCrop = cropRepo.create(RICE_CROP_DATA);
    riceCrop = await cropRepo.save(riceCrop);
    console.log(`   Created Crop: ${riceCrop.name} (Variety: ${riceCrop.variety}, ID: ${riceCrop.id})`);
  } else {
    riceCrop.variety = RICE_CROP_DATA.variety;
    riceCrop.scientific_name = RICE_CROP_DATA.scientific_name;
    riceCrop = await cropRepo.save(riceCrop);
    console.log(`   Updated Crop: ${riceCrop.name} (Variety: ${riceCrop.variety}, ID: ${riceCrop.id})`);
  }

  // 2. Seed Growth Stages
  console.log('\n📈 Seeding Growth Stages for Rice / IR64 (120 Days lifecycle)...');
  for (const stageData of RICE_GROWTH_STAGES_DATA) {
    let stage = await growthStageRepo.findOne({
      where: [
        { crop_id: riceCrop.id, stage_order: stageData.stage_order },
        { crop_id: riceCrop.id, stage_name: stageData.stage_name },
      ],
    });

    if (!stage) {
      stage = growthStageRepo.create({
        ...stageData,
        crop: riceCrop,
        crop_id: riceCrop.id,
      });
      await growthStageRepo.save(stage);
      console.log(`   + Stage ${stageData.stage_order}: ${stageData.stage_name} (${stageData.duration_days} days)`);
    } else {
      stage.stage_name = stageData.stage_name;
      stage.stage_order = stageData.stage_order;
      stage.duration_days = stageData.duration_days;
      stage.description = stageData.description;
      await growthStageRepo.save(stage);
      console.log(`   ✓ Stage ${stageData.stage_order}: ${stageData.stage_name} (${stageData.duration_days} days)`);
    }
  }

  // 3. Seed Advisory Rules
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

  console.log('\n🎉 Seeding completed successfully!');
  await AppDataSource.destroy();
}

if (require.main === module) {
  seedRiceIR64()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
