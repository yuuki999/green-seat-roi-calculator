"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CalculationSummary } from "@/types/result";
import type { CalculationFormValues } from "@/types/form";
import {
  calculationFormSchema,
  type CalculationFormSchema,
} from "@/app/_schemas/calculation";
import { calculateProfitAction } from "@/app/actions/calculate-profit";
import { calculateGreenSeatProfit } from "@/lib/calculation";
import { mapFormToCalculationRequest } from "@/lib/form-mapper";
import {
  formatCurrency,
  formatHours,
} from "@/lib/formatters";

const FORM_STORAGE_KEY = "green-commute-calculator:form";

interface CalculatorProps {
  initialFormValues: CalculationFormValues;
  initialSummary: CalculationSummary;
}

interface FieldMeta {
  name: keyof CalculationFormSchema;
  label: string;
  unit: string;
  helperText: string;
  step?: number;
  min?: number;
  max?: number;
}

// フォームの仕様を集約して管理することで、フィールド追加時の漏れを防止する。
const fieldConfigurations: FieldMeta[] = [
  {
    name: "hourlyRate",
    label: "時給（円）",
    unit: "円",
    helperText: "通勤時間に確保できる作業の時給を設定してください。",
    step: 100,
    min: 0,
    max: 100000,
  },
  {
    name: "commuteMinutesOneWay",
    label: "片道の通勤時間（分）",
    unit: "分",
    helperText: "自宅からオフィスまでの所要時間を入力します。",
    step: 5,
    min: 0,
    max: 300,
  },
  {
    name: "commutingDaysPerWeek",
    label: "週あたりの出社日数",
    unit: "日",
    helperText: "週に何日出社するかを整数で入力してください。",
    step: 1,
    min: 0,
    max: 7,
  },
  {
    name: "additionalCostOneWay",
    label: "グリーン車の追加料金（片道）",
    unit: "円",
    helperText: "通常料金との差額を片道あたりで入力します。",
    step: 50,
    min: 0,
    max: 20000,
  },
  {
    name: "greenSeatTripsPerDay",
    label: "1日のグリーン車利用回数",
    unit: "回",
    helperText:
      "往復利用なら2、片道のみなら1を入力してください。利用しない日は0にもできます。",
    step: 1,
    min: 0,
    max: 4,
  },
];

// テーブル表示にすることで指標名を繰り返し表示せずに視認性を高める。
function PeriodSummaryTable({ summary }: { summary: CalculationSummary }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <th className="w-24 px-4 py-3">期間</th>
            <th className="px-4 py-3 text-right">損益</th>
            <th className="px-4 py-3 text-right">作業による収入</th>
            <th className="px-4 py-3 text-right">グリーン車コスト</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {summary.periodSummaries.map((periodSummary) => (
            <tr key={periodSummary.period} className="transition hover:bg-emerald-50/30">
              <th scope="row" className="px-4 py-3 text-left text-sm font-semibold text-zinc-800">
                {periodSummary.label}
              </th>
              <td
                className={`px-4 py-3 text-right text-sm font-semibold ${
                  periodSummary.netProfit >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {formatCurrency(periodSummary.netProfit)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-zinc-700">
                {formatCurrency(periodSummary.workValue)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-zinc-700">
                {formatCurrency(periodSummary.greenSeatCost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CostBreakdownBoard({ summary }: { summary: CalculationSummary }) {
  const { costBreakdown, breakEvenHourlyRate } = summary;
  const additionalCostPerDay =
    costBreakdown.additionalCostPerTrip * costBreakdown.greenSeatTripsPerDay;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-800">
        コスト内訳と目安
      </h3>
      <div className="mt-4 grid gap-4 text-sm text-zinc-700 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            時間の内訳
          </h4>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between">
              <dt>1日の作業可能時間</dt>
              <dd className="font-medium text-zinc-800">
                {formatHours(costBreakdown.workingHoursPerDay)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>グリーン車利用回数（1日）</dt>
              <dd className="font-medium text-zinc-800">
                {costBreakdown.greenSeatTripsPerDay}回
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>グリーン車利用回数（週）</dt>
              <dd className="font-medium text-zinc-800">
                {costBreakdown.greenSeatTripsPerWeek}回
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            コストの内訳
          </h4>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between">
              <dt>片道あたりの追加料金</dt>
              <dd className="font-medium text-zinc-800">
                {formatCurrency(costBreakdown.additionalCostPerTrip)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>1日あたりの追加料金</dt>
              <dd className="font-medium text-zinc-800">
                {formatCurrency(additionalCostPerDay)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="mt-4">
        {breakEvenHourlyRate === null ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            グリーン車を利用しない条件のため、損益分岐点の時給は算出されません。
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              損益分岐点の目安
            </h4>
            <p className="mt-1 leading-relaxed">
              この条件では、
              <span className="font-semibold">
                1時間あたり約{formatCurrency(breakEvenHourlyRate)}
              </span>
              以上の価値が生まれる作業ができれば、グリーン車利用の追加コストを相殺できます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Calculator({
  initialFormValues,
  initialSummary,
}: CalculatorProps) {
  const [summary, setSummary] = useState<CalculationSummary>(initialSummary);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasBootstrappedForm, setHasBootstrappedForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState,
    setError,
    reset,
    watch,
  } = useForm<CalculationFormSchema>({
    resolver: zodResolver(calculationFormSchema),
    defaultValues: initialFormValues,
  });

  // ローカルストレージに保存されたフォーム値があれば初期化時に復元する。
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const storedValue = window.localStorage.getItem(FORM_STORAGE_KEY);
      if (!storedValue) {
        setHasBootstrappedForm(true);
        return;
      }
      const parsed = JSON.parse(storedValue);
      const result = calculationFormSchema.safeParse(parsed);
      if (!result.success) {
        setHasBootstrappedForm(true);
        return;
      }
      reset(result.data);
      const request = mapFormToCalculationRequest(result.data);
      setSummary(calculateGreenSeatProfit(request));
    } catch {
      window.localStorage.removeItem(FORM_STORAGE_KEY);
    } finally {
      setHasBootstrappedForm(true);
    }
  }, [reset]);

  const watchedValues = watch();

  // 入力内容が有効な場合のみローカルストレージへ保存する。
  useEffect(() => {
    if (!hasBootstrappedForm || typeof window === "undefined") {
      return;
    }
    const result = calculationFormSchema.safeParse(watchedValues);
    if (!result.success) {
      return;
    }
    window.localStorage.setItem(
      FORM_STORAGE_KEY,
      JSON.stringify(result.data),
    );
  }, [hasBootstrappedForm, watchedValues]);

  // Server Actions を通じて損益計算を行い、結果をクライアント側で即時反映する。
  const onSubmit = handleSubmit((values) => {
    setServerMessage(null);
    startTransition(async () => {
      const result = await calculateProfitAction(values);
      if (result.success) {
        setSummary(result.summary);
        return;
      }

      setServerMessage(result.message ?? "計算に失敗しました。");
      Object.entries(result.fieldErrors).forEach(([fieldKey, messages]) => {
        const firstMessage = messages[0];
        if (!firstMessage) {
          return;
        }
        if (
          fieldKey === "form" ||
          !(fieldKey in initialFormValues)
        ) {
          return;
        }
        setError(fieldKey as keyof CalculationFormSchema, {
          type: "server",
          message: firstMessage,
        });
      });
    });
  });

  return (
    <div className="space-y-8 md:grid md:grid-cols-[minmax(0,380px)_1fr] md:gap-8 md:space-y-0 md:items-start">
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-xl space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:mx-0"
      >
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            基本設定
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            通勤条件を入力すると、グリーン車利用による損益を算出します。
          </p>
        </div>
        {fieldConfigurations.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <label
              htmlFor={field.name}
              className="flex justify-between text-sm font-medium text-zinc-800"
            >
              <span>{field.label}</span>
              <span className="text-zinc-500">{field.unit}</span>
            </label>
            <input
              id={field.name}
              type="number"
              inputMode="decimal"
              step={field.step}
              min={field.min}
              max={field.max}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              {...register(field.name, { valueAsNumber: true })}
            />
            <p className="text-xs text-zinc-500">{field.helperText}</p>
            {formState.errors[field.name] && (
              <p className="text-xs text-rose-600">
                {formState.errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}
        {serverMessage && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {serverMessage}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 cursor-pointer"
          disabled={isPending}
        >
          {isPending ? "計算中..." : "損益を計算する"}
        </button>
      </form>
      <div className="mx-auto w-full max-w-xl space-y-6 md:mx-0 md:max-w-none">
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">
            結果サマリー
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            期間別の損益と詳細な内訳を確認できます。
          </p>
          <div className="mt-6">
            <PeriodSummaryTable summary={summary} />
          </div>
        </div>
        <CostBreakdownBoard summary={summary} />
      </div>
    </div>
  );
}
