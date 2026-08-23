export interface RuleOccurrence {
  ruleCode: string;
  riskLevel: string;
  riskType: string | null;
  category: string | null;
  message: string;
  occurrences: { time: string; temperature: number; humidity: number }[];
}
