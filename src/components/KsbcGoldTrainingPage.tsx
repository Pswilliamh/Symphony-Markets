import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  FileCheck2,
  FileWarning,
  KeyRound,
  Lock,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import goldRwaBlueprintImg from '../assets/images/infographic_gold_rwa_blueprint_1794621089543.jpg';

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
    shortTitle: 'Step 1 · Visual Overview',
    headline: 'How Physical Gold Becomes an Honest Digital Receipt',
    summary:
      'KSBC (Kingdom Symphony Bible Coin) is our personal-learning blueprint (not a live coin yet) showing the 3 visual building blocks of Real-World Asset tokenization.',
  },
  {
    step: 2,
    shortTitle: 'Step 2 · Interactive Mint Map',
    headline: 'Drag the Slider to Watch Gold Map Onto the XRP Ledger',
    summary:
      'See visually how physical gold weight translates into token units—and how the XRPL Trustline Gate protects your wallet from spam.',
  },
  {
    step: 3,
    shortTitle: 'Step 3 · Visual Scam Spotter',
    headline: 'Spot the Difference in 5 Seconds: Fake Hype vs. Honest RWA',
    summary:
      'Compare the visual red flags of fake "gold coin" websites against transparent, self-custody standards.',
  },
  {
    step: 4,
    shortTitle: 'Step 4 · Visual Safety Cushion',
    headline: 'See Why a Safety Cushion Beats 20x Casino Leverage',
    summary:
      'Move the sliders and watch the green safety bar resize in real time—showing how asset backing protects against wipeouts.',
  },
];

export const KsbcGoldTrainingPage: React.FC<KsbcGoldTrainingPageProps> = ({
  onEnterApp,
  xrpLivePrice,
}) => {
  const [activeStep, setActiveStep] = useState<LessonStep>(1);
  const [blueprintImgError, setBlueprintImgError] = useState<boolean>(false);

  // Step 2 Hypothetical Minting Sandbox State
  const [goldOunces, setGoldOunces] = useState<number>(3);
  const [unitMode, setUnitMode] = useState<'gram' | 'hundredth_oz'>('gram');
  const referenceGoldSpotUsd = 2650;

  // Step 4 Hypothetical Collateral Safety Buffer State
  const [collateralGoldUsd, setCollateralGoldUsd] = useState<number>(1000);
  const [ltvPercent, setLtvPercent] = useState<number>(60);

  const currentMeta = STEP_META.find((s) => s.step === activeStep) ?? STEP_META[0];

  // Step 2 Calculations
  const totalGrams = goldOunces * 31.1035;
  const hypotheticalTokensMinted =
    unitMode === 'gram' ? Math.floor(totalGrams * 100) / 100 : goldOunces * 100;
  const estimatedGoldValueUsd = goldOunces * referenceGoldSpotUsd;
  const valuePerTokenUsd =
    hypotheticalTokensMinted > 0 ? estimatedGoldValueUsd / hypotheticalTokensMinted : 0;
  const xrplTrustlineReserveXrp = 0.2;
  const xrplTrustlineReserveUsd = xrplTrustlineReserveXrp * xrpLivePrice;
  const fullBarsCount = Math.floor(goldOunces);
  const hasHalfBar = goldOunces % 1 !== 0;

  // Step 4 Calculations
  const maxConservativeBorrowUsd = (collateralGoldUsd * ltvPercent) / 100;
  const safetyEquityBufferUsd = collateralGoldUsd - maxConservativeBorrowUsd;
  const safetyBufferPct = 100 - ltvPercent;
  const annualSimpleInterestUsd = maxConservativeBorrowUsd * 0.05;

  return (
    <div className="max-w-[1180px] w-full mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">
      {/* Compact Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-semibold">
            <span>KSBC · Kingdom Symphony Bible Coin</span>
            <span aria-hidden="true">·</span>
            <span>Visual RWA Training Sandbox (Hypothetical · Not Live or Government-Certified)</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Gold Real-World Asset (RWA) Visual Classroom
          </h1>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          Visual Lesson {activeStep} of 4
        </div>
      </div>

      {/* 4-Step Visual Stepper */}
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
                  ? 'bg-amber-500/12 dark:bg-amber-500/20 border-amber-500/60 text-slate-900 dark:text-white'
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

      {/* Single Focused Visual Lesson Stage */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-4">
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
         * STEP 1: VISUAL 3-STAGE ILLUSTRATED PIPELINE DIAGRAM
         * ===================================================================== */}
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* Illustrated 3-Step Visual Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch">
              {/* Stage 1 Visual Card: Physical Gold Ingot SVG */}
              <div className="md:col-span-3 p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-500/30 flex flex-col items-center text-center justify-between gap-4">
                <div className="text-xs font-mono font-semibold text-amber-800 dark:text-amber-400">
                  01 · Physical Metal
                </div>

                {/* Custom Illustrated Gold Bullion SVG */}
                <svg
                  viewBox="0 0 180 100"
                  className="w-40 h-24"
                  role="img"
                  aria-label="Physical 999.9 fine gold bar illustration"
                >
                  <defs>
                    <linearGradient id="goldTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="goldSide" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#92400E" />
                    </linearGradient>
                  </defs>
                  {/* Base Shadow */}
                  <ellipse cx="90" cy="84" rx="68" ry="8" fill="rgba(146,64,14,0.18)" />
                  {/* 3D Trapezoid Ingot Base */}
                  <polygon points="24,74 156,74 140,42 40,42" fill="url(#goldSide)" />
                  {/* Top Face */}
                  <polygon
                    points="40,42 140,42 130,24 50,24"
                    fill="url(#goldTop)"
                    stroke="#FEF3C7"
                    strokeWidth="1.5"
                  />
                  {/* Front Bevel */}
                  <polygon points="24,74 156,74 140,42 40,42" fill="url(#goldTop)" opacity="0.82" />
                  <text
                    x="90"
                    y="62"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill="#78350F"
                  >
                    999.9 FINE GOLD
                  </text>
                </svg>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Real Gold Exists First
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Starts with tangible bullion measured by real weight and purity—never thin air.
                  </p>
                </div>
              </div>

              {/* Visual Connector Arrow 1 */}
              <div className="md:col-span-1 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
              </div>

              {/* Stage 2 Visual Card: Assay & Scale Verification SVG */}
              <div className="md:col-span-3 p-5 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-300/60 dark:border-sky-500/30 flex flex-col items-center text-center justify-between gap-4">
                <div className="text-xs font-mono font-semibold text-sky-800 dark:text-sky-400">
                  02 · Honest Proof
                </div>

                {/* Custom Illustrated Balance Scale + Verification Shield SVG */}
                <svg
                  viewBox="0 0 180 100"
                  className="w-40 h-24"
                  role="img"
                  aria-label="Precision balance scale matching gold weight to digital supply"
                >
                  {/* Pillar & Base */}
                  <rect x="70" y="80" width="40" height="6" rx="3" fill="#0284C7" />
                  <rect x="87" y="24" width="6" height="58" rx="2" fill="#0284C7" />
                  {/* Balance Beam */}
                  <line x1="38" y1="34" x2="142" y2="34" stroke="#0369A1" strokeWidth="4" strokeLinecap="round" />
                  {/* Left Pan (Gold) */}
                  <line x1="44" y1="34" x2="34" y2="58" stroke="#38BDF8" strokeWidth="1.8" />
                  <line x1="44" y1="34" x2="54" y2="58" stroke="#38BDF8" strokeWidth="1.8" />
                  <path d="M28,58 Q44,68 60,58 Z" fill="#0284C7" />
                  <rect x="36" y="49" width="16" height="8" rx="1.5" fill="#F59E0B" />
                  {/* Right Pan (1:1 Proof) */}
                  <line x1="136" y1="34" x2="126" y2="58" stroke="#38BDF8" strokeWidth="1.8" />
                  <line x1="136" y1="34" x2="146" y2="58" stroke="#38BDF8" strokeWidth="1.8" />
                  <path d="M120,58 Q136,68 152,58 Z" fill="#0284C7" />
                  <circle cx="136" cy="52" r="6" fill="#10B981" />
                  {/* Center Check */}
                  <circle cx="90" cy="24" r="9" fill="#10B981" />
                  <polyline
                    points="85,24 88.5,27.5 95,20.5"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    1:1 Weight Match
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Independent assay & proof-of-reserve confirm every unit matches real metal.
                  </p>
                </div>
              </div>

              {/* Visual Connector Arrow 2 */}
              <div className="md:col-span-1 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
              </div>

              {/* Stage 3 Visual Card: XRPL Digital Receipt SVG */}
              <div className="md:col-span-3 p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300/60 dark:border-emerald-500/30 flex flex-col items-center text-center justify-between gap-4">
                <div className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400">
                  03 · XRPL Digital Token
                </div>

                {/* Custom Illustrated Token Receipt on Ledger SVG */}
                <svg
                  viewBox="0 0 180 100"
                  className="w-40 h-24"
                  role="img"
                  aria-label="Divisible KSBC digital token on the XRP Ledger"
                >
                  {/* Ledger Grid Lines */}
                  <line x1="25" y1="50" x2="155" y2="50" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" />
                  <rect x="24" y="38" width="24" height="24" rx="5" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
                  <rect x="132" y="38" width="24" height="24" rx="5" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
                  {/* Center Token Coin */}
                  <circle cx="90" cy="50" r="28" fill="#059669" />
                  <circle cx="90" cy="50" r="22" fill="#10B981" stroke="#A7F3D0" strokeWidth="1.5" />
                  <text
                    x="90"
                    y="48"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    fill="#FFFFFF"
                  >
                    KSBC
                  </text>
                  <text
                    x="90"
                    y="60"
                    textAnchor="middle"
                    fontSize="8"
                    fontFamily="monospace"
                    fill="#ECFDF5"
                  >
                    XRPL RWA
                  </text>
                </svg>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Divisible Ledger Receipt
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Moves on XRPL in 3–4 seconds for ~$0.0001 while holders keep self-custody.
                  </p>
                </div>
              </div>
            </div>

            {/* Blueprint Infographic + Thorough Plain-English Walkthrough */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5">
                {!blueprintImgError ? (
                  <img
                    src={goldRwaBlueprintImg}
                    alt="Architectural blueprint illustration showing fine gold bullion bars on an analytical assay balance connected to distributed ledger blocks"
                    referrerPolicy="no-referrer"
                    onError={() => setBlueprintImgError(true)}
                    className="w-full aspect-16/9 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                ) : (
                  <div className="w-full aspect-16/9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center p-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                    Assay Scale Verification → 1:1 XRPL Distributed Ledger Blocks
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Full Plain-English Explanation · Why KSBC Starts as an Educational Blueprint
                </div>
                <p>
                  <strong>KSBC (Kingdom Symphony Bible Coin)</strong> was originally envisioned as an honest exchange mechanism for Real-World Asset (RWA) gold. Right now, KSBC is <strong>not a live trading coin</strong> and makes zero claims of government certification—everything here is a transparent personal-learning blueprint for people who want to understand how physical gold can become a real digital asset in the future.
                </p>
                <p>
                  Instead of printing tokens out of thin air, genuine RWA tokenization follows a strict sequence: <strong>(1) Physical Metal</strong> is weighed and assayed for purity (such as 999.9 fine gold), <strong>(2) Independent Proof-of-Reserve</strong> locks that exact weight in an audited vault, and <strong>(3) Divisible Ledger Receipts</strong> are issued 1-to-1 on the XRP Ledger so everyday holders can transfer fractional gold weight in 3–4 seconds for ~$0.0001.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * STEP 2: INTERACTIVE VISUAL GOLD TRAY & XRPL TRUSTLINE GATE
         * ===================================================================== */}
        {activeStep === 2 && (
          <div className="space-y-6">
            {/* Top Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="gold-oz-slider"
                    className="font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Drag to Add Hypothetical Gold Bars:
                  </label>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                    {goldOunces} Troy Oz ({totalGrams.toFixed(1)} grams)
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
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Choose Token Size:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitMode('gram')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      unitMode === 'gram'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    1 KSBC = 1 Gram
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitMode('hundredth_oz')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      unitMode === 'hundredth_oz'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    1 KSBC = 0.01 Oz
                  </button>
                </div>
              </div>
            </div>

            {/* Live Visual Pipeline: Gold Bar Tray -> XRPL Trustline Gate -> Self-Custody Wallet */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
              {/* Visual Box 1: Live Gold Ingot Tray */}
              <div className="lg:col-span-4 p-5 rounded-xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/15 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <Scale className="w-4 h-4" />
                    Physical Vault Tray
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ~${estimatedGoldValueUsd.toLocaleString()}
                  </span>
                </div>

                {/* Dynamic 10-Slot Gold Bar Grid */}
                <div className="grid grid-cols-5 gap-2 py-2">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const isFull = idx < fullBarsCount;
                    const isHalf = idx === fullBarsCount && hasHalfBar;
                    return (
                      <div
                        key={idx}
                        className={`h-11 rounded-md border flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all ${
                          isFull
                            ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-amber-600 text-amber-950 shadow-xs'
                            : isHalf
                            ? 'bg-gradient-to-r from-amber-400 via-amber-300/60 to-slate-100 dark:to-slate-800 border-amber-500/70 text-amber-950 dark:text-amber-200'
                            : 'bg-slate-100/70 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>{isFull ? '1 oz' : isHalf ? '0.5' : '—'}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Each lit gold bar = <strong>1 Troy Oz</strong> (31.1g) of verified physical metal.
                </div>
              </div>

              {/* Arrow */}
              <div className="lg:col-span-1 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ArrowRight className="w-6 h-6 rotate-90 lg:rotate-0" />
              </div>

              {/* Visual Box 2: XRPL Issuer + Opt-In Trustline Gate */}
              <div className="lg:col-span-3 p-5 rounded-xl border border-sky-300/60 dark:border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/15 flex flex-col justify-between gap-3">
                <div className="text-xs font-semibold text-sky-800 dark:text-sky-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  XRPL Trustline Gate
                </div>

                <div className="divide-y divide-sky-200/70 dark:divide-slate-800 my-auto">
                  <div className="pb-3 flex items-start gap-2.5 text-xs">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white">
                        Offline Issuer Key
                      </strong>
                      <span className="text-slate-600 dark:text-slate-400">
                        Mints exact 1:1 cap only
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 flex items-start gap-2.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white">
                        Holder Trustline Opt-In
                      </strong>
                      <span className="text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                        {xrplTrustlineReserveXrp} XRP (~${xrplTrustlineReserveUsd.toFixed(2)}) anti-spam lock
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-sky-200/70 dark:border-slate-800">
                  Blocks fake airdrop scams automatically.
                </div>
              </div>

              {/* Arrow */}
              <div className="lg:col-span-1 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ArrowRight className="w-6 h-6 rotate-90 lg:rotate-0" />
              </div>

              {/* Visual Box 3: Resulting Token Output in Self-Custody Wallet */}
              <div className="lg:col-span-2 p-5 rounded-xl border border-emerald-300/60 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/15 flex flex-col justify-between gap-3">
                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  Your Wallet
                </div>

                <div className="my-auto space-y-1 font-mono tabular-nums">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {hypotheticalTokensMinted.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    KSBC Tokens
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    ${valuePerTokenUsd.toFixed(2)} / token
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  100% matched to {totalGrams.toFixed(1)}g gold.
                </div>
              </div>
            </div>

            {/* Detailed Step-by-Step Words Explaining the XRPL Minting & Trustline Mechanics */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div>
                <strong className="block text-slate-900 dark:text-white mb-1">
                  1. Cold Issuer Account vs. Hot Distribution
                </strong>
                On the XRP Ledger, honest issuers separate the <strong>Cold Issuing Address</strong> (kept offline, strictly minting tokens when new verified metal enters the vault) from the operational distribution account so nobody can secretly inflate supply.
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white mb-1">
                  2. Why XRPL Requires a 0.2 XRP Trustline
                </strong>
                Unlike networks where scammers drop fake tokens into your wallet uninvited, XRPL requires you to sign an explicit <span className="font-mono">TrustSet</span> opt-in (temporarily locking {xrplTrustlineReserveXrp} XRP in your own wallet) before you can hold any RWA token.
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white mb-1">
                  3. Redemption Burns the Digital Receipt
                </strong>
                If a holder redeems physical gold from the vault, those exact tokens are returned to the issuer address and permanently extinguished so the ledger supply never exceeds the real metal on the shelf.
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
         * STEP 3: VISUAL SIDE-BY-SIDE SCAM SPOTTER CARDS
         * ===================================================================== */}
        {activeStep === 3 && (
          <div className="space-y-4">
            {[
              {
                topic: 'Vault & Backing Claims',
                scamIcon: FileWarning,
                scamText: 'Flashes fake government seals or "secret vaults" nobody can audit.',
                honestIcon: FileCheck2,
                honestText:
                  'States clearly when a concept (like KSBC today) is an educational prototype—and publishes real assay audits before launching.',
              },
              {
                topic: 'Who Holds Your Wallet Keys?',
                scamIcon: Lock,
                scamText:
                  'Forces you to deposit money into their website where withdrawals can be frozen.',
                honestIcon: KeyRound,
                honestText:
                  '100% self-custody on the XRP Ledger—your keys and tokens stay in your own wallet.',
              },
              {
                topic: 'Token Supply Discipline',
                scamIcon: ShieldAlert,
                scamText:
                  'Prints millions of unbacked presale tokens and promises "guaranteed daily yield."',
                honestIcon: Coins,
                honestText:
                  'Strict 1:1 reserve math: zero tokens minted without matching physical weight.',
              },
            ].map((row) => {
              const ScamIcon = row.scamIcon;
              const HonestIcon = row.honestIcon;
              return (
                <div
                  key={row.topic}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                >
                  <div className="md:col-span-2 flex items-center">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {row.topic}
                    </span>
                  </div>

                  {/* Red Trap Visual Box */}
                  <div className="md:col-span-5 p-3.5 rounded-lg bg-rose-500/8 border border-rose-500/25 flex items-start gap-3">
                    <ScamIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="block text-rose-700 dark:text-rose-400 mb-0.5">
                        ✕ Fake Gold Scam Trap
                      </strong>
                      {row.scamText}
                    </div>
                  </div>

                  {/* Green Shield Visual Box */}
                  <div className="md:col-span-5 p-3.5 rounded-lg bg-emerald-500/8 border border-emerald-500/25 flex items-start gap-3">
                    <HonestIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="block text-emerald-700 dark:text-emerald-400 mb-0.5">
                        ✓ No-Scam Zone Standard
                      </strong>
                      {row.honestText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =====================================================================
         * STEP 4: LIVE PROPORTIONAL SAFETY BAR VS. 20X LEVERAGE WIPEOUT BAR
         * ===================================================================== */}
        {activeStep === 4 && (
          <div className="space-y-6">
            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="collateral-usd-slider"
                    className="font-semibold text-slate-800 dark:text-slate-200"
                  >
                    1. Hypothetical Gold Value
                  </label>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ${collateralGoldUsd.toLocaleString()}
                  </span>
                </div>
                <input
                  id="collateral-usd-slider"
                  type="range"
                  min={200}
                  max={10000}
                  step={200}
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
                    2. Borrow Ratio (LTV) vs. Safety Cushion
                  </label>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {ltvPercent}% Credit / {safetyBufferPct}% Cushion
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
            </div>

            {/* Visual Bar Comparison: RWA Cushion vs. 20x Futures Wipeout */}
            <div className="space-y-5">
              {/* Bar 1: Conservative Gold RWA Bar */}
              <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Conservative Gold Backing (${collateralGoldUsd.toLocaleString()} Total Asset)
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                    Est. 5% Interest: ${annualSimpleInterestUsd.toFixed(0)}/yr
                  </span>
                </div>

                {/* Live Proportional Stacked Bar */}
                <div className="w-full h-11 rounded-lg overflow-hidden flex border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold tabular-nums">
                  <div
                    style={{ width: `${ltvPercent}%` }}
                    className="bg-amber-400 text-amber-950 flex items-center justify-center px-2 whitespace-nowrap overflow-hidden"
                  >
                    Credit ${maxConservativeBorrowUsd.toFixed(0)} ({ltvPercent}%)
                  </div>
                  <div
                    style={{ width: `${safetyBufferPct}%` }}
                    className="bg-emerald-600 text-white flex items-center justify-center px-2 whitespace-nowrap overflow-hidden"
                  >
                    Safety Cushion ${safetyEquityBufferUsd.toFixed(0)} ({safetyBufferPct}%)
                  </div>
                </div>
              </div>

              {/* Bar 2: Visual Contrast Against Dangerous 20x Crypto Leverage */}
              <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Compare: Dangerous 20x Futures Leverage Trap
                  </span>
                  <span className="font-mono text-rose-700 dark:text-rose-400">
                    5% price drop = 100% Account Wiped Out
                  </span>
                </div>

                <div className="w-full h-9 rounded-lg overflow-hidden flex border border-rose-400/50 font-mono text-xs font-bold">
                  <div
                    style={{ width: '5%' }}
                    className="bg-slate-700 text-white flex items-center justify-center text-[10px]"
                    title="5% tiny margin"
                  >
                    5%
                  </div>
                  <div
                    style={{ width: '95%' }}
                    className="bg-rose-600 text-white flex items-center justify-center px-3 whitespace-nowrap"
                  >
                    95% Borrowed Debt Zone (Instant Liquidation Danger)
                  </div>
                </div>
              </div>

              {/* Detailed Plain-English Explanation of Over-Collateralization vs. Leverage */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">
                  Why the Green Safety Cushion Protects Families & Learners:
                </strong>{' '}
                In hypothetical RWA collateral models, borrowing at a conservative <strong>{ltvPercent}% Loan-to-Value (LTV)</strong> against ${collateralGoldUsd.toLocaleString()} of verified asset value leaves a <strong>${safetyEquityBufferUsd.toFixed(0)} ({safetyBufferPct}%) equity cushion</strong> so normal market dips do not wipe you out. By contrast, 20x crypto futures use 95% borrowed debt with only 5% margin—meaning a routine 5% market wiggle liquidates 100% of a beginner’s account.
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Navigation Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((s) => Math.max(1, s - 1) as LessonStep)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            ← Previous Visual
          </button>

          {activeStep < 4 ? (
            <button
              type="button"
              onClick={() => setActiveStep((s) => Math.min(4, s + 1) as LessonStep)}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Next Visual ({activeStep + 1} of 4) →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEnterApp('start-here')}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Practice Inside $5 Wallet App →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
