"use server";

import { calculationFormSchema } from "../_schemas/calculation";
import type { CalculationFormSchema } from "../_schemas/calculation";
import type { CalculationSummary } from "../../types/result";
import { calculateGreenSeatProfit } from "../../lib/calculation";
import { mapFormToCalculationRequest } from "@/lib/form-mapper";

type FieldErrorRecord = Record<string, string[]>;

export type CalculationActionResult =
  | {
      success: true;
      summary: CalculationSummary;
    }
  | {
      success: false;
      fieldErrors: FieldErrorRecord;
      message?: string;
    };

export async function calculateProfitAction(
  values: CalculationFormSchema,
): Promise<CalculationActionResult> {
  const parseResult = calculationFormSchema.safeParse(values);
  if (!parseResult.success) {
    const fieldErrors: FieldErrorRecord = {};
    parseResult.error.issues.forEach((issue) => {
      const fieldPath = issue.path.join(".") || "form";
      const existingMessages = fieldErrors[fieldPath] ?? [];
      fieldErrors[fieldPath] = [...existingMessages, issue.message];
    });
    return {
      success: false,
      fieldErrors,
      message: "入力内容を確認してください。",
    };
  }

  const calculationRequest = mapFormToCalculationRequest(parseResult.data);
  const summary = calculateGreenSeatProfit(calculationRequest);

  return {
    success: true,
    summary,
  };
}
