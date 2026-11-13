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

  // Default Google Drive Asset IDs from the shared Symphony Markets folder
  // Folder: https://drive.google.com/drive/folders/1hPDCoTd5K4163HsDW7_LtQXXB8VvBkv3
  const DEFAULT_DRIVE_VIDEO_ID = '1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw'; // Symphony_Markets__The_No-Scam_Sandbox.mp4
  const DEFAULT_DRIVE_PDF_ID = '1mMH2ngPd4gWPjFYEOAHtpv9XZm-v9McN'; // no-scam-zone-manifesto.pdf
  const MAX_VIDEO_CHUNK_BYTES = 2 * 1024 * 1024; // 2 MB chunks keep every HTTP response well under Cloud Run's 32 MB limit

  let cachedManifestoPdf: Buffer | null = null;

  app.get('/api/drive-video/:fileId', async (req, res) => {
    const rawId = String(req.params.fileId || DEFAULT_DRIVE_VIDEO_ID).trim();
    if (!/^[a-zA-Z0-9_-]{10,80}$/.test(rawId)) {
      res.status(400).json({ error: 'Invalid Google Drive video ID.' });
      return;
    }

    // Fast-path: if requesting the default homepage video and local web-optimized asset exists, stream from disk
    const fs = await import('fs');
    const localBundledVideo = path.join(__dirname, 'public', 'assets', 'symphony-welcome.mp4');
    if (rawId === DEFAULT_DRIVE_VIDEO_ID && fs.existsSync(localBundledVideo)) {
      const stat = fs.statSync(localBundledVideo);
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

        const fileStream = fs.createReadStream(localBundledVideo, { start, end });
        fileStream.on('error', () => {
          if (!res.writableEnded) res.end();
        });
        fileStream.pipe(res);
        return;
      }

      // Non-range fallback (local file is optimized well under 32 MB)
      res.status(200);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', String(totalSize));
      res.setHeader('Cache-Control', 'public, max-age=3600');
      fs.createReadStream(localBundledVideo).pipe(res);
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
    try {
      const fs = await import('fs');
      const localPdfPath = path.join(__dirname, 'public', 'assets', 'no-scam-zone-manifesto.pdf');
      if (!cachedManifestoPdf && fs.existsSync(localPdfPath)) {
        cachedManifestoPdf = fs.readFileSync(localPdfPath);
      }

      if (!cachedManifestoPdf) {
        const pdfUrl = `https://drive.google.com/uc?export=download&id=${DEFAULT_DRIVE_PDF_ID}`;
        const upstream = await fetch(pdfUrl, { redirect: 'follow' });
        if (!upstream.ok) {
          throw new Error(`Google Drive returned status ${upstream.status}`);
        }
        const arrayBuf = await upstream.arrayBuffer();
        cachedManifestoPdf = Buffer.from(arrayBuf);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', String(cachedManifestoPdf.length));
      res.setHeader(
        'Content-Disposition',
        `${isDownload ? 'attachment' : 'inline'}; filename="no-scam-zone-manifesto.pdf"`
      );
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(cachedManifestoPdf);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to retrieve PDF guide from Google Drive.';
      res.status(502).json({ error: message });
    }
  });

  // Serve local /assets/*.mp4 videos in 2 MB Range chunks so 30MB+ videos never hit Cloud Run's 32 MB response cap
  app.get(/^\/assets\/.+\.mp4$/i, async (req, res, next) => {
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
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', String(totalSize));
        res.end();
        return;
      }

      // If a client requests a large MP4 without Range, return the first 2 MB chunk as 206 so Cloud Run never drops >32MB payloads
      if (totalSize > 20 * 1024 * 1024) {
        const end = Math.min(MAX_VIDEO_CHUNK_BYTES - 1, totalSize - 1);
        res.status(206);
        res.setHeader('Content-Type', 'video/mp4');
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
