# グリーン車通勤損益計算アプリ 設計書

## 1. 概要

### 目的
通勤時間にグリーン車で作業することの経済的価値を可視化し、通勤方法の意思決定をサポートするWebアプリケーション

### ターゲットユーザー
- 副業をしている会社員
- 通勤時間を有効活用したいビジネスパーソン
- リモートワークと出社のハイブリッド勤務者

---

## 2. 要件定義

### 2.1 機能要件

#### Phase 1: MVP（最小機能）

**1. 基本設定機能**
- 時給の設定
- 通勤時間（片道）の入力
- 通勤頻度（週の出社日数）

**2. 交通費設定機能**

*簡易モード（デフォルト）*
- グリーン車の追加コスト（片道）を入力
- 普通車定期は会社支給として自動計算

*詳細モード（オプション）*
- 交通手段の選択（電車/バス/車/その他）
- 定期券の種類選択
  - 会社全額支給
  - 自己負担
  - 一部支給（支給額を指定）
  - 都度払い
- グリーン車利用方法の選択
  - グリーン定期券
  - 都度グリーン券
  - 併用

**3. 損益計算機能**
- 通勤時間に働いた場合の収入計算
- グリーン車の追加コスト計算
- 差額（損益）の算出
- 期間別集計（日/週/月/年）
- 損益分岐点の時給計算

**4. 結果表示機能**
- 日次損益の大きな表示
- 期間別タブ切り替え
- 色分け表示（プラス：緑、マイナス：赤）
- コスト内訳の表示

#### Phase 2: 拡張機能

**1. データ永続化**
- Supabaseでのデータ保存
- 設定の自動保存

**2. 可視化機能**
- 損益推移グラフ
- 月次・年次のトレンド表示
- 時間の有効活用度の可視化

**3. 実績トラッキング**
- 実際にグリーン車を利用した日の記録
- 実作業時間の入力
- 生産性評価（1-5段階）
- 予測値と実績値の比較

**4. 比較機能**
- 複数パターンの比較
  - 在宅勤務
  - グリーン車通勤
  - 普通車通勤
- シミュレーション機能

#### Phase 3: SaaS化機能

**1. ユーザー認証**
- Supabase Authによる認証
- 複数デバイスでのデータ同期

**2. 高度な分析**
- 週次・月次レポート
- 累計統計
- エクスポート機能（PDF/CSV）

**3. 路線データ連携**
- 路線・区間からの自動料金計算
- 定期代の自動取得

**4. 企業向け機能**
- チーム機能
- 管理者ダッシュボード
- 交通費精算データの出力

### 2.2 非機能要件

**パフォーマンス**
- 初期表示：2秒以内
- 計算結果の即座表示

**ユーザビリティ**
- レスポンシブデザイン（スマホ・タブレット対応）
- 直感的なUI/UX
- リアルタイムプレビュー

**可用性**
- PWA対応
- オフラインでの基本機能利用
- データのローカルキャッシュ

**セキュリティ**
- 個人情報の適切な管理
- HTTPS通信
- XSS/CSRF対策

---

## 3. データモデル設計

### 3.1 型定義

```typescript
// 交通手段の種類
type TransportType = 'train' | 'bus' | 'car' | 'other';

// 定期券の種類
type TicketType = 'commuter_pass' | 'green_pass' | 'pay_per_ride' | 'none';

// 費用タイプ
type CostType = 'monthly_pass' | 'per_ride';

// グリーン車利用タイプ
type GreenCostType = 'monthly_pass' | 'green_ticket' | 'both';

// 設定モード
type SettingsMode = 'simple' | 'detailed';

// 交通費設定（詳細モード）
interface TransportCostSettings {
  transportType: TransportType;
  
  trainSettings?: {
    ticketType: TicketType;
    
    // 普通車の費用
    regularCost: {
      type: CostType;
      amount: number;
      companyPaid: boolean;
      companyPaidAmount?: number;
    };
    
    // グリーン車の費用
    greenCost: {
      type: GreenCostType;
      monthlyPassAmount?: number;
      greenTicketAmount?: number;
      companyPaid: boolean;
      companyPaidAmount?: number;
    };
  };
}

// 簡易設定
interface SimpleCostSettings {
  greenCarAdditionalCost: number; // 片道の追加コスト
}

// ユーザー設定
interface UserSettings {
  id: string;
  userId?: string; // Supabase Auth連携時
  
  // 基本設定
  hourlyRate: number; // 時給（税込）
  commuteTimeMinutes: number; // 片道通勤時間
  workDaysPerWeek: number; // 週の出社日数
  
  // 交通費設定
  settingsMode: SettingsMode;
  simpleCost?: SimpleCostSettings;
  detailedCost?: TransportCostSettings;
  
  createdAt: Date;
  updatedAt: Date;
}

// 計算結果
interface CalculationResult {
  // 収入
  dailyWorkIncome: number; // 1日の通勤時間で稼げる金額（往復）
  weeklyWorkIncome: number;
  monthlyWorkIncome: number;
  annualWorkIncome: number;
  
  // コスト
  dailyCost: number; // 1日のグリーン車追加コスト
  weeklyCost: number;
  monthlyCost: number;
  annualCost: number;
  
  // 損益
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  annualProfit: number;
  
  // その他
  breakEvenHourlyRate: number; // 損益分岐点の時給
  totalCommuteHoursPerMonth: number; // 月間通勤時間
}

// コスト内訳
interface CostBreakdown {
  regularCommuteCost: number; // 普通車での月額自己負担
  greenCommuteCost: number; // グリーン車での月額自己負担
  additionalCost: number; // 追加コスト
  
  breakdown: {
    regularTotal: number;
    regularCompanyPaid: number;
    regularSelfPaid: number;
    greenTotal: number;
    greenCompanyPaid: number;
    greenSelfPaid: number;
  };
}

// 通勤実績ログ（Phase 2）
interface CommuteLog {
  id: string;
  userId: string;
  date: Date;
  usedGreenCar: boolean;
  actualWorkMinutes?: number;
  productivity?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: Date;
}
```

### 3.2 Supabaseテーブル設計

```sql
-- ユーザー設定テーブル
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  hourly_rate DECIMAL(10, 2) NOT NULL,
  commute_time_minutes INTEGER NOT NULL,
  work_days_per_week INTEGER NOT NULL,
  settings_mode VARCHAR(20) NOT NULL DEFAULT 'simple',
  simple_cost JSONB,
  detailed_cost JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通勤ログテーブル（Phase 2）
CREATE TABLE commute_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  used_green_car BOOLEAN NOT NULL,
  actual_work_minutes INTEGER,
  productivity INTEGER CHECK (productivity BETWEEN 1 AND 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- インデックス
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_commute_logs_user_id ON commute_logs(user_id);
CREATE INDEX idx_commute_logs_date ON commute_logs(date);
```

---

## 4. 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **状態管理**: Zustand または React Context
- **グラフ**: Recharts
- **フォーム**: React Hook Form + Zod

### バックエンド
- **BaaS**: Supabase
  - Database (PostgreSQL)
  - Authentication
  - Realtime subscriptions

### インフラ
- **ホスティング**: Vercel
- **ドメイン**: 任意
- **SSL**: 自動（Vercel）

### 開発ツール
- **パッケージマネージャー**: pnpm
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **テスト**: Vitest + Testing Library

---

## 5. アーキテクチャ設計

### 5.1 ディレクトリ構成

```
src/
├─ app/
│  ├─ page.tsx                    # ダッシュボード（メイン画面）
│  ├─ settings/
│  │  └─ page.tsx                # 設定画面
│  ├─ history/
│  │  └─ page.tsx                # 履歴・実績（Phase 2）
│  ├─ analytics/
│  │  └─ page.tsx                # 分析画面（Phase 2）
│  ├─ layout.tsx
│  └─ globals.css
│
├─ components/
│  ├─ ui/                         # shadcn/uiコンポーネント
│  ├─ dashboard/
│  │  ├─ ProfitDisplay.tsx       # 損益表示カード
│  │  ├─ PeriodTabs.tsx          # 期間切り替えタブ
│  │  ├─ ProfitChart.tsx         # 損益グラフ
│  │  └─ CostBreakdown.tsx       # コスト内訳
│  ├─ settings/
│  │  ├─ BasicSettingsForm.tsx   # 基本設定フォーム
│  │  ├─ SimpleCostForm.tsx      # 簡易交通費設定
│  │  ├─ DetailedCostForm.tsx    # 詳細交通費設定
│  │  └─ ModeToggle.tsx          # 簡易/詳細モード切り替え
│  ├─ history/
│  │  ├─ CommuteLogForm.tsx      # 実績入力フォーム
│  │  └─ LogList.tsx             # 実績一覧
│  └─ common/
│     ├─ Header.tsx
│     ├─ Navigation.tsx
│     └─ LoadingSpinner.tsx
│
├─ lib/
│  ├─ calculator/
│  │  ├─ profit-calculator.ts    # 損益計算ロジック
│  │  ├─ cost-calculator.ts      # コスト計算ロジック
│  │  └─ utils.ts                # 計算用ユーティリティ
│  ├─ supabase/
│  │  ├─ client.ts               # Supabaseクライアント
│  │  ├─ settings.ts             # 設定関連のクエリ
│  │  └─ logs.ts                 # ログ関連のクエリ
│  ├─ stores/
│  │  └─ settings-store.ts       # 設定の状態管理
│  └─ types/
│     └─ index.ts                # 型定義
│
├─ hooks/
│  ├─ useSettings.ts             # 設定管理フック
│  ├─ useCalculation.ts          # 計算結果取得フック
│  ├─ useCommuteLogs.ts          # 実績ログ管理フック
│  └─ useSupabase.ts             # Supabase操作フック
│
└─ utils/
   ├─ format.ts                   # フォーマット関数
   ├─ validation.ts               # バリデーション
   └─ constants.ts                # 定数定義
```

### 5.2 計算ロジック

```typescript
// lib/calculator/profit-calculator.ts

export function calculateProfit(
  settings: UserSettings
): CalculationResult {
  const { hourlyRate, commuteTimeMinutes, workDaysPerWeek } = settings;
  
  // 月間出社日数
  const monthlyWorkDays = (workDaysPerWeek * 52) / 12;
  
  // 往復通勤時間（時間単位）
  const roundTripHours = (commuteTimeMinutes * 2) / 60;
  
  // 収入計算
  const dailyWorkIncome = roundTripHours * hourlyRate;
  const weeklyWorkIncome = dailyWorkIncome * workDaysPerWeek;
  const monthlyWorkIncome = dailyWorkIncome * monthlyWorkDays;
  const annualWorkIncome = monthlyWorkIncome * 12;
  
  // コスト計算
  const costBreakdown = calculateCost(settings);
  const dailyCost = costBreakdown.additionalCost / monthlyWorkDays;
  const weeklyCost = dailyCost * workDaysPerWeek;
  const monthlyCost = costBreakdown.additionalCost;
  const annualCost = monthlyCost * 12;
  
  // 損益計算
  const dailyProfit = dailyWorkIncome - dailyCost;
  const weeklyProfit = weeklyWorkIncome - weeklyCost;
  const monthlyProfit = monthlyWorkIncome - monthlyCost;
  const annualProfit = annualWorkIncome - annualCost;
  
  // 損益分岐点の時給
  const breakEvenHourlyRate = dailyCost / roundTripHours;
  
  // 月間通勤時間
  const totalCommuteHoursPerMonth = roundTripHours * monthlyWorkDays;
  
  return {
    dailyWorkIncome,
    weeklyWorkIncome,
    monthlyWorkIncome,
    annualWorkIncome,
    dailyCost,
    weeklyCost,
    monthlyCost,
    annualCost,
    dailyProfit,
    weeklyProfit,
    monthlyProfit,
    annualProfit,
    breakEvenHourlyRate,
    totalCommuteHoursPerMonth,
  };
}
```

```typescript
// lib/calculator/cost-calculator.ts

export function calculateCost(
  settings: UserSettings
): CostBreakdown {
  const { settingsMode, simpleCost, detailedCost, workDaysPerWeek } = settings;
  const monthlyWorkDays = (workDaysPerWeek * 52) / 12;
  
  if (settingsMode === 'simple' && simpleCost) {
    // 簡易モード: グリーン車の追加コストのみ
    const additionalCost = simpleCost.greenCarAdditionalCost * 2 * monthlyWorkDays;
    
    return {
      regularCommuteCost: 0, // 会社支給と仮定
      greenCommuteCost: additionalCost,
      additionalCost,
      breakdown: {
        regularTotal: 0,
        regularCompanyPaid: 0,
        regularSelfPaid: 0,
        greenTotal: additionalCost,
        greenCompanyPaid: 0,
        greenSelfPaid: additionalCost,
      },
    };
  }
  
  if (settingsMode === 'detailed' && detailedCost?.trainSettings) {
    const { regularCost, greenCost } = detailedCost.trainSettings;
    
    // 普通車のコスト
    let regularTotal = 0;
    if (regularCost.type === 'monthly_pass') {
      regularTotal = regularCost.amount;
    } else {
      regularTotal = regularCost.amount * 2 * monthlyWorkDays;
    }
    
    const regularCompanyPaid = regularCost.companyPaid 
      ? (regularCost.companyPaidAmount || regularTotal) 
      : 0;
    const regularSelfPaid = regularTotal - regularCompanyPaid;
    
    // グリーン車のコスト
    let greenTotal = 0;
    if (greenCost.type === 'monthly_pass') {
      greenTotal = greenCost.monthlyPassAmount || 0;
    } else if (greenCost.type === 'green_ticket') {
      greenTotal = regularTotal + (greenCost.greenTicketAmount || 0) * 2 * monthlyWorkDays;
    } else {
      greenTotal = (greenCost.monthlyPassAmount || 0) + 
                   (greenCost.greenTicketAmount || 0) * 2 * monthlyWorkDays;
    }
    
    const greenCompanyPaid = greenCost.companyPaid
      ? (greenCost.companyPaidAmount || 0)
      : regularCompanyPaid;
    const greenSelfPaid = greenTotal - greenCompanyPaid;
    
    return {
      regularCommuteCost: regularSelfPaid,
      greenCommuteCost: greenSelfPaid,
      additionalCost: greenSelfPaid - regularSelfPaid,
      breakdown: {
        regularTotal,
        regularCompanyPaid,
        regularSelfPaid,
        greenTotal,
        greenCompanyPaid,
        greenSelfPaid,
      },
    };
  }
  
  // デフォルト値
  return {
    regularCommuteCost: 0,
    greenCommuteCost: 0,
    additionalCost: 0,
    breakdown: {
      regularTotal: 0,
      regularCompanyPaid: 0,
      regularSelfPaid: 0,
      greenTotal: 0,
      greenCompanyPaid: 0,
      greenSelfPaid: 0,
    },
  };
}
```

---

## 6. UI/UX設計

### 6.1 画面構成

#### ダッシュボード（メイン画面）
```
+------------------------------------------+
| [ロゴ]              [設定] [履歴]        |
+------------------------------------------+
|                                          |
|  今日の損益                               |
|  +3,750円 🟢                             |
|  (グリーン車で通勤した場合)               |
|                                          |
|  [日次] [週次] [月次] [年次]              |
|                                          |
|  ┌────────────────────────┐            |
|  │ 損益推移グラフ            │            |
|  │                          │            |
|  └────────────────────────┘            |
|                                          |
|  収入詳細                                 |
|  通勤時間での作業: +5,000円               |
|  グリーン車追加コスト: -1,250円           |
|                                          |
|  月間統計                                 |
|  通勤時間: 15時間                         |
|  獲得可能収入: 75,000円                   |
|  実質利益: 60,000円                       |
|                                          |
+------------------------------------------+
```

#### 設定画面
```
+------------------------------------------+
| [戻る] 設定                               |
+------------------------------------------+
|                                          |
|  基本設定                                 |
|  ┌────────────────────────┐            |
|  │ 時給: [5000]円                       │            |
|  │ 通勤時間（片道）: [45]分              │            |
|  │ 週の出社日数: [5]日                   │            |
|  └────────────────────────┘            |
|                                          |
|  交通費設定 [簡易モード ▼]               |
|  ┌────────────────────────┐            |
|  │ グリーン車追加コスト                  │            |
|  │ 片道: [750]円                        │            |
|  │                                      │            |
|  │ ※普通車定期は会社支給として計算      │            |
|  └────────────────────────┘            |
|                                          |
|  リアルタイムプレビュー                   |
|  月間利益: +60,000円                     |
|                                          |
|  [保存する]                               |
|                                          |
+------------------------------------------+
```

#### 詳細モード設定画面
```
+------------------------------------------+
|  交通費設定 [詳細モード ▼]               |
+------------------------------------------+
|                                          |
|  普通車での通勤                           |
|  ┌────────────────────────┐            |
|  │ 定期の種類:                           │            |
|  │ ○ 定期券（会社全額支給）              │            |
|  │ ○ 定期券（自己負担）                  │            |
|  │ ○ 定期券（一部支給）                  │            |
|  │ ○ 都度払い（IC乗車）                  │            |
|  │                                      │            |
|  │ 月額/片道料金: [15000]円              │            |
|  │ 会社支給額: [15000]円                 │            |
|  └────────────────────────┘            |
|                                          |
|  グリーン車での通勤                       |
|  ┌────────────────────────┐            |
|  │ 利用方法:                             │            |
|  │ ○ グリーン定期券                      │            |
|  │ ○ 都度グリーン券                      │            |
|  │ ○ グリーン定期+追加券                 │            |
|  │                                      │            |
|  │ グリーン券（片道）: [750]円           │            |
|  └────────────────────────┘            |
|                                          |
|  コスト内訳                               |
|  普通車: 0円/月（会社支給）               |
|  グリーン車: 30,000円/月                  |
|  追加コスト: 30,000円/月                  |
|                                          |
+------------------------------------------+
```

### 6.2 カラーパレット

```typescript
const colors = {
  profit: {
    positive: '#10b981', // green-500
    negative: '#ef4444', // red-500
    neutral: '#6b7280',  // gray-500
  },
  primary: '#3b82f6',    // blue-500
  background: '#ffffff',
  surface: '#f9fafb',    // gray-50
  border: '#e5e7eb',     // gray-200
  text: {
    primary: '#111827',  // gray-900
    secondary: '#6b7280', // gray-500
  },
};
```

---

## 7. 実装フェーズ

### Phase 1: MVP（2週間）
**Week 1**
- [ ] プロジェクトセットアップ
- [ ] 基本的なレイアウト構築
- [ ] 設定フォーム実装（簡易モード）
- [ ] 計算ロジック実装

**Week 2**
- [ ] ダッシュボード実装
- [ ] 期間別表示機能
- [ ] ローカルストレージでの保存
- [ ] レスポンシブ対応

### Phase 2: データ永続化・可視化（2週間）
**Week 3**
- [ ] Supabaseセットアップ
- [ ] ユーザー設定の保存・読み込み
- [ ] 詳細モードの実装
- [ ] グラフ表示の実装

**Week 4**
- [ ] PWA対応
- [ ] パフォーマンス最適化
- [ ] エラーハンドリング
- [ ] テスト実装

### Phase 3: 実績トラッキング（1-2週間）
- [ ] 実績ログ機能
- [ ] 実績と予測の比較
- [ ] レポート機能

### Phase 4: SaaS化準備（3-4週間）
- [ ] 認証機能
- [ ] 複数デバイス対応
- [ ] 高度な分析機能
- [ ] 企業向け機能の検討

---

## 8. 将来的な拡張案

### 8.1 機能拡張
- 路線・区間データベース連携
- AI による最適通勤パターン提案
- 他ユーザーとの匿名比較
- カレンダー連携（出社予定の自動取得）
- Slack/Teams 通知連携

### 8.2 収益化モデル
**Freemiumモデル**
- 基本機能: 無料
- プレミアム機能: 月額500円
  - 高度な分析レポート
  - データエクスポート
  - 複数パターンの保存
  - 過去データの無制限保存

**エンタープライズプラン**
- チーム機能
- 管理者ダッシュボード
- API連携
- カスタムレポート
- 専用サポート

### 8.3 マーケティング戦略
- ターゲット: 副業をしている会社員、フリーランス
- チャネル: Twitter、LinkedIn、note
- コンテンツ: 通勤時間の活用事例、生産性向上Tips
- SEO: 「グリーン車 仕事」「通勤時間 有効活用」など

---

## 9. 成功指標（KPI）

### MVP段階
- 自分自身が継続的に使用できている
- 計算結果の精度が高い
- UI/UXが直感的で使いやすい

### 公開後
- MAU（月間アクティブユーザー）: 100人
- 継続率（1ヶ月後）: 30%
- NPS（Net Promoter Score）: 40+

### SaaS化後
- 有料会員数: 500人
- MRR（月次経常収益）: 25万円
- チャーンレート: 5%以下

---

## 10. リスクと対策

### 技術的リスク
- **リスク**: 計算ロジックの複雑化によるバグ
- **対策**: ユニットテストの徹底、段階的な機能追加

### ビジネスリスク
- **リスク**: ニーズの過小評価
- **対策**: MVPで早期検証、ユーザーインタビュー

### 法的リスク
- **リスク**: 個人情報保護法への対応
- **対策**: プライバシーポリシーの整備、最小限のデータ収集

---

## 付録

### A. 参考資料
- Next.js公式ドキュメント: https://nextjs.org/docs
- Supabase公式ドキュメント: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com

### B. 用語集
- **MVP**: Minimum Viable Product（実用最小限の製品）
- **SaaS**: Software as a Service
- **PWA**: Progressive Web App
- **MRR**: Monthly Recurring Revenue（月次経常収益）

### C. 更新履歴
- 2025-11-02: 初版作成
  - 基本要件定義
  - データモデル設計
  - 交通費の柔軟な設定機能を追加