import { Calculator } from "@/components/calculator/calculator";
import {
  getDefaultCalculationRequest,
  getDefaultFormValues,
} from "@/lib/defaults";
import { calculateGreenSeatProfit } from "@/lib/calculation";

export default async function Home() {
  const [defaultFormValues, defaultRequest] = await Promise.all([
    getDefaultFormValues(),
    getDefaultCalculationRequest(),
  ]);

  const summary = calculateGreenSeatProfit(defaultRequest);

  return (
    <main className="flex min-h-screen flex-col bg-emerald-50/40">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
        <header className="max-w-3xl space-y-4">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-600">
            グリーン車通勤損益計算
          </span>
          <h1 className="text-3xl font-semibold text-zinc-900 md:text-4xl">
            通勤時間を価値に変えて、グリーン車利用を賢く判断
          </h1>
          <p className="text-base text-zinc-600 md:text-lg">
            作業できる通勤時間の価値と追加コストを比較。日・週・月・年単位で損益がわかります。
          </p>
        </header>
        <Calculator
          initialFormValues={defaultFormValues}
          initialSummary={summary}
        />
      </section>
      <footer className="mt-auto border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-6 py-8 text-sm text-zinc-600">
          <span>お問い合わせ：</span>
          <a
            href="https://x.com/haru_tech9999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-600 transition hover:text-emerald-700 hover:underline"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @haru_tech9999
          </a>
        </div>
      </footer>
    </main>
  );
}
