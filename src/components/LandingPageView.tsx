import React, { useEffect, useRef, useState } from 'react';
import founderDeskImg from '../assets/images/founder_desk_story_1794561548330.jpg';
import noScamCompassImg from '../assets/images/no_scam_compass_1794561548457.jpg';
import videoCoverStopsImg from '../assets/images/video_cover_stops_1794561549253.jpg';
import videoCoverWalletImg from '../assets/images/video_cover_wallet_1794561551281.jpg';
import { createNoScamZonePdfBlob } from '../utils/pdfGuideGenerator';

export type PublicPageTab = 'welcome' | 'features' | 'story' | 'guide';

interface LandingPageViewProps {
  activePage: PublicPageTab;
  onNavigatePage: (page: PublicPageTab) => void;
  onEnterApp: (targetSectionId?: string) => void;
  xrpLivePrice: number;
  xlmLivePrice: number;
}

interface WalkthroughSlide {
  chapter: string;
  title: string;
  caption: string;
  image: string;
}

interface VideoLessonItem {
  id: string;
  number: string;
  title: string;
  duration: string;
  description: string;
  coverSrc: string;
  coverAlt: string;
  driveUrl: string;
}

const WELCOME_SLIDES: WalkthroughSlide[] = [
  {
    chapter: '01 / Welcome to Symphony Markets',
    title: 'An Honest, Scam-Free Classroom for Learning Crypto Markets',
    caption:
      'Years ago, a fake "stop-trading" website stole money from unsuspecting beginners. Symphony Markets was built as the exact opposite: 100% free, open-source, and non-custodial.',
    image: founderDeskImg,
  },
  {
    chapter: '02 / The No-Scam Zone Policy',
    title: 'Zero Deposits, Zero Seed Phrases, Zero Paid Bot Hype',
    caption:
      'You never send money to this app. Every stop-loss, fee, and slippage formula is open on GitHub, and AI acts strictly as a plain-English shield against bad trades.',
    image: noScamCompassImg,
  },
  {
    chapter: '03 / Learn With a Real $5 Wallet',
    title: 'Practice Wise Decisions Using the 10-Cent Safety Net',
    caption:
      'Discover why low-fee networks like Stellar (XLM) and XRP let you test real self-custody swaps for fractions of a cent while risking pennies—never your whole wallet.',
    image: videoCoverWalletImg,
  },
  {
    chapter: '04 / Live Charts, Candlesticks & 11-Skill Desk',
    title: 'Step Inside the Interactive Training Workspace',
    caption:
      'Decode live XRP and XLM candlesticks, test setups in the 2,500-path Time Machine, and ask the Plain-English AI Mentor before you ever make a move.',
    image: videoCoverStopsImg,
  },
];

const HOMEPAGE_DRIVE_VIDEO_URL =
  'https://drive.google.com/file/d/1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw/view';
const MANIFESTO_DRIVE_PDF_VIEW_URL =
  'https://drive.google.com/file/d/1mMH2ngPd4gWPjFYEOAHtpv9XZm-v9McN/view';
const SHARED_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1hPDCoTd5K4163HsDW7_LtQXXB8VvBkv3';

const INITIAL_LESSONS: VideoLessonItem[] = [
  {
    id: 'vid_sandbox_overview',
    number: 'Overview Video',
    title: 'Symphony Markets: The No-Scam Sandbox (Official Walkthrough)',
    duration: 'Google Drive MP4 · Ready',
    description:
      'Our connected homepage video from Google Drive introducing Symphony Markets, the No-Scam Zone mission, and how to explore the training sandbox safely.',
    coverSrc: founderDeskImg,
    coverAlt: 'Sunlight across a warm oak study desk with notebook and market charts',
    driveUrl: HOMEPAGE_DRIVE_VIDEO_URL,
  },
  {
    id: 'vid_fake_stops',
    number: 'Lesson 01',
    title: 'How Fake "Stop-Trading" Buttons Scam Beginners—And How Real Protection Works',
    duration: '1 min · Coming Soon',
    description:
      'Learn how fraudulent websites fake stop-loss controls on screen while holding your funds hostage, and why keeping coins in your own wallet changes everything.',
    coverSrc: videoCoverStopsImg,
    coverAlt: 'Printed market study notes and brass ruler on a sunlit wooden table',
    driveUrl: '',
  },
  {
    id: 'vid_five_dollar_wallet',
    number: 'Lesson 02',
    title: 'Your First $5 Self-Custody Wallet: Avoiding Gas Traps & Seed-Phrase Scams',
    duration: '1 min · Coming Soon',
    description:
      'A calm, 60-second walkthrough of practicing with $5 of XLM or XRP using public read-only tracking—without ever giving any website access to your wallet.',
    coverSrc: videoCoverWalletImg,
    coverAlt: 'Smartphone beside a pocket notebook on a warm sunlit cafe table',
    driveUrl: '',
  },
];

function toEmbeddableVideoUrl(rawUrl: string): { type: 'iframe' | 'video'; src: string } | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch?.[1]) {
    if (driveMatch[1] === '1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw') {
      return { type: 'video', src: '/assets/symphony-welcome.mp4' };
    }
    return {
      type: 'video',
      src: `/api/drive-video/${driveMatch[1]}`,
    };
  }

  const driveIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveIdParam?.[1]) {
    if (driveIdParam[1] === '1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw') {
      return { type: 'video', src: '/assets/symphony-welcome.mp4' };
    }
    return {
      type: 'video',
      src: `/api/drive-video/${driveIdParam[1]}`,
    };
  }

  if (
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('/api/drive-video/') ||
    trimmed.endsWith('.mp4') ||
    trimmed.endsWith('.webm') ||
    trimmed.endsWith('.ogg')
  ) {
    return { type: 'video', src: trimmed };
  }

  return { type: 'iframe', src: trimmed };
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  activePage,
  onNavigatePage,
  onEnterApp,
  xrpLivePrice,
  xlmLivePrice,
}) => {
  const welcomeVideoRef = useRef<HTMLVideoElement | null>(null);

  // Media Player State (Page 1: Welcome — connected by default to Google Drive Homepage Video)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [elapsedInSlide, setElapsedInSlide] = useState<number>(0);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>(HOMEPAGE_DRIVE_VIDEO_URL);
  const [showUrlEditor, setShowUrlEditor] = useState<boolean>(false);
  const [draftVideoUrl, setDraftVideoUrl] = useState<string>(HOMEPAGE_DRIVE_VIDEO_URL);

  // Story Page Video Library Link State (Page 3: Our Story)
  const [lessons, setLessons] = useState<VideoLessonItem[]>(INITIAL_LESSONS);
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [draftLessonUrl, setDraftLessonUrl] = useState<string>('');

  // Free PDF Guide Email Form State (Page 4: Free PDF Guide)
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState<boolean>(false);
  const [unlockedForEmail, setUnlockedForEmail] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  useEffect(() => {
    if (!isPlaying || customVideoUrl || activePage !== 'welcome') return;
    const timer = setInterval(() => {
      setElapsedInSlide((prev) => {
        if (prev + 1 >= 8) {
          setCurrentSlideIdx((s) => {
            if (s + 1 >= WELCOME_SLIDES.length) {
              setIsPlaying(false);
              return 0;
            }
            return s + 1;
          });
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, customVideoUrl, activePage]);

  const activeSlide = WELCOME_SLIDES[currentSlideIdx];
  const totalProgressPct =
    ((currentSlideIdx * 8 + elapsedInSlide) / (WELCOME_SLIDES.length * 8)) * 100;
  const embeddedCustomVideo = toEmbeddableVideoUrl(customVideoUrl);

  const handleSaveDriveLink = (id: string) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              driveUrl: draftLessonUrl.trim(),
              duration: draftLessonUrl.trim()
                ? '1 min · Google Drive Video'
                : '1 min · Coming Soon',
            }
          : l
      )
    );
    setEditingLessonId(null);
    setDraftLessonUrl('');
  };

  const handleRequestFreeGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address (for example, name@example.com).');
      return;
    }

    setIsSubmittingEmail(true);
    try {
      const res = await fetch('/api/free-guide-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not validate email');
      }
      setUnlockedForEmail(trimmed);
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : 'Unable to submit right now.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await fetch('/api/drive-pdf?download=1');
      if (!res.ok) {
        throw new Error('Fallback to generated PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'no-scam-zone-manifesto.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      const fallbackBlob = createNoScamZonePdfBlob(unlockedForEmail ?? undefined);
      const url = URL.createObjectURL(fallbackBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'no-scam-zone-manifesto.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  /* ============================================================================
   * PAGE 1: SINGLE-STAGE WELCOME LANDING SCREEN (NO VERTICAL SCROLL CLUTTER)
   * ============================================================================ */
  if (activePage === 'welcome') {
    return (
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4 lg:py-6 flex-1 flex items-center">
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: App Welcome & Direct Entry Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>100% Free & Open-Source</span>
                <span aria-hidden="true">·</span>
                <span>No-Scam Zone Policy</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Live XRP ${xrpLivePrice.toFixed(4)} / XLM ${xlmLivePrice.toFixed(4)}
                </span>
              </div>

              <div className="space-y-2.5">
                <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.04]">
                  Symphony Markets
                </h1>
                <p
                  className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-sky-700 dark:text-sky-400 leading-snug"
                  style={{ textWrap: 'balance' }}
                >
                  Learn how markets truly work—without hype, fees, or scams.
                </p>
              </div>

              <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-[58ch]">
                Watch the short welcome overview in the media player, grab our 100% free{' '}
                <strong>No-Scam Zone PDF Guide</strong>, or step directly inside the interactive training workspace to practice wise decisions with a $5 real-wallet roadmap.
              </p>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onEnterApp()}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Enter Symphony Markets App →
                </button>

                <button
                  type="button"
                  onClick={() => onNavigatePage('guide')}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Free No-Scam PDF Guide
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>No signup required to enter</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigatePage('features')}
                  className="text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                >
                  Explore Features
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigatePage('story')}
                  className="text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                >
                  Read Our Story
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent On-Screen Video Media Player */}
          <div className="lg:col-span-7 flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
            <div className="relative aspect-16/9 w-full bg-slate-950 overflow-hidden">
              {embeddedCustomVideo ? (
                embeddedCustomVideo.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={welcomeVideoRef}
                      key={embeddedCustomVideo.src}
                      poster={founderDeskImg}
                      controls
                      playsInline
                      preload="metadata"
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      onEnded={() => setVideoPlaying(false)}
                      className="w-full h-full object-contain bg-slate-950"
                    >
                      <source src={embeddedCustomVideo.src} type="video/mp4" />
                      <source
                        src="/api/drive-video/1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw"
                        type="video/mp4"
                      />
                    </video>

                    {!videoPlaying && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-12 bg-gradient-to-b from-black/35 via-transparent to-black/35 flex items-center justify-center p-4">
                        <button
                          type="button"
                          onClick={() => {
                            const el = welcomeVideoRef.current;
                            if (el) {
                              void el.play();
                            }
                          }}
                          className="pointer-events-auto px-5 py-3 rounded-lg bg-white/95 hover:bg-white text-slate-950 text-xs sm:text-sm font-semibold shadow-lg transition-transform duration-150 hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          ▶ Play Welcome Video
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <iframe
                    src={embeddedCustomVideo.src}
                    title="Symphony Markets Welcome Video"
                    allow="autoplay; fullscreen"
                    className="w-full h-full border-0"
                  />
                )
              ) : (
                <>
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-200 ${
                      isPlaying ? 'scale-[1.02]' : 'scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 flex flex-col justify-between p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-200 font-mono">
                      <span>{activeSlide.chapter}</span>
                      <span>{isPlaying ? 'PLAYING OVERVIEW' : '4-SLIDE OVERVIEW'}</span>
                    </div>

                    {!isPlaying && (
                      <div className="my-auto flex justify-center">
                        <button
                          type="button"
                          onClick={() => setIsPlaying(true)}
                          aria-label="Play Slide Tour"
                          className="px-5 py-2.5 rounded-lg bg-white/95 hover:bg-white text-slate-950 text-xs sm:text-sm font-semibold shadow-md transition-transform duration-150 hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          ▶ Play 4-Slide Summary
                        </button>
                      </div>
                    )}

                    <div className="space-y-1 max-w-2xl">
                      <h2 className="font-editorial text-lg sm:text-xl font-bold text-white leading-snug">
                        {activeSlide.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {activeSlide.caption}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Compact Transport Bar */}
            <div className="py-2.5 px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {!embeddedCustomVideo && (
                <div className="w-full h-1 bg-slate-200 dark:border-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 transition-transform duration-200 origin-left"
                    style={{ width: `${Math.min(100, totalProgressPct)}%` }}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {!embeddedCustomVideo ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className="px-2.5 py-1 font-semibold bg-slate-900 dark:bg-slate-800 text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <div className="flex items-center gap-1">
                      {WELCOME_SLIDES.map((s, idx) => (
                        <button
                          key={s.chapter}
                          type="button"
                          onClick={() => {
                            setCurrentSlideIdx(idx);
                            setElapsedInSlide(0);
                          }}
                          className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                            currentSlideIdx === idx
                              ? 'bg-sky-600/15 text-sky-700 dark:text-sky-400 font-semibold'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          0{idx + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomVideoUrl(HOMEPAGE_DRIVE_VIDEO_URL);
                        setIsPlaying(false);
                      }}
                      className="ml-2 font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap"
                    >
                      ← Back to Homepage Video
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Symphony Markets: The No-Scam Sandbox
                    </span>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => setCustomVideoUrl('')}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer whitespace-nowrap"
                    >
                      View 4-Slide Summary
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowUrlEditor((v) => !v);
                    setDraftVideoUrl(customVideoUrl || HOMEPAGE_DRIVE_VIDEO_URL);
                  }}
                  className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  {showUrlEditor ? 'Close Video Settings' : 'Video Source'}
                </button>
              </div>

              {showUrlEditor && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <input
                    type="url"
                    value={draftVideoUrl}
                    onChange={(e) => setDraftVideoUrl(e.target.value)}
                    placeholder="Paste Google Drive share link or .mp4 URL..."
                    className="flex-1 min-w-[220px] px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomVideoUrl(draftVideoUrl.trim());
                      setShowUrlEditor(false);
                      setIsPlaying(false);
                    }}
                    className="px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Load Video
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ============================================================================
   * PAGE 2: STANDALONE FEATURES PAGE
   * ============================================================================ */
  if (activePage === 'features') {
    return (
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              Platform Capabilities · 100% Free Open-Source Toolkit
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              What Symphony Markets Provides Inside the App
            </h1>
          </div>

          <button
            type="button"
            onClick={() => onEnterApp()}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Enter Training App →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {[
            {
              span: 'md:col-span-7',
              num: '01. $5 Real-Wallet Guided Training Roadmap',
              desc: 'A progressive 5-step beginner curriculum teaching you how to avoid multi-dollar network gas traps, understand XRPL/Stellar 1-coin wallet reserves, check whether a coin is near its ceiling, and apply the "10-Cent Safety Net" on a real $5 Spot budget.',
              targetId: 'start-here',
              actionLabel: 'Launch $5 Roadmap →',
            },
            {
              span: 'md:col-span-5',
              num: '02. Plain-English AI Market Mentor',
              desc: 'Ask any question in everyday words. Our server-side AI Mentor reads live XRP and XLM candles and decodes confusing Wall Street jargon before you touch your wallet.',
              targetId: 'start-here',
              actionLabel: 'Ask the AI Mentor →',
            },
            {
              span: 'md:col-span-4',
              num: '03. 2% Risk & 1:2 Stop-Loss Simulator',
              desc: 'Real-time open-source position sizing across 1x Spot, Futures margin/liquidation warnings, and Options breakeven math—with visual target lines plotted directly on live charts.',
              targetId: 'risk-chart',
              actionLabel: 'Open Risk Calculator →',
            },
            {
              span: 'md:col-span-4',
              num: '04. Candlestick & Fibonacci Decoder',
              desc: 'Automatically spots Hammer, Doji, Morning Star, and Engulfing bars on live XRP/USDT and XLM/USDT feeds, explaining what buyers and sellers are doing at key pullback bands.',
              targetId: 'candlestick-guide',
              actionLabel: 'Explore Candlestick Guide →',
            },
            {
              span: 'md:col-span-4',
              num: '05. 11-Module Skill Desk & Time Machine',
              desc: 'Includes a 2,500-path Monte Carlo session replay, multi-chart scanner, 6-point pre-trade risk audit, scale-out exit ladder, and explicit "yes"-gated paper bracket tickets.',
              targetId: 'skill-desk',
              actionLabel: 'Try the Time Machine →',
            },
            {
              span: 'md:col-span-12',
              num: '06. Read-Only Public Wallet Watch & 24/7 Decentralized DEX Lab',
              desc: 'Safely monitor external Trust Wallet, XRPL, and Stellar public addresses without ever exposing private keys, and inspect real on-chain DEX AMM liquidity pools (XRP/RLUSD, XLM/USDC, and tokenized Solar DePIN pools).',
              targetId: 'ai-dex-lab',
              actionLabel: 'Inspect Live DEX & Wallet Tools →',
            },
          ].map((feat) => (
            <div
              key={feat.num}
              className={`${feat.span} p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-4`}
            >
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {feat.num}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onEnterApp(feat.targetId)}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  {feat.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ============================================================================
   * PAGE 3: STANDALONE OUR STORY, NO-SCAM ZONE & 1-MINUTE VIDEO LIBRARY PAGE
   * ============================================================================ */
  if (activePage === 'story') {
    return (
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <img
                src={noScamCompassImg}
                alt="Solid brass compass and optical glass lens resting on travertine stone"
                referrerPolicy="no-referrer"
                className="w-full aspect-4/3 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                About Symphony Markets · Free & Open-Source on GitHub
              </div>
              <h1
                className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-snug"
                style={{ textWrap: 'balance' }}
              >
                My First Trading Experience Was a Fake “Stop-Trading” Scam. I Promised to Build the Opposite.
              </h1>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[68ch]">
                <p>
                  Years ago, when I first became curious about trading, I signed up with an online company that looked completely legitimate on the surface. Their website even featured a prominent <strong>“Stop Trading”</strong> button designed to make beginners feel protected. It was a lie—the button was completely fake, built to deceive people while stealing their hard-earned money.
                </p>
                <p>
                  Over the past six or seven years watching the crypto space, it has been heartbreaking to see that same greed repeated in new disguises: fake automated bots, rigged dashboards, secret-phrase phishing, and influencers promising guaranteed daily returns.
                </p>
                <p>
                  Back then, I made a commitment: if I ever had the chance to help people avoid being scammed, I would establish a strict <strong>No-Scam Zone Policy</strong>. Symphony Markets uses AI not to sell hype, but to give everyday learners an honest, transparent chance to understand markets safely.
                </p>
              </div>
            </div>
          </div>

          {/* 4-Pillar Charter */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            <div className="space-y-1">
              <strong className="block text-slate-900 dark:text-white">
                01. Zero Custody of Your Money
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                You never deposit a single cent here. Your $5 stays inside your own wallet while we read only public ledger balances.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="block text-slate-900 dark:text-white">
                02. Real Math, Open-Source Code
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Published freely on GitHub so anyone can inspect how every stop-loss, fee, and slippage number is calculated.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="block text-slate-900 dark:text-white">
                03. No Paid Bots or Referral Traps
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                No subscriptions, no profit-sharing gas cards, no VIP signal groups, and no multi-level referral links.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="block text-slate-900 dark:text-white">
                04. AI Used as a Shield, Not Hype
              </strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Our AI Mentor warns you about fee traps, FOMO ceiling spikes, and risky leverage before you act.
              </p>
            </div>
          </div>

          {/* 1-Minute How-To Video Trading Library */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-sky-600 dark:text-sky-400">
                  Trading Video Library · Connected to Google Drive
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                  Walkthrough & Short 60-Second How-To Video Guides
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <a
                  href={SHARED_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:underline"
                >
                  Open Shared Google Drive Folder ↗
                </a>
                <button
                  type="button"
                  onClick={() => onEnterApp()}
                  className="font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Practice Inside the App →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {lessons.map((lesson) => {
                const resolvedMedia = toEmbeddableVideoUrl(lesson.driveUrl);
                const isLessonPlaying = playingLessonId === lesson.id && resolvedMedia;

                return (
                  <div
                    key={lesson.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between bg-slate-50/40 dark:bg-slate-950/40"
                  >
                    <div className="relative aspect-16/9 w-full bg-slate-950 overflow-hidden">
                      {isLessonPlaying && resolvedMedia.type === 'video' ? (
                        <video
                          src={resolvedMedia.src}
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full object-contain bg-slate-950"
                        />
                      ) : isLessonPlaying && resolvedMedia.type === 'iframe' ? (
                        <iframe
                          src={resolvedMedia.src}
                          title={lesson.title}
                          allow="autoplay; fullscreen"
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <>
                          <img
                            src={lesson.coverSrc}
                            alt={lesson.coverAlt}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3.5 flex items-center justify-between text-xs text-white">
                            <span className="font-semibold">{lesson.number}</span>
                            <span className="font-mono text-[11px] text-slate-200">
                              {lesson.duration}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {lesson.description}
                        </p>
                      </div>

                      {editingLessonId === lesson.id ? (
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="url"
                            value={draftLessonUrl}
                            onChange={(e) => setDraftLessonUrl(e.target.value)}
                            placeholder="Paste Google Drive share link..."
                            className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveDriveLink(lesson.id)}
                            className="px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLessonId(null)}
                            className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800/70 text-xs">
                          {lesson.driveUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPlayingLessonId((curr) => (curr === lesson.id ? null : lesson.id))
                              }
                              className="font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                            >
                              {isLessonPlaying ? 'Stop Video' : '▶ Play Video Inline'}
                            </button>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              Video slot reserved for your recording
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLessonId(lesson.id);
                              setDraftLessonUrl(lesson.driveUrl);
                            }}
                            className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium cursor-pointer whitespace-nowrap shrink-0"
                          >
                            {lesson.driveUrl ? 'Edit Link' : '+ Attach Link'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================================
   * PAGE 4: STANDALONE 100% FREE "NO-SCAM ZONE" PDF GUIDE PAGE
   * ============================================================================ */
  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 lg:py-10 flex flex-col justify-center min-h-[calc(100vh-132px)] gap-6">
      <div className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              100% Free PDF Resource · Synced From Google Drive · Nothing For Sale, Ever
            </div>
            <h1
              className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              The “No-Scam Zone” Manifesto & Starter Guide (Free PDF)
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-[62ch]">
              Enter your email to unlock and download our official{' '}
              <strong>no-scam-zone-manifesto.pdf</strong> directly from our community Google Drive—built to protect newcomers before they ever connect a wallet or place a $5 learning trade.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white">
                  Part 1: Scam Red Flags
                </strong>
                <span className="text-slate-500 dark:text-slate-400">
                  Spotting fake stop-loss buttons, gas-card bots, and seed-phrase traps.
                </span>
              </div>
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white">
                  Part 2: $5 Wallet Rules
                </strong>
                <span className="text-slate-500 dark:text-slate-400">
                  Choosing sub-penny networks (XLM & XRP) and understanding 1-coin reserves.
                </span>
              </div>
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white">
                  Part 3: 10-Cent Safety Net
                </strong>
                <span className="text-slate-500 dark:text-slate-400">
                  Printable pre-swap checklist for 1x Spot 2% risk sizing.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            {unlockedForEmail ? (
              <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    ✓ Manifesto PDF Unlocked for {unlockedForEmail}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Download your copy of <strong>no-scam-zone-manifesto.pdf</strong> below, preview it right on this page, or step inside the live training app.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isDownloadingPdf ? 'Downloading PDF...' : 'Download no-scam-zone-manifesto.pdf'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterApp()}
                    className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Enter App →
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowPdfPreview((p) => !p)}
                    className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {showPdfPreview ? 'Hide Inline PDF Reader' : 'Read PDF Inline on Page'}
                  </button>
                  <a
                    href={MANIFESTO_DRIVE_PDF_VIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:underline"
                  >
                    View in Google Drive ↗
                  </a>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleRequestFreeGuide}
                noValidate
                className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div>
                  <label
                    htmlFor="free-guide-email"
                    className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
                  >
                    Email Address for Instant Free Manifesto PDF
                  </label>
                  <input
                    id="free-guide-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {emailError && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {emailError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingEmail}
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isSubmittingEmail
                    ? 'Preparing Your Free PDF...'
                    : 'Unlock & Download Free Manifesto PDF'}
                </button>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  Zero paid courses · Zero affiliate spam · 100% Free Forever
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {unlockedForEmail && showPdfPreview && (
        <div className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-white">
              no-scam-zone-manifesto.pdf (Synced from Google Drive)
            </span>
            <button
              type="button"
              onClick={() => setShowPdfPreview(false)}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Close Reader
            </button>
          </div>
          <iframe
            src="/api/drive-pdf"
            title="No-Scam Zone Manifesto PDF"
            className="w-full h-[640px] border-0 bg-slate-100 dark:bg-slate-950"
          />
        </div>
      )}
    </div>
  );
};
