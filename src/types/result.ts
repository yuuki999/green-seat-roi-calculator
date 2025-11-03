import type { PeriodUnit } from "./commute";

export interface PeriodBreakdown {
  period: PeriodUnit;
  label: string;
  workValue: number;
  greenSeatCost: number;
  netProfit: number;
}

export interface CostBreakdown {
  workingMinutesPerDay: number;
  workingHoursPerDay: number;
  greenSeatTripsPerDay: number;
  greenSeatTripsPerWeek: number;
  additionalCostPerTrip: number;
}

export interface CalculationSummary {
  periodSummaries: PeriodBreakdown[];
  breakEvenHourlyRate: number | null;
  costBreakdown: CostBreakdown;
}
