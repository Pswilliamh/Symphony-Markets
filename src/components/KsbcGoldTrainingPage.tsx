import React, { useState } from 'react';

interface KsbcGoldTrainingPageProps {
  onEnterApp: (targetSectionId?: string) => void;
  xrpLivePrice: number;
}

type LessonStep = 1 | 2 | 3 | 4;

const STEP_META: Array<{
  step: LessonStep;
  shortTitle: string;
  headline: string;
  summary: string;
}> = [
  {
    step: 1,
    shortTitle: 'Step 1 · What Is KSBC?',
    headline: 'Turning Real Physical Gold Into Honest Digital Proof',
    summary:
      'Learn the idea behind KSBC (Kingdom Symphony Bible Coin) and how Real-World Asset (RWA) tokenization differs from hype coins.',
  },
  {
    step: 2,
    shortTitle: 'Step 2 · XRPL Token Blueprint',
    headline: 'How You Would Structure a Gold Token on the XRP Ledger',
    summary:
      'Experiment with a hypothetical amount of personal gold to see how XRPL Issuer Accounts, Trustlines, and 1:1 token units work.',
  },
  {
    step: 3,
    shortTitle: 'Step 3 · No-Scam Honesty Rules',
    headline: 'How to Tell True RWA Education Apart From Fake Gold Scams',
    summary:
      'Before any asset token goes live, honest builders separate hypothetical learning blueprints from verified vaults and legal audits.',
  },
  {
    step: 4,
    shortTitle: 'Step 4 · Safe Collateral Math',
    headline: 'Conservative Asset Backing vs. Dangerous Crypto Leverage',
    summary:
      'Use two simple sliders to see why real-world gold models use a 50%–70% safety cushion instead of risky 20x trading leverage.',
  },
];

export const KsbcGoldTrainingPage: React.FC<KsbcGoldTrainingPageProps> = ({
  onEnterApp,
  xrpLivePrice,
}) => {
  const [activeStep, setActiveStep] = useState<LessonStep>(1);

  // Step 2 Hypothetical Minting Sandbox State
  const [goldOunces, setGoldOunces] = useState<number>(1);
  const [unitMode, setUnitMode] = useState<'gram' | 'hundredth_oz'>('gram');
  const referenceGoldSpotUsd = 2650; // Educational reference price per troy oz

  // Step 4 Hypothetical Collateral Safety Buffer State
  const [collateralGoldUsd, setCollateralGoldUsd] = useState<number>(1000);
  const [ltvPercent, setLtvPercent] = useState<number>(65);

  const currentMeta = STEP_META.find((s) => s.step === activeStep) ?? STEP_META[0];

  // Step 2 Calculations (1 troy oz = 31.1035 grams)
  const totalGrams = goldOunces * 31.1035;
  const hypotheticalTokensMinted =
    unitMode === 'gram' ? Math.floor(totalGrams * 100) / 100 : goldOunces * 100;
  const estimatedGoldValueUsd = goldOunces * referenceGoldSpotUsd;
  const valuePerTokenUsd =
    hypotheticalTokensMinted > 0 ? estimatedGoldValueUsd / hypotheticalTokensMinted : 0;
  const xrplTrustlineReserveXrp = 0.2; // XRPL owner reserve per trustline (educational reference)
  const xrplTrustlineReserveUsd = xrplTrustlineReserveXrp * xrpLivePrice;

  // Step 4 Calculations
  const maxConservativeBorrowUsd = (collateralGoldUsd * ltvPercent) / 100;
  const safetyEquityBufferUsd = collateralGoldUsd - maxConservativeBorrowUsd;
  const annualSimpleInterestUsd = maxConservativeBorrowUsd * 0.05;

  return (
    <div className="max-w-[1180px] w-full mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      {/* Top Educational Clarity Header — Clean & Uncluttered */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-semibold">
            <span>KSBC · Kingdom Symphony Bible Coin</span>
            <span aria-hidden="true">·</span>
            <span>Hypothetical RWA Training Module</span>
            <span aria-hidden="true">·</span>
            <span>Personal Learning Only (Not a Live Coin or Government-Certified)</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Gold Real-World Asset (RWA) Tokenization Classroom
          </h1>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          Step {activeStep} of 4 · One Concept at a Time
        </div>
      </div>

      {/* 4-Step Progressive Navigation Bar (Prevents Screen Overload) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {STEP_META.map((item) => {
          const isActive = item.step === activeStep;
          return (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step)}
              className={`text-left px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`text-xs font-semibold ${
                  isActive
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.shortTitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Focused Single-Step Stage Card */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            {currentMeta.shortTitle}
          </div>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {currentMeta.headline}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[68ch]">
            {currentMeta.summary}
          </p>
        </div>

        {/* =====================================================================
         * STEP 1: WHAT IS KSBC & REAL-WORLD ASSET TOKENIZATION?
         * ===================================================================== */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/25 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Plain-English Honesty Note:</strong>{' '}
              <strong>KSBC (Kingdom Symphony Bible Coin)</strong> was originally envisioned as a real-world asset exchange concept for gold on the XRP Ledger. Right now, KSBC is <strong>not a live coin</strong> and we do not claim any government certification or public vault custody. We use it here strictly as a <strong>step-by-step training blueprint</strong>—so if you hold gold and want to understand how tokenization could become a reality in the future, you can learn the mechanics clearly first.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
                  LAYER 01 · PHYSICAL REALITY
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Real Gold First
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Unlike meme coins created out of thin air, a real-world asset starts with physical gold whose weight and purity (such as .9999 fine bullion) actually exist offline.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
                  LAYER 02 · VERIFICATION
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Transparent Proof
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Before any token is trusted by others, independent assay testing, safe storage documentation, and transparent proof-of-reserve records verify the gold is truly there.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  LAYER 03 · XRP LEDGER
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Digital Receipt on XRPL
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Each token issued on the XRP Ledger acts like a divisible digital receipt—allowing fractional ownership or future XRPL DEX trading for fractions of a cent in fees.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * STEP 2: INTERACTIVE XRPL GOLD-TO-TOKEN HYPOTHETICAL SANDBOX
         * ===================================================================== */}
        {activeStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 space-y-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="gold-oz-slider"
                    className="font-semibold text-slate-800 dark:text-slate-200"
                  >
                    1. Hypothetical Physical Gold You Hold
                  </label>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                    {goldOunces} Troy Oz ({totalGrams.toFixed(1)} g)
                  </span>
                </div>
                <input
                  id="gold-oz-slider"
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={goldOunces}
                  onChange={(e) => setGoldOunces(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>0.5 oz</span>
                  <span>5 oz</span>
                  <span>10 oz</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  2. Choose How Each Hypothetical KSBC Token Is Sized
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitMode('gram')}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      unitMode === 'gram'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    1 Token = 1 Gram
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitMode('hundredth_oz')}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      unitMode === 'hundredth_oz'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    1 Token = 0.01 Oz
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong>Key XRPL Safety Feature:</strong> On the XRP Ledger, nobody can force an unknown token into a learner&apos;s wallet. A holder must intentionally set a <strong>Trustline</strong> (reserving ~{xrplTrustlineReserveXrp} XRP, or ~${xrplTrustlineReserveUsd.toFixed(2)} today) to accept an issued asset.
              </p>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono tabular-nums">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
                  <span className="font-sans text-xs text-slate-500 dark:text-slate-400 block">
                    Hypothetical Supply Cap
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {hypotheticalTokensMinted.toLocaleString()} KSBC
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
                  <span className="font-sans text-xs text-slate-500 dark:text-slate-400 block">
                    Implied Backing per Token
                  </span>
                  <span className="text-xl font-bold text-amber-700 dark:text-amber-400">
                    ${valuePerTokenUsd.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="font-semibold text-slate-900 dark:text-white">
                  3 Technical Steps on XRPL (When Moving From Concept to Live):
                </div>
                <div>
                  <strong>1. Issuer Cold Wallet:</strong> Create a dedicated XRPL issuing address whose sole job is minting the exact verified supply ({hypotheticalTokensMinted.toLocaleString()} units).
                </div>
                <div>
                  <strong>2. Distribution Hot Wallet:</strong> Send the minted tokens to a separate operational wallet so the issuing key stays offline and protected.
                </div>
                <div>
                  <strong>3. Native XRPL DEX Pair:</strong> Once live and legally compliant, XRPL&apos;s built-in decentralized exchange allows pairing against XRP or RLUSD without custom smart-contract bugs.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * STEP 3: NO-SCAM HONESTY RULES FOR RWA PROJECTS
         * ===================================================================== */}
        {activeStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                What Scam "Gold Coins" Do (Avoid These)
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4">
                <li>
                  Claim they have "billions in certified vaults" with fake PDF certificates that cannot be independently verified.
                </li>
                <li>
                  Promise guaranteed monthly yield or pressure beginners to buy presale tokens before any real backing exists.
                </li>
                <li>
                  Lock user funds inside a private website instead of letting holders keep custody in their own XRPL wallet.
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                The No-Scam Zone RWA Standard (Our Training Approach)
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-4">
                <li>
                  <strong>Total Honesty About Stage:</strong> Clearly state when a coin like KSBC is an educational prototype—never sell or trade it as live until real backing and legal structure are in place.
                </li>
                <li>
                  <strong>Never Mint Unbacked Supply:</strong> On-chain token supply must never exceed documented physical metal weight.
                </li>
                <li>
                  <strong>Self-Custody First:</strong> Learners keep full control of their own wallet keys at every stage.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* =====================================================================
         * STEP 4: CONSERVATIVE COLLATERAL SAFETY BUFFER (70% LTV SANDBOX)
         * ===================================================================== */}
        {activeStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 space-y-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="collateral-usd-slider"
                    className="font-semibold text-slate-800 dark:text-slate-200"
                  >
                    1. Hypothetical Verified Gold Value
                  </label>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ${collateralGoldUsd.toLocaleString()}
                  </span>
                </div>
                <input
                  id="collateral-usd-slider"
                  type="range"
                  min={100}
                  max={10000}
                  step={100}
                  value={collateralGoldUsd}
                  onChange={(e) => setCollateralGoldUsd(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="ltv-slider"
                    className="font-semibold text-slate-800 dark:text-slate-200"
                  >
                    2. Loan-to-Value (LTV) Limit
                  </label>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {ltvPercent}% LTV ({100 - ltvPercent}% Safety Cushion)
                  </span>
                </div>
                <input
                  id="ltv-slider"
                  type="range"
                  min={30}
                  max={70}
                  step={5}
                  value={ltvPercent}
                  onChange={(e) => setLtvPercent(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Notice the opposite mindset from casino leverage: instead of borrowing 20x <em>more</em> than you own, conservative RWA collateral models borrow <strong>less</strong> than the asset is worth (keeping a {100 - ltvPercent}% equity cushion).
              </p>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono tabular-nums">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
                  <span className="font-sans text-xs text-slate-500 dark:text-slate-400 block">
                    Max Conservative Credit
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    ${maxConservativeBorrowUsd.toFixed(0)}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
                  <span className="font-sans text-xs text-slate-500 dark:text-slate-400 block">
                    Protective Equity Buffer
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ${safetyEquityBufferUsd.toFixed(0)}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
                  <span className="font-sans text-xs text-slate-500 dark:text-slate-400 block">
                    5% Est. Annual Cost
                  </span>
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                    ${annualSimpleInterestUsd.toFixed(0)}/yr
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-700 dark:text-slate-300">
                  Ready to practice live XRPL DEX orderbook math with XRP & XLM?
                </span>
                <button
                  type="button"
                  onClick={() => onEnterApp('ai-dex-lab')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Open Live XRPL DEX Lab →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Footer Controls */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((s) => Math.max(1, s - 1) as LessonStep)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            ← Previous Step
          </button>

          {activeStep < 4 ? (
            <button
              type="button"
              onClick={() => setActiveStep((s) => Math.min(4, s + 1) as LessonStep)}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Next Step ({activeStep + 1} of 4) →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEnterApp('start-here')}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Continue to $5 Wallet Training App →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
