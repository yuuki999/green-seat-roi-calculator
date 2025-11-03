export type CostCalculationMode = "simple" | "detailed";

export type TransportMethod = "train" | "bus" | "car" | "other";

export type GreenSeatUsageType =
  | "season_ticket"
  | "single_ticket"
  | "hybrid";

export interface BasicSettings {
  hourlyRate: number;
  commuteMinutesOneWay: number;
  commutingDaysPerWeek: number;
}

export interface SimpleCostSettings {
  additionalCostOneWay: number;
  greenSeatTripsPerDay: number;
}

export interface SharedCostSettings {
  costMode: CostCalculationMode;
}

export interface SimpleCostConfiguration extends SharedCostSettings {
  costMode: "simple";
  simpleCost: SimpleCostSettings;
}

export interface DetailedCostSettings {
  transportMethod: TransportMethod;
  passFundingType:
    | "company"
    | "self"
    | "partial"
    | "pay_as_you_go";
  employerSupportAmount?: number;
  greenSeatUsage: GreenSeatUsageType;
  greenSeasonTicketCost?: number;
  singleTicketCost?: number;
}

export interface DetailedCostConfiguration extends SharedCostSettings {
  costMode: "detailed";
  detailedCost: DetailedCostSettings;
}

export type CommuteSettings =
  | SimpleCostConfiguration
  | DetailedCostConfiguration;

export interface CalculationRequest {
  basic: BasicSettings;
  commute: CommuteSettings;
}

export type PeriodUnit = "daily" | "weekly" | "monthly" | "yearly";
