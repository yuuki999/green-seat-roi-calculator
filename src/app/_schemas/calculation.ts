import { z } from "zod";

export const calculationFormSchema = z.object({
  hourlyRate: z.coerce.number()
    .min(0, "時給は0以上で入力してください")
    .max(100000, "時給が高すぎます"),
  commuteMinutesOneWay: z.coerce.number()
    .min(0, "通勤時間は0分以上で入力してください")
    .max(300, "通勤時間が長すぎます"),
  commutingDaysPerWeek: z.coerce.number()
    .int("出社日数は整数で入力してください")
    .min(0, "出社日数は0日以上にしてください")
    .max(7, "週の出社日数は7日以下にしてください"),
  additionalCostOneWay: z.coerce.number()
    .min(0, "グリーン車の追加コストは0円以上で入力してください")
    .max(20000, "追加コストが大きすぎます"),
  greenSeatTripsPerDay: z.coerce.number()
    .int("利用回数は整数で入力してください")
    .min(0, "利用回数は0回以上にしてください")
    .max(4, "1日の利用回数が多すぎます"),
});

export type CalculationFormSchema = z.infer<typeof calculationFormSchema>;
