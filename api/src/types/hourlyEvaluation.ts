import { RuleEvaluation } from "./ruleEvaluation";

// export type HourlyEvaluation = {
//   time: string;
//   temperature: number;
//   humidity: number;
//   evaluation: RuleEvaluation[];
// };

export interface HourlyEvaluation {
  time: string;
  temperature: number;
  humidity: number;
  evaluation: RuleEvaluation[] | null;
}

export interface DailyEvaluation {
  forecast_date?: string;
  temperature?: number;
  humidity?: number;
  evaluation: RuleEvaluation[] | null;
}