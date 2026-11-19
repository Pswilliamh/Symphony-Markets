/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Layers, Lock, ShieldCheck } from 'lucide-react';
import {
  AcademyAdminConsoleModal,
  AcademyPasscodeGateCard,
  AcademyProgressBanner,
  AcademyTierLevel,
} from './components/AcademyTierGateAndAdminBar';
import { CandleEducationDeck } from './components/CandleEducationDeck';
import { CandlestickChart } from './components/CandlestickChart';
import { CandlestickSymphonyComposer } from './components/CandlestickSymphonyComposer';
import { CoinHistoryAndFoundersModule } from './components/CoinHistoryAndFoundersModule';
import { DayTraderSkillSuite } from './components/DayTraderSkillSuite';
import { DecentralizedAiDexDesk } from './components/DecentralizedAiDexDesk';
import { FibonacciSymphonyGeometryModule } from './components/FibonacciSymphonyGeometryModule';
import { FibonacciSymphonyMarkersStudio } from './components/FibonacciSymphonyMarkersStudio';
import { LandingPageView, PublicPageTab } from './components/LandingPageView';
import { LiveAiSignalHelper } from './components/LiveAiSignalHelper';
import {
  MarketCyclePartId,
  MarketCyclesEducationModule,
} from './components/MarketCyclesEducationModule';
import {
  ONE_BY_ONE_CHECKLIST_STORAGE_KEY,
  OneByOneChecklistState,
  OneByOneTradeChecklist,
  loadPersistedChecklistState,
} from './components/OneByOneTradeChecklist';
import { OpenMediaAndDocumentLibrary } from './components/OpenMediaAndDocumentLibrary';
import { PortfolioAndToolsSection } from './components/PortfolioAndToolsSection';
import {
  ImportedAutoTraderDexSet,
  RiskSimulatorPanel,
} from './components/RiskSimulatorPanel';
import { StartHereRoadmap } from './components/StartHereRoadmap';
import { SymphonyCandlestickBackdrop, SymphonyHarpLogo } from './components/SymphonyHarpLogo';
import { TenSetAutoTraderLab } from './components/TenSetAutoTraderLab';
import {
  AcademyAdminSettingsState,
  AcademyPublicGatesState,
  DEFAULT_ADMIN_SETTINGS_STATE,
  DEFAULT_PUBLIC_GATES_STATE,
  User,
  auth,
  fetchAcademyAdminSettingsFromFirestore,
  fetchAcademyPublicGatesFromFirestore,
  isBootstrapOwnerEmail,
  onAuthStateChanged,
  saveAcademyConfigurationToFirestore,
  signInWithGoogleForAcademyAdmin,
  signOutGoogleWalletGate,
} from './firebase';
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

type CurriculumGroupId = AcademyTierLevel;

type WorkshopChapterId =
  | 'start-here'
  | 'coin-history'
  | 'cycle-bull-vs-bear'
  | 'cycle-four-seasons'
  | 'market-symphony'
  | 'risk-chart'
  | 'candlestick-guide'
  | 'fibonacci-symphony-geometry'
  | 'fibonacci-symphony-markers'
  | 'ai-buy-sell-helper'
  | 'portfolio-ledger'
  | 'cycle-monthly-rhythms'
  | 'ten-set-auto-trader'
  | 'skill-desk'
  | 'ai-dex-lab'
  | 'cycle-four-year-clock'
  | 'open-library';

interface CurriculumGroupMeta {
  id: CurriculumGroupId;
  roman: string;
  label: string;
  rangeBadge: string;
}

interface WorkshopChapterMeta {
  id: WorkshopChapterId;
  number: string;
  groupId: CurriculumGroupId;
  shortTitle: string;
  fullTitle: string;
  cyclePart?: MarketCyclePartId;
}

const CURRICULUM_GROUPS: CurriculumGroupMeta[] = [
  {
    id: 'beginner',
    roman: 'I',
    label: 'Beginners · Foundations & Seasons (Open)',
    rangeBadge: '01–07',
  },
  {
    id: 'intermediate',
    roman: 'II',
    label: 'Intermediate · Fibonacci & Paper Rehearsal',
    rangeBadge: '08–12',
  },
  {
    id: 'advanced',
    roman: 'III',
    label: 'Advanced · Self-Custody DEX Capstone',
    rangeBadge: '13–16',
  },
  {
    id: 'open_library',
    roman: 'IV',
    label: 'Open Media & Document Library',
    rangeBadge: 'Open',
  },
];

const WORKSHOP_CHAPTERS: WorkshopChapterMeta[] = [
  // =========================================================================
  // STAGE I: BEGINNERS — FOUNDATIONS, SEASONS & RHYTHM (01–07, OPEN ACCESS)
  // =========================================================================
  {
    id: 'start-here',
    number: '01',
    groupId: 'beginner',
    shortTitle: '01. $5 Start Here & Safety',
    fullTitle: '$5 Start Here & Real-Wallet Safety Roadmap',
  },
  {
    id: 'coin-history',
    number: '02',
    groupId: 'beginner',
    shortTitle: '02. Coin History & Founders',
    fullTitle: 'History of Our Coins: What They Represent & Their Founders (BTC, XRP, XLM, KSBC)',
  },
  {
    id: 'cycle-bull-vs-bear',
    number: '03',
    groupId: 'beginner',
    shortTitle: '03. Eagle Markets (Bull & Bear)',
    fullTitle:
      'The Ascending Eagle & Descending Eagle Markets — And Why Wall Street Calls Them Bull & Bear',
    cyclePart: 'bull_vs_bear',
  },
  {
    id: 'cycle-four-seasons',
    number: '04',
    groupId: 'beginner',
    shortTitle: '04. 4 Market Cycle Seasons',
    fullTitle: 'How a Complete Market Cycle Flows Through 4 Seasons',
    cyclePart: 'four_seasons',
  },
  {
    id: 'cycle-monthly-rhythms',
    number: '05',
    groupId: 'beginner',
    shortTitle: '05. Monthly & Yearly Rhythms',
    fullTitle: 'How the Market Moves by Time of the Year & Time of the Month',
    cyclePart: 'monthly_rhythms',
  },
  {
    id: 'cycle-four-year-clock',
    number: '06',
    groupId: 'beginner',
    shortTitle: '06. 4-Year Cycle Clock (2026)',
    fullTitle: 'The Past Four 4-Year Cycles & Where the Market Is Right Now (Late 2026)',
    cyclePart: 'four_year_cycles',
  },
  {
    id: 'market-symphony',
    number: '07',
    groupId: 'beginner',
    shortTitle: '07. ♪ 8-Hour Symphony Graph',
    fullTitle: '♪ 8-Hour Market Symphony Music Graph',
  },

  // =========================================================================
  // STAGE II: INTERMEDIATE — SHEET MUSIC, FIBONACCI & PAPER REHEARSAL (08–12)
  // =========================================================================
  {
    id: 'candlestick-guide',
    number: '08',
    groupId: 'intermediate',
    shortTitle: '08. Candlestick & Fib Retracements',
    fullTitle: 'Candlestick Anatomy & Fibonacci Retracement Guide',
  },
  {
    id: 'fibonacci-symphony-geometry',
    number: '09',
    groupId: 'intermediate',
    shortTitle: '09. ♪ 3-Point Fib Extensions & 144/233',
    fullTitle: 'The Geometry of Creation, Musical Notes & 3-Point Fibonacci Extensions',
  },
  {
    id: 'fibonacci-symphony-markers',
    number: '10',
    groupId: 'intermediate',
    shortTitle: '10. ♬ Fib Symphony Buy/Sell Markers',
    fullTitle: 'Dedicated Fibonacci Symphony Studio: Musical Buy, Stop & Sell Markers',
  },
  {
    id: 'ai-buy-sell-helper',
    number: '11',
    groupId: 'intermediate',
    shortTitle: '11. ★ Live AI Market Examiner',
    fullTitle: 'Live AI Market Examiner: Recommended Buy, Stop-Loss & Sell Points',
  },
  {
    id: 'portfolio-ledger',
    number: '12',
    groupId: 'intermediate',
    shortTitle: '12. Paper Portfolio & Wallet Watch',
    fullTitle: 'Paper Rehearsal Ledger, Read-Only Wallet Watch & Price Alerts',
  },

  // =========================================================================
  // STAGE III: ADVANCED — END OF THE PROCESS: SELF-CUSTODY EXECUTION (13–16)
  // =========================================================================
  {
    id: 'skill-desk',
    number: '13',
    groupId: 'advanced',
    shortTitle: '13. 11-Skill Readiness Check',
    fullTitle: '11-Module Day-Trader Readiness & Discipline Check',
  },
  {
    id: 'risk-chart',
    number: '14',
    groupId: 'advanced',
    shortTitle: '14. Single Trade · Embedded XRPL DEX',
    fullTitle: 'Live Candlestick Chart, 2% Risk Desk & First Single Trade on Embedded XRPL DEX',
  },
  {
    id: 'ten-set-auto-trader',
    number: '15',
    groupId: 'advanced',
    shortTitle: '15. ⚡ 10-Set Sequencer & XRPL Bridge',
    fullTitle: 'Automated 10-Set Buy & Sell Sequencer (& Step-by-Step XRPL DEX Bridge)',
  },
  {
    id: 'ai-dex-lab',
    number: '16',
    groupId: 'advanced',
    shortTitle: '16. ★ Capstone: 24/7 DEX Stewardship',
    fullTitle: 'Graduation Capstone: 24/7 On-Chain DEX Lab & Self-Custody Mastery',
  },

  // =========================================================================
  // STANDALONE REFERENCE ROOM — ALWAYS OPEN (NOT COUNTED AS STEP #17)
  // =========================================================================
  {
    id: 'open-library',
    number: 'IV',
    groupId: 'open_library',
    shortTitle: 'Open Media & Document Library',
    fullTitle: 'Open Media, Course Videos & Document Reading Room (No Password Required)',
  },
];

const PROGRESSION_CHAPTERS = WORKSHOP_CHAPTERS.filter((ch) => ch.groupId !== 'open_library');

function resolveChapterId(targetSectionId?: string): WorkshopChapterId {
  if (!targetSectionId) return 'start-here';
  if (targetSectionId === 'market-cycles') return 'cycle-bull-vs-bear';
  const match = WORKSHOP_CHAPTERS.find((ch) => ch.id === targetSectionId);
  return match ? match.id : 'start-here';
}

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [publicPage, setPublicPage] = useState<PublicPageTab>('welcome');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [symbol, setSymbol] = useState<AssetSymbol>('XRPUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [activeChapterId, setActiveChapterId] = useState<WorkshopChapterId>('start-here');
  const [lastProgressionChapterId, setLastProgressionChapterId] =
    useState<WorkshopChapterId>('start-here');
  const [paginatedMode, setPaginatedMode] = useState<boolean>(true);

  const [publicGates, setPublicGates] = useState<AcademyPublicGatesState>(
    DEFAULT_PUBLIC_GATES_STATE
  );
  const [adminSettings, setAdminSettings] = useState<AcademyAdminSettingsState>(
    DEFAULT_ADMIN_SETTINGS_STATE
  );
  const [academyUser, setAcademyUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [adminPreviewStudentGate, setAdminPreviewStudentGate] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminBusy, setAdminBusy] = useState<boolean>(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [intermediateUnlocked, setIntermediateUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('symphony_int_unlocked') === '1';
    } catch {
      return false;
    }
  });
  const [advancedUnlocked, setAdvancedUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('symphony_adv_unlocked') === '1';
    } catch {
      return false;
    }
  });
  const [oneByOneChecklist, setOneByOneChecklist] = useState<OneByOneChecklistState>(() =>
    loadPersistedChecklistState()
  );

  useEffect(() => {
    try {
      localStorage.setItem(ONE_BY_ONE_CHECKLIST_STORAGE_KEY, JSON.stringify(oneByOneChecklist));
    } catch {
      // Ignore storage quota errors in restricted preview modes
    }
  }, [oneByOneChecklist]);

  // Market State for BTC, XRP, and XLM
  const [candlesBySymbol, setCandlesBySymbol] = useState<Record<AssetSymbol, Candle[]>>({
    BTCUSDT: [],
    XRPUSDT: [],
    XLMUSDT: [],
  });
  const [statsBySymbol, setStatsBySymbol] = useState<Record<AssetSymbol, MarketStats | null>>({
    BTCUSDT: null,
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
  const [beginnerFocusMode, setBeginnerFocusMode] = useState<boolean>(true);

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
  const [embeddedXrplAddress, setEmbeddedXrplAddress] = useState<string>('');
  const [importedXrplDexSet, setImportedXrplDexSet] =
    useState<ImportedAutoTraderDexSet | null>(null);

  // Sync Dark Mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Public SHA-256 Passcode Gates & Orientation Video Metadata on Boot
  useEffect(() => {
    let active = true;
    fetchAcademyPublicGatesFromFirestore()
      .then((gates) => {
        if (active) setPublicGates(gates);
      })
      .catch(() => {
        // Fallback to built-in SHA-256 defaults if offline
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync Firebase Google Auth Session (Supports Both Primary Owner & Separate Admin Google Login)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setAcademyUser(u);
      if (!u || !u.emailVerified) {
        setIsAdminUser(false);
        return;
      }
      if (isBootstrapOwnerEmail(u.email)) {
        setIsAdminUser(true);
        try {
          const settings = await fetchAcademyAdminSettingsFromFirestore();
          setAdminSettings(settings);
        } catch {
          // Settings doc may not have been initialized yet
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUnlockIntermediate = () => {
    setIntermediateUnlocked(true);
    try {
      sessionStorage.setItem('symphony_int_unlocked', '1');
    } catch {
      // Ignore storage restriction
    }
  };

  const handleUnlockAdvanced = () => {
    setAdvancedUnlocked(true);
    try {
      sessionStorage.setItem('symphony_adv_unlocked', '1');
    } catch {
      // Ignore storage restriction
    }
  };

  const handleLockStudentSessionGates = () => {
    setIntermediateUnlocked(false);
    setAdvancedUnlocked(false);
    try {
      sessionStorage.removeItem('symphony_int_unlocked');
      sessionStorage.removeItem('symphony_adv_unlocked');
    } catch {
      // Ignore storage restriction
    }
  };

  const handleGoogleAdminSignIn = async () => {
    setAdminBusy(true);
    setAdminAuthError(null);
    try {
      const signedUser = await signInWithGoogleForAcademyAdmin();
      setAcademyUser(signedUser);
      if (!signedUser.emailVerified) {
        setIsAdminUser(false);
        setAdminAuthError('Please use a Google account with a verified email address.');
        return;
      }

      if (isBootstrapOwnerEmail(signedUser.email)) {
        setIsAdminUser(true);
        setAdminPreviewStudentGate(false);
        const settings = await fetchAcademyAdminSettingsFromFirestore();
        setAdminSettings(settings);
        setAlertBanner(
          `Admin Access Active (${signedUser.email}): All Beginner, Intermediate & Advanced sections unlocked.`
        );
        return;
      }

      try {
        const settings = await fetchAcademyAdminSettingsFromFirestore();
        if (
          settings.secondaryAdminEmail &&
          signedUser.email &&
          settings.secondaryAdminEmail.toLowerCase() === signedUser.email.toLowerCase()
        ) {
          setIsAdminUser(true);
          setAdminPreviewStudentGate(false);
          setAdminSettings(settings);
          setAlertBanner(
            `Separate Admin Google Login Verified (${signedUser.email}): All curriculum tiers unlocked.`
          );
        } else {
          setIsAdminUser(false);
        }
      } catch {
        setIsAdminUser(false);
        setAdminAuthError(
          `Signed in as ${signedUser.email}, which is not yet registered as a Separate Admin Google Login. Sign in once with PsWilliamh@gmail.com to add this email in Admin Settings.`
        );
      }
    } catch (err: unknown) {
      setAdminAuthError(
        err instanceof Error ? err.message : 'Google Sign-In was cancelled or blocked by browser.'
      );
    } finally {
      setAdminBusy(false);
    }
  };

  const handleGoogleAdminSignOut = async () => {
    setAdminBusy(true);
    setAdminAuthError(null);
    try {
      await signOutGoogleWalletGate(academyUser?.uid);
      setAcademyUser(null);
      setIsAdminUser(false);
      setAdminPreviewStudentGate(false);
    } finally {
      setAdminBusy(false);
    }
  };

  const handleSaveAdminConfiguration = async (draft: {
    intermediatePasscodePlain: string;
    advancedPasscodePlain: string;
    intermediateGateEnabled: boolean;
    advancedGateEnabled: boolean;
    orientationVideoUrl: string;
    orientationVideoTitle: string;
    secondaryAdminEmail: string;
  }) => {
    if (!academyUser) return;
    setAdminBusy(true);
    setAdminAuthError(null);
    try {
      const saved = await saveAcademyConfigurationToFirestore({
        user: academyUser,
        ...draft,
      });
      setPublicGates(saved.publicGates);
      setAdminSettings(saved.adminSettings);
      setAlertBanner(
        'Saved Intermediate & Advanced passcodes, Separate Admin Google Login, and Orientation Video settings.'
      );
    } catch (err: unknown) {
      setAdminAuthError(
        err instanceof Error ? err.message : 'Unable to save Admin configuration right now.'
      );
    } finally {
      setAdminBusy(false);
    }
  };

  const isTierLocked = (tier: CurriculumGroupId): boolean => {
    if (tier === 'beginner' || tier === 'open_library') return false;
    if (isAdminUser && !adminPreviewStudentGate) return false;
    if (tier === 'intermediate') {
      return publicGates.intermediateGateEnabled && !intermediateUnlocked;
    }
    if (tier === 'advanced') {
      return publicGates.advancedGateEnabled && !advancedUnlocked;
    }
    return false;
  };

  // Fetch initial market data for BTCUSDT, XRPUSDT, and XLMUSDT
  useEffect(() => {
    let cancelled = false;
    async function loadAllCoins() {
      setIsLoading(true);
      const [btcData, xrpData, xlmData] = await Promise.all([
        fetchMarketData('BTCUSDT', timeframe),
        fetchMarketData('XRPUSDT', timeframe),
        fetchMarketData('XLMUSDT', timeframe),
      ]);
      if (cancelled) return;

      setCandlesBySymbol({
        BTCUSDT: btcData.candles,
        XRPUSDT: xrpData.candles,
        XLMUSDT: xlmData.candles,
      });
      setStatsBySymbol({
        BTCUSDT: btcData.stats,
        XRPUSDT: xrpData.stats,
        XLMUSDT: xlmData.stats,
      });

      const currentPrice =
        symbol === 'BTCUSDT'
          ? btcData.stats.lastPrice
          : symbol === 'XRPUSDT'
          ? xrpData.stats.lastPrice
          : xlmData.stats.lastPrice;
      const dec = symbol === 'BTCUSDT' ? 2 : 4;
      setEntryPrice(Number(currentPrice.toFixed(dec)));
      const activeList =
        symbol === 'BTCUSDT'
          ? btcData.candles
          : symbol === 'XRPUSDT'
          ? xrpData.candles
          : xlmData.candles;
      setSelectedCandleIndex(activeList.length - 1);
      setIsLoading(false);
    }
    loadAllCoins();
    return () => {
      cancelled = true;
    };
  }, [timeframe]);

  // Live Real-Time Tick Stream Simulation / Polling Updater
  useEffect(() => {
    const interval = setInterval(() => {
      setCandlesBySymbol((prev) => {
        const next: Record<AssetSymbol, Candle[]> = { ...prev };
        (['BTCUSDT', 'XRPUSDT', 'XLMUSDT'] as AssetSymbol[]).forEach((sym) => {
          const list = prev[sym];
          if (!list || list.length === 0) return;
          const dec = sym === 'BTCUSDT' ? 2 : 4;
          const updated = [...list];
          const last = { ...updated[updated.length - 1] };
          const microDelta = (Math.random() - 0.492) * last.close * 0.0018;
          const newClose = Number(Math.max(0.01, last.close + microDelta).toFixed(dec));
          last.close = newClose;
          last.high = Number(Math.max(last.high, newClose).toFixed(dec));
          last.low = Number(Math.min(last.low, newClose).toFixed(dec));
          last.volume = Math.round(
            last.volume + Math.random() * (sym === 'BTCUSDT' ? 18 : 18000)
          );
          updated[updated.length - 1] = last;
          next[sym] = enrichCandlesWithIndicators(updated);
        });
        return next;
      });

      setStatsBySymbol((prevStats) => {
        const nextStats = { ...prevStats };
        (['BTCUSDT', 'XRPUSDT', 'XLMUSDT'] as AssetSymbol[]).forEach((sym) => {
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
    const btcNow = statsBySymbol.BTCUSDT?.lastPrice;
    const xrpNow = statsBySymbol.XRPUSDT?.lastPrice;
    const xlmNow = statsBySymbol.XLMUSDT?.lastPrice;
    if (!xrpNow || !xlmNow) return;

    setAlerts((prev) =>
      prev.map((al) => {
        if (al.triggered) return al;
        const price =
          al.symbol === 'BTCUSDT'
            ? btcNow ?? 91450
            : al.symbol === 'XRPUSDT'
            ? xrpNow
            : xlmNow;
        const hit =
          (al.condition === 'above' && price >= al.targetPrice) ||
          (al.condition === 'below' && price <= al.targetPrice);
        if (hit) {
          const timeStr = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const dec = al.symbol === 'BTCUSDT' ? 2 : 4;
          setAlertBanner(
            `Alert Triggered: ${al.symbol} crossed ${al.condition} $${al.targetPrice.toFixed(
              dec
            )} (${al.note})`
          );
          return { ...al, triggered: true, triggeredAt: timeStr };
        }
        return al;
      })
    );
  }, [
    statsBySymbol.BTCUSDT?.lastPrice,
    statsBySymbol.XRPUSDT?.lastPrice,
    statsBySymbol.XLMUSDT?.lastPrice,
  ]);

  const activeCandles = candlesBySymbol[symbol] || [];
  const activeStats = statsBySymbol[symbol];
  const livePrice =
    activeCandles.length > 0
      ? activeCandles[activeCandles.length - 1].close
      : activeStats?.lastPrice ||
        (symbol === 'BTCUSDT' ? 91450 : symbol === 'XRPUSDT' ? 2.42 : 0.415);

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
    const dec = newSym === 'BTCUSDT' ? 2 : 4;
    if (list && list.length > 0) {
      const latest = list[list.length - 1].close;
      setEntryPrice(Number(latest.toFixed(dec)));
      setSelectedCandleIndex(list.length - 1);
    } else {
      const fallback = newSym === 'BTCUSDT' ? 91450 : newSym === 'XRPUSDT' ? 2.42 : 0.415;
      setEntryPrice(Number(fallback.toFixed(dec)));
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
    const coinLabel =
      created.symbol === 'BTCUSDT' ? 'BTC' : created.symbol === 'XRPUSDT' ? 'XRP' : 'XLM';
    const priceDec = created.symbol === 'BTCUSDT' ? 2 : 4;
    const qtyStr =
      created.symbol === 'BTCUSDT'
        ? created.quantity.toFixed(6)
        : created.quantity.toLocaleString();
    setAlertBanner(
      `Logged Simulated ${created.side.toUpperCase()} Position: ${qtyStr} ${coinLabel} at $${created.entryPrice.toFixed(
        priceDec
      )} (2% Risk Cap)`
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

  const btcLive =
    candlesBySymbol.BTCUSDT.length > 0
      ? candlesBySymbol.BTCUSDT[candlesBySymbol.BTCUSDT.length - 1].close
      : statsBySymbol.BTCUSDT?.lastPrice ?? 91450;
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

  const navigateToChapter = (targetSectionId?: string) => {
    const resolvedId = resolveChapterId(targetSectionId);
    setActiveChapterId(resolvedId);
    if (resolvedId !== 'open-library') {
      setLastProgressionChapterId(resolvedId);
    }
    if (
      resolvedId === 'skill-desk' ||
      resolvedId === 'ai-dex-lab' ||
      resolvedId === 'candlestick-guide' ||
      resolvedId === 'fibonacci-symphony-geometry' ||
      resolvedId.startsWith('cycle-')
    ) {
      setBeginnerFocusMode(false);
    }
    setViewMode('app');
    setTimeout(() => {
      if (paginatedMode) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (targetSectionId) {
        document.getElementById(resolvedId)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 40);
  };

  const handleEnterApp = (targetSectionId?: string) => {
    navigateToChapter(targetSectionId);
  };

  const activeChapter = useMemo(
    () => WORKSHOP_CHAPTERS.find((ch) => ch.id === activeChapterId) ?? WORKSHOP_CHAPTERS[0],
    [activeChapterId]
  );

  const resumeStudyChapter = useMemo(
    () =>
      PROGRESSION_CHAPTERS.find((ch) => ch.id === lastProgressionChapterId) ??
      PROGRESSION_CHAPTERS[0],
    [lastProgressionChapterId]
  );

  const isStandaloneLibraryActive = activeChapter.id === 'open-library';

  const activeProgressionIdx = useMemo(() => {
    const idx = PROGRESSION_CHAPTERS.findIndex((ch) => ch.id === activeChapter.id);
    return idx >= 0 ? idx : 0;
  }, [activeChapter.id]);

  const prevChapter = isStandaloneLibraryActive
    ? resumeStudyChapter
    : activeProgressionIdx > 0
    ? PROGRESSION_CHAPTERS[activeProgressionIdx - 1]
    : null;
  const nextChapter = isStandaloneLibraryActive
    ? null
    : activeProgressionIdx < PROGRESSION_CHAPTERS.length - 1
    ? PROGRESSION_CHAPTERS[activeProgressionIdx + 1]
    : null;

  const activeGroup =
    CURRICULUM_GROUPS.find((g) => g.id === activeChapter.groupId) ?? CURRICULUM_GROUPS[0];
  const chaptersInActiveGroup = WORKSHOP_CHAPTERS.filter(
    (ch) => ch.groupId === activeGroup.id
  );

  const isSingleStageWelcome = viewMode === 'landing' && publicPage === 'welcome';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-4 xl:gap-8 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Zone 1: Brand Emblem + Wordmark with warm background highlight & faded animated candlesticks */}
        <a
          href="#welcome"
          onClick={(e) => {
            e.preventDefault();
            navigatePublicPage('welcome');
          }}
          className="relative overflow-hidden inline-flex items-center gap-2.5 font-editorial text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white pl-2 pr-3.5 py-1 rounded-xl bg-gradient-to-r from-amber-200/80 via-sky-100/95 to-amber-100/80 dark:from-sky-500/25 dark:via-amber-400/20 dark:to-sky-500/20 border border-amber-300/60 dark:border-sky-400/30 whitespace-nowrap shrink-0"
        >
          <SymphonyCandlestickBackdrop className="opacity-25 dark:opacity-35" />
          <SymphonyHarpLogo variant="emblem" className="relative z-10 w-8 h-8 sm:w-9 sm:h-9" />
          <span className="relative z-10">Symphony Markets Academy</span>
        </a>

        {/* Zone 2: Standalone Page Menu Items (5 concise single-line links obeying Top Bar Contract) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => navigatePublicPage('symphony')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'landing' && publicPage === 'symphony'
                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ♪ Symphony
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
            Open Library
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

      {/* Mobile & Tablet Compact Page Switcher (visible below lg breakpoint so header nav never clips) */}
      <nav className="lg:hidden flex items-center gap-4 overflow-x-auto px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-400">
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
            btcLivePrice={btcLive}
            xrpLivePrice={xrpLive}
            xlmLivePrice={xlmLive}
            symbol={symbol}
            onSelectSymbol={handleSelectSymbol}
            candles={activeCandles}
          />
        </main>
      ) : (
        /* Main Training Workspace Container (1440px max-w) */
        <main id="workspace" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* 3-Tier Progressive Stewardship Status & Separate Admin Google Console Bar */}
          <AcademyProgressBanner
            activeTier={activeGroup.id}
            intermediateUnlocked={intermediateUnlocked}
            advancedUnlocked={advancedUnlocked}
            isAdminUser={isAdminUser}
            adminPreviewStudentGate={adminPreviewStudentGate}
            onToggleAdminPreviewStudentGate={() => setAdminPreviewStudentGate((p) => !p)}
            onOpenAdminModal={() => setShowAdminModal(true)}
            onOpenLibraryChapter={() => {
              setPaginatedMode(true);
              navigateToChapter('open-library');
            }}
            orientationVideoUrl={publicGates.orientationVideoUrl}
            orientationVideoTitle={publicGates.orientationVideoTitle}
          />

          {/* Guiding Epigraph & Page-by-Page vs Full Scroll Mode Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="italic text-slate-700 dark:text-slate-300">
                “It’s not about making money—it’s about learning how to manage and understand what the system is doing.”
              </span>
              <button
                type="button"
                onClick={() => {
                  setPaginatedMode(true);
                  navigateToChapter('open-library');
                }}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold whitespace-nowrap cursor-pointer"
              >
                Open Media & Document Library →
              </button>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <button
                type="button"
                onClick={() => navigatePublicPage('guide')}
                className="text-sky-600 dark:text-sky-400 hover:underline font-medium whitespace-nowrap cursor-pointer"
              >
                Free Ebook (PDF & EPUB) →
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPaginatedMode(true)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  paginatedMode
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Page-by-Page Menu ({PROGRESSION_CHAPTERS.length}-Step Path)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaginatedMode(false);
                  setBeginnerFocusMode(false);
                }}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  !paginatedMode
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Full Scroll View
              </button>
            </div>
          </div>

          {/* Grouped Curriculum Menu Bar (Stage I · Stage II · Stage III Capstone · Standalone Open Library) */}
          <nav
            aria-label="Training Curriculum Menu"
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5"
          >
            {/* Row 1: 4 Progressive Tier Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 w-full xl:w-auto flex-1">
                {CURRICULUM_GROUPS.map((grp) => {
                  const isGroupActive = paginatedMode && activeGroup.id === grp.id;
                  const firstInGroup = WORKSHOP_CHAPTERS.find((c) => c.groupId === grp.id);
                  const locked = isTierLocked(grp.id);
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => {
                        setPaginatedMode(true);
                        if (activeGroup.id !== grp.id && firstInGroup) {
                          navigateToChapter(firstInGroup.id);
                        }
                      }}
                      className={`px-3.5 py-2.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isGroupActive
                          ? 'bg-slate-900 dark:bg-sky-600 text-white border-slate-900 dark:border-sky-500'
                          : 'bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate inline-flex items-center gap-1.5">
                        <span className="font-mono opacity-80">{grp.roman}.</span>
                        <span className="truncate">{grp.label}</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded shrink-0 ${
                          isGroupActive
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {locked && <Lock className="w-3 h-3 shrink-0" />}
                        <span>{grp.rangeBadge}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Active Group's Individual Section Buttons + Quick Jump Dropdown + Top Prev/Next */}
            {paginatedMode ? (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {chaptersInActiveGroup.map((ch) => {
                    const isCurrent = ch.id === activeChapter.id;
                    const locked = isTierLocked(ch.groupId);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => navigateToChapter(ch.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {locked && <Lock className="w-3 h-3 opacity-80 shrink-0" />}
                        <span>{ch.shortTitle}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
                  <select
                    aria-label={`Jump directly to any of the ${PROGRESSION_CHAPTERS.length} progressive training steps or Open Library`}
                    value={activeChapter.id}
                    onChange={(e) => navigateToChapter(e.target.value)}
                    className="max-w-[260px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    {CURRICULUM_GROUPS.map((grp) => (
                      <optgroup
                        key={grp.id}
                        label={`Stage ${grp.roman}: ${grp.label} (${grp.rangeBadge})`}
                      >
                        {WORKSHOP_CHAPTERS.filter((ch) => ch.groupId === grp.id).map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            {ch.groupId === 'open_library'
                              ? ch.fullTitle
                              : `${ch.number}. ${ch.fullTitle}`}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  {isStandaloneLibraryActive ? (
                    <>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold whitespace-nowrap">
                        Always-Open Library
                      </span>
                      <button
                        type="button"
                        onClick={() => navigateToChapter(resumeStudyChapter.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        ← Return to {resumeStudyChapter.shortTitle}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        Step {activeProgressionIdx + 1} / {PROGRESSION_CHAPTERS.length}
                      </span>

                      <button
                        type="button"
                        disabled={!prevChapter}
                        onClick={() => prevChapter && navigateToChapter(prevChapter.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        ← Prev
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigateToChapter(nextChapter ? nextChapter.id : PROGRESSION_CHAPTERS[0].id)
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {nextChapter ? 'Next →' : 'Restart Path ↺'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span>
                  <strong>Full Scroll View Active:</strong> Open Foundations & Seasons (01–07) and the Open Media Library display immediately; Intermediate Rehearsal (08–12) and Advanced Execution Capstone (13–16) respect active cohort passcode gates.
                </span>
                <button
                  type="button"
                  onClick={() => setPaginatedMode(true)}
                  className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline whitespace-nowrap cursor-pointer"
                >
                  Return to 16-Step Mastery Path →
                </button>
              </div>
            )}
          </nav>

          {/* PAGINATED PASSCODE GATE: Shown When Active Chapter Is in a Locked Intermediate or Advanced Tier */}
          {paginatedMode &&
            (activeChapter.groupId === 'intermediate' || activeChapter.groupId === 'advanced') &&
            isTierLocked(activeChapter.groupId) && (
              <AcademyPasscodeGateCard
                requiredTier={activeChapter.groupId}
                chapterNumber={activeChapter.number}
                chapterTitle={activeChapter.fullTitle}
                chaptersInTier={WORKSHOP_CHAPTERS.filter(
                  (c) => c.groupId === activeChapter.groupId
                ).map((c) => ({
                  number: c.number,
                  fullTitle: c.fullTitle,
                }))}
                publicGates={publicGates}
                onUnlockIntermediate={handleUnlockIntermediate}
                onUnlockAdvanced={handleUnlockAdvanced}
                onOpenBeginnerStart={() => navigateToChapter('start-here')}
                onOpenPublicLibrary={() => navigateToChapter('open-library')}
                onOpenAdminModal={() => setShowAdminModal(true)}
                isAdminUser={isAdminUser}
                adminPreviewStudentGate={adminPreviewStudentGate}
                onExitStudentPreview={() => setAdminPreviewStudentGate(false)}
              />
            )}

          {/* ====================================================================
           * STAGE I: BEGINNERS — OPEN FOUNDATIONS & MARKET SEASONS (STEPS 01–07)
           * ==================================================================== */}
          {(!paginatedMode || activeChapter.id === 'start-here') && (
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
                  setEntryPrice(Number(livePrice.toFixed(symbol === 'BTCUSDT' ? 2 : 4)));
                  setAlertBanner(
                    'Activated $5 Real-Wallet Learning Preset: $5.00 Budget · 1x Spot (Zero Leverage) · 10-Cent Safety Exit'
                  );
                }}
                onJumpToWalletWatch={() => {
                  setActiveBottomTab('wallets');
                  navigateToChapter('portfolio-ledger');
                }}
                beginnerFocusMode={beginnerFocusMode}
                onToggleBeginnerFocusMode={() => {
                  if (paginatedMode) {
                    navigateToChapter('skill-desk');
                  } else {
                    setBeginnerFocusMode((v) => !v);
                  }
                }}
              />
            </section>
          )}

          {(!paginatedMode || activeChapter.id === 'coin-history') && (
            <section id="coin-history">
              <CoinHistoryAndFoundersModule
                btcLivePrice={btcLive}
                xrpLivePrice={xrpLive}
                xlmLivePrice={xlmLive}
                onSelectSymbolAndTrain={(sym, targetId) => {
                  handleSelectSymbol(sym);
                  navigateToChapter(targetId || 'ten-set-auto-trader');
                }}
                onOpenKsbcGoldLedger={() => navigatePublicPage('ksbc')}
              />
            </section>
          )}

          {(!paginatedMode || activeChapter.id === 'cycle-bull-vs-bear') && (
            <section id="cycle-bull-vs-bear">
              <MarketCyclesEducationModule
                symbol={symbol}
                onSelectSymbol={handleSelectSymbol}
                candles={activeCandles}
                btcLivePrice={btcLive}
                xrpLivePrice={xrpLive}
                xlmLivePrice={xlmLive}
                onEnterApp={handleEnterApp}
                onlyPart="bull_vs_bear"
                sectionNumberOverride="03"
              />
            </section>
          )}

          {(!paginatedMode || activeChapter.id === 'cycle-four-seasons') && (
            <section id="cycle-four-seasons">
              <MarketCyclesEducationModule
                symbol={symbol}
                onSelectSymbol={handleSelectSymbol}
                candles={activeCandles}
                btcLivePrice={btcLive}
                xrpLivePrice={xrpLive}
                xlmLivePrice={xlmLive}
                onEnterApp={handleEnterApp}
                onlyPart="four_seasons"
                sectionNumberOverride="04"
              />
            </section>
          )}

          {(!paginatedMode || activeChapter.id === 'cycle-monthly-rhythms') && (
            <section id="cycle-monthly-rhythms">
              <MarketCyclesEducationModule
                symbol={symbol}
                onSelectSymbol={handleSelectSymbol}
                candles={activeCandles}
                btcLivePrice={btcLive}
                xrpLivePrice={xrpLive}
                xlmLivePrice={xlmLive}
                onEnterApp={handleEnterApp}
                onlyPart="monthly_rhythms"
                sectionNumberOverride="05"
              />
            </section>
          )}

          {(!paginatedMode || activeChapter.id === 'cycle-four-year-clock') && (
            <section id="cycle-four-year-clock">
              <MarketCyclesEducationModule
                symbol={symbol}
                onSelectSymbol={handleSelectSymbol}
                candles={activeCandles}
                btcLivePrice={btcLive}
                xrpLivePrice={xrpLive}
                xlmLivePrice={xlmLive}
                onEnterApp={handleEnterApp}
                onlyPart="four_year_cycles"
                sectionNumberOverride="06"
              />
            </section>
          )}

          {(!paginatedMode || activeChapter.id === 'market-symphony') && (
            <section id="market-symphony">
              <CandlestickSymphonyComposer
                symbol={symbol}
                onSelectSymbol={handleSelectSymbol}
                candles={activeCandles}
                livePrice={livePrice}
                btcLivePrice={btcLive}
                xrpLivePrice={xrpLive}
                xlmLivePrice={xlmLive}
              />
            </section>
          )}

          {/* ====================================================================
           * STAGE II: INTERMEDIATE — SHEET MUSIC, FIBONACCI & PAPER REHEARSAL (08–12)
           * ==================================================================== */}
          {!paginatedMode && isTierLocked('intermediate') && (
            <AcademyPasscodeGateCard
              requiredTier="intermediate"
              chapterNumber="08–12"
              chapterTitle="Intermediate Curriculum: Candlestick Sheet Music, Fibonacci Extensions & Paper Rehearsal"
              chaptersInTier={WORKSHOP_CHAPTERS.filter((c) => c.groupId === 'intermediate').map(
                (c) => ({ number: c.number, fullTitle: c.fullTitle })
              )}
              publicGates={publicGates}
              onUnlockIntermediate={handleUnlockIntermediate}
              onUnlockAdvanced={handleUnlockAdvanced}
              onOpenBeginnerStart={() => navigateToChapter('start-here')}
              onOpenPublicLibrary={() => {
                setPaginatedMode(true);
                navigateToChapter('open-library');
              }}
              onOpenAdminModal={() => setShowAdminModal(true)}
              isAdminUser={isAdminUser}
              adminPreviewStudentGate={adminPreviewStudentGate}
              onExitStudentPreview={() => setAdminPreviewStudentGate(false)}
            />
          )}

          {!isTierLocked('intermediate') && (
            <>
              {(!paginatedMode || activeChapter.id === 'candlestick-guide') && (
                <section id="candlestick-guide">
                  <CandleEducationDeck
                    symbol={symbol}
                    candles={activeCandles}
                    selectedCandleIndex={selectedCandleIndex}
                    onSelectCandle={setSelectedCandleIndex}
                    fibLevels={fibLevels}
                    livePrice={livePrice}
                    onUsePriceAsEntry={(price) => {
                      setEntryPrice(price);
                      const dec = symbol === 'BTCUSDT' ? 2 : 4;
                      setAlertBanner(
                        `Set Planned Entry Price to $${price.toFixed(dec)} from Section 08 Candlestick & Fibonacci Guide`
                      );
                    }}
                  />
                </section>
              )}

              {(!paginatedMode || activeChapter.id === 'fibonacci-symphony-geometry') && (
                <section id="fibonacci-symphony-geometry">
                  <FibonacciSymphonyGeometryModule
                    symbol={symbol}
                    onSelectSymbol={handleSelectSymbol}
                    candles={activeCandles}
                    livePrice={livePrice}
                    onApplySetupToSimulator={({
                      entryPrice: ep,
                      stopLossPrice,
                      takeProfitPrice,
                      rrRatio: rr,
                    }) => {
                      setEntryPrice(ep);
                      const stopPct = Math.max(
                        0.5,
                        Math.min(10, Number((((ep - stopLossPrice) / ep) * 100).toFixed(2)))
                      );
                      setStopDistancePct(stopPct);
                      setRrRatio(rr);
                      const dec = symbol === 'BTCUSDT' ? 2 : 4;
                      if (isTierLocked('advanced')) {
                        setActiveBottomTab('portfolio');
                        setAlertBanner(
                          `Staged 3-Point Fibonacci Setup (${symbol.replace(
                            'USDT',
                            ''
                          )}): Point C Buy $${ep.toFixed(dec)} · 78.6% Stop $${stopLossPrice.toFixed(
                            dec
                          )} · 161.8% Target $${takeProfitPrice.toFixed(
                            dec
                          )} — Ready for Paper Rehearsal in Section 12`
                        );
                        navigateToChapter('portfolio-ledger');
                      } else {
                        setAlertBanner(
                          `Loaded 3-Point Fibonacci Setup (${symbol.replace(
                            'USDT',
                            ''
                          )}) onto Section 14 Order Desk: Point C Buy $${ep.toFixed(
                            dec
                          )} · 78.6% Stop $${stopLossPrice.toFixed(
                            dec
                          )} · 161.8% Golden Target $${takeProfitPrice.toFixed(dec)}`
                        );
                        navigateToChapter('risk-chart');
                      }
                    }}
                  />
                </section>
              )}

              {(!paginatedMode || activeChapter.id === 'fibonacci-symphony-markers') && (
                <section id="fibonacci-symphony-markers">
                  <FibonacciSymphonyMarkersStudio
                    symbol={symbol}
                    onSelectSymbol={handleSelectSymbol}
                    candles={activeCandles}
                    livePrice={livePrice}
                    btcLivePrice={btcLive}
                    xrpLivePrice={xrpLive}
                    xlmLivePrice={xlmLive}
                    onSendMarkerSetupToOrderDesk={({
                      symbol: targetSym,
                      entryPrice: ep,
                      stopLossPrice,
                      takeProfitPrice,
                      rrRatio: rr,
                      markerLabel,
                    }) => {
                      handleSelectSymbol(targetSym);
                      setEntryPrice(ep);
                      const stopPct = Math.max(
                        0.5,
                        Math.min(10, Number((((ep - stopLossPrice) / ep) * 100).toFixed(2)))
                      );
                      setStopDistancePct(stopPct);
                      setRrRatio(rr);
                      setTradeSide('long');
                      setShowRiskOverlay(true);
                      const dec = targetSym === 'BTCUSDT' ? 2 : 4;
                      if (isTierLocked('advanced')) {
                        setActiveBottomTab('portfolio');
                        setAlertBanner(
                          `Staged ${markerLabel} (${targetSym.replace(
                            'USDT',
                            ''
                          )}): Buy $${ep.toFixed(dec)} · 78.6% Stop $${stopLossPrice.toFixed(
                            dec
                          )} · Sell $${takeProfitPrice.toFixed(
                            dec
                          )} — Rehearse in Section 12 Paper Ledger before Stage III Live Execution`
                        );
                        navigateToChapter('portfolio-ledger');
                      } else {
                        setAlertBanner(
                          `Loaded ${markerLabel} (${targetSym.replace(
                            'USDT',
                            ''
                          )}) onto Section 14 Order Desk: Buy $${ep.toFixed(
                            dec
                          )} · 78.6% Stop $${stopLossPrice.toFixed(
                            dec
                          )} · Sell $${takeProfitPrice.toFixed(dec)}`
                        );
                        navigateToChapter('risk-chart');
                      }
                    }}
                  />
                </section>
              )}

              {(!paginatedMode || activeChapter.id === 'ai-buy-sell-helper') && (
                <section id="ai-buy-sell-helper">
                  <LiveAiSignalHelper
                    symbol={symbol}
                    onSelectSymbol={handleSelectSymbol}
                    timeframe={timeframe}
                    candles={activeCandles}
                    stats={activeStats}
                    fibLevels={fibLevels}
                    livePrice={livePrice}
                    btcLivePrice={btcLive}
                    xrpLivePrice={xrpLive}
                    xlmLivePrice={xlmLive}
                    accountBalance={accountBalance}
                    riskPercent={riskPercent}
                    onApplyRecommendationToChart={({
                      entryPrice: recEntry,
                      stopDistancePct: recStopPct,
                      rrRatio: recRr,
                    }) => {
                      setEntryPrice(recEntry);
                      setStopDistancePct(recStopPct);
                      setRrRatio(recRr);
                      setTradeSide('long');
                      setShowRiskOverlay(true);
                      const dec = symbol === 'BTCUSDT' ? 2 : 4;
                      if (isTierLocked('advanced')) {
                        setActiveBottomTab('portfolio');
                        setAlertBanner(
                          `Staged AI Examiner Levels (${symbol}): Buy $${recEntry.toFixed(
                            dec
                          )} · Stop ${recStopPct}% · 1:${recRr} Target — Ready for Section 12 Paper Rehearsal`
                        );
                        navigateToChapter('portfolio-ledger');
                      } else {
                        setAlertBanner(
                          `Loaded AI Buy & Sell Points onto Section 14 Live ${symbol} Chart: Buy $${recEntry.toFixed(
                            dec
                          )} · Stop ${recStopPct}% · 1:${recRr} Target (Use at Your Own Risk)`
                        );
                        navigateToChapter('risk-chart');
                      }
                    }}
                  />
                </section>
              )}

              {(!paginatedMode || activeChapter.id === 'portfolio-ledger') && (
                <section id="portfolio-ledger">
                  <PortfolioAndToolsSection
                    activeSectionTab={activeBottomTab}
                    onSectionTabChange={setActiveBottomTab}
                    positions={positions}
                    onClosePosition={handleClosePosition}
                    btcPrice={btcLive}
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
              )}
            </>
          )}

          {/* ====================================================================
           * STAGE III: ADVANCED — END OF THE PROCESS: SELF-CUSTODY EXECUTION (13–16)
           * ==================================================================== */}
          {!paginatedMode && isTierLocked('advanced') && (
            <AcademyPasscodeGateCard
              requiredTier="advanced"
              chapterNumber="13–16"
              chapterTitle="Advanced Capstone: 11-Skill Readiness, Single XRPL DEX Trade & 10-Set Execution"
              chaptersInTier={WORKSHOP_CHAPTERS.filter((c) => c.groupId === 'advanced').map(
                (c) => ({ number: c.number, fullTitle: c.fullTitle })
              )}
              publicGates={publicGates}
              onUnlockIntermediate={handleUnlockIntermediate}
              onUnlockAdvanced={handleUnlockAdvanced}
              onOpenBeginnerStart={() => navigateToChapter('start-here')}
              onOpenPublicLibrary={() => {
                setPaginatedMode(true);
                navigateToChapter('open-library');
              }}
              onOpenAdminModal={() => setShowAdminModal(true)}
              isAdminUser={isAdminUser}
              adminPreviewStudentGate={adminPreviewStudentGate}
              onExitStudentPreview={() => setAdminPreviewStudentGate(false)}
            />
          )}

          {!isTierLocked('advanced') && (
            <>
              {/* Stage III Finish-Line Execution Sequence Strip (Visible across Steps 13–16 in Page-by-Page Mode) */}
              {paginatedMode && activeChapter.groupId === 'advanced' && (
                <section
                  aria-label="Stage III Finish-Line Execution Sequence"
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Stage III — End-of-Process Execution Sequence
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Readiness Check → First Single Self-Custody Trade → 10-Set Sequencer → 24/7 Stewardship
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      Capstone Step {activeChapter.number} of 16
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    {[
                      {
                        id: 'skill-desk' as WorkshopChapterId,
                        step: '13. Readiness Check',
                        desc: 'Verify 11 risk & discipline skills before live orders',
                      },
                      {
                        id: 'risk-chart' as WorkshopChapterId,
                        step: '14. First Single XRPL Trade',
                        desc: 'Size 1 trade (e.g. 2 XRP) on the Embedded XRPL DEX',
                      },
                      {
                        id: 'ten-set-auto-trader' as WorkshopChapterId,
                        step: '15. 10-Set Sequencer',
                        desc: 'Import Set #01–#10 one by one with 1:2+ math',
                      },
                      {
                        id: 'ai-dex-lab' as WorkshopChapterId,
                        step: '16. 24/7 DEX Stewardship',
                        desc: 'Graduation architecture & ongoing self-custody',
                      },
                    ].map((item) => {
                      const isCurrent = activeChapter.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateToChapter(item.id)}
                          className={`p-3 rounded-lg border text-left transition-colors cursor-pointer space-y-1 ${
                            isCurrent
                              ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                            {item.step}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                            {item.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {(!paginatedMode || activeChapter.id === 'skill-desk') && (
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
                        `Armed Alert: ${newAl.symbol} ${newAl.condition} $${newAl.targetPrice.toFixed(
                          newAl.symbol === 'BTCUSDT' ? 2 : 4
                        )}`
                      );
                    }}
                  />
                </section>
              )}

              {(!paginatedMode || activeChapter.id === 'risk-chart') && (
                <div id="risk-chart" className="space-y-6">
                  <OneByOneTradeChecklist
                    contextStep="step14"
                    xrpLivePrice={xrpLive}
                    connectedXrplAddress={
                      embeddedXrplAddress ||
                      watchedWallets.find((w) => w.network === 'XRPL')?.address ||
                      ''
                    }
                    checklistState={oneByOneChecklist}
                    onChangeChecklistState={setOneByOneChecklist}
                    onLoadSetIntoDex={(payload) => {
                      handleSelectSymbol('XRPUSDT');
                      setInstrument('spot');
                      setLeverage(1);
                      setTradeSide('long');
                      setShowRiskOverlay(true);
                      if (payload.walletAddress) {
                        setEmbeddedXrplAddress(payload.walletAddress);
                      }
                      setImportedXrplDexSet({
                        ...payload,
                        nonce: Date.now(),
                      });
                      const numStr =
                        payload.setNumber < 10
                          ? `0${payload.setNumber}`
                          : String(payload.setNumber);
                      setAlertBanner(
                        `Loaded Set #${numStr} (${payload.setupName}) into Embedded XRPL DEX — ${payload.quantityXrp} XRP Ready!`
                      );
                    }}
                  />

                  <section className="flex flex-wrap items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleSelectSymbol('BTCUSDT')}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            symbol === 'BTCUSDT'
                              ? 'bg-amber-600 text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          BTC / USDT ($
                          {btcLive.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          )
                        </button>
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
                            ? 'Live Exchange Feed Connected'
                            : 'Simulated Live Market Feed'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 text-xs font-mono tabular-nums">
                      <div>
                        <span className="font-sans text-slate-500 dark:text-slate-400 block">
                          Live Mark Price
                        </span>
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          $
                          {symbol === 'BTCUSDT'
                            ? livePrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : livePrice.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="font-sans text-slate-500 dark:text-slate-400 block">
                          24h Change
                        </span>
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
                          ${(activeStats?.low24h ?? livePrice * 0.96).toFixed(symbol === 'BTCUSDT' ? 2 : 4)} – $
                          {(activeStats?.high24h ?? livePrice * 1.04).toFixed(symbol === 'BTCUSDT' ? 2 : 4)}
                        </span>
                      </div>
                      <div>
                        <span className="font-sans text-slate-500 dark:text-slate-400 block">
                          Hist. Volatility / ATR(14)
                        </span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {(activeStats?.annualizedVolatilityPct ?? 54.2).toFixed(1)}% · $
                          {(activeStats?.atr14 ?? livePrice * 0.015).toFixed(symbol === 'BTCUSDT' ? 2 : 4)}
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
                        connectedXrplAddress={
                          embeddedXrplAddress ||
                          watchedWallets.find((w) => w.network === 'XRPL')?.address ||
                          ''
                        }
                        onChangeXrplAddress={(addr) => setEmbeddedXrplAddress(addr)}
                        onSwitchToXrpSymbol={() => handleSelectSymbol('XRPUSDT')}
                        importedTenSet={importedXrplDexSet}
                      />
                    </div>
                  </section>
                </div>
              )}

              {(!paginatedMode || activeChapter.id === 'ten-set-auto-trader') && (
                <div id="ten-set-auto-trader" className="space-y-6">
                  <OneByOneTradeChecklist
                    contextStep="step15"
                    xrpLivePrice={xrpLive}
                    connectedXrplAddress={
                      embeddedXrplAddress ||
                      watchedWallets.find((w) => w.network === 'XRPL')?.address ||
                      ''
                    }
                    checklistState={oneByOneChecklist}
                    onChangeChecklistState={setOneByOneChecklist}
                    onLoadSetIntoDex={(payload) => {
                      handleSelectSymbol('XRPUSDT');
                      setInstrument('spot');
                      setLeverage(1);
                      setTradeSide('long');
                      setShowRiskOverlay(true);
                      if (payload.walletAddress) {
                        setEmbeddedXrplAddress(payload.walletAddress);
                      }
                      setImportedXrplDexSet({
                        ...payload,
                        nonce: Date.now(),
                      });
                      const numStr =
                        payload.setNumber < 10
                          ? `0${payload.setNumber}`
                          : String(payload.setNumber);
                      setAlertBanner(
                        `Loaded Set #${numStr} (${payload.setupName}) into Section 14 Embedded XRPL DEX — ${payload.quantityXrp} XRP Ready!`
                      );
                      navigateToChapter('risk-chart');
                    }}
                  />

                  <section>
                    <TenSetAutoTraderLab
                      symbol={symbol}
                      onSelectSymbol={handleSelectSymbol}
                      candles={activeCandles}
                      fibLevels={fibLevels}
                      livePrice={livePrice}
                      btcLivePrice={btcLive}
                      xrpLivePrice={xrpLive}
                      xlmLivePrice={xlmLive}
                      accountBalance={accountBalance}
                      riskPercent={riskPercent}
                      onLogSetPositionToPortfolio={handleOpenPaperPosition}
                      onSendSetToEmbeddedXrplDex={(payload) => {
                        handleSelectSymbol('XRPUSDT');
                        setInstrument('spot');
                        setLeverage(1);
                        setTradeSide('long');
                        setShowRiskOverlay(true);
                        if (payload.walletAddress) {
                          setEmbeddedXrplAddress(payload.walletAddress);
                        }
                        setOneByOneChecklist((prev) => ({
                          ...prev,
                          sets: {
                            ...prev.sets,
                            [payload.setNumber]: {
                              ...(prev.sets[payload.setNumber] || {
                                staged: false,
                                receiptChecked: false,
                                signedInWallet: false,
                                filledAndLogged: false,
                                note: '',
                              }),
                              staged: true,
                            },
                          },
                        }));
                        setImportedXrplDexSet({
                          ...payload,
                          nonce: Date.now(),
                        });
                        const numStr =
                          payload.setNumber < 10
                            ? `0${payload.setNumber}`
                            : String(payload.setNumber);
                        setAlertBanner(
                          `Loaded Set #${numStr} (${payload.setupName}) into Section 14 Embedded XRPL DEX — ${payload.quantityXrp} XRP Ready!`
                        );
                        navigateToChapter('risk-chart');
                      }}
                    />
                  </section>
                </div>
              )}

              {(!paginatedMode || activeChapter.id === 'ai-dex-lab') && (
                <div id="ai-dex-lab" className="space-y-6">
                  <section>
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

                  {/* End-of-Process Graduation & Self-Custody Stewardship Capstone Summary */}
                  <section
                    aria-label="Symphony Markets Academy Graduation Capstone"
                    className="rounded-xl border border-emerald-500/40 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6"
                  >
                    <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Step 16 of 16 · End of the Academy Process</span>
                        <span aria-hidden="true">·</span>
                        <span>Learn → Rehearse → Execute Stewardship Complete</span>
                      </div>
                      <h2
                        className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white"
                        style={{ textWrap: 'balance' }}
                      >
                        Graduation Protocol: How Symphony Markets Stewards Operate Going Forward
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-[70ch] leading-relaxed">
                        You have walked the full 16-step progression in intentional order—learning the market’s natural seasons first, reading Fibonacci sheet music and rehearsing on paper second, and executing calm, non-custodial limit orders last.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-1.5">
                        <div className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                          I. Seasons & Rhythm First (01–07)
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          Always identify whether we are in an <strong>Ascending Eagle</strong> or <strong>Descending Eagle</strong> season and check the monthly/4-year clock before hunting setups.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-1.5">
                        <div className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                          II. Fibonacci & Paper Proof (08–12)
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          Map 61.8% retracement support and 127.2% / 161.8% extension targets, verify at least a <strong>1:2 Risk-to-Reward</strong> ratio, and test new ideas in the Paper Ledger first.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                        <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                          III. One-by-One Self-Custody (13–16)
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          Keep 100% Spot self-custody (zero leverage, 2% max risk). Execute <strong>one limit order at a time</strong> in Section 14 or step-by-step from the Section 15 10-Set Sequencer.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => navigateToChapter('risk-chart')}
                        className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Go to Step 14: Single Trade on Embedded XRPL DEX →
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateToChapter('ten-set-auto-trader')}
                        className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Go to Step 15: 10-Set Sequencer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaginatedMode(true);
                          navigateToChapter('open-library');
                        }}
                        className="px-4 py-2.5 rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Open Media & Document Library
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </>
          )}

          {/* ====================================================================
           * STANDALONE REFERENCE ROOM: OPEN MEDIA & DOCUMENT LIBRARY (NO PASSCODE)
           * ==================================================================== */}
          {(!paginatedMode || activeChapter.id === 'open-library') && (
            <section id="open-library">
              <OpenMediaAndDocumentLibrary
                orientationVideoUrl={publicGates.orientationVideoUrl}
                orientationVideoTitle={publicGates.orientationVideoTitle}
                isAdminUnlocked={isAdminUser}
                onOpenAdminConsole={() => setShowAdminModal(true)}
                onJumpToBeginnerStart={() => {
                  setPaginatedMode(true);
                  navigateToChapter('start-here');
                }}
              />
            </section>
          )}

          {/* Clean End-of-Section Footer Bar (Every Section Ends Peacefully With Previous & Next Buttons) */}
          {paginatedMode && (
            <section
              aria-label="End of Section Navigation"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {isStandaloneLibraryActive
                      ? '✓ Open Reference Room (Accessible Anytime)'
                      : `✓ End of Step ${activeChapter.number} of ${PROGRESSION_CHAPTERS.length}`}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {activeChapter.fullTitle}
                  </span>
                </div>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  Stage {activeGroup.roman}: {activeGroup.label}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center">
                  {isStandaloneLibraryActive ? (
                    <button
                      type="button"
                      onClick={() => navigateToChapter(resumeStudyChapter.id)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span>Resume Step: {resumeStudyChapter.shortTitle}</span>
                    </button>
                  ) : prevChapter ? (
                    <button
                      type="button"
                      onClick={() => navigateToChapter(prevChapter.id)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span>Previous: {prevChapter.shortTitle}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigatePublicPage('welcome')}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4 shrink-0" />
                      <span>Return to Welcome Stage</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs">
                  <label
                    htmlFor="bottom-chapter-jump"
                    className="text-slate-500 dark:text-slate-400 whitespace-nowrap"
                  >
                    Jump to Section:
                  </label>
                  <select
                    id="bottom-chapter-jump"
                    value={activeChapter.id}
                    onChange={(e) => navigateToChapter(e.target.value)}
                    className="max-w-[270px] sm:max-w-[340px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    {CURRICULUM_GROUPS.map((grp) => (
                      <optgroup
                        key={grp.id}
                        label={`Stage ${grp.roman}: ${grp.label} (${grp.rangeBadge})`}
                      >
                        {WORKSHOP_CHAPTERS.filter((ch) => ch.groupId === grp.id).map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            {ch.groupId === 'open_library'
                              ? ch.fullTitle
                              : `${ch.number}. ${ch.fullTitle}`}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end">
                  {isStandaloneLibraryActive ? (
                    <button
                      type="button"
                      onClick={() => navigateToChapter('start-here')}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <span>Start Step 01: {PROGRESSION_CHAPTERS[0].fullTitle}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  ) : nextChapter ? (
                    <button
                      type="button"
                      onClick={() => navigateToChapter(nextChapter.id)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <span>
                        Next ({nextChapter.number}/{PROGRESSION_CHAPTERS.length}): {nextChapter.fullTitle}
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigateToChapter(PROGRESSION_CHAPTERS[0].id)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <span>Restart at 01: {PROGRESSION_CHAPTERS[0].fullTitle}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      )}

      {/* Instructor Admin & Student Passcode Console Modal */}
      <AcademyAdminConsoleModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        currentUser={academyUser}
        isAdminUser={isAdminUser}
        publicGates={publicGates}
        adminSettings={adminSettings}
        intermediateUnlocked={intermediateUnlocked}
        advancedUnlocked={advancedUnlocked}
        onUnlockIntermediate={handleUnlockIntermediate}
        onUnlockAdvanced={handleUnlockAdvanced}
        onLockStudentSessionGates={handleLockStudentSessionGates}
        onGoogleAdminSignIn={handleGoogleAdminSignIn}
        onGoogleAdminSignOut={handleGoogleAdminSignOut}
        onSaveConfiguration={handleSaveAdminConfiguration}
        authError={adminAuthError}
        isBusy={adminBusy}
      />

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
              Symphony Markets Academy — Free Open-Source No-Scam Zone Sandbox (Hypothetical Simulation · Zero Custody · Not Financial Advice).
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
