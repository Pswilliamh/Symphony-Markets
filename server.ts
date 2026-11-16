import 'dotenv/config';
import express from 'express';
import path from 'path';
import { Readable } from 'stream';
import { ReadableStream as WebReadableStream } from 'stream/web';
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

  app.post('/api/ai-buy-sell-helper', async (req, res) => {
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
        symbol,
        timeframe,
        livePrice,
        high24h,
        low24h,
        ema20,
        sma50,
        rsi14,
        fib382,
        fib500,
        fib618,
        latestPattern,
        accountBalance,
        riskPercent,
        recentCandlesSummary,
      } = req.body ?? {};

      const prompt = `Examine this LIVE crypto market state right now and generate recommended technical Buy (Entry), Safety Stop-Loss, and Sell (Take-Profit) points (Use at Your Own Risk):

Asset: ${symbol} (Timeframe: ${timeframe})
Current Live Price: $${livePrice}
24h Swing Range: Low $${low24h} to High $${high24h}
Moving Averages: 20 EMA = $${ema20} | 50 SMA = $${sma50}
Momentum: RSI(14) = ${rsi14}
Fibonacci Retracement Support/Resistance Levels:
- Fib 38.2%: $${fib382}
- Fib 50.0%: $${fib500}
- Fib 61.8% (Golden Pocket): $${fib618}
Latest Candlestick Pattern Detected: ${latestPattern}
Recent Candles Summary: ${recentCandlesSummary}
User Wallet Size: $${accountBalance} (Max Risk Per Trade: ${riskPercent}%)

Provide specific numerical Recommended Buy Zone 1 (Primary Pullback/Support Buy), Recommended Buy Zone 2 (Deep Value Buy), Recommended Stop-Loss (Invalidation Floor), and 3 Recommended Sell Zones (TP1 Conservative, TP2 Core 1:2 Target, TP3 Breakout Target), plus a plain-English explanation of why the live chart supports these exact points and what could invalidate the setup.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an algorithmic technical analysis helper examining live market structure (EMA 20/50, RSI 14, Fibonacci 38.2/50/61.8 levels, and candlestick patterns) to output concrete, disciplined Recommended Buy Points, Safety Stop-Loss Points, and Recommended Sell (Take-Profit) Points. Always include a clear reminder that all signals are probabilistic technical levels provided strictly on a "Use at Your Own Risk" basis with a strict 2% risk cap ($0.10 on a $5 wallet) and 1x Spot self-custody discipline.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              marketVerdict: {
                type: Type.STRING,
                description:
                  'One of: BUY_ZONE_ACTIVE, WAIT_FOR_PULLBACK_BUY, or SELL_RESISTANCE_ALERT',
              },
              verdictHeadline: {
                type: Type.STRING,
                description:
                  'Concise 1-sentence summary of the current live market posture and action.',
              },
              recommendedBuy1: {
                type: Type.NUMBER,
                description: 'Primary recommended buy/entry price based on live support/Fibonacci.',
              },
              recommendedBuy1Note: {
                type: Type.STRING,
                description: 'Plain-English reason why Buy Point 1 is the primary entry zone.',
              },
              recommendedBuy2: {
                type: Type.NUMBER,
                description: 'Secondary deep-discount limit buy price if a deeper wick occurs.',
              },
              recommendedBuy2Note: {
                type: Type.STRING,
                description: 'Plain-English reason for Deep Value Buy Point 2.',
              },
              recommendedStopLoss: {
                type: Type.NUMBER,
                description: 'Recommended safety stop-loss price below structural support.',
              },
              stopLossNote: {
                type: Type.STRING,
                description: 'Why this price invalidates the setup and protects the wallet.',
              },
              recommendedSell1: {
                type: Type.NUMBER,
                description: 'First recommended sell/take-profit price (TP1 conservative target).',
              },
              recommendedSell2: {
                type: Type.NUMBER,
                description: 'Second recommended sell/take-profit price (TP2 core 1:2 R:R target).',
              },
              recommendedSell3: {
                type: Type.NUMBER,
                description: 'Third recommended sell/take-profit price (TP3 upper breakout target).',
              },
              sellStrategyNote: {
                type: Type.STRING,
                description: 'How to scale out across Sell Points 1, 2, and 3 in plain English.',
              },
              liveMarketWhy: {
                type: Type.STRING,
                description:
                  '2-3 sentences in plain English explaining what the live candles, RSI, and moving averages are doing right now.',
              },
              riskDisclaimer: {
                type: Type.STRING,
                description:
                  'Explicit Use-at-Your-Own-Risk reminder tailored to this trade setup.',
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      res.json(JSON.parse(rawText));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error running AI Buy & Sell Helper.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ten-set-ai-explainer', async (req, res) => {
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
        symbol,
        executionMode,
        startingBalance,
        endingBalance,
        winCount,
        lossCount,
        netPnlUsd,
        setsSummary,
      } = req.body ?? {};

      const prompt = `An advanced student just ran the 10-Set Automated Buy & Sell Sequencer on ${symbol} (Mode: ${executionMode}).
Starting Wallet Balance: $${startingBalance} -> Ending Balance after 10 Sets: $${endingBalance} (Net PnL: $${netPnlUsd}, Wins: ${winCount}, Controlled 1R Stops: ${lossCount}).

Here are the 10 Buy & Sell Sets executed:
${setsSummary}

Write a crystal-clear, encouraging Masterclass Explanation teaching the student:
1. Overall 10-Set Executive Summary: What the automated engine did across all 10 sets and why thinking in "10-Set Batches" (Law of Large Numbers with 1:2 Risk-to-Reward) beats emotional single-trade gambling.
2. Why the Winning Buy & Sell Points Worked: How Fibonacci pullbacks, EMA support, and RSI confluence selected the entries and exits.
3. Why the Controlled Stop-Losses Were Essential: How the small 1R stops protected the wallet so the 2R/3R winners could compound.
4. Three Advanced Takeaways for Live Trust Wallet Self-Custody Execution.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a quantitative trading mentor for advanced students at Symphony Markets. Explain clearly what the 10-Set Automated Buy & Sell engine did and why each mathematical decision (Fibonacci entries, 1:2 R:R profit targets, and 2% stop-loss protection) teaches market mastery. Always remind students that automated tools are used at their own risk and that self-custody in Trust Wallet keeps them in full control of their keys.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: '1-sentence headline summarizing the 10-Set run and its core lesson.',
              },
              whatTheEngineDid: {
                type: Type.STRING,
                description:
                  'Clear explanation of how the automation selected the 10 buy and sell points.',
              },
              whyTenSetsMatter: {
                type: Type.STRING,
                description:
                  'Why executing in 10-trade sets with 1:2 R:R removes emotion and builds consistency.',
              },
              stopLossLesson: {
                type: Type.STRING,
                description:
                  'Why the 1-2 controlled stop-loss sets in the batch were actually a victory for risk management.',
              },
              advancedStudentTakeaways: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: '3 actionable lessons for the student from this 10-set run.',
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      res.json(JSON.parse(rawText));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unexpected error generating 10-Set AI Masterclass explanation.';
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
      message: 'Your 100% Free No-Scam Zone Manifesto PDF is unlocked and ready to download below.',
    });
  });

  // Default Google Drive Asset IDs from the shared Symphony Markets folder & Video Media subfolder
  // Folder: https://drive.google.com/drive/folders/1hPDCoTd5K4163HsDW7_LtQXXB8VvBkv3
  // Video Media Subfolder: https://drive.google.com/drive/folders/1UbpPHFwQ9WSu7X1-O8qmNk7UCyroS5og
  const DEFAULT_DRIVE_VIDEO_ID = '1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw'; // Symphony_Markets__The_No-Scam_Sandbox.mp4
  const ANTIDOTE_DRIVE_VIDEO_ID = '1vgJ0QiwY1aVtJwr-iPtKLdxTdcVqTTnr'; // Symphony_Markets__The_Antidote_to_Predation.mp4
  const BLUEPRINT_DRIVE_VIDEO_ID = '1RNomMOr0irdvq0nsbm8nQh2fhooCPoBp'; // Symphony_Markets__The__5_Blueprint.mp4
  // Newly added 10-second Promo Series streamed via /api/drive-video/:fileId:
  // - 1vvE86gSwiJeR7LxLPZcGfxbxw5EbPWM7 (Promo 1: KSBC Gold RWA & Open Math Proof)
  // - 1IANyjDSGVeC_7ksdot8cmAuNcZrSO8nO (Promo 2: 11-Module Day-Trader-Skill Sandbox)
  // - 1R_Cy_uBTBjVgLjCqseoAjPxm0oqh5e9g (Promo 3: Symphony Harp Candlesticks & 10-Cent Cap)
  // - 1eDtMP2vrBOl1AVqQ9ECVOUI0ByJ_JPtl (Promo 4: Transparent Crystalline AMM x * y = k)
  const DEFAULT_DRIVE_PDF_ID = '1mMH2ngPd4gWPjFYEOAHtpv9XZm-v9McN'; // no-scam-zone-manifesto.pdf
  const MAX_VIDEO_CHUNK_BYTES = 2 * 1024 * 1024; // 2 MB chunks keep every HTTP response well under Cloud Run's 32 MB limit

  const DRIVE_DOCS_MAP: Record<
    string,
    { localFile: string; driveId: string; downloadName: string; mimeType: string }
  > = {
    manifesto: {
      localFile: 'no-scam-zone-manifesto.pdf',
      driveId: '1mMH2ngPd4gWPjFYEOAHtpv9XZm-v9McN',
      downloadName: 'no-scam-zone-manifesto.pdf',
      mimeType: 'application/pdf',
    },
    certificate: {
      localFile: 'no-scam-zone-certificate.pdf',
      driveId: '1gijppbcHpuRfAcLSzOsYXJiD3SzIxf-e',
      downloadName: 'no-scam-zone-certificate.pdf',
      mimeType: 'application/pdf',
    },
    companion: {
      localFile: 'quantum-analemma-companion.pdf',
      driveId: '1L6Fq0y4Jwm7_j03Qb6Pbh83kZONAaXzy',
      downloadName: 'quantum-analemma-companion.pdf',
      mimeType: 'application/pdf',
    },
    book_pdf: {
      localFile: 'quantum-analemma-cycle.pdf',
      driveId: '1VOPZ7qvbJN9AbkxRaBG8kIl-fAMgdWer',
      downloadName: 'quantum-analemma-a-i-technology-cycle.pdf',
      mimeType: 'application/pdf',
    },
    book_epub: {
      localFile: 'quantum-analemma-cycle.epub',
      driveId: '1Us_E4FMnxOgcRZ-S056JR-Enq4s_v-u0',
      downloadName: 'quantum-analemma-a-i-technology-cycle.epub',
      mimeType: 'application/epub+zip',
    },
  };

  app.get('/api/drive-video/:fileId', async (req, res) => {
    const rawId = String(req.params.fileId || DEFAULT_DRIVE_VIDEO_ID).trim();
    if (!/^[a-zA-Z0-9_-]{10,80}$/.test(rawId)) {
      res.status(400).json({ error: 'Invalid Google Drive video ID.' });
      return;
    }

    // Fast-path: if requesting one of our known Google Drive videos and local web-optimized asset exists, stream from disk
    const fs = await import('fs');
    const localVideoCandidate =
      rawId === DEFAULT_DRIVE_VIDEO_ID
        ? path.join(__dirname, 'public', 'assets', 'symphony-welcome.mp4')
        : rawId === ANTIDOTE_DRIVE_VIDEO_ID
        ? path.join(__dirname, 'public', 'assets', 'symphony-antidote.mp4')
        : rawId === BLUEPRINT_DRIVE_VIDEO_ID
        ? path.join(
            __dirname,
            'public',
            'assets',
            'aistudio',
            'Symphony_Markets__The__5_Blueprint_781e68ab.mp4'
          )
        : null;

    if (localVideoCandidate && fs.existsSync(localVideoCandidate)) {
      const stat = fs.statSync(localVideoCandidate);
      const totalSize = stat.size;
      const rangeHeader = req.headers.range;

      if (rangeHeader) {
        const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
        const start = match ? parseInt(match[1], 10) : 0;
        const requestedEnd =
          match && match[2] ? parseInt(match[2], 10) : start + MAX_VIDEO_CHUNK_BYTES - 1;
        const end = Math.min(requestedEnd, start + MAX_VIDEO_CHUNK_BYTES - 1, totalSize - 1);

        if (start >= totalSize || start > end) {
          res.status(416).setHeader('Content-Range', `bytes */${totalSize}`).end();
          return;
        }

        const chunkLength = end - start + 1;
        res.status(206);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
        res.setHeader('Content-Length', String(chunkLength));
        res.setHeader('Cache-Control', 'public, max-age=3600');

        const fileStream = fs.createReadStream(localVideoCandidate, { start, end });
        fileStream.on('error', () => {
          if (!res.writableEnded) res.end();
        });
        fileStream.pipe(res);
        return;
      }

      // Non-range fallback: clamp to 2 MB chunk if > 20 MB
      const end = Math.min(MAX_VIDEO_CHUNK_BYTES - 1, totalSize - 1);
      res.status(206);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Range', `bytes 0-${end}/${totalSize}`);
      res.setHeader('Content-Length', String(end + 1));
      res.setHeader('Cache-Control', 'public, max-age=3600');
      fs.createReadStream(localVideoCandidate, { start: 0, end }).pipe(res);
      return;
    }

    // Upstream Google Drive streaming with strict 2 MB Range clamping so responses never exceed Cloud Run's 32 MB limit
    const abortController = new AbortController();
    req.on('close', () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    });

    try {
      const driveUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(rawId)}`;
      const rangeHeader = req.headers.range;
      let start = 0;
      let end = MAX_VIDEO_CHUNK_BYTES - 1;

      if (rangeHeader) {
        const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
        if (match) {
          start = parseInt(match[1], 10);
          const requestedEnd = match[2]
            ? parseInt(match[2], 10)
            : start + MAX_VIDEO_CHUNK_BYTES - 1;
          end = Math.min(requestedEnd, start + MAX_VIDEO_CHUNK_BYTES - 1);
        }
      }

      const upstream = await fetch(driveUrl, {
        headers: {
          Range: `bytes=${start}-${end}`,
        },
        redirect: 'follow',
        signal: abortController.signal,
      });

      if (!upstream.ok && upstream.status !== 206) {
        res.status(upstream.status).json({ error: 'Unable to stream video from Google Drive.' });
        return;
      }

      res.status(206);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      const contentLength = upstream.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      const contentRange = upstream.headers.get('content-range');
      if (contentRange) {
        res.setHeader('Content-Range', contentRange);
      }
      res.setHeader('Cache-Control', 'public, max-age=3600');

      if (!upstream.body) {
        res.end();
        return;
      }

      const nodeStream = Readable.fromWeb(upstream.body as unknown as WebReadableStream);
      nodeStream.on('error', () => {
        if (!res.writableEnded) res.end();
      });
      nodeStream.pipe(res);
    } catch (err: unknown) {
      if (abortController.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Video stream error';
      if (!res.headersSent) {
        res.status(502).json({ error: message });
      } else if (!res.writableEnded) {
        res.end();
      }
    }
  });

  app.get('/api/drive-pdf', async (req, res) => {
    const isDownload = req.query.download === '1';
    const docKey = String(req.query.doc || 'manifesto').trim();
    const docMeta = DRIVE_DOCS_MAP[docKey] ?? DRIVE_DOCS_MAP.manifesto;

    try {
      const fs = await import('fs');
      const localDocPath = path.join(__dirname, 'public', 'assets', docMeta.localFile);
      let fileBuffer: Buffer | null = null;

      if (fs.existsSync(localDocPath)) {
        fileBuffer = fs.readFileSync(localDocPath);
      } else {
        const driveUrl = `https://drive.google.com/uc?export=download&id=${docMeta.driveId || DEFAULT_DRIVE_PDF_ID}`;
        const upstream = await fetch(driveUrl, { redirect: 'follow' });
        if (!upstream.ok) {
          throw new Error(`Google Drive returned status ${upstream.status}`);
        }
        const arrayBuf = await upstream.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
      }

      res.setHeader('Content-Type', docMeta.mimeType);
      res.setHeader('Content-Length', String(fileBuffer.length));
      res.setHeader(
        'Content-Disposition',
        `${isDownload ? 'attachment' : 'inline'}; filename="${docMeta.downloadName}"`
      );
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(fileBuffer);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to retrieve document from Google Drive.';
      res.status(502).json({ error: message });
    }
  });

  // Serve local /assets/*.mp4 and /assets/*.m4a media in 2 MB Range chunks so 30MB-45MB files never hit Cloud Run's 32 MB response cap
  app.get(/^\/assets\/.+\.(mp4|m4a|mp3|ogg|webm)$/i, async (req, res, next) => {
    try {
      const fs = await import('fs');
      const publicRoot = path.resolve(__dirname, 'public');
      const distRoot = path.resolve(__dirname, 'dist');
      const decodedPath = decodeURIComponent(req.path).replace(/^\/+/, '');
      let candidatePath = path.resolve(publicRoot, decodedPath);
      if (!candidatePath.startsWith(publicRoot + path.sep) || !fs.existsSync(candidatePath)) {
        const distCandidate = path.resolve(distRoot, decodedPath);
        if (distCandidate.startsWith(distRoot + path.sep) && fs.existsSync(distCandidate)) {
          candidatePath = distCandidate;
        } else {
          next();
          return;
        }
      }

      const stat = fs.statSync(candidatePath);
      if (!stat.isFile()) {
        next();
        return;
      }

      const ext = path.extname(candidatePath).toLowerCase();
      const mediaMimeType =
        ext === '.m4a'
          ? 'audio/mp4'
          : ext === '.mp3'
          ? 'audio/mpeg'
          : ext === '.ogg'
          ? 'audio/ogg'
          : ext === '.webm'
          ? 'video/webm'
          : 'video/mp4';

      const totalSize = stat.size;
      const rangeHeader = req.headers.range;

      if (rangeHeader) {
        const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
        const start = match ? parseInt(match[1], 10) : 0;
        const requestedEnd =
          match && match[2] ? parseInt(match[2], 10) : start + MAX_VIDEO_CHUNK_BYTES - 1;
        const end = Math.min(requestedEnd, start + MAX_VIDEO_CHUNK_BYTES - 1, totalSize - 1);

        if (start >= totalSize || start > end) {
          res.status(416).setHeader('Content-Range', `bytes */${totalSize}`).end();
          return;
        }

        const chunkLength = end - start + 1;
        res.status(206);
        res.setHeader('Content-Type', mediaMimeType);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
        res.setHeader('Content-Length', String(chunkLength));
        res.setHeader('Cache-Control', 'public, max-age=3600');

        if (req.method === 'HEAD') {
          res.end();
          return;
        }

        const stream = fs.createReadStream(candidatePath, { start, end });
        stream.on('error', () => {
          if (!res.writableEnded) res.end();
        });
        stream.pipe(res);
        return;
      }

      if (req.method === 'HEAD') {
        res.status(200);
        res.setHeader('Content-Type', mediaMimeType);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', String(totalSize));
        res.end();
        return;
      }

      // If a client requests a large MP4/M4A without Range, return the first 2 MB chunk as 206 so Cloud Run never drops >32MB payloads
      if (totalSize > 20 * 1024 * 1024) {
        const end = Math.min(MAX_VIDEO_CHUNK_BYTES - 1, totalSize - 1);
        res.status(206);
        res.setHeader('Content-Type', mediaMimeType);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Range', `bytes 0-${end}/${totalSize}`);
        res.setHeader('Content-Length', String(end + 1));
        res.setHeader('Cache-Control', 'public, max-age=3600');
        const stream = fs.createReadStream(candidatePath, { start: 0, end });
        stream.on('error', () => {
          if (!res.writableEnded) res.end();
        });
        stream.pipe(res);
        return;
      }

      next();
    } catch {
      next();
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    let viteMiddleware: express.RequestHandler | null = null;
    const viteReady = (async () => {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false, watch: null },
        appType: 'spa',
      });
      viteMiddleware = vite.middlewares;
    })();

    app.use(async (req, res, next) => {
      if (!viteMiddleware) {
        await viteReady;
      }
      if (viteMiddleware) {
        viteMiddleware(req, res, next);
      } else {
        next();
      }
    });
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
