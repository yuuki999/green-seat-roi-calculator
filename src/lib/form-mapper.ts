import type { CalculationFormSchema } from "@/app/_schemas/calculation";
import type { CalculationRequest } from "@/types/commute";

export function mapFormToCalculationRequest(
  values: CalculationFormSchema,
): CalculationRequest {
  return {
    basic: {
      hourlyRate: values.hourlyRate,
      commuteMinutesOneWay: values.commuteMinutesOneWay,
      commutingDaysPerWeek: values.commutingDaysPerWeek,
    },
    commute: {
      costMode: "simple",
      simpleCost: {
        additionalCostOneWay: values.additionalCostOneWay,
        greenSeatTripsPerDay: values.greenSeatTripsPerDay,
      },
    },
  };
}

