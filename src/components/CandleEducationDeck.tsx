import React, { useMemo, useState } from 'react';
import { CANDLE_PATTERNS } from '../services/marketData';
import {
  AssetSymbol,
  Candle,
  CandlePatternInfo,
  CandlePatternType,
  FibonacciLevel,
} from '../types/market';

interface CandleEducationDeckProps {
  symbol: AssetSymbol;
  candles: Candle[];
  selectedCandleIndex: number | null;
  onSelectCandle: (index: number) => void;
  fibLevels: FibonacciLevel[];
  livePrice: number;
  onUsePriceAsEntry: (price: number) => void;
}

export const CandleEducationDeck: React.FC<CandleEducationDeckProps> = ({
  symbol,
  candles,
  selectedCandleIndex,
  onSelectCandle,
  fibLevels,
  livePrice,
  onUsePriceAsEntry,
}) => {
  const [activeTab, setActiveTab] = useState<'patterns' | 'fibonacci'>('patterns');
  const [manualPatternId, setManualPatternId] = useState<CandlePatternType | null>(null);

  const recentDetections = useMemo(() => {
    const items: Array<{ index: number; candle: Candle; pattern: CandlePatternInfo }> = [];
    for (let i = candles.length - 1; i >= 0; i--) {
      const p = candles[i].detectedPattern;
      if (p) {
        items.push({ index: i, candle: candles[i], pattern: p });
      }
      if (items.length >= 8) break;
    }
    return items;
  }, [candles]);

  const activePattern: CandlePatternInfo = useMemo(() => {
    if (manualPatternId) {
      return CANDLE_PATTERNS[manualPatternId];
    }
    if (selectedCandleIndex !== null && candles[selectedCandleIndex]?.detectedPattern) {
      return candles[selectedCandleIndex].detectedPattern!;
    }
    if (recentDetections.length > 0) {
      return recentDetections[0].pattern;
    }
    return CANDLE_PATTERNS.bullish_engulfing;
  }, [manualPatternId, selectedCandleIndex, candles, recentDetections]);

  const decimals = 4;

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col gap-5">
      {/* Header & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Candlestick Anatomy & Fibonacci Retracement Guide
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive pattern recognition and standard technical retracement zones for {symbol}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('patterns')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'patterns'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Candlestick Patterns ({recentDetections.length} Detected)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fibonacci')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'fibonacci'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fibonacci Price Levels
          </button>
        </div>
      </div>

      {activeTab === 'patterns' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Live Detected Candles & Encyclopedia Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Recent Formations Detected on {symbol}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {recentDetections.length === 0 ? (
                  <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
                    No multi-candle patterns detected in current window. Select any pattern below to study its structure.
                  </div>
                ) : (
                  recentDetections.slice(0, 5).map(({ index, candle, pattern }) => {
                    const isSelected = selectedCandleIndex === index && !manualPatternId;
                    return (
                      <button
                        key={candle.time}
                        type="button"
                        onClick={() => {
                          setManualPatternId(null);
                          onSelectCandle(index);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors ${
                          isSelected
                            ? 'bg-sky-500/10 text-slate-900 dark:text-white'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{pattern.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            {new Date(candle.time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            · Close ${candle.close.toFixed(decimals)}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            pattern.bias === 'Bullish'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : pattern.bias === 'Bearish'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {pattern.bias}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pattern Reference Library */}
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                All Core Candlestick Formations
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(CANDLE_PATTERNS).map((pat) => {
                  const isCurrent = activePattern.id === pat.id;
                  return (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => setManualPatternId(pat.id)}
                      className={`px-3 py-2 text-left text-xs rounded-lg border transition-colors whitespace-nowrap truncate ${
                        isCurrent
                          ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {pat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Detailed Educational Breakdown */}
          <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/60 dark:bg-slate-950/60 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Selected Candlestick Formation
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {activePattern.name}
                  </h3>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Sentiment Signal:{' '}
                  <strong
                    className={
                      activePattern.bias === 'Bullish'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : activePattern.bias === 'Bearish'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }
                  >
                    {activePattern.bias}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                    1. What It Is (Visual Structure)
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {activePattern.whatItIs}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                    2. What It Does (Order Book Mechanics)
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {activePattern.whatItDoes}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                    3. Market Sentiment & Trend Context
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {activePattern.sentimentMeaning}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                    4. Risk Management & Confirmation Rule
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {activePattern.confirmationTip}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Educational Note: Candlestick patterns reflect recent buyer/seller balance and should always be paired with strict stop-loss sizing.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Fibonacci Retracement Color-Coded Table */
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Standard Fibonacci retracement ratios (<span className="font-mono">23.6%</span>,{' '}
            <span className="font-mono">38.2%</span>, <span className="font-mono">50.0%</span>,{' '}
            <span className="font-mono">61.8%</span>, <span className="font-mono">78.6%</span>) divide the recent swing range into color-coded visual price zones to help identify potential support and resistance areas. Click any level below to test it as your Planned Entry Price in the Risk Simulator.
          </p>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-medium">Visual Band & Ratio</th>
                  <th className="py-2.5 px-3 font-medium">Zone Classification</th>
                  <th className="py-2.5 px-3 font-medium text-right">Level Price</th>
                  <th className="py-2.5 px-3 font-medium text-right">Distance vs. Live</th>
                  <th className="py-2.5 px-3 font-medium">Technical Meaning</th>
                  <th className="py-2.5 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {fibLevels.map((lvl) => {
                  const distPct = ((lvl.price - livePrice) / Math.max(livePrice, 1e-8)) * 100;
                  return (
                    <tr
                      key={lvl.label}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-medium whitespace-nowrap">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-xs mr-2 align-middle"
                          style={{ backgroundColor: lvl.colorHex }}
                        />
                        {lvl.label}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {lvl.zoneName}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        ${lvl.price.toFixed(decimals)}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono tabular-nums text-right whitespace-nowrap ${
                          distPct >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {distPct >= 0 ? '+' : ''}
                        {distPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-md">
                        {lvl.educationalNote}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onUsePriceAsEntry(Number(lvl.price.toFixed(decimals)))}
                          className="px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-md transition-colors whitespace-nowrap shrink-0"
                        >
                          Use as Entry
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
