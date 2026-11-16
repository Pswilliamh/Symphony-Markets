/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { CandleEducationDeck } from './components/CandleEducationDeck';
import { CandlestickChart } from './components/CandlestickChart';
import { CandlestickSymphonyComposer } from './components/CandlestickSymphonyComposer';
import { DayTraderSkillSuite } from './components/DayTraderSkillSuite';
import { DecentralizedAiDexDesk } from './components/DecentralizedAiDexDesk';
import { LandingPageView, PublicPageTab } from './components/LandingPageView';
import { LiveAiSignalHelper } from './components/LiveAiSignalHelper';
import { MarketCyclesEducationModule } from './components/MarketCyclesEducationModule';
import { PortfolioAndToolsSection } from './components/PortfolioAndToolsSection';
import { RiskSimulatorPanel } from './components/RiskSimulatorPanel';
import { StartHereRoadmap } from './components/StartHereRoadmap';
import { SymphonyCandlestickBackdrop, SymphonyHarpLogo } from './components/SymphonyHarpLogo';
import { TenSetAutoTraderLab } from './components/TenSetAutoTraderLab';
import {
  calculateFibonacciLevels,
  enrichCandlesWithIndicators,
  fetchMarketData,
} from './services/marketData';
import {
  AssetSymbol,
  BotStrategyConfig,
  Candle,
  InstrumentType,
  MarketStats,
  PaperPosition,
  PriceAlert,
  Timeframe,
  TradeSide,
  WatchedWallet,
} from './types/market';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [publicPage, setPublicPage] = useState<PublicPageTab>('welcome');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [symbol, setSymbol] = useState<AssetSymbol>('XRPUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');

  // Market State for XRP and XLM
  const [candlesBySymbol, setCandlesBySymbol] = useState<Record<AssetSymbol, Candle[]>>({
    XRPUSDT: [],
    XLMUSDT: [],
  });
  const [statsBySymbol, setStatsBySymbol] = useState<Record<AssetSymbol, MarketStats | null>>({
    XRPUSDT: null,
    XLMUSDT: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Chart Overlay Toggles & Candle Selection
  const [selectedCandleIndex, setSelectedCandleIndex] = useState<number | null>(null);
  const [showFibOverlay, setShowFibOverlay] = useState<boolean>(true);
  const [showTrendBands, setShowTrendBands] = useState<boolean>(true);
  const [showRiskOverlay, setShowRiskOverlay] = useState<boolean>(true);

  // Risk Manager Simulator Parameters ($5 1x Spot Wallet default for guided learning)
  const [accountBalance, setAccountBalance] = useState<number>(5);
  const [entryPrice, setEntryPrice] = useState<number>(2.42);
  const [stopDistancePct, setStopDistancePct] = useState<number>(2.0);
  const [riskPercent, setRiskPercent] = useState<number>(2.0);
  const [rrRatio, setRrRatio] = useState<number>(2);
  const [tradeSide, setTradeSide] = useState<TradeSide>('long');
  const [instrument, setInstrument] = useState<InstrumentType>('spot');
  const [leverage, setLeverage] = useState<number>(1);
  const [beginnerFocusMode, setBeginnerFocusMode] = useState<boolean>(false);

  // Bottom Workspace Section Tab
  const [activeBottomTab, setActiveBottomTab] = useState<
    'portfolio' | 'wallets' | 'bot_sandbox' | 'alerts'
  >('portfolio');

  // Paper Positions State
  const [positions, setPositions] = useState<PaperPosition[]>([
    {
      id: 'pos_initial_xrp',
      symbol: 'XRPUSDT',
      instrument: 'futures',
      side: 'long',
      entryPrice: 2.385,
      stopLoss: 2.3254,
      takeProfit: 2.5042,
      quantity: 3355.7,
      notionalUsd: 8003.34,
      marginRequiredUsd: 1600.67,
      leverage: 5,
      liquidationPrice: 1.9462,
      riskAmountUsd: 200.0,
      riskPercent: 2.0,
      rewardAmountUsd: 400.0,
      rrRatio: 2,
      openedAt: '08:30 AM',
      status: 'open',
    },
    {
      id: 'pos_initial_xlm',
      symbol: 'XLMUSDT',
      instrument: 'spot',
      side: 'long',
      entryPrice: 0.402,
      stopLoss: 0.3919,
      takeProfit: 0.4222,
      quantity: 19801.98,
      notionalUsd: 7960.39,
      marginRequiredUsd: 7960.39,
      leverage: 1,
      liquidationPrice: null,
      riskAmountUsd: 200.0,
      riskPercent: 2.0,
      rewardAmountUsd: 400.0,
      rrRatio: 2,
      openedAt: 'Yesterday',
      status: 'closed',
      exitPrice: 0.4215,
      realizedPnlUsd: 386.14,
      closeReason: '1:2 Target Hit',
    },
  ]);

  // Read-Only Public Wallets State
  const [watchedWallets, setWatchedWallets] = useState<WatchedWallet[]>([
    {
      id: 'wal_1',
      label: 'Trust Wallet Cold Reserve (Read-Only)',
      network: 'XRPL',
      address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
      xrpBalance: 4250,
      xlmBalance: 0,
      usdtBalance: 1500,
      lastSynced: 'Live Sync',
      isLiveChain: false,
    },
    {
      id: 'wal_2',
      label: 'Stellar DEX Liquidity Watch',
      network: 'Stellar',
      address: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
      xrpBalance: 0,
      xlmBalance: 12800,
      usdtBalance: 850,
      lastSynced: 'Live Sync',
      isLiveChain: false,
    },
  ]);

  // Strategy Bot Sandbox State
  const [botStrategies, setBotStrategies] = useState<BotStrategyConfig[]>([
    {
      id: 'bot_fib_xrp',
      name: 'XRP Fibonacci 61.8% Pullback + 2% Risk Sizing',
      symbol: 'XRPUSDT',
      active: true,
      entryTrigger: 'fib_618_pullback',
      riskPerTradePct: 2.0,
      rrTarget: 2,
      leverage: 3,
      exchangeSandbox: 'Binance Paper API',
      twoFactorVerified: true,
      simulatedTradesCount: 18,
      winRatePct: 61.1,
      netPnlUsd: 840.5,
    },
    {
      id: 'bot_ema_xlm',
      name: 'XLM EMA 20/50 Trend + Bullish Engulfing Filter',
      symbol: 'XLMUSDT',
      active: true,
      entryTrigger: 'bullish_engulfing_reversal',
      riskPerTradePct: 2.0,
      rrTarget: 2,
      leverage: 2,
      exchangeSandbox: 'Stellar SDEX Sandbox',
      twoFactorVerified: true,
      simulatedTradesCount: 14,
      winRatePct: 57.1,
      netPnlUsd: 520.2,
    },
  ]);

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'al_1',
      symbol: 'XRPUSDT',
      condition: 'above',
      targetPrice: 2.52,
      note: 'XRP upper swing resistance test',
      triggered: false,
    },
    {
      id: 'al_2',
      symbol: 'XLMUSDT',
      condition: 'below',
      targetPrice: 0.398,
      note: 'XLM Fibonacci 61.8% retracement support zone',
      triggered: false,
    },
  ]);

  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Sync Dark Mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch initial market data for both XRPUSDT and XLMUSDT
  useEffect(() => {
    let cancelled = false;
    async function loadBoth() {
      setIsLoading(true);
      const [xrpData, xlmData] = await Promise.all([
        fetchMarketData('XRPUSDT', timeframe),
        fetchMarketData('XLMUSDT', timeframe),
      ]);
      if (cancelled) return;

      setCandlesBySymbol({
        XRPUSDT: xrpData.candles,
        XLMUSDT: xlmData.candles,
      });
      setStatsBySymbol({
        XRPUSDT: xrpData.stats,
        XLMUSDT: xlmData.stats,
      });

      const currentPrice = symbol === 'XRPUSDT' ? xrpData.stats.lastPrice : xlmData.stats.lastPrice;
      setEntryPrice(Number(currentPrice.toFixed(4)));
      setSelectedCandleIndex(xrpData.candles.length - 1);
      setIsLoading(false);
    }
    loadBoth();
    return () => {
      cancelled = true;
    };
  }, [timeframe]);

  // Live Real-Time Tick Stream Simulation / Polling Updater
  useEffect(() => {
    const interval = setInterval(() => {
      setCandlesBySymbol((prev) => {
        const next: Record<AssetSymbol, Candle[]> = { ...prev };
        (['XRPUSDT', 'XLMUSDT'] as AssetSymbol[]).forEach((sym) => {
          const list = prev[sym];
          if (!list || list.length === 0) return;
          const updated = [...list];
          const last = { ...updated[updated.length - 1] };
          const microDelta = (Math.random() - 0.492) * last.close * 0.0018;
          const newClose = Number(Math.max(0.01, last.close + microDelta).toFixed(4));
          last.close = newClose;
          last.high = Number(Math.max(last.high, newClose).toFixed(4));
          last.low = Number(Math.min(last.low, newClose).toFixed(4));
          last.volume = Math.round(last.volume + Math.random() * 18000);
          updated[updated.length - 1] = last;
          next[sym] = enrichCandlesWithIndicators(updated);
        });
        return next;
      });

      setStatsBySymbol((prevStats) => {
        const nextStats = { ...prevStats };
        (['XRPUSDT', 'XLMUSDT'] as AssetSymbol[]).forEach((sym) => {
          const st = prevStats[sym];
          const list = candlesBySymbol[sym];
          if (!st || !list || list.length === 0) return;
          const latestClose = list[list.length - 1].close;
          nextStats[sym] = {
            ...st,
            lastPrice: latestClose,
            high24h: Math.max(st.high24h, latestClose),
            low24h: Math.min(st.low24h, latestClose),
          };
        });
        return nextStats;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [candlesBySymbol]);

  // Check Threshold Alerts against Live Prices
  useEffect(() => {
    const xrpNow = statsBySymbol.XRPUSDT?.lastPrice;
    const xlmNow = statsBySymbol.XLMUSDT?.lastPrice;
    if (!xrpNow || !xlmNow) return;

    setAlerts((prev) =>
      prev.map((al) => {
        if (al.triggered) return al;
        const price = al.symbol === 'XRPUSDT' ? xrpNow : xlmNow;
        const hit =
          (al.condition === 'above' && price >= al.targetPrice) ||
          (al.condition === 'below' && price <= al.targetPrice);
        if (hit) {
          const timeStr = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          setAlertBanner(
            `Alert Triggered: ${al.symbol} crossed ${al.condition} $${al.targetPrice.toFixed(
              4
            )} (${al.note})`
          );
          return { ...al, triggered: true, triggeredAt: timeStr };
        }
        return al;
      })
    );
  }, [statsBySymbol.XRPUSDT?.lastPrice, statsBySymbol.XLMUSDT?.lastPrice]);

  const activeCandles = candlesBySymbol[symbol] || [];
  const activeStats = statsBySymbol[symbol];
  const livePrice =
    activeCandles.length > 0
      ? activeCandles[activeCandles.length - 1].close
      : activeStats?.lastPrice || (symbol === 'XRPUSDT' ? 2.42 : 0.415);

  const fibLevels = useMemo(() => calculateFibonacciLevels(activeCandles), [activeCandles]);

  const stopDistRatio = Math.max(0.002, stopDistancePct / 100);
  const currentStopLoss =
    tradeSide === 'long' ? entryPrice * (1 - stopDistRatio) : entryPrice * (1 + stopDistRatio);
  const currentTakeProfit =
    tradeSide === 'long'
      ? entryPrice * (1 + stopDistRatio * rrRatio)
      : entryPrice * (1 - stopDistRatio * rrRatio);

  const handleSelectSymbol = (newSym: AssetSymbol) => {
    setSymbol(newSym);
    const list = candlesBySymbol[newSym];
    if (list && list.length > 0) {
      const latest = list[list.length - 1].close;
      setEntryPrice(Number(latest.toFixed(4)));
      setSelectedCandleIndex(list.length - 1);
    }
  };

  const handleOpenPaperPosition = (
    newPos: Omit<PaperPosition, 'id' | 'openedAt' | 'status'>
  ) => {
    const created: PaperPosition = {
      ...newPos,
      id: `pos_${Date.now()}`,
      openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'open',
    };
    setPositions((prev) => [created, ...prev]);
    setActiveBottomTab('portfolio');
    setAlertBanner(
      `Logged Simulated ${created.side.toUpperCase()} Position: ${created.quantity.toLocaleString()} ${
        created.symbol === 'XRPUSDT' ? 'XRP' : 'XLM'
      } at $${created.entryPrice.toFixed(4)} (2% Risk Cap)`
    );
  };

  const handleClosePosition = (id: string, exitPrice: number) => {
    setPositions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const diff = p.side === 'long' ? exitPrice - p.entryPrice : p.entryPrice - exitPrice;
        const realizedPnlUsd = Number((diff * p.quantity).toFixed(2));
        return {
          ...p,
          status: 'closed',
          exitPrice,
          realizedPnlUsd,
          closeReason: 'Market Close',
        };
      })
    );
  };

  const handleToggleBot = (id: string) => {
    setBotStrategies((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const handleRunBotBacktest = (id: string) => {
    setBotStrategies((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const deltaTrades = 3;
        const addedPnl = Number(((Math.random() * 1.4 - 0.25) * 180).toFixed(2));
        return {
          ...b,
          simulatedTradesCount: b.simulatedTradesCount + deltaTrades,
          netPnlUsd: Number((b.netPnlUsd + addedPnl).toFixed(2)),
          winRatePct: Math.min(78, Math.max(48, b.winRatePct + (addedPnl >= 0 ? 1.2 : -1.1))),
        };
      })
    );
    setAlertBanner('Completed 10-bar historical candle simulation with 2% position sizing.');
  };

  const xrpLive =
    candlesBySymbol.XRPUSDT.length > 0
      ? candlesBySymbol.XRPUSDT[candlesBySymbol.XRPUSDT.length - 1].close
      : statsBySymbol.XRPUSDT?.lastPrice ?? 2.42;
  const xlmLive =
    candlesBySymbol.XLMUSDT.length > 0
      ? candlesBySymbol.XLMUSDT[candlesBySymbol.XLMUSDT.length - 1].close
      : statsBySymbol.XLMUSDT?.lastPrice ?? 0.415;

  const navigatePublicPage = (page: PublicPageTab) => {
    setPublicPage(page);
    setViewMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterApp = (targetSectionId?: string) => {
    if (targetSectionId === 'skill-desk' || targetSectionId === 'ai-dex-lab') {
      setBeginnerFocusMode(false);
    }
    setViewMode('app');
    setTimeout(() => {
      if (targetSectionId) {
        document.getElementById(targetSectionId)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  const isSingleStageWelcome = viewMode === 'landing' && publicPage === 'welcome';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Zone 1: Brand Emblem + Wordmark with warm background highlight & faded animated candlesticks */}
        <a
          href="#welcome"
          onClick={(e) => {
            e.preventDefault();
            navigatePublicPage('welcome');
          }}
          className="relative overflow-hidden inline-flex items-center gap-2.5 font-editorial text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white pl-2 pr-3.5 py-1 rounded-xl bg-gradient-to-r from-amber-200/80 via-sky-100/95 to-amber-100/80 dark:from-sky-500/25 dark:via-amber-400/20 dark:to-sky-500/20 border border-amber-300/60 dark:border-sky-400/30 whitespace-nowrap shrink-0"
        >
          <SymphonyCandlestickBackdrop className="opacity-25 dark:opacity-35" />
          <SymphonyHarpLogo variant="emblem" className="relative z-10 w-8 h-8 sm:w-9 sm:h-9" />
          <span className="relative z-10">Symphony Markets</span>
        </a>

        {/* Zone 2: Standalone Page Menu Items (6 concise single-line links) */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => navigatePublicPage('symphony')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'landing' && publicPage === 'symphony'
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ♪ Symphony Music
          </button>
          <button
            type="button"
            onClick={() => navigatePublicPage('cycles')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'landing' && publicPage === 'cycles'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Market Cycles
          </button>
          <button
            type="button"
            onClick={() => navigatePublicPage('ksbc')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'landing' && publicPage === 'ksbc'
                ? 'text-amber-700 dark:text-amber-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            KSBC Gold
          </button>
          <button
            type="button"
            onClick={() => navigatePublicPage('guide')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'landing' && publicPage === 'guide'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Free Ebook
          </button>
          <button
            type="button"
            onClick={() => navigatePublicPage('podcast')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'landing' && publicPage === 'podcast'
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Podcast
          </button>
          <button
            type="button"
            onClick={() => navigatePublicPage('story')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'landing' && publicPage === 'story'
                ? 'text-sky-600 dark:text-sky-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Our Story
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {viewMode === 'landing' ? (
            <button
              type="button"
              onClick={() => handleEnterApp()}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Enter Training App
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {darkMode ? 'Switch to Light UI' : 'Switch to Dark UI'}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Compact Page Switcher (visible only below md breakpoint) */}
      <nav className="md:hidden flex items-center gap-4 overflow-x-auto px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-400">
        <button
          type="button"
          onClick={() => navigatePublicPage('welcome')}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'landing' && publicPage === 'welcome'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : ''
          }`}
        >
          Welcome
        </button>
        <button
          type="button"
          onClick={() => navigatePublicPage('symphony')}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'landing' && publicPage === 'symphony'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : ''
          }`}
        >
          ♪ Symphony Music
        </button>
        <button
          type="button"
          onClick={() => navigatePublicPage('cycles')}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'landing' && publicPage === 'cycles'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : ''
          }`}
        >
          Market Cycles
        </button>
        <button
          type="button"
          onClick={() => navigatePublicPage('features')}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'landing' && publicPage === 'features'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : ''
          }`}
        >
          Features
        </button>
        <button
          type="button"
          onClick={() => navigatePublicPage('ksbc')}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'landing' && publicPage === 'ksbc'
              ? 'text-amber-700 dark:text-amber-400 font-semibold'
              : ''
          }`}
        >
          KSBC Gold
        </button>
        <button
          type="button"
          onClick={() => navigatePublicPage('podcast')}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'landing' && publicPage === 'podcast'
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : ''
          }`}
        >
          Podcast
        </button>
        <button
          type="button"
          onClick={() => navigatePublicPage('story')}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'landing' && publicPage === 'story'
              ? 'text-sky-600 dark:text-sky-400 font-semibold'
              : ''
          }`}
        >
          Our Story
        </button>
        <button
          type="button"
          onClick={() => navigatePublicPage('guide')}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'landing' && publicPage === 'guide'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : ''
          }`}
        >
          Free Ebook
        </button>
        <button
          type="button"
          onClick={() => handleEnterApp()}
          className={`whitespace-nowrap shrink-0 cursor-pointer ${
            viewMode === 'app' ? 'text-sky-600 dark:text-sky-400 font-semibold' : ''
          }`}
        >
          Training App
        </button>
      </nav>

      {/* Alert Notification Toast Bar */}
      {alertBanner && viewMode === 'app' && (
        <div className="bg-sky-500/10 border-b border-sky-500/30 px-6 py-2.5 flex items-center justify-between gap-4 text-xs">
          <span className="font-medium text-sky-700 dark:text-sky-300">{alertBanner}</span>
          <button
            type="button"
            onClick={() => setAlertBanner(null)}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium whitespace-nowrap shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {viewMode === 'landing' ? (
        <main className="flex-1 flex flex-col">
          <LandingPageView
            activePage={publicPage}
            onNavigatePage={navigatePublicPage}
            onEnterApp={handleEnterApp}
            xrpLivePrice={xrpLive}
            xlmLivePrice={xlmLive}
            symbol={symbol}
            onSelectSymbol={handleSelectSymbol}
            candles={activeCandles}
          />
        </main>
      ) : (
        /* Main Training Workspace Container (1440px max-w) */
        <main id="workspace" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
          {/* Quick In-App Jump Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-slate-900 dark:text-white">Workspace Jump:</span>
              <a href="#start-here" className="hover:text-sky-600 dark:hover:text-sky-400 whitespace-nowrap">
                1. $5 Start Here Roadmap
              </a>
              <a href="#ai-buy-sell-helper" className="text-amber-700 dark:text-amber-400 font-bold hover:underline whitespace-nowrap">
                ★ AI Buy & Sell Helper
              </a>
              <a href="#ten-set-auto-trader" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline whitespace-nowrap">
                ⚡ 10-Set Auto-Trader (Trust Wallet)
              </a>
              <a href="#risk-chart" className="hover:text-sky-600 dark:hover:text-sky-400 whitespace-nowrap">
                2. Live Chart & 2% Risk Simulator
              </a>
              <a href="#market-symphony" className="text-amber-700 dark:text-amber-400 font-semibold hover:underline whitespace-nowrap">
                ♪ 8-Hour Music Graph
              </a>
              {!beginnerFocusMode && (
                <>
                  <a href="#skill-desk" className="hover:text-sky-600 dark:hover:text-sky-400 whitespace-nowrap">
                    3. 11-Module Skill Desk
                  </a>
                  <a href="#ai-dex-lab" className="hover:text-sky-600 dark:hover:text-sky-400 whitespace-nowrap">
                    4. 24/7 AI DEX Lab
                  </a>
                </>
              )}
              <a href="#candlestick-guide" className="hover:text-sky-600 dark:hover:text-sky-400 whitespace-nowrap">
                Candlestick Guide
              </a>
              <a href="#market-cycles" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline whitespace-nowrap">
                Bull vs. Bear & 4-Year Cycles
              </a>
              <a href="#portfolio-ledger" className="hover:text-sky-600 dark:hover:text-sky-400 whitespace-nowrap">
                Wallet Watch & Ledger
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigatePublicPage('guide')}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold whitespace-nowrap cursor-pointer"
              >
                Free Ebook (PDF & EPUB) →
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => navigatePublicPage('story')}
                className="text-sky-600 dark:text-sky-400 hover:underline font-medium whitespace-nowrap cursor-pointer"
              >
                Promo Video Library →
              </button>
            </div>
          </div>

          {/* Start Here: 5-Step $5 Real-Wallet Guided Training Module & AI Mentor */}
          <section id="start-here">
          <StartHereRoadmap
            symbol={symbol}
            onSelectSymbol={handleSelectSymbol}
            candles={activeCandles}
            fibLevels={fibLevels}
            livePrice={livePrice}
            accountBalance={accountBalance}
            entryPrice={entryPrice}
            stopLoss={currentStopLoss}
            takeProfit={currentTakeProfit}
            riskPercent={riskPercent}
            rrRatio={rrRatio}
            instrument={instrument}
            leverage={leverage}
            tradeSide={tradeSide}
            onActivateFiveDollarPreset={() => {
              setAccountBalance(5);
              setInstrument('spot');
              setLeverage(1);
              setRiskPercent(2.0);
              setStopDistancePct(2.0);
              setRrRatio(2);
              setTradeSide('long');
              setEntryPrice(Number(livePrice.toFixed(4)));
              setAlertBanner(
                'Activated $5 Real-Wallet Learning Preset: $5.00 Budget · 1x Spot (Zero Leverage) · 10-Cent Safety Exit'
              );
            }}
            onJumpToWalletWatch={() => {
              setActiveBottomTab('wallets');
              document.getElementById('portfolio-ledger')?.scrollIntoView({ behavior: 'smooth' });
            }}
            beginnerFocusMode={beginnerFocusMode}
            onToggleBeginnerFocusMode={() => setBeginnerFocusMode((v) => !v)}
          />
        </section>

        {/* Live AI Market Examiner: Recommended Buy, Stop-Loss & Sell Points (Use at Your Own Risk) */}
        <section id="ai-buy-sell-helper">
          <LiveAiSignalHelper
            symbol={symbol}
            onSelectSymbol={handleSelectSymbol}
            timeframe={timeframe}
            candles={activeCandles}
            stats={activeStats}
            fibLevels={fibLevels}
            livePrice={livePrice}
            xrpLivePrice={xrpLive}
            xlmLivePrice={xlmLive}
            accountBalance={accountBalance}
            riskPercent={riskPercent}
            onApplyRecommendationToChart={({ entryPrice: recEntry, stopDistancePct: recStopPct, rrRatio: recRr }) => {
              setEntryPrice(recEntry);
              setStopDistancePct(recStopPct);
              setRrRatio(recRr);
              setTradeSide('long');
              setShowRiskOverlay(true);
              setAlertBanner(
                `Loaded AI Buy & Sell Points onto Live ${symbol} Chart: Buy $${recEntry.toFixed(4)} · Stop ${recStopPct}% · 1:${recRr} Target (Use at Your Own Risk)`
              );
              document.getElementById('risk-chart')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* Advanced Student 10-Set Automated Buy & Sell Sequencer (Simulated or Active Trust Wallet) */}
        <section id="ten-set-auto-trader">
          <TenSetAutoTraderLab
            symbol={symbol}
            onSelectSymbol={handleSelectSymbol}
            candles={activeCandles}
            fibLevels={fibLevels}
            livePrice={livePrice}
            xrpLivePrice={xrpLive}
            xlmLivePrice={xlmLive}
            accountBalance={accountBalance}
            riskPercent={riskPercent}
            onLogSetPositionToPortfolio={handleOpenPaperPosition}
          />
        </section>

        {/* Asset Selector & Live Telemetry Strip */}
        <section id="risk-chart" className="flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* XRP vs XLM Segmented Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleSelectSymbol('XRPUSDT')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  symbol === 'XRPUSDT'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                XRP / USDT (${xrpLive.toFixed(4)})
              </button>
              <button
                type="button"
                onClick={() => handleSelectSymbol('XLMUSDT')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  symbol === 'XLMUSDT'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                XLM / USDT (${xlmLive.toFixed(4)})
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>{activeStats?.name || 'Spot & Perpetual Paper Feed'}</span>
              <span aria-hidden="true" className="mx-2">
                ·
              </span>
              <span>
                {activeStats?.isLiveStream
                  ? '● Live Exchange Feed Connected'
                  : '● Simulated Live Market Feed'}
              </span>
            </div>
          </div>

          {/* Key Market & DEX Volatility Telemetry */}
          <div className="flex flex-wrap items-center gap-5 text-xs font-mono tabular-nums">
            <div>
              <span className="font-sans text-slate-500 dark:text-slate-400 block">
                Live Mark Price
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                ${livePrice.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="font-sans text-slate-500 dark:text-slate-400 block">24h Change</span>
              <span
                className={`font-semibold ${
                  (activeStats?.priceChangePercent24h ?? 0) >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {(activeStats?.priceChangePercent24h ?? 0) >= 0 ? '+' : ''}
                {(activeStats?.priceChangePercent24h ?? 1.84).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="font-sans text-slate-500 dark:text-slate-400 block">
                24h Range (Low – High)
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                ${(activeStats?.low24h ?? livePrice * 0.96).toFixed(4)} – $
                {(activeStats?.high24h ?? livePrice * 1.04).toFixed(4)}
              </span>
            </div>
            <div>
              <span className="font-sans text-slate-500 dark:text-slate-400 block">
                Hist. Volatility / ATR(14)
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {(activeStats?.annualizedVolatilityPct ?? 54.2).toFixed(1)}% · $
                {(activeStats?.atr14 ?? livePrice * 0.015).toFixed(4)}
              </span>
            </div>
            <div>
              <span className="font-sans text-slate-500 dark:text-slate-400 block">
                DEX Pool Depth / Spread
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                ${((activeStats?.dexLiquidityUsd ?? 45_000_000) / 1_000_000).toFixed(1)}M ·{' '}
                {(activeStats?.dexSpreadBps ?? 4.5).toFixed(1)} bps
              </span>
            </div>
          </div>
        </section>

        {/* Primary Two-Zone Sandbox Layout: Interactive Chart (Left 7 cols) + 2% Risk Simulator (Right 5 cols) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            {isLoading && activeCandles.length === 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-8 h-[480px] flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Loading {symbol} candlestick history and technical indicators...
              </div>
            ) : (
              <CandlestickChart
                symbol={symbol}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                candles={activeCandles}
                fibLevels={fibLevels}
                selectedCandleIndex={selectedCandleIndex}
                onSelectCandle={setSelectedCandleIndex}
                entryPrice={entryPrice}
                stopLoss={currentStopLoss}
                takeProfit={currentTakeProfit}
                tradeSide={tradeSide}
                showFibOverlay={showFibOverlay}
                onToggleFibOverlay={() => setShowFibOverlay((v) => !v)}
                showTrendBands={showTrendBands}
                onToggleTrendBands={() => setShowTrendBands((v) => !v)}
                showRiskOverlay={showRiskOverlay}
                onToggleRiskOverlay={() => setShowRiskOverlay((v) => !v)}
              />
            )}
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <RiskSimulatorPanel
              symbol={symbol}
              livePrice={livePrice}
              atr14={activeStats?.atr14 ?? livePrice * 0.015}
              accountBalance={accountBalance}
              onAccountBalanceChange={setAccountBalance}
              entryPrice={entryPrice}
              onEntryPriceChange={setEntryPrice}
              stopDistancePct={stopDistancePct}
              onStopDistancePctChange={setStopDistancePct}
              riskPercent={riskPercent}
              onRiskPercentChange={setRiskPercent}
              rrRatio={rrRatio}
              onRrRatioChange={setRrRatio}
              tradeSide={tradeSide}
              onTradeSideChange={setTradeSide}
              instrument={instrument}
              onInstrumentChange={setInstrument}
              leverage={leverage}
              onLeverageChange={setLeverage}
              onOpenPaperPosition={handleOpenPaperPosition}
            />
          </div>
        </section>

        {/* Dedicated 8-Hour Candlestick Symphony Music Graph Module */}
        <section id="market-symphony">
          <CandlestickSymphonyComposer
            symbol={symbol}
            onSelectSymbol={handleSelectSymbol}
            candles={activeCandles}
            livePrice={livePrice}
            xrpLivePrice={xrpLive}
            xlmLivePrice={xlmLive}
          />
        </section>

        {/* Day-Trader-Skill 11-Module Interactive Suite (Hidden when Simplify Screen is active) */}
        {!beginnerFocusMode && (
          <section id="skill-desk">
            <DayTraderSkillSuite
              symbol={symbol}
              onSelectSymbol={handleSelectSymbol}
              candles={activeCandles}
              stats={activeStats}
              fibLevels={fibLevels}
              livePrice={livePrice}
              accountBalance={accountBalance}
              entryPrice={entryPrice}
              onEntryPriceChange={setEntryPrice}
              stopLoss={currentStopLoss}
              takeProfit={currentTakeProfit}
              stopDistancePct={stopDistancePct}
              riskPercent={riskPercent}
              rrRatio={rrRatio}
              tradeSide={tradeSide}
              instrument={instrument}
              leverage={leverage}
              positions={positions}
              onOpenPaperPosition={handleOpenPaperPosition}
              onAddAlert={(newAl) => {
                setAlerts((prev) => [
                  { ...newAl, id: `al_${Date.now()}`, triggered: false },
                  ...prev,
                ]);
                setAlertBanner(
                  `Armed Alert: ${newAl.symbol} ${newAl.condition} $${newAl.targetPrice.toFixed(4)}`
                );
              }}
            />
          </section>
        )}

        {/* 24/7 AI Decentralized DEX Lab (Hidden when Simplify Screen is active) */}
        {!beginnerFocusMode && (
          <section id="ai-dex-lab">
            <DecentralizedAiDexDesk
              symbol={symbol}
              candles={activeCandles}
              stats={activeStats}
              livePrice={livePrice}
              accountBalance={accountBalance}
              entryPrice={entryPrice}
              stopLoss={currentStopLoss}
              takeProfit={currentTakeProfit}
              riskPercent={riskPercent}
              rrRatio={rrRatio}
              tradeSide={tradeSide}
              onOpenPaperPosition={handleOpenPaperPosition}
            />
          </section>
        )}

        {/* Candlestick Pattern Learning Guide & Fibonacci Retracement Zones */}
        <section id="candlestick-guide">
          <CandleEducationDeck
            symbol={symbol}
            candles={activeCandles}
            selectedCandleIndex={selectedCandleIndex}
            onSelectCandle={setSelectedCandleIndex}
            fibLevels={fibLevels}
            livePrice={livePrice}
            onUsePriceAsEntry={(price) => setEntryPrice(price)}
          />
        </section>

        {/* Bull vs. Bear Markets, Seasonal Rhythms & 4-Year Halving Cycle Compass */}
        <section id="market-cycles">
          <MarketCyclesEducationModule
            symbol={symbol}
            onSelectSymbol={handleSelectSymbol}
            candles={activeCandles}
            xrpLivePrice={xrpLive}
            xlmLivePrice={xlmLive}
          />
        </section>

        {/* Paper Portfolio, Read-Only Wallet Watch, Bot Sandbox & Alerts */}
        <section id="portfolio-ledger">
          <PortfolioAndToolsSection
            activeSectionTab={activeBottomTab}
            onSectionTabChange={setActiveBottomTab}
            positions={positions}
            onClosePosition={handleClosePosition}
            xrpPrice={xrpLive}
            xlmPrice={xlmLive}
            candles={activeCandles}
            watchedWallets={watchedWallets}
            onAddWallet={(w) => setWatchedWallets((prev) => [w, ...prev])}
            onRemoveWallet={(id) =>
              setWatchedWallets((prev) => prev.filter((item) => item.id !== id))
            }
            botStrategies={botStrategies}
            onToggleBot={handleToggleBot}
            onRunBotBacktest={handleRunBotBacktest}
            alerts={alerts}
            onAddAlert={(newAl) =>
              setAlerts((prev) => [
                { ...newAl, id: `al_${Date.now()}`, triggered: false },
                ...prev,
              ])
            }
            onDeleteAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
          />
        </section>
      </main>
      )}

      {/* Quiet Educational Disclaimer & Analemma Ventures Ecosystem Cross-Link Footer */}
      <footer
        className={`border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 ${
          isSingleStageWelcome ? '' : 'mt-8'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <SymphonyHarpLogo variant="vector" className="w-5 h-5" />
            <span>
              Symphony Markets — Free Open-Source No-Scam Zone Sandbox (Hypothetical Simulation · Zero Custody · Not Financial Advice).
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigatePublicPage('guide')}
              className="text-emerald-700 dark:text-emerald-400 hover:underline underline-offset-2 font-semibold cursor-pointer"
            >
              Free Ebook (PDF & EPUB)
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => navigatePublicPage('story')}
              className="text-sky-600 dark:text-sky-400 hover:underline underline-offset-2 font-medium cursor-pointer"
            >
              Analemma Ventures · Digital Visual Resume Pro 1.0 Node
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-2 cursor-pointer"
            >
              {darkMode ? 'Light Theme' : 'Dark Theme'}
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() =>
                viewMode === 'landing' ? handleEnterApp() : navigatePublicPage('welcome')
              }
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-2 cursor-pointer"
            >
              {viewMode === 'landing' ? 'Enter Training App' : 'Return to Welcome Stage'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
