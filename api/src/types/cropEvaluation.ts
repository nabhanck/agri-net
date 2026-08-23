import { HourlyEvaluation } from "./hourlyEvaluation";
import { RuleEvaluation } from "./ruleEvaluation";
import { RuleOccurrence } from "./ruleOccurenceType";

export type CropEvaluation = {
  cropId: number | undefined;
  growthStage: string;
  current: CurrentData | null;
  // current: RuleEvaluation[] | null;
  hourly: HourlyEvaluation[];
  daily: any[];
  triggeredRisks: RuleOccurrence[];
  advisory: string | null;
};


export type CurrentData = {
  temperature: number;
  humidity: number;
  evaluation: RuleEvaluation[] | null;
}