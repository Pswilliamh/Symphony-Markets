import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.post('/api/dex-ai-audit', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error:
            'GEMINI_API_KEY is not configured. Please check Settings > Secrets in AI Studio.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const {
        venueName,
        pairLabel,
        mode,
        livePrice,
        entryPrice,
        stopLoss,
        takeProfit,
        riskPercent,
        rrRatio,
        notionalUsd,
        poolTvlUsd,
        swapFeeBps,
        priceImpactBps,
        spreadBps,
        rsi14,
        atrPct,
      } = req.body ?? {};

      const prompt = `Analyze this decentralized exchange (DEX) paper trade setup using the 11-module day-trader-skill framework:
Venue: ${venueName} (${pairLabel})
Execution Mode: ${mode}
Live DEX Mid Price: $${livePrice}
Planned Entry: $${entryPrice} | Stop-Loss (${riskPercent}% risk): $${stopLoss} | Take-Profit (1:${rrRatio} R:R): $${takeProfit}
Order Notional Size: $${notionalUsd}
AMM Pool TVL: $${poolTvlUsd} | LP Swap Fee: ${swapFeeBps} bps | AMM Price Impact: ${priceImpactBps} bps | CLOB Spread: ${spreadBps} bps
Technicals: RSI(14) = ${rsi14}, 14-bar ATR = ${atrPct}% of price.

Evaluate whether 24/7 autonomous DEX execution faces excessive slippage/fee drag relative to the stop distance, and provide an educational decision brief.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a quantitative DeFi and DEX risk educator applying the 11-module day-trader-skill workflow (scanner, news, analyst, pelosi, entry, exit, risk, budget, timemachine, alerts, broker). Keep responses concise, realistic, and strictly educational (paper simulation only, never financial advice). Highlight how AMM slippage, LP fees, and on-chain spread affect a 2% risk / 1:2 R:R setup.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: {
                type: Type.STRING,
                description: 'Short status: STAGE_LIMIT_OFFER, WAIT_FOR_PULLBACK, or REDUCE_SIZE_SLIPPAGE',
              },
              headline: {
                type: Type.STRING,
                description: 'One concise sentence summarizing the AI DEX audit result.',
              },
              executionFrictionNote: {
                type: Type.STRING,
                description: 'Analysis of AMM price impact + LP fee + spread relative to the 1:2 R:R edge.',
              },
              soloVsHumanNote: {
                type: Type.STRING,
                description: 'How a 24/7 autonomous DEX agent handles this vs. human-in-the-loop confirmation.',
              },
              moduleHighlights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING },
                    finding: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error calling Gemini DEX audit.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/learning-coach', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error:
            'GEMINI_API_KEY is not configured. Please check Settings > Secrets in AI Studio.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const {
        question,
        symbol,
        livePrice,
        accountBalance,
        entryPrice,
        stopLoss,
        takeProfit,
        riskUsd,
        rewardUsd,
        candlePattern,
        priceZoneStatus,
        instrument,
        leverage,
      } = req.body ?? {};

      const prompt = `Learner Question: "${question}"

Live Context on Screen:
- Coin Selected: ${symbol} at Live Price $${livePrice}
- Learner Wallet Budget: $${accountBalance} (Mode: ${instrument}, Leverage: ${leverage}x)
- Planned Buy/Entry: $${entryPrice} | Safety Exit (Stop-Loss): $${stopLoss} (Max loss: $${riskUsd}) | Profit Goal: $${takeProfit} (Target gain: +$${rewardUsd})
- Latest Candlestick Clue: ${candlePattern}
- Current Price Zone: ${priceZoneStatus}

Answer the learner's question in warm, crystal-clear everyday English with zero unexplained Wall Street or crypto jargon. Help them understand how to make wise, calm decisions when experimenting with $5 in a real wallet (covering fee awareness, base reserves, never chasing spikes, and why risking pennies teaches real habits). Never give financial predictions or tell them a trade is guaranteed.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a patient, plain-English crypto market teacher helping a beginner learn market mechanics safely with a $5 real-wallet budget. Translate technical chart data into simple everyday analogies. Never promise profits or give financial advice; teach process, fee protection, and patience.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plainEnglishAnswer: {
                type: Type.STRING,
                description: 'Clear, friendly 2-4 sentence answer in everyday English.',
              },
              liveChartTranslation: {
                type: Type.STRING,
                description: 'What the live price and latest candle on screen mean right now in plain words.',
              },
              fiveDollarActionTip: {
                type: Type.STRING,
                description: 'One practical, safe habit for a $5 wallet experiment.',
              },
              jargonDecoded: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    simpleMeaning: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      res.json(JSON.parse(rawText));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error calling AI Learning Coach.';
      res.status(500).json({ error: message });
    }
  });

  const guideSignups: Array<{ email: string; requestedAt: string }> = [];

  app.post('/api/free-guide-signup', (req, res) => {
    const email = String(req.body?.email ?? '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    guideSignups.push({ email, requestedAt: new Date().toISOString() });
    res.json({
      ok: true,
      email,
      message: 'Your 100% Free No-Scam Zone PDF Guide is unlocked and ready to download below.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Symphony Markets server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
