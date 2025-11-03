import { z } from "zod";

// 空文字列やNaNを適切に処理して日本語エラーメッセージを返すヘルパー
const numberField = (errorMessage: string) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) {
        return NaN;
      }
      return Number(val);
    })
    .refine((val) => !isNaN(val), { message: errorMessage });

export const calculationFormSchema = z.object({
  hourlyRate: numberField("時給は数値で入力してください")
    .refine((val) => val >= 0, { message: "時給は0以上で入力してください" })
    .refine((val) => val <= 100000, { message: "時給が高すぎます" }),
  commuteMinutesOneWay: numberField("通勤時間は数値で入力してください")
    .refine((val) => val >= 0, { message: "通勤時間は0分以上で入力してください" })
    .refine((val) => val <= 300, { message: "通勤時間が長すぎます" }),
  commutingDaysPerWeek: numberField("出社日数は数値で入力してください")
    .refine((val) => Number.isInteger(val), { message: "出社日数は整数で入力してください" })
    .refine((val) => val >= 0, { message: "出社日数は0日以上にしてください" })
    .refine((val) => val <= 7, { message: "週の出社日数は7日以下にしてください" }),
  additionalCostOneWay: numberField("追加料金は数値で入力してください")
    .refine((val) => val >= 0, { message: "グリーン車の追加コストは0円以上で入力してください" })
    .refine((val) => val <= 20000, { message: "追加コストが大きすぎます" }),
  greenSeatTripsPerDay: numberField("利用回数は数値で入力してください")
    .refine((val) => Number.isInteger(val), { message: "利用回数は整数で入力してください" })
    .refine((val) => val >= 0, { message: "利用回数は0回以上にしてください" })
    .refine((val) => val <= 4, { message: "1日の利用回数が多すぎます" }),
});

export type CalculationFormSchema = z.infer<typeof calculationFormSchema>;
