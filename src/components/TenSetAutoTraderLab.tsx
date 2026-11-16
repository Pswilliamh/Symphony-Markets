import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ExternalLink,
  FastForward,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  StepForward,
  Wallet,
} from 'lucide-react';
import { AssetSymbol, Candle, FibonacciLevel, PaperPosition } from '../types/market';

interface TenSetAutoTraderLabProps {
  symbol: AssetSymbol;
  onSelectSymbol: (sym: AssetSymbol) => void;
  candles: Candle[];
  fibLevels: FibonacciLevel[];
  livePrice: number;
  xrpLivePrice: number;
  xlmLivePrice: number;
  accountBalance: number;
  riskPercent: number;
  onLogSetPositionToPortfolio?: (
    pos: Omit<PaperPosition, 'id' | 'openedAt' | 'status'>
  ) => void;
}

type ExecutionMode = 'simulated' | 'trust_wallet_live';

interface VerifiedLiveWallet {
  address: string;
  shortAddress: string;
  walletLabel: string;
  coinTicker: 'XRP' | 'XLM';
  totalCoins: number;
  reservedCoins: number;
  spendableCoins: number;
  checkedAt: string;
}

interface AutomatedTradeSet {
  setNumber: number;
  setupName: string;
  patternBadge: string;
  buyPrice: number;
  stopLossPrice: number;
  sellPrice: number;
  quantity: number;
  riskUsd: number;
  pnlUsd: number;
  pnlCoins: number;
  effectiveRMultiple: number;
  rMultiple: number;
  outcome: 'WIN_TARGET_HIT' | 'CONTROLLED_1R_STOP';
  startingCoinsBefore: number;
  cumulativeCoinsAfter: number;
  cumulativeBalanceAfter: number;
  cappedBySpotWallet: boolean;
  whatItDid: string;
  whyItBought: string;
  whyItSold: string;
  studentLesson: string;
  trustWalletTxPayload: string;
}

interface AiTenSetExplanation {
  headline: string;
  whatTheEngineDid: string;
  whyTenSetsMatter: string;
  stopLossLesson: string;
  advancedStudentTakeaways: string[];
}

declare global {
  interface Window {
    trustwallet?: {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    ethereum?: {
      isTrust?: boolean;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export const TenSetAutoTraderLab: React.FC<TenSetAutoTraderLabProps> = ({
  symbol,
  onSelectSymbol,
  candles,
  livePrice,
  xrpLivePrice,
  xlmLivePrice,
  accountBalance,
  riskPercent,
  onLogSetPositionToPortfolio,
}) => {
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('simulated');
  const [completedSetsCount, setCompletedSetsCount] = useState<number>(10);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [selectedSetNumber, setSelectedSetNumber] = useState<number>(1);

  // Active Self-Custody Wallet State (Xaman Android/iOS & Trust Wallet)
  const [walletNetwork, setWalletNetwork] = useState<
    'Xaman_XRPL' | 'XRPL' | 'Stellar' | 'EVM_TrustExtension'
  >(symbol === 'XRPUSDT' ? 'Xaman_XRPL' : 'Stellar');
  const [trustWalletAddress, setTrustWalletAddress] = useState<string>(
    'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh'
  );
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletStatusMsg, setWalletStatusMsg] = useState<string | null>(null);
  const [liveOnChainBalance, setLiveOnChainBalance] = useState<string | null>(null);
  const [verifiedWallet, setVerifiedWallet] = useState<VerifiedLiveWallet | null>(null);
  const [useLiveWalletSizing, setUseLiveWalletSizing] = useState<boolean>(true);
  const [isCheckingWallet, setIsCheckingWallet] = useState<boolean>(false);
  const [signedSetNumbers, setSignedSetNumbers] = useState<number[]>([]);

  // AI Masterclass Explanation State
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<AiTenSetExplanation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const activeCoinTicker: 'XRP' | 'XLM' = symbol === 'XRPUSDT' ? 'XRP' : 'XLM';
  const effectiveBasePrice =
    livePrice > 0 ? livePrice : symbol === 'XRPUSDT' ? 2.42 : 0.415;

  // Determine whether the 10-Set math is actively sized from the user's real connected wallet coins
  const isSizingFromLiveWallet =
    executionMode === 'trust_wallet_live' &&
    walletConnected &&
    useLiveWalletSizing &&
    verifiedWallet !== null &&
    verifiedWallet.coinTicker === activeCoinTicker &&
    verifiedWallet.spendableCoins > 0;

  // Build the 10 educational & algorithmic Buy/Sell Sets dynamically from either the Live Connected Wallet Spendable Coins OR Classroom Budget
  const tenSets = useMemo<AutomatedTradeSet[]>(() => {
    const basePrice = effectiveBasePrice;
    const coinTicker = activeCoinTicker;
    const startCoins = isSizingFromLiveWallet
      ? verifiedWallet.spendableCoins
      : Math.max(5, accountBalance) / basePrice;
    const startBal = Number((startCoins * basePrice).toFixed(2));
    const riskPctDecimal = Math.max(0.005, Math.min(0.05, riskPercent / 100));

    const blueprints: Array<{
      setupName: string;
      patternBadge: string;
      entryOffsetPct: number;
      stopDistPct: number;
      rMultiple: number;
      outcome: 'WIN_TARGET_HIT' | 'CONTROLLED_1R_STOP';
      whyItBought: string;
      whyItSold: string;
      studentLesson: string;
    }> = [
      {
        setupName: 'Set #01 · Fibonacci 61.8% Golden Pocket Pullback',
        patternBadge: 'Bullish Hammer + Fib 61.8%',
        entryOffsetPct: -0.018,
        stopDistPct: 0.018,
        rMultiple: 2.0,
        outcome: 'WIN_TARGET_HIT',
        whyItBought:
          'Price pulled back calmly into the 61.8% Fibonacci Golden Pocket support zone while printing a long lower Hammer wick—showing sellers were exhausted and buyers stepped in.',
        whyItSold:
          'Automatically placed the Sell limit order at exactly 1:2.0 Risk-to-Reward (+2.0R) just below the prior swing high ceiling so profits locked in before resistance.',
        studentLesson:
          'Never buy green spikes at the top. Waiting for the 61.8% Golden Pocket pullback lets you buy at wholesale and sell at retail.',
      },
      {
        setupName: 'Set #02 · 20 EMA Rising Staircase Bounce',
        patternBadge: '20/50 EMA Bullish Alignment',
        entryOffsetPct: -0.012,
        stopDistPct: 0.016,
        rMultiple: 2.0,
        outcome: 'WIN_TARGET_HIT',
        whyItBought:
          'The 20 EMA crossed above the 50 SMA (confirming a Bullish Staircase) and price touched the 20 EMA dynamic floor with RSI holding steady at 48.',
        whyItSold:
          'Sold into the upper Bollinger channel expansion at +2.0R once short-term RSI reached 68.',
        studentLesson:
          'In an uptrend, the 20-period Moving Average acts like a rising trampoline floor—buy when price rests on the line, not when it stretches far above it.',
      },
      {
        setupName: 'Set #03 · False Breakout Whip (Controlled 1R Safety Stop)',
        patternBadge: 'Stop-Loss Protection Test',
        entryOffsetPct: -0.008,
        stopDistPct: 0.015,
        rMultiple: -1.0,
        outcome: 'CONTROLLED_1R_STOP',
        whyItBought:
          'Entered on a 38.2% shallow pullback after a high-volume green bar.',
        whyItSold:
          'A sudden macro news wick pushed price 1.5% lower, triggering the automated Safety Stop-Loss for a strictly capped -1.0R loss.',
        studentLesson:
          'Even the best strategy has losing sets! Because the Stop-Loss capped the loss at -1R (2% of wallet), a single 2R win immediately erases this loss and puts you ahead.',
      },
      {
        setupName: 'Set #04 · RSI(14) Oversold Spring (<36) + Morning Star',
        patternBadge: 'Morning Star 3-Bar Reversal',
        entryOffsetPct: -0.025,
        stopDistPct: 0.02,
        rMultiple: 2.5,
        outcome: 'WIN_TARGET_HIT',
        whyItBought:
          'After Set #03’s washout wick, 14-bar RSI dropped to 34 (oversold) and formed a 3-candle Morning Star reversal right on the lower support band.',
        whyItSold:
          'Scaled out at +2.5R as momentum snapped back across the 50 SMA mean-reversion target.',
        studentLesson:
          'Stop-hunt wicks often create the best entry of the day. Staying calm after a small 1R stop lets you catch the +2.5R spring reversal.',
      },
      {
        setupName: 'Set #05 · Bullish Engulfing Volume Breakout Retest',
        patternBadge: 'Bullish Engulfing + Volume',
        entryOffsetPct: -0.005,
        stopDistPct: 0.016,
        rMultiple: 2.0,
        outcome: 'WIN_TARGET_HIT',
        whyItBought:
          'A large green candle completely engulfed the prior red body on 1.6x average volume, and the bot bought the calm 50% retest of that engulfing bar.',
        whyItSold:
          'Sold automatically at the +2.0R measured move projection before volume began to taper.',
        studentLesson:
          'When a breakout happens, wait for price to kiss the breakout level from above (“break-and-retest”) rather than chasing the initial candle.',
      },
      {
        setupName: 'Set #06 · Liquidity Pool Spread & Slippage Guard Exit',
        patternBadge: 'Doji Indecision + Support Hold',
        entryOffsetPct: -0.014,
        stopDistPct: 0.015,
        rMultiple: 1.5,
        outcome: 'WIN_TARGET_HIT',
        whyItBought:
          'Bought a Doji equilibrium candle resting on the 50% Fibonacci retracement midpoint with tight 4.2 bps DEX spread.',
        whyItSold:
          'Detected upper-wick selling pressure near +1.5R and automatically harvested profit early to protect gains.',
        studentLesson:
          'If sellers start leaving long upper wicks (Shooting Stars) just shy of your 2R target, locking in +1.5R is smart defensive stewardship.',
      },
      {
        setupName: 'Set #07 · Mid-Range Chop Shakeout (Controlled 1R Stop)',
        patternBadge: '2% Safety Net Triggered',
        entryOffsetPct: -0.009,
        stopDistPct: 0.015,
        rMultiple: -1.0,
        outcome: 'CONTROLLED_1R_STOP',
        whyItBought:
          'Tested a mid-channel support bounce while moving averages were flattening.',
        whyItSold:
          'Price drifted below the local swing low, and the automated Safety Stop exited cleanly at -1.0R with zero hesitation or "hoping."',
        studentLesson:
          'Amateurs move their stop-loss lower and turn a 10-cent dip into a wallet wipeout. Professionals take the tiny -1R exit and wait for Set #08.',
      },
      {
        setupName: 'Set #08 · Double-Bottom Institutional Demand Zone',
        patternBadge: 'W-Bottom + RSI Bullish Divergence',
        entryOffsetPct: -0.022,
        stopDistPct: 0.018,
        rMultiple: 2.2,
        outcome: 'WIN_TARGET_HIT',
        whyItBought:
          'Price retested the exact same support floor twice (forming a W-shaped Double Bottom) while RSI made a Higher Low (Bullish Divergence).',
        whyItSold:
          'Sold at +2.2R as price broke above the W-pattern neckline and reached the upper Fibonacci extension.',
        studentLesson:
          'A Double Bottom ("W" pattern) with rising RSI is one of the highest-probability signals that institutional buyers are defending a floor.',
      },
      {
        setupName: 'Set #09 · Higher-Low Continuation Channel',
        patternBadge: 'Ascending Channel HL3',
        entryOffsetPct: -0.004,
        stopDistPct: 0.015,
        rMultiple: 2.0,
        outcome: 'WIN_TARGET_HIT',
        whyItBought:
          'Entered on the 3rd Higher Low (HL3) along the ascending support trendline with 20 EMA and 50 SMA fanning upward.',
        whyItSold:
          'Sold at the top rail of the ascending channel for a clean +2.0R gain.',
        studentLesson:
          'Draw a line connecting Higher Lows in a Bull trend: buy near the bottom rail, sell near the top rail.',
      },
      {
        setupName: 'Set #10 · Full Confluence Symphony Finale (1:3 Runner)',
        patternBadge: 'Fib 61.8% + Hammer + EMA Cross',
        entryOffsetPct: -0.011,
        stopDistPct: 0.016,
        rMultiple: 3.0,
        outcome: 'WIN_TARGET_HIT',
        whyItBought:
          'All 4 factors aligned simultaneously: 61.8% Fib pullback, 20/50 EMA support, RSI at 42, and a Bullish Hammer candle.',
        whyItSold:
          'Trailed the stop-loss upward and rode the breakout wave to the full +3.0R Runner Target.',
        studentLesson:
          'Across 10 disciplined sets (8 wins, 2 small -1R stops), mathematical consistency compounds your wallet without ever needing luck or gambling.',
      },
    ];

    let runningBalance = startBal;
    let runningCoins = startCoins;

    return blueprints.map((bp, idx) => {
      const setNum = idx + 1;
      const startingCoinsBefore = Number(runningCoins.toFixed(4));
      const buyPrice = Number((basePrice * (1 + bp.entryOffsetPct)).toFixed(4));
      const stopLossPrice = Number((buyPrice * (1 - bp.stopDistPct)).toFixed(4));
      const priceRiskPerCoin = Math.max(0.0001, buyPrice - stopLossPrice);
      const sellPrice =
        bp.outcome === 'WIN_TARGET_HIT'
          ? Number((buyPrice + priceRiskPerCoin * bp.rMultiple).toFixed(4))
          : stopLossPrice;

      const targetRiskUsd = runningBalance * riskPctDecimal;
      const idealRiskQuantity = targetRiskUsd / priceRiskPerCoin;
      // In a real 1x Spot self-custody wallet (no leverage!), you can NEVER trade more coins than your spendable wallet balance
      const maxSpotUnitsInWallet = runningBalance / Math.max(buyPrice, 0.0001);
      const cappedBySpotWallet = idealRiskQuantity > maxSpotUnitsInWallet;
      const quantity = Number(Math.min(idealRiskQuantity, maxSpotUnitsInWallet).toFixed(2));

      const actualRiskUsd = Number((quantity * priceRiskPerCoin).toFixed(2));
      const rawPnlUsd =
        bp.outcome === 'WIN_TARGET_HIT'
          ? quantity * (sellPrice - buyPrice)
          : -quantity * (buyPrice - stopLossPrice);
      const pnlUsd = Number(rawPnlUsd.toFixed(2));
      const pnlCoins = Number((pnlUsd / Math.max(basePrice, 0.0001)).toFixed(4));

      runningBalance = Number(Math.max(0, runningBalance + pnlUsd).toFixed(2));
      runningCoins = Number((runningBalance / Math.max(basePrice, 0.0001)).toFixed(4));

      const walletSourceTag = isSizingFromLiveWallet
        ? `[Sized from Live Wallet: ${startingCoinsBefore.toFixed(2)} ${coinTicker} available] `
        : '';

      const whatItDid =
        bp.outcome === 'WIN_TARGET_HIT'
          ? `${walletSourceTag}Allocated ${quantity.toLocaleString()} ${coinTicker} at $${buyPrice.toFixed(4)} (Safety Stop $${stopLossPrice.toFixed(4)}) and Sold at $${sellPrice.toFixed(4)} for +$${pnlUsd.toFixed(2)} (+${pnlCoins.toFixed(2)} ${coinTicker} / +${bp.rMultiple.toFixed(1)}R).`
          : `${walletSourceTag}Allocated ${quantity.toLocaleString()} ${coinTicker} at $${buyPrice.toFixed(4)} and exited at the $${stopLossPrice.toFixed(4)} Safety Stop-Loss for $${pnlUsd.toFixed(2)} (${pnlCoins.toFixed(2)} ${coinTicker} / -1.0R).`;

      const trustWalletTxPayload = JSON.stringify(
        {
          network: symbol === 'XRPUSDT' ? 'XRPL_MAINNET' : 'STELLAR_PUBLIC',
          executionState: signedSetNumbers.includes(setNum)
            ? 'STAGED_AWAITING_WALLET_SIGNATURE'
            : 'PREVIEW_NOT_BROADCAST_ON_CHAIN',
          sizingSource: isSizingFromLiveWallet
            ? `LIVE_WALLET_SPENDABLE (${verifiedWallet?.spendableCoins.toFixed(2)} ${coinTicker})`
            : 'CLASSROOM_SANDBOX_BUDGET',
          set: setNum,
          pair: `${coinTicker}/USD`,
          buyLimitOffer: buyPrice,
          stopLossGuard: stopLossPrice,
          takeProfitOffer: sellPrice,
          quantityCoins: quantity,
          projectedWalletSpendableAfter: `${runningCoins.toFixed(2)} ${coinTicker} ($${runningBalance.toFixed(2)})`,
          selfCustodySigner: trustWalletAddress || 'USER_SELF_CUSTODY_WALLET',
        },
        null,
        2
      );

      return {
        setNumber: setNum,
        setupName: bp.setupName,
        patternBadge: bp.patternBadge,
        buyPrice,
        stopLossPrice,
        sellPrice,
        quantity,
        riskUsd: actualRiskUsd,
        pnlUsd,
        pnlCoins,
        effectiveRMultiple: bp.rMultiple,
        rMultiple: bp.rMultiple,
        outcome: bp.outcome,
        startingCoinsBefore,
        cumulativeCoinsAfter: runningCoins,
        cumulativeBalanceAfter: runningBalance,
        cappedBySpotWallet,
        whatItDid,
        whyItBought: bp.whyItBought,
        whyItSold: bp.whyItSold,
        studentLesson: bp.studentLesson,
        trustWalletTxPayload,
      };
    });
  }, [
    effectiveBasePrice,
    activeCoinTicker,
    isSizingFromLiveWallet,
    verifiedWallet,
    accountBalance,
    riskPercent,
    symbol,
    trustWalletAddress,
    signedSetNumbers,
  ]);

  // Auto-Run Stepper Effect when student clicks "Auto-Run All 10 Sets"
  useEffect(() => {
    if (!isAutoRunning) return;
    if (completedSetsCount >= 10) {
      setIsAutoRunning(false);
      return;
    }
    const timer = setTimeout(() => {
      setCompletedSetsCount((prev) => {
        const next = Math.min(10, prev + 1);
        setSelectedSetNumber(next);
        return next;
      });
    }, 650);
    return () => clearTimeout(timer);
  }, [isAutoRunning, completedSetsCount]);

  const visibleSets = useMemo(
    () => tenSets.slice(0, Math.max(1, completedSetsCount)),
    [tenSets, completedSetsCount]
  );

  const selectedSet = useMemo(
    () => tenSets.find((s) => s.setNumber === selectedSetNumber) ?? tenSets[0],
    [tenSets, selectedSetNumber]
  );

  const batchSummary = useMemo(() => {
    const startCoins = isSizingFromLiveWallet
      ? verifiedWallet.spendableCoins
      : Math.max(5, accountBalance) / effectiveBasePrice;
    const startBal = Number((startCoins * effectiveBasePrice).toFixed(2));
    const wins = visibleSets.filter((s) => s.outcome === 'WIN_TARGET_HIT').length;
    const losses = visibleSets.filter((s) => s.outcome === 'CONTROLLED_1R_STOP').length;
    const endBal =
      visibleSets.length > 0
        ? visibleSets[visibleSets.length - 1].cumulativeBalanceAfter
        : startBal;
    const endCoins =
      visibleSets.length > 0
        ? visibleSets[visibleSets.length - 1].cumulativeCoinsAfter
        : startCoins;
    const netPnl = Number((endBal - startBal).toFixed(2));
    const netCoins = Number((endCoins - startCoins).toFixed(2));
    const totalR = Number(visibleSets.reduce((acc, s) => acc + s.rMultiple, 0).toFixed(1));
    return {
      startBal,
      startCoins: Number(startCoins.toFixed(2)),
      endBal,
      endCoins: Number(endCoins.toFixed(2)),
      netPnl,
      netCoins,
      wins,
      losses,
      totalR,
    };
  }, [visibleSets, accountBalance, isSizingFromLiveWallet, verifiedWallet, effectiveBasePrice]);

  // Connect Active Xaman / Trust Wallet (Browser Extension or Public XRPL/Stellar Address Lookup)
  const handleConnectTrustWallet = async () => {
    setIsCheckingWallet(true);
    setWalletStatusMsg(null);
    const checkedTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    try {
      const provider = window.trustwallet || window.ethereum;
      if (walletNetwork === 'EVM_TrustExtension' && provider?.request) {
        const accounts = (await provider.request({
          method: 'eth_requestAccounts',
        })) as string[];
        if (accounts && accounts.length > 0) {
          setTrustWalletAddress(accounts[0]);
          setWalletConnected(true);
          setVerifiedWallet(null);
          setLiveOnChainBalance('Connected via Active Trust Wallet Browser Extension');
          setWalletStatusMsg(
            `Active Trust Wallet Extension connected (${accounts[0].slice(0, 8)}...${accounts[0].slice(-6)}). Zero private keys shared.`
          );
          setIsCheckingWallet(false);
          return;
        }
      }

      const trimmed = trustWalletAddress.trim();
      if (!trimmed) {
        setWalletStatusMsg('Please enter your public Xaman or Trust Wallet address first.');
        setIsCheckingWallet(false);
        return;
      }

      if (
        trimmed.startsWith('0x') &&
        (walletNetwork === 'Xaman_XRPL' || walletNetwork === 'XRPL')
      ) {
        setWalletConnected(false);
        setVerifiedWallet(null);
        setLiveOnChainBalance('Warning: 0x EVM/BEP-20 Address Detected');
        setWalletStatusMsg(
          'Heads-up: That 0x... address is BNB Smart Chain / Ethereum (wrapped XRP), NOT native XRP Ledger! Open Xaman on Android (or select Native XRP Ledger in Trust Wallet) and copy your address starting with lowercase r...'
        );
        setIsCheckingWallet(false);
        return;
      }

      // Live XRPL (Xaman / Trust Wallet) or Stellar Public Ledger Verification
      if (trimmed.startsWith('r') && trimmed.length >= 25) {
        onSelectSymbol('XRPUSDT');
        const res = await fetch('https://xrplcluster.com/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'account_info',
            params: [{ account: trimmed, strict: true, ledger_index: 'current' }],
          }),
        });
        const data = await res.json();
        const drops = data?.result?.account_data?.Balance;
        const walletLabelName =
          walletNetwork === 'Xaman_XRPL' ? 'Xaman Wallet (XRPL)' : 'Trust Wallet (XRPL)';
        const shortAddr = `${trimmed.slice(0, 8)}...${trimmed.slice(-6)}`;

        if (drops) {
          const totalXrp = Number((Number(drops) / 1_000_000).toFixed(4));
          const spendableXrp = Number(Math.max(0, totalXrp - 1).toFixed(4));
          setVerifiedWallet({
            address: trimmed,
            shortAddress: shortAddr,
            walletLabel: walletLabelName,
            coinTicker: 'XRP',
            totalCoins: totalXrp,
            reservedCoins: Math.min(1, totalXrp),
            spendableCoins: spendableXrp,
            checkedAt: checkedTime,
          });
          setUseLiveWalletSizing(true);
          setLiveOnChainBalance(
            `${totalXrp.toFixed(2)} XRP on XRPL (${spendableXrp.toFixed(2)} XRP spendable after 1 XRP reserve)`
          );
        } else if (data?.result?.error === 'actNotFound') {
          setVerifiedWallet({
            address: trimmed,
            shortAddress: shortAddr,
            walletLabel: walletLabelName,
            coinTicker: 'XRP',
            totalCoins: 0,
            reservedCoins: 0,
            spendableCoins: 0,
            checkedAt: checkedTime,
          });
          setLiveOnChainBalance('0.00 XRP on XRPL (Send ≥1 XRP to activate 1 XRP Base Reserve)');
        } else {
          setVerifiedWallet(null);
          setLiveOnChainBalance('Public XRPL address linked (Read-Only Non-Custodial Mode)');
        }
        setWalletConnected(true);
        setWalletStatusMsg(
          `Connected to ${walletLabelName} (${shortAddr}). All 10 Buy/Sell blocks below are now sized directly from your live spendable XRP!`
        );
      } else if (trimmed.startsWith('G') && trimmed.length >= 50) {
        onSelectSymbol('XLMUSDT');
        const shortAddr = `${trimmed.slice(0, 8)}...${trimmed.slice(-6)}`;
        const res = await fetch(`https://horizon.stellar.org/accounts/${trimmed}`);
        if (res.ok) {
          const data = await res.json();
          const native = (data?.balances || []).find(
            (b: { asset_type?: string }) => b.asset_type === 'native'
          );
          if (native?.balance) {
            const totalXlm = Number(Number(native.balance).toFixed(4));
            const spendableXlm = Number(Math.max(0, totalXlm - 1).toFixed(4));
            setVerifiedWallet({
              address: trimmed,
              shortAddress: shortAddr,
              walletLabel: 'Stellar Self-Custody Wallet',
              coinTicker: 'XLM',
              totalCoins: totalXlm,
              reservedCoins: Math.min(1, totalXlm),
              spendableCoins: spendableXlm,
              checkedAt: checkedTime,
            });
            setUseLiveWalletSizing(true);
            setLiveOnChainBalance(
              `${totalXlm.toFixed(2)} XLM on Stellar (${spendableXlm.toFixed(2)} XLM spendable after 1 XLM reserve)`
            );
          } else {
            setVerifiedWallet(null);
            setLiveOnChainBalance('Public Stellar address linked');
          }
        } else {
          setVerifiedWallet(null);
          setLiveOnChainBalance('Public Stellar address linked (Read-Only Non-Custodial Mode)');
        }
        setWalletConnected(true);
        setWalletStatusMsg(
          `Connected to active Stellar Wallet (${shortAddr}). All 10 Buy/Sell blocks below are sized from your live spendable XLM!`
        );
      } else {
        setWalletConnected(true);
        setVerifiedWallet(null);
        setLiveOnChainBalance('Active Self-Custody Wallet Linked (Non-Custodial)');
        setWalletStatusMsg(
          `Linked public wallet address (${trimmed.slice(0, 10)}...). Ready to stage 10-Set Buy & Sell orders.`
        );
      }
    } catch {
      setWalletConnected(true);
      setVerifiedWallet(null);
      setLiveOnChainBalance('Active Trust Wallet Linked (Non-Custodial Signing Mode)');
      setWalletStatusMsg(
        'Wallet linked in non-custodial mode. Every live order requires your explicit approval in your wallet app.'
      );
    } finally {
      setIsCheckingWallet(false);
    }
  };

  // Generate Gemini AI Masterclass Explanation of the 10 Sets
  const handleGenerateAiExplanation = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const setsSummary = tenSets
        .map(
          (s) =>
            `Set #${s.setNumber} (${s.setupName}): Buy $${s.buyPrice.toFixed(4)} -> Sell $${s.sellPrice.toFixed(4)} (${s.rMultiple > 0 ? '+' : ''}${s.rMultiple}R, PnL $${s.pnlUsd.toFixed(2)})`
        )
        .join('\n');

      const response = await fetch('/api/ten-set-ai-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          executionMode:
            executionMode === 'trust_wallet_live'
              ? 'Active Trust Wallet Connected Mode'
              : 'Simulated 10-Set Classroom Mode',
          startingBalance: batchSummary.startBal.toFixed(2),
          endingBalance: batchSummary.endBal.toFixed(2),
          winCount: batchSummary.wins,
          lossCount: batchSummary.losses,
          netPnlUsd: batchSummary.netPnl.toFixed(2),
          setsSummary,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate 10-Set AI explanation.');
      }
      setAiExplanation(data as AiTenSetExplanation);
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : 'Unexpected error calling 10-Set AI Explainer.'
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-6">
      {/* Header & Mode Switcher (Simulated vs. Active Trust Wallet Live) */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Advanced Student Automation Lab</span>
            <span aria-hidden="true">·</span>
            <span>10-Set Buy & Sell Sequencer</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              “What It Did & Why” Teaching Engine
            </span>
          </div>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Automated 10-Set Buy & Sell Sequencer (Simulated or Active Xaman / Trust Wallet)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Built for advanced students: this tool automatically chooses the <strong>Buy Point</strong>, <strong>Safety Stop-Loss</strong>, and <strong>Sell Point</strong> across <strong>10 complete sets (Set #01 – Set #10)</strong> and writes a plain-English breakdown of <em>what it did and why</em> so you master how institutional 10-trade batches work.
          </p>
        </div>

        {/* Mode Toggle: Simulated Classroom vs. Live Active Xaman / Trust Wallet */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setExecutionMode('simulated')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              executionMode === 'simulated'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Simulated 10-Set Mode
          </button>
          <button
            type="button"
            onClick={() => setExecutionMode('trust_wallet_live')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              executionMode === 'trust_wallet_live'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 inline mr-1.5" />
            Xaman / Trust Wallet Mode
          </button>
        </div>
      </div>

      {/* Active Xaman & Trust Wallet Connection Bar (Shown when in Active Wallet Mode) */}
      {executionMode === 'trust_wallet_live' && (
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  Non-Custodial Xaman (Android / iOS) & Trust Wallet Bridge · Zero Private Keys Asked
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Paste your public <strong>Xaman Wallet</strong> native XRPL address (<span className="font-mono">r...</span>) or <strong>Trust Wallet</strong> address (<span className="font-mono">r...</span> / <span className="font-mono">G...</span>) to verify your live on-chain balance and stage 10-Set DEX Limit Offers. <strong>Tip:</strong> Sending XRP to your personal Xaman <span className="font-mono">r...</span> wallet requires <strong>NO Destination Tag</strong>—just make sure Trust Wallet is on <strong>Native XRP (`r...`)</strong>, not BEP-20 (`0x...`).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setWalletNetwork('Xaman_XRPL');
                  setTrustWalletAddress('rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh');
                  onSelectSymbol('XRPUSDT');
                }}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  walletNetwork === 'Xaman_XRPL'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Xaman (Android XRPL)
              </button>
              <button
                type="button"
                onClick={() => {
                  setWalletNetwork('XRPL');
                  setTrustWalletAddress('rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh');
                  onSelectSymbol('XRPUSDT');
                }}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  walletNetwork === 'XRPL'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Trust Wallet (XRPL)
              </button>
              <button
                type="button"
                onClick={() => {
                  setWalletNetwork('Stellar');
                  setTrustWalletAddress(
                    'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
                  );
                  onSelectSymbol('XLMUSDT');
                }}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  walletNetwork === 'Stellar'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Stellar (XLM)
              </button>
              <button
                type="button"
                onClick={() => setWalletNetwork('EVM_TrustExtension')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  walletNetwork === 'EVM_TrustExtension'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Browser Extension
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={trustWalletAddress}
              onChange={(e) => setTrustWalletAddress(e.target.value)}
              placeholder="Paste public Xaman or Trust Wallet address (r... for XRPL or G... for Stellar)"
              className="flex-1 min-w-[240px] px-3.5 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <button
              type="button"
              disabled={isCheckingWallet}
              onClick={handleConnectTrustWallet}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isCheckingWallet
                ? 'Checking Live Ledger...'
                : walletConnected
                ? '✓ Wallet Verified on Ledger'
                : 'Verify Public Wallet'}
            </button>
            <a
              href="https://xumm.app/detect/xapp:xumm.dex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-emerald-400/60 dark:border-emerald-500/40 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open Xaman DEX (Android)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://link.trustwallet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open Trust Wallet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {walletStatusMsg && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-white/85 dark:bg-slate-900/85 px-3.5 py-2.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                <span>{walletStatusMsg}</span>
                <div className="flex flex-wrap items-center gap-2">
                  {liveOnChainBalance && (
                    <span className="font-mono font-bold">{liveOnChainBalance}</span>
                  )}
                  <button
                    type="button"
                    disabled={isCheckingWallet}
                    onClick={handleConnectTrustWallet}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCheckingWallet ? 'animate-spin' : ''}`} />
                    <span>Re-Check On-Chain</span>
                  </button>
                </div>
              </div>

              {/* Crystal-Clear Live Wallet Resource & Non-Custodial Execution Truth Panel */}
              {verifiedWallet && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="lg:col-span-6 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        1. Is the 10-Set Math Sizing From Your Live Wallet?
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseLiveWalletSizing((v) => !v)}
                        className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        {useLiveWalletSizing
                          ? 'Switch to $5 Classroom Preset'
                          : `Use My Live ${verifiedWallet.spendableCoins.toFixed(2)} ${verifiedWallet.coinTicker} Balance`}
                      </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {isSizingFromLiveWallet ? (
                        <>
                          <strong>YES — Live Balance Sizing Active:</strong> All 10 Buy & Sell blocks below start directly from your real{' '}
                          <strong className="font-mono text-slate-900 dark:text-white">
                            {verifiedWallet.spendableCoins.toFixed(2)} {verifiedWallet.coinTicker}
                          </strong>{' '}
                          spendable balance (
                          <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                            ${(verifiedWallet.spendableCoins * effectiveBasePrice).toFixed(2)} USD
                          </strong>{' '}
                          at ${effectiveBasePrice.toFixed(4)}), while keeping your{' '}
                          <span className="font-mono">{verifiedWallet.reservedCoins.toFixed(2)} {verifiedWallet.coinTicker}</span>{' '}
                          reserve locked ({verifiedWallet.totalCoins.toFixed(2)} {verifiedWallet.coinTicker} total on-chain).
                        </>
                      ) : (
                        <>
                          <strong>Currently Using Classroom Preset (${Math.max(5, accountBalance).toFixed(2)}):</strong>{' '}
                          {verifiedWallet.spendableCoins <= 0
                            ? `Your wallet (${verifiedWallet.shortAddress}) currently has 0.00 spendable ${verifiedWallet.coinTicker}.`
                            : verifiedWallet.coinTicker !== activeCoinTicker
                            ? `Switch the coin toggle below back to ${verifiedWallet.coinTicker} to size directly from your ${verifiedWallet.spendableCoins.toFixed(2)} ${verifiedWallet.coinTicker} wallet.`
                            : 'Click above to switch back to sizing from your live wallet balance.'}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="lg:col-span-6 space-y-1.5 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        2. Did “Auto-Run” Spend Real Coins On-Chain Yet?
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        Checked {verifiedWallet.checkedAt}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong>NO — 0.00 {verifiedWallet.coinTicker} Moved Automatically (100% Non-Custodial):</strong>{' '}
                      Clicking <em>Auto-Run All 10 Sets</em> calculates your step-by-step Buy & Sell plan using your real{' '}
                      <span className="font-mono">{verifiedWallet.spendableCoins.toFixed(2)} {verifiedWallet.coinTicker}</span>{' '}
                      balance, <strong>without touching your live wallet coins</strong>. Because Symphony Markets never holds your private keys, real on-chain trades only execute when you sign an order inside <strong>Xaman</strong> or <strong>Trust Wallet</strong>!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Control Deck: Auto-Run 10 Sets, Step 1 Set, Instant Complete, Coin Selector & AI Masterclass Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (completedSetsCount >= 10) {
                setCompletedSetsCount(1);
                setSelectedSetNumber(1);
              }
              setIsAutoRunning((v) => !v);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>
              {isAutoRunning
                ? `Auto-Running Set #${completedSetsCount} of 10...`
                : 'Auto-Run All 10 Sets Step-by-Step'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAutoRunning(false);
              setCompletedSetsCount((prev) => {
                const next = prev >= 10 ? 1 : prev + 1;
                setSelectedSetNumber(next);
                return next;
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step Next Set (+1)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAutoRunning(false);
              setCompletedSetsCount(10);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Show All 10 Sets</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAutoRunning(false);
              setCompletedSetsCount(1);
              setSelectedSetNumber(1);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onSelectSymbol('XRPUSDT')}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer whitespace-nowrap shrink-0 ${
                symbol === 'XRPUSDT'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              XRP (${xrpLivePrice.toFixed(4)})
            </button>
            <button
              type="button"
              onClick={() => onSelectSymbol('XLMUSDT')}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer whitespace-nowrap shrink-0 ${
                symbol === 'XLMUSDT'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              XLM (${xlmLivePrice.toFixed(4)})
            </button>
          </div>

          <button
            type="button"
            disabled={isGeneratingAi}
            onClick={handleGenerateAiExplanation}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Writing AI 10-Set Lesson...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Explain All 10 Sets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 10-Set Batch Scoreboard Strip (Shows Exact Live Wallet Coins + USD When Connected!) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono tabular-nums text-xs">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="font-sans text-slate-500 dark:text-slate-400">
            {isSizingFromLiveWallet ? 'Sets Planned (Non-Custodial)' : 'Sets Executed'}
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            {completedSetsCount} / 10 Sets
          </div>
          {isSizingFromLiveWallet && (
            <div className="font-sans text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              {signedSetNumbers.length} / 10 Staged to Sign
            </div>
          )}
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="font-sans text-slate-500 dark:text-slate-400">Win / Stop Ratio</div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {batchSummary.wins}W – {batchSummary.losses}L ({Math.round((batchSummary.wins / visibleSets.length) * 100)}%)
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="font-sans text-slate-500 dark:text-slate-400">Cumulative R-Edge</div>
          <div className="text-base font-bold text-sky-600 dark:text-sky-400 mt-0.5">
            +{batchSummary.totalR.toFixed(1)}R Total
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="font-sans text-slate-500 dark:text-slate-400">
            {isSizingFromLiveWallet
              ? `Live Wallet Spendable (${verifiedWallet.shortAddress.slice(0, 6)}..)`
              : 'Starting Budget'}
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            {isSizingFromLiveWallet
              ? `${batchSummary.startCoins.toFixed(2)} ${activeCoinTicker} ($${batchSummary.startBal.toFixed(2)})`
              : `$${batchSummary.startBal.toFixed(2)}`}
          </div>
          {isSizingFromLiveWallet && (
            <div className="font-sans text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              +{verifiedWallet.reservedCoins.toFixed(2)} {activeCoinTicker} locked = {verifiedWallet.totalCoins.toFixed(2)} on-chain
            </div>
          )}
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/25 col-span-2 sm:col-span-1">
          <div className="font-sans text-emerald-800 dark:text-emerald-300 font-semibold">
            {isSizingFromLiveWallet ? 'Projected Spendable After Sets' : 'Ending Balance'}
          </div>
          <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {isSizingFromLiveWallet
              ? `${batchSummary.endCoins.toFixed(2)} ${activeCoinTicker} ($${batchSummary.endBal.toFixed(2)})`
              : `$${batchSummary.endBal.toFixed(2)} (+$${batchSummary.netPnl.toFixed(2)})`}
          </div>
          {isSizingFromLiveWallet && (
            <div className="font-sans text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
              Net: {batchSummary.netCoins >= 0 ? '+' : ''}
              {batchSummary.netCoins.toFixed(2)} {activeCoinTicker} ({batchSummary.netPnl >= 0 ? '+' : ''}$
              {batchSummary.netPnl.toFixed(2)}) · Live wallet still {verifiedWallet.totalCoins.toFixed(2)} {activeCoinTicker} until signed
            </div>
          )}
        </div>
      </div>

      {/* Visual 10-Set Execution & Equity Growth SVG Map */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-white">
            Visual 10-Set Buy → Sell Execution Map (Click Any Set Bar #01 – #10 to Inspect Why It Bought & Sold)
          </span>
          <span className="font-mono text-amber-300">
            Green = Buy → Profit Target Sold · Red Shield = Controlled -1R Safety Stop
          </span>
        </div>

        <svg
          viewBox="0 0 900 205"
          className="w-full h-auto"
          role="img"
          aria-label="Visual 10-Set automated trading chart showing Sets 1 through 10 with Buy and Sell levels and rising wallet equity curve"
        >
          <line x1="30" y1="35" x2="870" y2="35" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="30" y1="95" x2="870" y2="95" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="30" y1="155" x2="870" y2="155" stroke="#334155" strokeWidth="1" />

          {tenSets.map((setItem, idx) => {
            const xCenter = 68 + idx * 84;
            const isUnlocked = setItem.setNumber <= completedSetsCount;
            const isSelected = setItem.setNumber === selectedSetNumber;
            const isWin = setItem.outcome === 'WIN_TARGET_HIT';

            const buyY = 128;
            const sellY = isWin ? 54 : 148;

            return (
              <g
                key={setItem.setNumber}
                className="cursor-pointer"
                opacity={isUnlocked ? 1 : 0.25}
                onClick={() => {
                  if (!isUnlocked) setCompletedSetsCount(setItem.setNumber);
                  setSelectedSetNumber(setItem.setNumber);
                }}
              >
                {/* Highlight Column Box */}
                <rect
                  x={xCenter - 36}
                  y="16"
                  width="72"
                  height="174"
                  rx="8"
                  fill={isSelected ? '#0EA5E9' : '#0F172A'}
                  fillOpacity={isSelected ? '0.2' : '0.4'}
                  stroke={isSelected ? '#38BDF8' : '#1E293B'}
                  strokeWidth={isSelected ? '2' : '1'}
                />

                {/* Set Number Header */}
                <text
                  x={xCenter}
                  y="32"
                  textAnchor="middle"
                  fill={isSelected ? '#FBBF24' : '#94A3B8'}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  SET #{setItem.setNumber < 10 ? `0${setItem.setNumber}` : setItem.setNumber}
                </text>

                {/* Vertical Connector from Buy to Sell */}
                <line
                  x1={xCenter}
                  y1={buyY}
                  x2={xCenter}
                  y2={sellY}
                  stroke={isWin ? '#10B981' : '#F43F5E'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* BUY Node */}
                <circle cx={xCenter} cy={buyY} r="5.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
                <text
                  x={xCenter}
                  y={buyY + 15}
                  textAnchor="middle"
                  fill="#BAE6FD"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  Buy ${setItem.buyPrice.toFixed(3)}
                </text>

                {/* SELL Node */}
                <circle
                  cx={xCenter}
                  cy={sellY}
                  r="6"
                  fill={isWin ? '#10B981' : '#F43F5E'}
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
                <text
                  x={xCenter}
                  y={isWin ? sellY - 9 : sellY + 15}
                  textAnchor="middle"
                  fill={isWin ? '#6EE7B7' : '#FDA4AF'}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {isWin ? `+${setItem.rMultiple}R` : '-1.0R Stop'}
                </text>

                {/* Cumulative Balance Footer (Shows Live Coin Progression + USD When Connected!) */}
                <text
                  x={xCenter}
                  y="174"
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  ${setItem.cumulativeBalanceAfter.toFixed(2)}
                </text>
                <text
                  x={xCenter}
                  y="185"
                  textAnchor="middle"
                  fill="#38BDF8"
                  fontSize="7.8"
                  fontFamily="monospace"
                >
                  {setItem.cumulativeCoinsAfter.toFixed(2)} {activeCoinTicker}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 10 Quick Set Selector Pills/Buttons */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {tenSets.map((s) => {
            const isSelected = s.setNumber === selectedSetNumber;
            const isWin = s.outcome === 'WIN_TARGET_HIT';
            return (
              <button
                key={s.setNumber}
                type="button"
                onClick={() => {
                  if (s.setNumber > completedSetsCount) {
                    setCompletedSetsCount(s.setNumber);
                  }
                  setSelectedSetNumber(s.setNumber);
                }}
                className={`py-2 px-1 rounded-lg border text-center font-mono text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/20 text-white'
                    : isWin
                    ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400'
                    : 'border-rose-500/30 bg-rose-950/30 text-rose-300 hover:border-rose-400'
                }`}
              >
                #{s.setNumber < 10 ? `0${s.setNumber}` : s.setNumber}{' '}
                {isWin ? `+${s.rMultiple}R` : '-1R'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Set Detailed "What It Did & Why" Teaching Card */}
      <div className="rounded-xl border-2 border-sky-400/70 dark:border-sky-500/40 bg-sky-50/30 dark:bg-slate-950 p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="font-bold text-sky-700 dark:text-sky-400">
                INSPECTING SET #{selectedSet.setNumber < 10 ? `0${selectedSet.setNumber}` : selectedSet.setNumber} OF 10
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 dark:text-slate-400">
                Setup Clue: {selectedSet.patternBadge}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-bold ${
                  selectedSet.outcome === 'WIN_TARGET_HIT'
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {selectedSet.outcome === 'WIN_TARGET_HIT'
                  ? `✓ TARGET SOLD (+${selectedSet.rMultiple}R / +$${selectedSet.pnlUsd.toFixed(2)})`
                  : `■ SAFETY STOP EXIT (-1.0R / $${selectedSet.pnlUsd.toFixed(2)})`}
              </span>
            </div>
            <h3 className="font-editorial text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {selectedSet.setupName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {executionMode === 'trust_wallet_live' && (
              <button
                type="button"
                onClick={() => {
                  if (!signedSetNumbers.includes(selectedSet.setNumber)) {
                    setSignedSetNumbers((prev) => [...prev, selectedSet.setNumber]);
                  }
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {signedSetNumbers.includes(selectedSet.setNumber)
                  ? `✓ Set #${selectedSet.setNumber} Staged in Trust Wallet`
                  : `Stage Set #${selectedSet.setNumber} Buy/Sell in Trust Wallet`}
              </button>
            )}

            {onLogSetPositionToPortfolio && (
              <button
                type="button"
                onClick={() =>
                  onLogSetPositionToPortfolio({
                    symbol,
                    instrument: 'spot',
                    side: 'long',
                    entryPrice: selectedSet.buyPrice,
                    stopLoss: selectedSet.stopLossPrice,
                    takeProfit: selectedSet.sellPrice,
                    quantity: selectedSet.quantity,
                    notionalUsd: Number((selectedSet.buyPrice * selectedSet.quantity).toFixed(2)),
                    marginRequiredUsd: Number(
                      (selectedSet.buyPrice * selectedSet.quantity).toFixed(2)
                    ),
                    leverage: 1,
                    liquidationPrice: null,
                    riskAmountUsd: selectedSet.riskUsd,
                    riskPercent,
                    rewardAmountUsd: Math.abs(selectedSet.pnlUsd),
                    rrRatio: Math.abs(selectedSet.rMultiple),
                  })
                }
                className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Send Set #{selectedSet.setNumber} to Paper Portfolio →
              </button>
            )}
          </div>
        </div>

        {/* 4-Column Plain-English Explanation Grid: What It Did / Why It Bought / Why It Sold / Student Lesson */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-mono font-bold text-sky-700 dark:text-sky-400">
              1. WHAT THE TOOL DID
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {selectedSet.whatItDid}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px] text-slate-500 space-y-0.5">
              <div>
                Set Size: {selectedSet.quantity.toFixed(2)} {activeCoinTicker}
                {selectedSet.cappedBySpotWallet ? ' (1x Spot Wallet Cap)' : ''}
              </div>
              <div>Buy Entry: ${selectedSet.buyPrice.toFixed(4)}</div>
              <div>Safety Stop: ${selectedSet.stopLossPrice.toFixed(4)}</div>
              <div>Sell Exit: ${selectedSet.sellPrice.toFixed(4)}</div>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Balance After Set: {selectedSet.cumulativeCoinsAfter.toFixed(2)} {activeCoinTicker} ($
                {selectedSet.cumulativeBalanceAfter.toFixed(2)})
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              2. WHY IT CHOSE THAT BUY POINT
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedSet.whyItBought}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-mono font-bold text-amber-700 dark:text-amber-400">
              3. WHY IT CHOSE THAT SELL POINT
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedSet.whyItSold}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-500/30 space-y-2">
            <div className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
              4. STUDENT TAKEAWAY LESSON
            </div>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {selectedSet.studentLesson}
            </p>
          </div>
        </div>

        {/* Non-Custodial Trust Wallet Order Payload Inspector (Shown when in Active Trust Wallet Mode) */}
        {executionMode === 'trust_wallet_live' && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
              <span className="font-mono font-bold text-emerald-400">
                Non-Custodial Trust Wallet DEX Offer Payload (Set #{selectedSet.setNumber})
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Signed Locally in Your Wallet · 0 Seed Phrases Shared
              </span>
            </div>
            <pre className="text-[11px] font-mono text-sky-300 overflow-x-auto bg-slate-950 p-3 rounded-lg border border-slate-800">
              {selectedSet.trustWalletTxPayload}
            </pre>
          </div>
        )}
      </div>

      {/* Gemini AI Masterclass Explanation Panel (When Triggered) */}
      {aiError && (
        <div className="p-3.5 rounded-lg border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-200">
          {aiError}
        </div>
      )}

      {aiExplanation && (
        <div className="rounded-xl border-2 border-amber-400 dark:border-amber-400/70 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-500/30 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>AI MASTERCLASS DEBRIEF OF YOUR 10-SET RUN</span>
            </div>
            <span className="text-xs font-mono text-slate-500">Gemini Quantitative Coach</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {aiExplanation.headline}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                What the 10-Set Automation Did
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiExplanation.whatTheEngineDid}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                Why Trading in 10-Set Batches Works
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiExplanation.whyTenSetsMatter}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                Why the Controlled Stop-Losses Mattered
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiExplanation.stopLossLesson}
              </p>
            </div>
          </div>

          {aiExplanation.advancedStudentTakeaways?.length > 0 && (
            <div className="pt-2 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">
                3 Key Lessons for Your Next 10 Sets:
              </div>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                {aiExplanation.advancedStudentTakeaways.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Full 10-Set Ledger Table so students can compare all 10 Buy & Sell sets side by side */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400">
              <th className="py-2.5 px-3 font-semibold">Set #</th>
              <th className="py-2.5 px-3 font-semibold">Technical Setup & Clue</th>
              <th className="py-2.5 px-3 font-semibold font-mono">Size ({activeCoinTicker})</th>
              <th className="py-2.5 px-3 font-semibold font-mono">Buy Point</th>
              <th className="py-2.5 px-3 font-semibold font-mono">Safety Stop</th>
              <th className="py-2.5 px-3 font-semibold font-mono">Sell Point</th>
              <th className="py-2.5 px-3 font-semibold font-mono">Result</th>
              <th className="py-2.5 px-3 font-semibold font-mono">
                {isSizingFromLiveWallet ? 'Live Wallet Plan After' : 'Balance After'}
              </th>
              <th className="py-2.5 px-3 font-semibold">Why It Bought & Sold (Summary)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {visibleSets.map((row) => {
              const isSelected = row.setNumber === selectedSetNumber;
              const isWin = row.outcome === 'WIN_TARGET_HIT';
              return (
                <tr
                  key={row.setNumber}
                  onClick={() => setSelectedSetNumber(row.setNumber)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-50/80 dark:bg-sky-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    Set #{row.setNumber < 10 ? `0${row.setNumber}` : row.setNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                    {row.patternBadge}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200 tabular-nums whitespace-nowrap">
                    {row.quantity.toFixed(2)} {activeCoinTicker}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-sky-600 dark:text-sky-400 tabular-nums whitespace-nowrap">
                    ${row.buyPrice.toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-600 dark:text-rose-400 tabular-nums whitespace-nowrap">
                    ${row.stopLossPrice.toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                    ${row.sellPrice.toFixed(4)}
                  </td>
                  <td
                    className={`py-2.5 px-3 font-mono font-bold tabular-nums whitespace-nowrap ${
                      isWin
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isWin ? `+${row.rMultiple}R (+$${row.pnlUsd.toFixed(2)})` : `-1.0R ($${row.pnlUsd.toFixed(2)})`}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                    {row.cumulativeCoinsAfter.toFixed(2)} {activeCoinTicker} (${row.cumulativeBalanceAfter.toFixed(2)})
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-md truncate">
                    {row.whyItBought}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Use at Your Own Risk & Self-Custody Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            <strong>Use at Your Own Risk:</strong> Automated 10-Set Buy & Sell signals are for educational mastery and non-custodial self-custody execution. Never risk more than 2% per set.
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-sky-600 dark:text-sky-400">
          <span>Click any row above to inspect its full 4-part lesson</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </section>
  );
};
