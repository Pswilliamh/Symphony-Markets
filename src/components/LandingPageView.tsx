import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Compass,
  Layers,
  MessageSquareText,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import founderDeskImg from '../assets/images/founder_desk_story_1794561548330.jpg';
import noScamCompassImg from '../assets/images/no_scam_compass_1794561548457.jpg';
import videoCoverStopsImg from '../assets/images/video_cover_stops_1794561549253.jpg';
import videoCoverWalletImg from '../assets/images/video_cover_wallet_1794561551281.jpg';
import { createNoScamZonePdfBlob } from '../utils/pdfGuideGenerator';
import { KsbcGoldTrainingPage } from './KsbcGoldTrainingPage';
import { ScamScreenXRayInspector } from './ScamScreenXRayInspector';
import { SymphonyHarpLogo, symphonyHarpEmblemImg } from './SymphonyHarpLogo';
import { SymphonyPodcastPlayer } from './SymphonyPodcastPlayer';

export type PublicPageTab =
  | 'welcome'
  | 'features'
  | 'ksbc'
  | 'podcast'
  | 'story'
  | 'guide';

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

const FIVE_DOLLAR_BLUEPRINT_VIDEO_URL =
  '/assets/aistudio/Symphony_Markets__The__5_Blueprint_781e68ab.mp4';
const HOMEPAGE_DRIVE_VIDEO_URL =
  'https://drive.google.com/file/d/1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw/view';
const ANTIDOTE_DRIVE_VIDEO_URL =
  'https://drive.google.com/file/d/1vgJ0QiwY1aVtJwr-iPtKLdxTdcVqTTnr/view';
const MANIFESTO_DRIVE_PDF_VIEW_URL =
  'https://drive.google.com/file/d/1mMH2ngPd4gWPjFYEOAHtpv9XZm-v9McN/view';
const CERTIFICATE_DRIVE_PDF_VIEW_URL =
  'https://drive.google.com/file/d/1gijppbcHpuRfAcLSzOsYXJiD3SzIxf-e/view';
const COMPANION_DRIVE_PDF_VIEW_URL =
  'https://drive.google.com/file/d/1L6Fq0y4Jwm7_j03Qb6Pbh83kZONAaXzy/view';
const BOOK_DRIVE_PDF_VIEW_URL =
  'https://drive.google.com/file/d/1VOPZ7qvbJN9AbkxRaBG8kIl-fAMgdWer/view';
const BOOK_DRIVE_EPUB_VIEW_URL =
  'https://drive.google.com/file/d/1Us_E4FMnxOgcRZ-S056JR-Enq4s_v-u0/view';
const SHARED_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1hPDCoTd5K4163HsDW7_LtQXXB8VvBkv3';

type SanctuaryDocKey = 'manifesto' | 'certificate' | 'companion' | 'book_pdf';

interface SanctuaryDocumentItem {
  key: SanctuaryDocKey;
  badge: string;
  title: string;
  subtitle: string;
  filename: string;
  pageInfo: string;
  driveViewUrl: string;
  highlights: string[];
}

const SANCTUARY_DOCUMENTS: SanctuaryDocumentItem[] = [
  {
    key: 'manifesto',
    badge: '01 · Core Starter Guide',
    title: 'The “No-Scam Zone” Manifesto & Starter Guide',
    subtitle: 'Foundational protection rules before you ever connect a wallet or place a $5 trade.',
    filename: 'no-scam-zone-manifesto.pdf',
    pageInfo: 'Official PDF · Synced from Google Drive',
    driveViewUrl: MANIFESTO_DRIVE_PDF_VIEW_URL,
    highlights: [
      'Spotting fake stop-loss buttons, gas-card bots, and seed-phrase traps.',
      'Why sub-penny networks (XLM & XRP) and 1-coin reserves protect a $5 wallet.',
      'Printable pre-swap checklist for 1x Spot 2% ("10-Cent Safety Net") risk sizing.',
    ],
  },
  {
    key: 'certificate',
    badge: '02 · Ethical Covenant',
    title: 'Certificate of Commitment & Ethical Agreement',
    subtitle: '“If you’re looking for a scam, you won’t find one here.” — The No-Scam Zone Covenant.',
    filename: 'no-scam-zone-certificate.pdf',
    pageInfo: 'Official Covenant PDF · Annalima Ventures',
    driveViewUrl: CERTIFICATE_DRIVE_PDF_VIEW_URL,
    highlights: [
      '1. Radical Self-Custody: Zero seed phrases, zero private keys, zero deposits.',
      '2. Zero Monetization Traps: 100% free & open-source with no VIP signal rooms.',
      '3. The 2% Risk Safety Net & 4. On-Chain Transparency on XRPL and Stellar.',
    ],
  },
  {
    key: 'companion',
    badge: '03 · Honorary Student Bonus',
    title: 'The Sovereign Mind & The Honest Market (Reader’s Companion)',
    subtitle:
      'Author’s Dedication & Study Companion to Quantum Analemma A.I. Technology Cycle by Ambassador William Hardrick, DQP-KS.',
    filename: 'quantum-analemma-companion.pdf',
    pageInfo: '4 Pillars Study Guide · PDF',
    driveViewUrl: COMPANION_DRIVE_PDF_VIEW_URL,
    highlights: [
      'Pillar 1: The Sovereign Breath (Pneuma) — Pausing emotional panic & FOMO.',
      'Pillar 2: The Sacred Geometry of Risk — Proportional balance & the 10-cent slice.',
      'Pillar 3: Machine Intelligence as a Shield & Pillar 4: Radical Ethics.',
    ],
  },
  {
    key: 'book_pdf',
    badge: '04 · Complete Book Edition (PDF + EPUB)',
    title: 'Quantum Analemma A.I. Technology Cycle',
    subtitle:
      'Full book edition by Spiritual Sciences Pneumatology Researcher William Hardrick, DQP-KS — included in both PDF and EPUB formats.',
    filename: 'quantum-analemma-a-i-technology-cycle.pdf',
    pageInfo: 'Full Book · PDF (765 KB) & EPUB (1.3 MB)',
    driveViewUrl: BOOK_DRIVE_PDF_VIEW_URL,
    highlights: [
      'Explores cyclic order, disciplined cognition, and sovereign decision-making.',
      'Bridges spiritual sciences (Pneumatology) with ethical AI technology cycles.',
      'Includes downloadable EPUB e-reader edition alongside the full printable PDF.',
    ],
  },
];

const WELCOME_PLAYLIST = [
  {
    id: 'blueprint',
    shortLabel: '01 · The $5 Blueprint',
    fullTitle: 'Symphony Markets: The $5 Blueprint',
    duration: '4:40',
    url: FIVE_DOLLAR_BLUEPRINT_VIDEO_URL,
    poster: videoCoverWalletImg,
  },
  {
    id: 'sandbox',
    shortLabel: '02 · The No-Scam Sandbox',
    fullTitle: 'Symphony Markets: The No-Scam Sandbox',
    duration: '5:45',
    url: HOMEPAGE_DRIVE_VIDEO_URL,
    poster: founderDeskImg,
  },
  {
    id: 'antidote',
    shortLabel: '03 · Antidote to Predation',
    fullTitle: 'Symphony Markets: The Antidote to Predation',
    duration: '6:04',
    url: ANTIDOTE_DRIVE_VIDEO_URL,
    poster: noScamCompassImg,
  },
] as const;

const INITIAL_LESSONS: VideoLessonItem[] = [
  {
    id: 'vid_five_dollar_blueprint',
    number: 'Video 01 · 4m 40s',
    title: 'Symphony Markets: The $5 Blueprint (Why 1x Spot & 10-Cent Risk Protect Beginners)',
    duration: 'HD Video · Ready',
    description:
      'Exposes how fake stop-loss platforms trap beginners, why sub-penny XRP & XLM fees preserve a $5 wallet, and how the 2% "10-Cent Safety Net" works.',
    coverSrc: videoCoverWalletImg,
    coverAlt: 'Smartphone beside a pocket notebook on a warm sunlit cafe table',
    driveUrl: FIVE_DOLLAR_BLUEPRINT_VIDEO_URL,
  },
  {
    id: 'vid_sandbox_overview',
    number: 'Video 02 · 5m 45s',
    title: 'Symphony Markets: The No-Scam Sandbox (Official Platform Walkthrough)',
    duration: 'Google Drive MP4 · Ready',
    description:
      'Full walkthrough introducing the Symphony Markets open-source classroom, the No-Scam Zone mission, and how to practice safely inside the workspace.',
    coverSrc: founderDeskImg,
    coverAlt: 'Sunlight across a warm oak study desk with notebook and market charts',
    driveUrl: HOMEPAGE_DRIVE_VIDEO_URL,
  },
  {
    id: 'vid_antidote_predation',
    number: 'Video 03 · 6m 04s',
    title: 'Symphony Markets: The Antidote to Predation (Why Ethical Education Defeats Hype)',
    duration: 'Google Drive MP4 · Ready',
    description:
      'Deep-dive into how predatory trading platforms exploit emotional urgency, and how self-custody, transparent ledger math, and the No-Scam Zone Covenant protect everyday learners.',
    coverSrc: noScamCompassImg,
    coverAlt: 'Solid brass compass and optical glass lens resting on travertine stone',
    driveUrl: ANTIDOTE_DRIVE_VIDEO_URL,
  },
];

function toEmbeddableVideoUrl(rawUrl: string): { type: 'iframe' | 'video'; src: string } | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const mapDriveIdToVideoSrc = (fileId: string): string => {
    if (fileId === '1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw') {
      return '/assets/symphony-welcome.mp4';
    }
    if (fileId === '1vgJ0QiwY1aVtJwr-iPtKLdxTdcVqTTnr') {
      return '/assets/symphony-antidote.mp4';
    }
    if (fileId === '1RNomMOr0irdvq0nsbm8nQh2fhooCPoBp') {
      return FIVE_DOLLAR_BLUEPRINT_VIDEO_URL;
    }
    return `/api/drive-video/${fileId}`;
  };

  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch?.[1]) {
    return {
      type: 'video',
      src: mapDriveIdToVideoSrc(driveMatch[1]),
    };
  }

  const driveIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveIdParam?.[1]) {
    return {
      type: 'video',
      src: mapDriveIdToVideoSrc(driveIdParam[1]),
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

  // Media Player State (Page 1: Welcome — features both official Welcome Videos)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [elapsedInSlide, setElapsedInSlide] = useState<number>(0);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>(FIVE_DOLLAR_BLUEPRINT_VIDEO_URL);
  const [showUrlEditor, setShowUrlEditor] = useState<boolean>(false);
  const [draftVideoUrl, setDraftVideoUrl] = useState<string>(FIVE_DOLLAR_BLUEPRINT_VIDEO_URL);

  // Story Page Video Library Link State (Page 3: Our Story)
  const [lessons, setLessons] = useState<VideoLessonItem[]>(INITIAL_LESSONS);
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [draftLessonUrl, setDraftLessonUrl] = useState<string>('');

  // Free PDF Guide Email Form & Sanctuary Library State (Page 4: Free PDF Guide)
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState<boolean>(false);
  const [unlockedForEmail, setUnlockedForEmail] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [activeDocKey, setActiveDocKey] = useState<SanctuaryDocKey>('manifesto');
  const [downloadingDocKey, setDownloadingDocKey] = useState<string | null>(null);

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
                ? 'Google Drive Video · Ready'
                : 'Slot Ready',
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

  const handleDownloadSanctuaryDoc = async (
    docKey: 'manifesto' | 'certificate' | 'companion' | 'book_pdf' | 'book_epub',
    downloadFilename: string
  ) => {
    setDownloadingDocKey(docKey);
    try {
      const res = await fetch(`/api/drive-pdf?doc=${docKey}&download=1`);
      if (!res.ok) {
        throw new Error('Fallback to generated PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      if (docKey === 'manifesto') {
        const fallbackBlob = createNoScamZonePdfBlob(unlockedForEmail ?? undefined);
        const url = URL.createObjectURL(fallbackBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
    } finally {
      setDownloadingDocKey(null);
    }
  };

  /* ============================================================================
   * PAGE 1: SINGLE-STAGE WELCOME LANDING SCREEN (NO VERTICAL SCROLL CLUTTER)
   * ============================================================================ */
  if (activePage === 'welcome') {
    return (
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 lg:py-8 flex-1 flex flex-col items-center justify-center gap-6">
        {/* Centered Symphony Markets Highlighted Name + Emblem */}
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight text-center">
          <span className="inline-flex items-center gap-3.5 pl-3 pr-5 py-2 rounded-2xl bg-gradient-to-r from-amber-200/80 via-sky-100/95 to-amber-100/80 dark:from-sky-500/25 dark:via-amber-400/20 dark:to-sky-500/20 border border-amber-300/60 dark:border-sky-400/30">
            <SymphonyHarpLogo
              variant="emblem"
              className="w-11 h-11 sm:w-13 sm:h-13 shadow-md"
            />
            <span>Symphony Markets</span>
          </span>
        </h1>

        {/* Centered Prominent Welcome Video Player */}
        <section className="w-full">
          <div className="w-full flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm">
            {/* Top Welcome Video Playlist Switcher */}
            <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {WELCOME_PLAYLIST.map((vid) => {
                  const isActiveVid = customVideoUrl === vid.url;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        setCustomVideoUrl(vid.url);
                        setVideoPlaying(false);
                        setIsPlaying(false);
                      }}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isActiveVid
                          ? 'bg-sky-600 text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {vid.shortLabel} ({vid.duration})
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (customVideoUrl) {
                    setCustomVideoUrl('');
                    setVideoPlaying(false);
                  } else {
                    setCustomVideoUrl(FIVE_DOLLAR_BLUEPRINT_VIDEO_URL);
                    setIsPlaying(false);
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  !customVideoUrl
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                4-Slide Summary
              </button>
            </div>

            <div className="relative aspect-16/9 w-full bg-slate-950 overflow-hidden">
              {embeddedCustomVideo ? (
                embeddedCustomVideo.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={welcomeVideoRef}
                      key={embeddedCustomVideo.src}
                      poster={
                        customVideoUrl === HOMEPAGE_DRIVE_VIDEO_URL
                          ? founderDeskImg
                          : customVideoUrl === ANTIDOTE_DRIVE_VIDEO_URL
                          ? noScamCompassImg
                          : undefined
                      }
                      controls
                      playsInline
                      preload="metadata"
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      onEnded={() => {
                        setVideoPlaying(false);
                        if (customVideoUrl === FIVE_DOLLAR_BLUEPRINT_VIDEO_URL) {
                          setCustomVideoUrl(HOMEPAGE_DRIVE_VIDEO_URL);
                        } else if (customVideoUrl === HOMEPAGE_DRIVE_VIDEO_URL) {
                          setCustomVideoUrl(ANTIDOTE_DRIVE_VIDEO_URL);
                        }
                      }}
                      className="w-full h-full object-contain bg-slate-950"
                    >
                      <source
                        src={
                          customVideoUrl === FIVE_DOLLAR_BLUEPRINT_VIDEO_URL
                            ? `${embeddedCustomVideo.src}#t=0.2`
                            : embeddedCustomVideo.src
                        }
                        type="video/mp4"
                      />
                      {customVideoUrl === HOMEPAGE_DRIVE_VIDEO_URL && (
                        <source
                          src="/api/drive-video/1FTGu-yv8TPVv2YT9gsLUceCak3bAEvcw"
                          type="video/mp4"
                        />
                      )}
                      {customVideoUrl === ANTIDOTE_DRIVE_VIDEO_URL && (
                        <source
                          src="/api/drive-video/1vgJ0QiwY1aVtJwr-iPtKLdxTdcVqTTnr"
                          type="video/mp4"
                        />
                      )}
                    </video>

                    {!videoPlaying && (
                      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-12 bg-gradient-to-b from-black/40 via-transparent to-black/45 flex items-center justify-center p-4">
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
                          {customVideoUrl === FIVE_DOLLAR_BLUEPRINT_VIDEO_URL
                            ? '▶ Play Video 1: The $5 Blueprint'
                            : customVideoUrl === HOMEPAGE_DRIVE_VIDEO_URL
                            ? '▶ Play Video 2: The No-Scam Sandbox'
                            : customVideoUrl === ANTIDOTE_DRIVE_VIDEO_URL
                            ? '▶ Play Video 3: The Antidote to Predation'
                            : '▶ Play Welcome Video'}
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
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {customVideoUrl === FIVE_DOLLAR_BLUEPRINT_VIDEO_URL
                        ? 'Video 1 of 3 · Symphony Markets: The $5 Blueprint'
                        : customVideoUrl === HOMEPAGE_DRIVE_VIDEO_URL
                        ? 'Video 2 of 3 · Symphony Markets: The No-Scam Sandbox'
                        : customVideoUrl === ANTIDOTE_DRIVE_VIDEO_URL
                        ? 'Video 3 of 3 · Symphony Markets: The Antidote to Predation'
                        : 'Custom Welcome Video'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoPlaying(false);
                        if (customVideoUrl === FIVE_DOLLAR_BLUEPRINT_VIDEO_URL) {
                          setCustomVideoUrl(HOMEPAGE_DRIVE_VIDEO_URL);
                        } else if (customVideoUrl === HOMEPAGE_DRIVE_VIDEO_URL) {
                          setCustomVideoUrl(ANTIDOTE_DRIVE_VIDEO_URL);
                        } else {
                          setCustomVideoUrl(FIVE_DOLLAR_BLUEPRINT_VIDEO_URL);
                        }
                      }}
                      className="text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer whitespace-nowrap"
                    >
                      {customVideoUrl === FIVE_DOLLAR_BLUEPRINT_VIDEO_URL
                        ? 'Next: Video 2 (Sandbox) →'
                        : customVideoUrl === HOMEPAGE_DRIVE_VIDEO_URL
                        ? 'Next: Video 3 (Antidote) →'
                        : '↺ Back to Video 1 ($5 Blueprint)'}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowUrlEditor((v) => !v);
                    setDraftVideoUrl(customVideoUrl || FIVE_DOLLAR_BLUEPRINT_VIDEO_URL);
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
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
                      setVideoPlaying(false);
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

        {/* Single Clean Entry Button to Step Behind the Welcome Stage */}
        <button
          type="button"
          onClick={() => onEnterApp()}
          className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Enter Symphony Markets →
        </button>
      </div>
    );
  }

  /* ============================================================================
   * PAGE 2C: STANDALONE STREAMING AUDIO PODCAST PAGE
   * ============================================================================ */
  if (activePage === 'podcast') {
    return (
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => onNavigatePage('welcome')}
                className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                ← Back to Welcome Video
              </button>
              <span aria-hidden="true">·</span>
              <span>Standalone Audio Deep Dive</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">57 min 46 sec</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Symphony Markets Audio Podcast
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

        {/* Visual Two-Blueprint Episode Architecture Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Part I · Defensive Self-Custody Blueprint
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">00:00 – 41:01</span>
            </div>
            <div className="py-2 border-y border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <span>Fake Stop UI</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Brass Key vs. Glass</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>$5 XRPL/XLM Rails</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">$0.10 = 1R</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Covers spotting rigged stop-loss buttons, protecting your 12-word recovery key, escaping $50 gas traps, 1x Spot ownership, and testing strategies on the 2,500-path Time Machine.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Part II · Offensive AI Content Studios
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">41:02 – 57:46</span>
            </div>
            <div className="py-2 border-y border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <span>1 Person, 1 Problem</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Custom B2B Audits</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>MRR Retainers</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-amber-700 dark:text-amber-400 font-semibold">Mini-Courses</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Covers building ethical capital from zero with specialized AI content workflows, human quality-controlled B2B audits, monthly recurring retainers, and focused community flywheels.
            </p>
          </div>
        </div>

        {/* Dedicated Streaming Audio Player + 9 Clickable Chapters */}
        <SymphonyPodcastPlayer />
      </div>
    );
  }

  /* ============================================================================
   * PAGE 2B: STANDALONE KSBC GOLD REAL-WORLD ASSET (RWA) TRAINING PAGE
   * ============================================================================ */
  if (activePage === 'ksbc') {
    return <KsbcGoldTrainingPage onEnterApp={onEnterApp} xrpLivePrice={xrpLivePrice} />;
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
              Visual Map of Platform Capabilities · 100% Free Open-Source Toolkit
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
          {/* Card 01: $5 Real-Wallet Guided Training Roadmap */}
          <div className="md:col-span-7 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  01. $5 Real-Wallet Guided Training Roadmap
                </h2>
              </div>

              {/* Visual 5-Step Flow Track */}
              <div className="py-3 border-y border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
                <span className="font-semibold text-slate-800 dark:text-slate-200">1. $5 Budget</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-sky-700 dark:text-sky-400">2. ~$0.0001 Fee</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-amber-700 dark:text-amber-400">3. 1-Coin Reserve</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">4. $0.10 Safety Net</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                A progressive 5-step beginner curriculum teaching you how to avoid multi-dollar network gas traps, understand XRPL/Stellar 1-coin wallet reserves, check whether a coin is near its ceiling, and apply the “10-Cent Safety Net” on a real $5 Spot budget.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onEnterApp('start-here')}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Launch $5 Roadmap →
              </button>
            </div>
          </div>

          {/* Card 02: Plain-English AI Market Mentor */}
          <div className="md:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  02. Plain-English AI Market Mentor
                </h2>
              </div>

              {/* Visual Jargon -> Plain English Schematic */}
              <div className="py-3 border-y border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <span className="font-mono text-rose-600 dark:text-rose-400 line-through">
                  “RSI 78 Overbought”
                </span>
                <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  “Near ceiling — wait for dip”
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask any question in everyday words. Our server-side AI Mentor reads live XRP and XLM candles and decodes confusing Wall Street jargon before you touch your wallet.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onEnterApp('start-here')}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Ask the AI Mentor →
              </button>
            </div>
          </div>

          {/* Card 03: 2% Risk & 1:2 Stop-Loss Simulator */}
          <div className="md:col-span-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  03. 2% Risk & 1:2 Stop-Loss Simulator
                </h2>
              </div>

              {/* Mini Visual 1:2 Risk-Reward Bar */}
              <div className="w-full h-8 rounded-md overflow-hidden flex font-mono text-[11px] font-bold tabular-nums">
                <div style={{ width: '34%' }} className="bg-rose-600 text-white flex items-center justify-center px-1.5 whitespace-nowrap">
                  Stop -$0.10 (1R)
                </div>
                <div style={{ width: '66%' }} className="bg-emerald-600 text-white flex items-center justify-center px-1.5 whitespace-nowrap">
                  Target +$0.20 (2R)
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time open-source position sizing across 1x Spot, Futures margin/liquidation warnings, and Options breakeven math—with visual target lines plotted directly on live charts.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onEnterApp('risk-chart')}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Open Risk Calculator →
              </button>
            </div>
          </div>

          {/* Card 04: Candlestick & Fibonacci Decoder */}
          <div className="md:col-span-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                04. Candlestick & Fibonacci Decoder
              </h2>

              {/* Custom Inline Candlestick Illustration SVG */}
              <svg
                viewBox="0 0 240 48"
                className="w-full h-11"
                role="img"
                aria-label="Visual illustration of Hammer, Doji, and Engulfing candlesticks"
              >
                {/* Fib Reference Dashed Line */}
                <line x1="8" y1="36" x2="232" y2="36" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                {/* Bullish Hammer */}
                <line x1="40" y1="10" x2="40" y2="42" stroke="#10B981" strokeWidth="2" />
                <rect x="33" y="12" width="14" height="10" rx="1.5" fill="#10B981" />
                <text x="54" y="21" fontSize="10" fontFamily="monospace" fill="#10B981">Hammer</text>
                {/* Bearish Rejection */}
                <line x1="145" y1="6" x2="145" y2="38" stroke="#F43F5E" strokeWidth="2" />
                <rect x="138" y="24" width="14" height="10" rx="1.5" fill="#F43F5E" />
                <text x="159" y="32" fontSize="10" fontFamily="monospace" fill="#F43F5E">Star</text>
              </svg>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically spots Hammer, Doji, Morning Star, and Engulfing bars on live XRP/USDT and XLM/USDT feeds, explaining what buyers and sellers are doing at key pullback bands.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onEnterApp('candlestick-guide')}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Explore Candlestick Guide →
              </button>
            </div>
          </div>

          {/* Card 05: 11-Module Skill Desk & Time Machine */}
          <div className="md:col-span-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  05. 11-Module Skill Desk & Time Machine
                </h2>
              </div>

              {/* Custom Inline Monte Carlo Fan Paths SVG */}
              <svg
                viewBox="0 0 240 48"
                className="w-full h-11"
                role="img"
                aria-label="Monte Carlo probability fan chart illustration"
              >
                <circle cx="16" cy="26" r="3.5" fill="#0284C7" />
                {/* Upper Bullish Path */}
                <path d="M16,26 Q90,22 150,12 T224,8" fill="none" stroke="#10B981" strokeWidth="2" />
                {/* Median Path */}
                <path d="M16,26 Q95,25 155,23 T224,22" fill="none" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="4 3" />
                {/* Lower Stop Path */}
                <path d="M16,26 Q90,32 150,38 T224,42" fill="none" stroke="#F43F5E" strokeWidth="2" />
              </svg>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Includes a 2,500-path Monte Carlo session replay, multi-chart scanner, 6-point pre-trade risk audit, scale-out exit ladder, and explicit “yes”-gated paper bracket tickets.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onEnterApp('skill-desk')}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Try the Time Machine →
              </button>
            </div>
          </div>

          {/* Card 06: Read-Only Public Wallet Watch & 24/7 Decentralized DEX Lab */}
          <div className="md:col-span-12 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  06. Read-Only Public Wallet Watch & 24/7 Decentralized DEX Lab
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Safely monitor external Trust Wallet, XRPL, and Stellar public addresses without ever exposing private keys, and inspect real on-chain DEX AMM liquidity pools (XRP/RLUSD, XLM/USDC, and tokenized Solar DePIN pools).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400">
                <span>Public Address</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>0 Keys Asked</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Live Ledger View</span>
              </div>
              <button
                type="button"
                onClick={() => onEnterApp('ai-dex-lab')}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Inspect Live DEX & Wallet Tools →
              </button>
            </div>
          </div>
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

              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-500/30 space-y-1.5">
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  “If you’re looking for a scam, you won’t find one here.”
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  “Walk with clean hands, disciplined math, and a sovereign mind. If anyone asks you for your private seed phrase, your monthly subscription, or your peace of mind—tell them you learned under the No-Scam Zone banner.”
                </p>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">
                  — Ambassador William Hardrick, DQP-KS · Spiritual Advisor & Founder, Annalima Ventures
                </div>
              </div>
            </div>
          </div>

          {/* Official Symphony Harp Candlestick Emblem Showcase */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4 flex items-center justify-center gap-5 p-5 rounded-xl bg-slate-950 border border-amber-400/30">
              <div className="text-center space-y-1.5">
                <img
                  src={symphonyHarpEmblemImg}
                  alt="Symphony Markets High-Res Crypto Medallion Logo"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-amber-400/80 shadow-lg mx-auto"
                />
                <div className="text-[11px] font-mono text-amber-300">
                  Crypto Medallion Crest
                </div>
              </div>
              <div className="text-center space-y-1.5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mx-auto">
                  <SymphonyHarpLogo variant="vector" className="w-24 h-24 sm:w-28 sm:h-28" />
                </div>
                <div className="text-[11px] font-mono text-sky-300">
                  Vector SVG Emblem
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-3">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                The Symphony Markets Emblem · Visual Symbolism
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Why Our Logo Is a Golden Symphony Harp With Candlestick Strings & Floating Notes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Every element of the <strong>Symphony Markets</strong> crest teaches a core principle of our classroom: the <strong>Golden Classical Harp</strong> represents sovereign order and patience; the <strong>Glowing Emerald & Cyan Candlestick Strings</strong> remind learners that real markets move in structured harmonic waves rather than gambling hype; and the <strong>Floating Musical Notes</strong> symbolize walking away from every trade with peace of mind under the No-Scam Zone Covenant.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={symphonyHarpEmblemImg}
                  download="symphony-markets-harp-logo.jpg"
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
                >
                  Download High-Res Coin Logo (JPG)
                </a>
                <a
                  href="/favicon.svg"
                  download="symphony-markets-vector-logo.svg"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Download Scalable Vector Logo (SVG)
                </a>
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

          {/* Interactive Red-Flag Scam X-Ray Inspector */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <ScamScreenXRayInspector />
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
   * PAGE 4: STANDALONE 100% FREE "NO-SCAM ZONE" & QUANTUM ANALEMMA SANCTUARY LIBRARY
   * ============================================================================ */
  const activeSanctuaryDoc =
    SANCTUARY_DOCUMENTS.find((d) => d.key === activeDocKey) ?? SANCTUARY_DOCUMENTS[0];

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 lg:py-8 flex flex-col gap-6">
      {/* Top Hero Card: Email Unlock + Instant Access to All 4 Google Drive Publications */}
      <div className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              100% Free Sanctuary Library · Synced From Google Drive · Nothing For Sale, Ever
            </div>
            <h1
              className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              The “No-Scam Zone” Manifesto, Ethical Covenant & Quantum Analemma Library
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-[65ch]">
              Every official PDF and e-book in our shared community Google Drive is 100% free. Download the{' '}
              <strong>No-Scam Zone Manifesto</strong>, the official{' '}
              <strong>Certificate of Commitment & Ethical Agreement</strong>, the{' '}
              <strong>Sovereign Mind & Honest Market Reader’s Companion</strong>, and the complete{' '}
              <strong>Quantum Analemma A.I. Technology Cycle</strong> book (PDF & EPUB).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white">
                  1. Manifesto & Starter Guide
                </strong>
                <span className="text-slate-500 dark:text-slate-400">
                  Spotting fake stop-loss buttons, gas-card bots, and $5 10-cent risk sizing.
                </span>
              </div>
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white">
                  2. Certificate of Commitment
                </strong>
                <span className="text-slate-500 dark:text-slate-400">
                  “If you’re looking for a scam, you won’t find one here.” — 4-Pillar Ethical Covenant.
                </span>
              </div>
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white">
                  3. Quantum Analemma + Bonus
                </strong>
                <span className="text-slate-500 dark:text-slate-400">
                  Full book (PDF & EPUB) + 4-Pillar Student Companion by Ambassador William Hardrick.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            {unlockedForEmail ? (
              <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    ✓ Complete 4-Document Sanctuary Library Unlocked ({unlockedForEmail})
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Download any of the 4 official Google Drive PDFs or the EPUB e-book below, open them in the inline reader right on this page, or step inside the live training workspace.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadSanctuaryDoc('manifesto', 'no-scam-zone-manifesto.pdf')
                    }
                    disabled={downloadingDocKey === 'manifesto'}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {downloadingDocKey === 'manifesto'
                      ? 'Downloading Manifesto...'
                      : 'Download Manifesto PDF'}
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
                    {showPdfPreview ? 'Hide Inline PDF Reader' : 'Open Inline PDF Reader'}
                  </button>
                  <a
                    href={SHARED_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:underline"
                  >
                    Open Full Google Drive Folder ↗
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
                    Email Address for Instant Free Access (Or Preview Directly Below)
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
                    ? 'Preparing Your Free Sanctuary Library...'
                    : 'Unlock & Download All 4 Free PDFs'}
                </button>

                <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Zero paid courses · 100% Free Forever</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockedForEmail('Sanctuary Guest');
                      setShowPdfPreview(true);
                    }}
                    className="font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Read Inline Now →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Featured Book Spotlight + 4-Document Sanctuary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Official Book Cover Spotlight (Quantum Analemma A.I. Technology Cycle) */}
        <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Featured Sanctuary Book · Free Gift
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                PDF + EPUB
              </span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-3">
              <img
                src="/assets/quantum-analemma-cycle.png"
                alt="Quantum Analemma A.I. Technology Cycle book cover by William Hardrick, DQP-KS"
                className="w-full max-h-[320px] object-contain rounded"
              />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-editorial text-lg font-bold text-slate-900 dark:text-white leading-snug">
                Quantum Analemma A.I. Technology Cycle
              </h2>
              <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
                By Spiritual Sciences Pneumatology Researcher William Hardrick, DQP-KS
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paired with <em>The Sovereign Mind & The Honest Market</em> companion guide, this book explores the 4 foundational pillars behind Symphony Markets: <strong>The Sovereign Breath (Pneuma)</strong>, <strong>The Sacred Geometry of Risk</strong>, <strong>Machine Intelligence as a Shield</strong>, and <strong>Radical Ethics & The No-Scam Zone</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleDownloadSanctuaryDoc(
                    'book_pdf',
                    'quantum-analemma-a-i-technology-cycle.pdf'
                  )
                }
                disabled={downloadingDocKey === 'book_pdf'}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
              >
                {downloadingDocKey === 'book_pdf' ? 'Downloading...' : 'Download Book PDF'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDownloadSanctuaryDoc(
                    'book_epub',
                    'quantum-analemma-a-i-technology-cycle.epub'
                  )
                }
                disabled={downloadingDocKey === 'book_epub'}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
              >
                {downloadingDocKey === 'book_epub' ? 'Downloading...' : 'Download EPUB'}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveDocKey('book_pdf');
                  setShowPdfPreview(true);
                }}
                className="font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Read Book Inline on Page →
              </button>
              <a
                href={BOOK_DRIVE_EPUB_VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white hover:underline"
              >
                EPUB in Drive ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right: 4-Card Sanctuary Document Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SANCTUARY_DOCUMENTS.map((doc) => {
            const isSelectedForReader = showPdfPreview && activeDocKey === doc.key;
            return (
              <div
                key={doc.key}
                className={`p-5 rounded-xl border transition-colors flex flex-col justify-between gap-4 ${
                  isSelectedForReader
                    ? 'border-sky-500 bg-sky-50/30 dark:bg-sky-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      {doc.badge}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.pageInfo}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {doc.subtitle}
                  </p>

                  <ul className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                    {doc.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDocKey(doc.key);
                        setShowPdfPreview(true);
                      }}
                      className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        isSelectedForReader
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      {isSelectedForReader ? 'Reading Below ✓' : 'Read Inline'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSanctuaryDoc(doc.key, doc.filename)}
                      disabled={downloadingDocKey === doc.key}
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {downloadingDocKey === doc.key ? 'Saving...' : 'Download PDF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-mono truncate">{doc.filename}</span>
                    <a
                      href={doc.driveViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 dark:text-sky-400 hover:underline shrink-0"
                    >
                      Google Drive ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Multi-Document Inline PDF Reader */}
      {showPdfPreview && (
        <div className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {SANCTUARY_DOCUMENTS.map((doc) => (
                <button
                  key={doc.key}
                  type="button"
                  onClick={() => setActiveDocKey(doc.key)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeDocKey === doc.key
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  {doc.badge}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                {activeSanctuaryDoc.filename}
              </span>
              <button
                type="button"
                onClick={() => setShowPdfPreview(false)}
                className="font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Close Reader ✕
              </button>
            </div>
          </div>
          <iframe
            key={activeDocKey}
            src={`/api/drive-pdf?doc=${activeDocKey}`}
            title={activeSanctuaryDoc.title}
            className="w-full h-[680px] border-0 bg-slate-100 dark:bg-slate-950"
          />
        </div>
      )}
    </div>
  );
};
