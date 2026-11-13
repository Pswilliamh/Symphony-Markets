import React, { useMemo, useState } from 'react';
import {
  AssetSymbol,
  Candle,
  FibonacciLevel,
  InstrumentType,
  TradeSide,
} from '../types/market';

interface StartHereRoadmapProps {
  symbol: AssetSymbol;
  onSelectSymbol: (sym: AssetSymbol) => void;
  candles: Candle[];
  fibLevels: FibonacciLevel[];
  livePrice: number;
  accountBalance: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskPercent: number;
  rrRatio: number;
  instrument: InstrumentType;
  leverage: number;
  tradeSide: TradeSide;
  onActivateFiveDollarPreset: () => void;
  onJumpToWalletWatch: () => void;
  beginnerFocusMode: boolean;
  onToggleBeginnerFocusMode: () => void;
}

interface CoachResponse {
  plainEnglishAnswer: string;
  liveChartTranslation: string;
  fiveDollarActionTip: string;
  jargonDecoded: Array<{ term: string; simpleMeaning: string }>;
}

const PLAIN_ENGLISH_GLOSSARY = [
  {
    term: 'Spot (1x) vs. Futures',
    plain:
      'Spot means actually owning the coin in your wallet—if you buy $5 of XLM, it cannot be "liquidated" to zero unless the coin itself goes to zero. Futures use borrowed money (leverage) and can wipe out beginners quickly.',
  },
  {
    term: 'Candlestick & Wicks',
    plain:
      'One bar showing a tug-of-war over time (like 1 hour). Green = buyers won that hour; Red = sellers won. The thin stick ("wick") shows a price buyers or sellers tried to reach before getting pushed back.',
  },
  {
    term: 'Stop-Loss ("Safety Exit")',
    plain:
      'Deciding BEFORE you buy at what exact price you admit the idea did not work and swap back to cash—so a 10-cent mistake never turns into losing half your wallet.',
  },
  {
    term: '1:2 Risk-Reward (R:R)',
    plain:
      'Only taking a trade when your realistic upside (+20 cents) is at least double what you risk losing (-10 cents). Even if you are right only 4 out of 10 times, you still come out ahead.',
  },
  {
    term: 'Fibonacci 50% / 61.8%',
    plain:
      'Think of it as waiting for a "sale" after a price jump. Instead of buying at the top of a spike, patient buyers wait for price to cool off halfway (50%–61.8%) before stepping in.',
  },
  {
    term: 'Spread & Bps (Basis Points)',
    plain:
      'The tiny fee gap between the instant buy price and instant sell price. 10 bps equals 0.10% (half a cent on $5). Lower bps means less money lost to trading friction.',
  },
];

export const StartHereRoadmap: React.FC<StartHereRoadmapProps> = ({
  symbol,
  onSelectSymbol,
  candles,
  fibLevels,
  livePrice,
  accountBalance,
  entryPrice,
  stopLoss,
  takeProfit,
  riskPercent,
  rrRatio,
  instrument,
  leverage,
  tradeSide,
  onActivateFiveDollarPreset,
  onJumpToWalletWatch,
  beginnerFocusMode,
  onToggleBeginnerFocusMode,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showGlossary, setShowGlossary] = useState<boolean>(false);

  // Step 5 AI Mentor State
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [coachReply, setCoachReply] = useState<CoachResponse | null>(null);
  const [isAskingCoach, setIsAskingCoach] = useState<boolean>(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  // Interactive Wise-Choice Checklist (Step 4/5)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    lowFeeChain: true,
    spotOnly: true,
    notChasingSpike: false,
    knowExitPrice: false,
  });

  const coinName = symbol === 'XRPUSDT' ? 'XRP' : 'XLM';
  const decimals = 4;

  // Live plain-English chart reading
  const liveReading = useMemo(() => {
    const recent = candles.slice(-40);
    const last = candles[candles.length - 1];
    if (!last || recent.length < 5) {
      return {
        zoneStatus: 'Fair Middle Range',
        zoneTone: 'text-sky-600 dark:text-sky-400',
        rangePositionPct: 50,
        candleStory: 'Waiting for live candle bars to load...',
        patternName: 'Normal Bar',
        wiseVerdict:
          'Wait for the chart to load, then check whether price is near a calm pullback zone.',
      };
    }

    const high = Math.max(...recent.map((c) => c.high));
    const low = Math.min(...recent.map((c) => c.low));
    const posPct = ((livePrice - low) / Math.max(high - low, 1e-8)) * 100;
    const isGreen = last.close >= last.open;
    const pat = last.detectedPattern;

    let zoneStatus = 'Middle Balance Zone (Wait for Clear Edge)';
    let zoneTone = 'text-sky-600 dark:text-sky-400';
    let wiseVerdict =
      'Price is sitting in the middle of its recent range. You do not need to rush—patient learners often wait for a dip closer to the 50%–61.8% pullback band.';

    if (posPct >= 78) {
      zoneStatus = 'Near Recent Ceiling (Caution: Chasing Risk)';
      zoneTone = 'text-amber-600 dark:text-amber-400';
      wiseVerdict =
        'Price is near the top of its recent range. Buying right after a big green run is where most beginners get trapped when early buyers take profit.';
    } else if (posPct >= 28 && posPct <= 55) {
      zoneStatus = 'Healthy Pullback / "Discount" Zone';
      zoneTone = 'text-emerald-600 dark:text-emerald-400';
      wiseVerdict =
        'Price has pulled back from its recent high into a calmer middle/support area—a much more disciplined spot to plan a small Spot entry with a clear safety exit.';
    } else if (posPct < 28) {
      zoneStatus = 'Near Recent Floor (Watch for Buyer Bounce)';
      zoneTone = 'text-amber-600 dark:text-amber-400';
      wiseVerdict =
        'Price is near its recent lows. Instead of guessing the bottom blindly, wait for a green reversal candle (like a Hammer or Bullish Engulfing) to show buyers actually stepped in.';
    }

    const candleStory = pat
      ? `The latest bar formed a "${pat.name}" (${pat.bias}): ${pat.whatItDoes}`
      : isGreen
      ? `In the current bar, buyers nudged ${coinName} upward from $${last.open.toFixed(
          decimals
        )} to $${last.close.toFixed(decimals)}.`
      : `In the current bar, sellers pushed ${coinName} slightly down from $${last.open.toFixed(
          decimals
        )} to $${last.close.toFixed(decimals)}.`;

    return {
      zoneStatus,
      zoneTone,
      rangePositionPct: Math.min(100, Math.max(0, posPct)),
      candleStory,
      patternName: pat ? `${pat.name} (${pat.bias})` : isGreen ? 'Green Up-Bar' : 'Red Down-Bar',
      wiseVerdict,
    };
  }, [candles, livePrice, coinName]);

  // Concrete $5 Wallet Numbers
  const fiveDollarPlan = useMemo(() => {
    const budget = accountBalance;
    const safeEntry = entryPrice > 0 ? entryPrice : livePrice;
    const riskUsd = budget * (riskPercent / 100);
    const rewardUsd = riskUsd * rrRatio;
    const stopDist = Math.max(Math.abs(safeEntry - stopLoss), 1e-6);
    const rawUnits = riskUsd / stopDist;
    // In a real 1x Spot wallet without leverage, you cannot buy more coins than your total cash budget!
    const maxSpotUnits = budget / Math.max(safeEntry, 1e-6);
    const actualSpotUnits = Math.min(rawUnits, maxSpotUnits);
    const cashUsedUsd = actualSpotUnits * safeEntry;
    const cashKeptSafeUsd = Math.max(0, budget - cashUsedUsd);
    const actualLossIfStopped = actualSpotUnits * stopDist;
    const actualGainIfTarget = actualSpotUnits * Math.abs(takeProfit - safeEntry);

    const fib618 = fibLevels.find((f) => f.ratio === 0.618)?.price ?? safeEntry * 0.98;

    return {
      budget,
      safeEntry,
      actualSpotUnits,
      cashUsedUsd,
      cashKeptSafeUsd,
      actualLossIfStopped,
      actualGainIfTarget,
      fib618,
    };
  }, [accountBalance, entryPrice, livePrice, riskPercent, rrRatio, stopLoss, takeProfit, fibLevels]);

  const askAiMentor = async (promptQuestion: string) => {
    const q = promptQuestion.trim();
    if (!q) return;
    setIsAskingCoach(true);
    setCoachError(null);
    try {
      const res = await fetch('/api/learning-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          symbol,
          livePrice: livePrice.toFixed(decimals),
          accountBalance: accountBalance.toFixed(2),
          entryPrice: fiveDollarPlan.safeEntry.toFixed(decimals),
          stopLoss: stopLoss.toFixed(decimals),
          takeProfit: takeProfit.toFixed(decimals),
          riskUsd: fiveDollarPlan.actualLossIfStopped.toFixed(2),
          rewardUsd: fiveDollarPlan.actualGainIfTarget.toFixed(2),
          candlePattern: liveReading.patternName,
          priceZoneStatus: liveReading.zoneStatus,
          instrument,
          leverage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not reach AI Learning Coach');
      }
      setCoachReply(data as CoachResponse);
    } catch (err: unknown) {
      setCoachError(err instanceof Error ? err.message : 'Error contacting AI Learning Coach');
    } finally {
      setIsAskingCoach(false);
    }
  };

  const isFiveDollarSpotReady = accountBalance === 5 && instrument === 'spot' && leverage === 1;

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-5">
      {/* Top Banner: Start Here Orientation + $5 Mode Switch */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            Start Here · Guided Training Module
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Learn Market Decisions Safely with a $5 Real-Wallet Roadmap
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Follow Steps 1 to 5 below to decode what every chart signal means in plain English, protect a real $5 wallet from hidden network fees, and use the AI Mentor to check your thinking before making a swap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onActivateFiveDollarPreset}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isFiveDollarSpotReady
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {isFiveDollarSpotReady
              ? '✓ $5 Spot Wallet Mode Active'
              : 'Set App to $5 Wallet Mode (1x Spot)'}
          </button>

          <button
            type="button"
            onClick={() => setShowGlossary((g) => !g)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showGlossary ? 'Hide Plain-English Dictionary' : 'Decode Jargon (Dictionary)'}
          </button>

          <button
            type="button"
            onClick={onToggleBeginnerFocusMode}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              beginnerFocusMode
                ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {beginnerFocusMode ? 'Show Advanced Pro Panels' : 'Simplify Screen (Hide Pro Desk)'}
          </button>
        </div>
      </div>

      {/* Collapsible Plain-English Jargon Decoder */}
      {showGlossary && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-900 dark:text-white">
            Plain-English Decoder — What All Those Dashboard Terms Actually Mean
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLAIN_ENGLISH_GLOSSARY.map((item) => (
              <div
                key={item.term}
                className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1"
              >
                <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {item.term}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.plain}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Step Guided Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { num: 1 as const, label: '1. Protect Your $5' },
          { num: 2 as const, label: '2. Read the Chart' },
          { num: 3 as const, label: '3. Check Buy Zone' },
          { num: 4 as const, label: '4. 10-Cent Safety Plan' },
          { num: 5 as const, label: '5. Ask AI Mentor' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`px-3 py-2.5 text-left text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap truncate cursor-pointer ${
              step === s.num
                ? 'bg-slate-900 dark:bg-sky-600 border-slate-900 dark:border-sky-600 text-white'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1: PROTECT YOUR $5 (WALLET, FEES & RESERVES) */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Step 1: How to Use a Real $5 Wallet Without Losing It to Hidden Traps
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Most beginners who try crypto with $5 accidentally lose $2–$4 on their very first click—not because of a bad trade, but because of <strong>network gas fees</strong> or <strong>wallet reserve rules</strong>. Here are the 3 golden rules for a $5 real-wallet test:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">
                  Rule A — Use XLM (Stellar) or XRP, Never Ethereum Mainnet for $5:
                </strong>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  Swapping on Ethereum can cost $2+ in gas fees (40% of your $5!). On{' '}
                  <strong>Stellar (XLM)</strong> or <strong>XRP Ledger (XRP)</strong>, a transaction costs{' '}
                  <span className="font-mono">~$0.00005</span> (less than a hundredth of a penny), so you can practice dozens of real swaps without fees eating your $5.
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">
                  Rule B — Know the "1-Coin Wallet Activation Reserve":
                </strong>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  Self-custody wallets (like Trust Wallet, Lobstr, or Xaman) keep <strong>1 XLM</strong> (~$0.41) on Stellar or <strong>1 XRP</strong> (~$2.42) on XRPL locked as an anti-spam account reserve. With a $5 budget, <strong>Stellar (XLM)</strong> leaves over <strong>$4.30+</strong> completely unlocked to swap back and forth with USDC!
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">
                  Rule C — Never Type Your 12-Word Secret Phrase Anywhere:
                </strong>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  Keep your $5 safely inside your own wallet app on your phone. To track your live balance inside Symphony Markets, paste <strong>only your Public Receive Address</strong> (starts with <span className="font-mono">G...</span> for XLM or <span className="font-mono">r...</span> for XRP).
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Quick $5 Coin Comparison (Live Data)
            </div>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  onSelectSymbol('XLMUSDT');
                  onActivateFiveDollarPreset();
                }}
                className={`w-full p-3 text-left rounded-lg border transition-colors cursor-pointer ${
                  symbol === 'XLMUSDT'
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Stellar (XLM) — Best for $5 Test</span>
                  <span className="text-emerald-600 dark:text-emerald-400">~$0.41 Reserve</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  $5 buys ~12 XLM · Fee: $0.00005 · Leaves ~$4.35+ free to trade with USDC
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectSymbol('XRPUSDT');
                  onActivateFiveDollarPreset();
                }}
                className={`w-full p-3 text-left rounded-lg border transition-colors cursor-pointer ${
                  symbol === 'XRPUSDT'
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>XRP Ledger (XRP) — High Liquidity</span>
                  <span className="text-sky-600 dark:text-sky-400">1 XRP Reserve</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  $5 buys ~2 XRP · Fee: $0.00003 · 1 XRP stays as wallet base reserve
                </div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onJumpToWalletWatch}
                className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Watch My Public Wallet Address →
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Next: Step 2 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: READ THE CHART IN PLAIN ENGLISH */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Step 2: What the {coinName} Chart Below Is Saying Right Now (In Plain English)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You don’t need to memorize 50 indicators. Look at the candlestick chart right below this box—it only shows three simple things:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  1. Green & Red Bars
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Green means buyers pushed price higher during that time block. Red means sellers pushed it lower.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-sky-600 dark:text-sky-400">
                  2. Blue & Purple Trend Lines
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  The smooth lines show the average price. When the blue line (EMA 20) stays above the purple line (SMA 50), the overall tide is rising.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-amber-600 dark:text-amber-400">
                  3. Colored Horizontal Zones
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Fibonacci bands mark "ceiling" (0%) and "discount pullback" (50%–61.8%) zones so you can see if price is high or on sale.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Live Translation of {coinName} (${livePrice.toFixed(decimals)})
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {liveReading.candleStory}
            </p>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Tip: Click any single bar on the candlestick chart below to read what that specific candle shape means!
            </div>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Next: Step 3 (Check Buy Zone) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CHECK WHETHER NOW IS A WISE ENTRY OR CHASING */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Step 3: Wise Choice Habit #1 — Never Buy Right at the Ceiling
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              When a coin suddenly shoots up with huge green candles, human emotion says <em>"Buy now before I miss out!"</em> In real markets, buying at the ceiling means buying from earlier traders who are cashing out. Wise traders check <strong>where price sits between its recent Floor (0%) and Ceiling (100%)</strong>:
            </p>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  Current {coinName} Position in Recent Range:
                </span>
                <span className={`font-semibold ${liveReading.zoneTone}`}>
                  {liveReading.zoneStatus} ({liveReading.rangePositionPct.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-transform duration-200 origin-left"
                  style={{ width: `${liveReading.rangePositionPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>0% Recent Floor</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  35%–55% Calm Pullback Sweet Spot
                </span>
                <span>100% Recent Ceiling</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Plain-English Readout Right Now
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {liveReading.wiseVerdict}
            </p>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
              Fibonacci 61.8% "Sale" Level: <strong>${fiveDollarPlan.fib618.toFixed(decimals)}</strong>
            </div>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Next: Step 4 ($5 Safety Math) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: YOUR EXACT $5 WALLET PLAN (THE 10-CENT RULE) */}
      {step === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Step 4: The "10-Cent Safety Net" on Your ${fiveDollarPlan.budget.toFixed(2)} Budget
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Even when you buy <strong>${fiveDollarPlan.cashUsedUsd.toFixed(2)}</strong> worth of {coinName} in your real wallet, you do <strong>not</strong> risk losing all $5! By picking your "Safety Exit" price before you buy, a wrong guess only costs pennies—teaching you the exact habit professionals use with $50,000:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono tabular-nums">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-sans text-slate-500 dark:text-slate-400">1. Buy Entry Price</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  ${fiveDollarPlan.safeEntry.toFixed(decimals)}
                </div>
                <div className="font-sans text-[11px] text-slate-500 mt-0.5">
                  Buy ~{fiveDollarPlan.actualSpotUnits.toFixed(2)} {coinName} (${fiveDollarPlan.cashUsedUsd.toFixed(2)})
                </div>
              </div>

              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                <div className="font-sans text-rose-600 dark:text-rose-400">
                  2. Safety Exit (If Wrong)
                </div>
                <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  ${stopLoss.toFixed(decimals)}
                </div>
                <div className="font-sans text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                  Loss: -${fiveDollarPlan.actualLossIfStopped.toFixed(2)} (Keep $
                  {(fiveDollarPlan.budget - fiveDollarPlan.actualLossIfStopped).toFixed(2)} safe!)
                </div>
              </div>

              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <div className="font-sans text-emerald-600 dark:text-emerald-400">
                  3. Profit Goal (1:{rrRatio} Target)
                </div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${takeProfit.toFixed(decimals)}
                </div>
                <div className="font-sans text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  Gain: +${fiveDollarPlan.actualGainIfTarget.toFixed(2)} (Wallet → $
                  {(fiveDollarPlan.budget + fiveDollarPlan.actualGainIfTarget).toFixed(2)})
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-950/60 space-y-2.5">
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Pre-Swap Wise Choice Checklist
            </div>
            {[
              { id: 'lowFeeChain', text: 'I am using a low-fee network (XLM or XRP, <1 cent fee).' },
              { id: 'spotOnly', text: 'I am buying 1x Spot coin (zero borrowed leverage).' },
              { id: 'notChasingSpike', text: 'I checked Step 3 and I am not FOMO-chasing a ceiling spike.' },
              {
                id: 'knowExitPrice',
                text: `I wrote down my Safety Exit ($${stopLoss.toFixed(decimals)}) & Profit Goal ($${takeProfit.toFixed(decimals)}).`,
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[item.id])}
                  onChange={() =>
                    setCheckedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  className="mt-0.5 accent-sky-600"
                />
                <span>{item.text}</span>
              </label>
            ))}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Next: Step 5 (Ask AI Mentor) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: INTERACTIVE AI PLAIN-ENGLISH TRADING MENTOR */}
      {step === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Step 5: Ask Your AI Plain-English Mentor
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              The AI Mentor reads the live {coinName} price (${livePrice.toFixed(decimals)}), latest candlestick pattern, and your ${accountBalance.toFixed(2)} plan right now—and explains anything you want in plain, jargon-free English:
            </p>

            <div className="space-y-1.5">
              {[
                `Is right now a wise time to test a $5 Spot buy on ${coinName}, or should I wait for a pullback?`,
                `Explain everything happening on the ${coinName} chart right now like I am brand new.`,
                `How do I execute this $5 ${coinName} plan safely inside a wallet like Trust Wallet without losing money to fees?`,
                `Why does risking 10 cents to make 20 cents matter if it's only $5?`,
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isAskingCoach}
                  onClick={() => askAiMentor(q)}
                  className="w-full p-2.5 text-left text-xs rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  “{q}”
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                askAiMentor(customQuestion);
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Or ask any question in your own words..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={isAskingCoach || !customQuestion.trim()}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isAskingCoach ? 'Thinking...' : 'Ask AI'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-950/60 min-h-[220px] flex flex-col justify-between gap-3">
            {coachError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
                {coachError}
              </div>
            )}

            {isAskingCoach ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                Reading live {coinName} candles and preparing your plain-English explanation...
              </div>
            ) : coachReply ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-semibold text-sky-600 dark:text-sky-400 mb-1">
                    AI Mentor Explanation
                  </div>
                  <p className="text-slate-800 dark:text-slate-100 leading-relaxed">
                    {coachReply.plainEnglishAnswer}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    What the Live {coinName} Chart Shows Right Now
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {coachReply.liveChartTranslation}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Your $5 Wise-Habit Takeaway
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {coachReply.fiveDollarActionTip}
                  </p>
                </div>

                {coachReply.jargonDecoded && coachReply.jargonDecoded.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {coachReply.jargonDecoded.slice(0, 4).map((j, i) => (
                      <div key={i} className="text-[11px] text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-900 dark:text-white">{j.term}:</strong>{' '}
                        {j.simpleMeaning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="font-semibold text-slate-700 dark:text-slate-200">
                  Click any question on the left (or type your own) to start!
                </div>
                <p className="max-w-md mx-auto leading-relaxed">
                  Your AI Mentor will translate the live {coinName} chart, candlesticks, and $5 safety numbers into clear everyday language before you test a real wallet swap.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
