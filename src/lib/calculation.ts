import { WEEKS_PER_MONTH, WEEKS_PER_YEAR } from "./constants";
import type {
  CalculationRequest,
  CommuteSettings,
  PeriodUnit,
} from "../types/commute";
import type { CalculationSummary, PeriodBreakdown } from "../types/result";

const periodLabels: Record<PeriodUnit, string> = {
  daily: "日次",
  weekly: "週次",
  monthly: "月次",
  yearly: "年次",
};

// 現状は簡易モードのみを想定し、詳細モードは今後の拡張で対応する。
function deriveAdditionalCostPerTrip(settings: CommuteSettings): number {
  if (settings.costMode === "simple") {
    return settings.simpleCost.additionalCostOneWay;
  }

  throw new Error("詳細モードの計算はまだ実装されていません。");
}

function deriveGreenSeatTripsPerDay(settings: CommuteSettings): number {
  if (settings.costMode === "simple") {
    return settings.simpleCost.greenSeatTripsPerDay;
  }

  throw new Error("詳細モードの計算はまだ実装されていません。");
}

function buildPeriodBreakdown(
  period: PeriodUnit,
  workValue: number,
  additionalCost: number,
): PeriodBreakdown {
  return {
    period,
    label: periodLabels[period],
    workValue,
    greenSeatCost: additionalCost,
    netProfit: workValue - additionalCost,
  };
}

export function calculateGreenSeatProfit(
  request: CalculationRequest,
): CalculationSummary {
  const { hourlyRate, commuteMinutesOneWay, commutingDaysPerWeek } =
    request.basic;
  const additionalCostPerTrip = deriveAdditionalCostPerTrip(request.commute);
  const greenSeatTripsPerDay = deriveGreenSeatTripsPerDay(request.commute);

  const workingMinutesPerDay =
    commuteMinutesOneWay * greenSeatTripsPerDay;
  const workingHoursPerDay = workingMinutesPerDay / 60;
  const additionalCostPerDay =
    additionalCostPerTrip * greenSeatTripsPerDay;
  const potentialIncomePerDay = workingHoursPerDay * hourlyRate;

  const workDaysPerWeek = commutingDaysPerWeek;
  const potentialIncomePerWeek = potentialIncomePerDay * workDaysPerWeek;
  const additionalCostPerWeek = additionalCostPerDay * workDaysPerWeek;
  const greenSeatTripsPerWeek = greenSeatTripsPerDay * workDaysPerWeek;

  const potentialIncomePerMonth = potentialIncomePerWeek * WEEKS_PER_MONTH;
  const additionalCostPerMonth = additionalCostPerWeek * WEEKS_PER_MONTH;

  const potentialIncomePerYear = potentialIncomePerWeek * WEEKS_PER_YEAR;
  const additionalCostPerYear = additionalCostPerWeek * WEEKS_PER_YEAR;

  const breakEvenHourlyRate =
    workingHoursPerDay > 0
      ? additionalCostPerDay / workingHoursPerDay
      : null;

  const periodSummaries: PeriodBreakdown[] = [
    buildPeriodBreakdown(
      "daily",
      potentialIncomePerDay,
      additionalCostPerDay,
    ),
    buildPeriodBreakdown(
      "weekly",
      potentialIncomePerWeek,
      additionalCostPerWeek,
    ),
    buildPeriodBreakdown(
      "monthly",
      potentialIncomePerMonth,
      additionalCostPerMonth,
    ),
    buildPeriodBreakdown(
      "yearly",
      potentialIncomePerYear,
      additionalCostPerYear,
    ),
  ];

  return {
    periodSummaries,
    breakEvenHourlyRate,
    costBreakdown: {
      workingMinutesPerDay,
      workingHoursPerDay,
      greenSeatTripsPerDay,
      greenSeatTripsPerWeek,
      additionalCostPerTrip,
    },
  };
}
