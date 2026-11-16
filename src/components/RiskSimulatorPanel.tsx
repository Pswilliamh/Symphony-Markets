import React, { useMemo, useState } from 'react';
import {
  AssetSymbol,
  InstrumentType,
  PaperPosition,
  TradeSide,
} from '../types/market';

interface RiskSimulatorPanelProps {
  symbol: AssetSymbol;
  livePrice: number;
  atr14: number;
  accountBalance: number;
  onAccountBalanceChange: (val: number) => void;
  entryPrice: number;
  onEntryPriceChange: (val: number) => void;
  stopDistancePct: number;
  onStopDistancePctChange: (val: number) => void;
  riskPercent: number;
  onRiskPercentChange: (val: number) => void;
  rrRatio: number;
  onRrRatioChange: (val: number) => void;
  tradeSide: TradeSide;
  onTradeSideChange: (side: TradeSide) => void;
  instrument: InstrumentType;
  onInstrumentChange: (inst: InstrumentType) => void;
  leverage: number;
  onLeverageChange: (lev: number) => void;
  onOpenPaperPosition: (pos: Omit<PaperPosition, 'id' | 'openedAt' | 'status'>) => void;
}

export const RiskSimulatorPanel: React.FC<RiskSimulatorPanelProps> = ({
  symbol,
  livePrice,
  atr14,
  accountBalance,
  onAccountBalanceChange,
  entryPrice,
  onEntryPriceChange,
  stopDistancePct,
  onStopDistancePctChange,
  riskPercent,
  onRiskPercentChange,
  rrRatio,
  onRrRatioChange,
  tradeSide,
  onTradeSideChange,
  instrument,
  onInstrumentChange,
  leverage,
  onLeverageChange,
  onOpenPaperPosition,
}) => {
  const [optionPremiumPct, setOptionPremiumPct] = useState<number>(3.5);
  const baseAsset = symbol === 'BTCUSDT' ? 'BTC' : symbol === 'XRPUSDT' ? 'XRP' : 'XLM';
  const decimals = symbol === 'BTCUSDT' ? 2 : 4;

  const calculations = useMemo(() => {
    const safeEntry = entryPrice > 0 ? entryPrice : livePrice;
    const stopDistRatio = Math.max(0.002, stopDistancePct / 100);

    const stopLoss =
      tradeSide === 'long'
        ? safeEntry * (1 - stopDistRatio)
        : safeEntry * (1 + stopDistRatio);

    const takeProfit =
      tradeSide === 'long'
        ? safeEntry * (1 + stopDistRatio * rrRatio)
        : safeEntry * (1 - stopDistRatio * rrRatio);

    const riskAmountUsd = accountBalance * (riskPercent / 100);
    const rewardAmountUsd = riskAmountUsd * rrRatio;

    const perUnitPriceRisk = Math.max(Math.abs(safeEntry - stopLoss), 1e-6);
    const quantity = riskAmountUsd / perUnitPriceRisk;
    const notionalUsd = quantity * safeEntry;

    const effectiveLeverage = instrument === 'spot' ? 1 : leverage;
    const marginRequiredUsd =
      instrument === 'options'
        ? riskAmountUsd
        : notionalUsd / Math.max(1, effectiveLeverage);

    const maintenanceMarginUsd =
      instrument === 'futures' ? notionalUsd * 0.005 : 0;

    // Estimated liquidation price for isolated perpetual futures
    let liquidationPrice: number | null = null;
    if (instrument === 'futures' && effectiveLeverage > 1) {
      const liqMove = (1 / effectiveLeverage) * 0.92;
      liquidationPrice =
        tradeSide === 'long'
          ? Math.max(0.0001, safeEntry * (1 - liqMove))
          : safeEntry * (1 + liqMove);
    }

    // Check if stop-loss is safer than liquidation price
    const isStopBeyondLiquidation =
      liquidationPrice !== null &&
      ((tradeSide === 'long' && stopLoss <= liquidationPrice) ||
        (tradeSide === 'short' && stopLoss >= liquidationPrice));

    // Real-time simulated PnL if entered at entryPrice and marked at livePrice
    const liveDiff =
      tradeSide === 'long' ? livePrice - safeEntry : safeEntry - livePrice;
    const liveSimulatedPnlUsd = quantity * liveDiff;

    // Options educational metrics
    const optionBreakEvenPrice =
      tradeSide === 'long'
        ? safeEntry * (1 + optionPremiumPct / 100)
        : safeEntry * (1 - optionPremiumPct / 100);

    return {
      safeEntry,
      stopLoss,
      takeProfit,
      riskAmountUsd,
      rewardAmountUsd,
      quantity,
      notionalUsd,
      marginRequiredUsd,
      maintenanceMarginUsd,
      liquidationPrice,
      isStopBeyondLiquidation,
      liveSimulatedPnlUsd,
      optionBreakEvenPrice,
    };
  }, [
    entryPrice,
    livePrice,
    stopDistancePct,
    tradeSide,
    rrRatio,
    accountBalance,
    riskPercent,
    instrument,
    leverage,
    optionPremiumPct,
  ]);

  const handleApplyAtrStop = () => {
    if (livePrice <= 0 || atr14 <= 0) return;
    const atrPct = Math.min(12, Math.max(0.5, ((atr14 * 1.5) / livePrice) * 100));
    onStopDistancePctChange(Number(atrPct.toFixed(2)));
  };

  const handleSubmitPaperOrder = () => {
    onOpenPaperPosition({
      symbol,
      instrument,
      side: tradeSide,
      entryPrice: Number(calculations.safeEntry.toFixed(decimals)),
      stopLoss: Number(calculations.stopLoss.toFixed(decimals)),
      takeProfit: Number(calculations.takeProfit.toFixed(decimals)),
      quantity: Number(calculations.quantity.toFixed(symbol === 'BTCUSDT' ? 6 : 2)),
      notionalUsd: Number(calculations.notionalUsd.toFixed(2)),
      marginRequiredUsd: Number(calculations.marginRequiredUsd.toFixed(2)),
      leverage: instrument === 'spot' ? 1 : leverage,
      liquidationPrice: calculations.liquidationPrice
        ? Number(calculations.liquidationPrice.toFixed(decimals))
        : null,
      riskAmountUsd: Number(calculations.riskAmountUsd.toFixed(2)),
      riskPercent,
      rewardAmountUsd: Number(calculations.rewardAmountUsd.toFixed(2)),
      rrRatio,
    });
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Risk Manager & Position Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            2% Account Risk Threshold · 1:{rrRatio} Risk-Reward Ratio · Paper Simulator
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onRiskPercentChange(2.0);
            onRrRatioChange(2);
            onEntryPriceChange(Number(livePrice.toFixed(decimals)));
          }}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Reset to 2% / 1:2
        </button>
      </div>

      {/* Instrument & Side Segmented Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Instrument Structure
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            {(['spot', 'futures', 'options'] as InstrumentType[]).map((inst) => (
              <button
                key={inst}
                type="button"
                onClick={() => onInstrumentChange(inst)}
                className={`py-1.5 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap shrink-0 ${
                  instrument === inst
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {inst}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Directional Bias
          </label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onTradeSideChange('long')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                tradeSide === 'long'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {instrument === 'options' ? 'Long Call (Bull)' : 'Long (Buy)'}
            </button>
            <button
              type="button"
              onClick={() => onTradeSideChange('short')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                tradeSide === 'short'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {instrument === 'options' ? 'Long Put (Bear)' : 'Short (Sell)'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Balance & Entry Price Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="sim-account-balance"
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Wallet / Account Budget ($)
            </label>
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  onAccountBalanceChange(5);
                  onInstrumentChange('spot');
                  onLeverageChange(1);
                }}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                $5 Wallet
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={() => onAccountBalanceChange(100)}
                className="font-medium text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                $100
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={() => onAccountBalanceChange(10000)}
                className="font-medium text-slate-500 dark:text-slate-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                $10k
              </button>
            </div>
          </div>
          <input
            id="sim-account-balance"
            type="number"
            min={1}
            step="any"
            value={accountBalance}
            onChange={(e) => onAccountBalanceChange(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="sim-entry-price"
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Planned Entry Price ($)
            </label>
            <button
              type="button"
              onClick={() => onEntryPriceChange(Number(livePrice.toFixed(decimals)))}
              className="text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
            >
              Use Live (${livePrice.toFixed(decimals)})
            </button>
          </div>
          <input
            id="sim-entry-price"
            type="number"
            step="0.0001"
            value={entryPrice}
            onChange={(e) => onEntryPriceChange(Math.max(0.0001, Number(e.target.value)))}
            className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Sliders: Account Risk % & Stop-Loss Distance % */}
      <div className="space-y-4 pt-1">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Account Risk Threshold:{' '}
              <strong className="font-mono tabular-nums text-sky-600 dark:text-sky-400">
                {riskPercent.toFixed(1)}%
              </strong>
            </span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Max Loss: -${calculations.riskAmountUsd.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={5.0}
            step={0.5}
            value={riskPercent}
            onChange={(e) => onRiskPercentChange(Number(e.target.value))}
            aria-label="Account Risk Threshold Percentage"
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            <span>0.5% Conservative</span>
            <span className="text-sky-500 font-medium">2.0% Standard Cap</span>
            <span>5.0% High Risk</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Stop-Loss Distance:{' '}
              <strong className="font-mono tabular-nums text-rose-500">
                {stopDistancePct.toFixed(2)}%
              </strong>
            </span>
            <button
              type="button"
              onClick={handleApplyAtrStop}
              className="text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
            >
              Set 1.5x ATR (${(atr14 * 1.5).toFixed(4)})
            </button>
          </div>
          <input
            type="range"
            min={0.5}
            max={10.0}
            step={0.25}
            value={stopDistancePct}
            onChange={(e) => onStopDistancePctChange(Number(e.target.value))}
            aria-label="Stop-Loss Distance Percentage"
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Risk-Reward Ratio Selector */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Risk-Reward Target Ratio
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            {[1.5, 2, 3].map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => onRrRatioChange(ratio)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  rrRatio === ratio
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                1:{ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Futures Leverage or Options Premium Controls */}
        {instrument === 'futures' && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Perpetual Futures Leverage:{' '}
                <strong className="font-mono text-amber-500">{leverage}x</strong>
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                Init Margin: ${calculations.marginRequiredUsd.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={leverage}
              onChange={(e) => onLeverageChange(Number(e.target.value))}
              aria-label="Futures Leverage Multiplier"
              className="w-full accent-amber-500 cursor-pointer"
            />
            {calculations.isStopBeyondLiquidation && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                Warning: At {leverage}x leverage, estimated liquidation ($
                {calculations.liquidationPrice?.toFixed(decimals)}) triggers before your stop-loss ($
                {calculations.stopLoss.toFixed(decimals)}). Reduce leverage or tighten stop distance.
              </p>
            )}
          </div>
        )}

        {instrument === 'options' && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Option Contract Premium (% of Spot):{' '}
                <strong className="font-mono text-sky-500">{optionPremiumPct.toFixed(1)}%</strong>
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                Breakeven: ${calculations.optionBreakEvenPrice.toFixed(decimals)}
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={10.0}
              step={0.5}
              value={optionPremiumPct}
              onChange={(e) => setOptionPremiumPct(Number(e.target.value))}
              aria-label="Option Premium Percentage"
              className="w-full accent-sky-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Long options cap maximum loss to the premium paid (${calculations.riskAmountUsd.toFixed(2)}) without margin liquidation risk, but require price to pass ${calculations.optionBreakEvenPrice.toFixed(decimals)} before expiry.
            </p>
          </div>
        )}
      </div>

      {/* Real-Time Calculated Position & PnL Grid */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Stop-Loss Level ({riskPercent.toFixed(1)}% Risk)
            </div>
            <div className="text-sm font-mono font-semibold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
              ${calculations.stopLoss.toFixed(decimals)}
            </div>
            <div className="text-xs font-mono text-rose-600/80 dark:text-rose-400/80 tabular-nums">
              Potential Loss: -${calculations.riskAmountUsd.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Take-Profit Target (1:{rrRatio} R:R)
            </div>
            <div className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              ${calculations.takeProfit.toFixed(decimals)}
            </div>
            <div className="text-xs font-mono text-emerald-600/80 dark:text-emerald-400/80 tabular-nums">
              Potential Profit: +${calculations.rewardAmountUsd.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Sizing Telemetry Rows */}
        <div className="space-y-1.5 text-xs font-mono tabular-nums pt-1">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/70">
            <span className="font-sans text-slate-500 dark:text-slate-400">
              Position Size ({baseAsset} Units)
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {calculations.quantity.toLocaleString(undefined, {
                maximumFractionDigits: symbol === 'BTCUSDT' ? 6 : 2,
              })}{' '}
              {baseAsset}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/70">
            <span className="font-sans text-slate-500 dark:text-slate-400">
              Total Notional Exposure
            </span>
            <span className="text-slate-800 dark:text-slate-200">
              ${calculations.notionalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/70">
            <span className="font-sans text-slate-500 dark:text-slate-400">
              Required Margin ({instrument === 'spot' ? '1x Spot' : `${leverage}x`})
            </span>
            <span className="text-slate-800 dark:text-slate-200">
              ${calculations.marginRequiredUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {calculations.liquidationPrice !== null && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/70">
              <span className="font-sans text-slate-500 dark:text-slate-400">
                Est. Futures Liquidation Price
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                ${calculations.liquidationPrice.toFixed(decimals)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-1">
            <span className="font-sans text-slate-500 dark:text-slate-400">
              Mark-to-Market vs. Live Price (${livePrice.toFixed(decimals)})
            </span>
            <span
              className={
                calculations.liveSimulatedPnlUsd >= 0
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-rose-600 dark:text-rose-400 font-semibold'
              }
            >
              {calculations.liveSimulatedPnlUsd >= 0 ? '+' : ''}$
              {calculations.liveSimulatedPnlUsd.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmitPaperOrder}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Log Simulated {tradeSide === 'long' ? 'Long' : 'Short'} Position ({baseAsset})
        </button>
      </div>
    </div>
  );
};
