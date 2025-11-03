import { cache } from "react";
import type { CalculationFormValues } from "../types/form";
import type { CalculationRequest } from "../types/commute";

const DEFAULT_FORM_VALUES: CalculationFormValues = {
  hourlyRate: 3000,
  commuteMinutesOneWay: 45,
  commutingDaysPerWeek: 3,
  additionalCostOneWay: 1000,
  greenSeatTripsPerDay: 2,
};

export const getDefaultFormValues = cache(
  async (): Promise<CalculationFormValues> => {
    return DEFAULT_FORM_VALUES;
  },
);

export const getDefaultCalculationRequest = cache(
  async (): Promise<CalculationRequest> => {
    return {
      basic: {
        hourlyRate: DEFAULT_FORM_VALUES.hourlyRate,
        commuteMinutesOneWay: DEFAULT_FORM_VALUES.commuteMinutesOneWay,
        commutingDaysPerWeek: DEFAULT_FORM_VALUES.commutingDaysPerWeek,
      },
      commute: {
        costMode: "simple",
        simpleCost: {
          additionalCostOneWay: DEFAULT_FORM_VALUES.additionalCostOneWay,
          greenSeatTripsPerDay: DEFAULT_FORM_VALUES.greenSeatTripsPerDay,
        },
      },
    };
  },
);
