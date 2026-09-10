export type Quality = 'poster' | '480p' | '720p' | '1080p' | '2k' | '4k';

export interface VideoQualityConfig {
  url: string;
  width: number;
  label: string;
}

// --- HOMEPAGE HERO VIDEO SET (Pixabay Tier Mapping) ---
export const VIDEO_QUALITIES: Record<Quality, VideoQualityConfig> = {
  poster: {
    url: '', 
    width: 0,
    label: 'Fallback'
  },
  '480p': {
    url: 'https://cdn.pixabay.com/video/2018/05/30/16495-272487520_large.mp4',
    width: 640,
    label: '480p / 720p (Mobile Fast)'
  },
  '720p': {
    url: 'https://cdn.pixabay.com/video/2018/05/30/16495-272487520_large.mp4',
    width: 1280,
    label: '720p (Desktop Fast)'
  },
  '1080p': {
    url: 'https://cdn.pixabay.com/video/2018/05/30/16495-272487520_large.mp4',
    width: 1920,
    label: '1080p (HD)'
  },
  '2k': {
    url: 'https://cdn.pixabay.com/video/2018/05/30/16495-272487520_large.mp4',
    width: 2560,
    label: '2K (Large)'
  },
  '4k': {
    url: 'https://cdn.pixabay.com/video/2018/05/30/16495-272487520_large.mp4',
    width: 3840,
    label: '4K (Original)'
  }
};

// --- JUNIOR HERO VIDEO SET ---
export const JUNIOR_VIDEO_QUALITIES: Record<Quality, VideoQualityConfig> = {
  poster: { url: '', width: 0, label: 'Fallback' },
  '480p': { url: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4', width: 640, label: '480p (Mobile)' },
  '720p': { url: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4', width: 960, label: '720p (Desktop Fast)' },
  '1080p': { url: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4', width: 1280, label: '1080p (HD)' },
  '2k': { url: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4', width: 1920, label: '2K (Large)' },
  '4k': { url: 'https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4', width: 1920, label: '4K (Original)' }
};

export interface QualityInput {
  viewportWidth: number;
  deviceMemory?: number;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  isMobile?: boolean;
  dataSaverOverride?: boolean;
  batterySaver?: boolean;
}

export function pickInitialQuality(input: QualityInput): Quality {
  const {
    viewportWidth,
    deviceMemory = 0,
    effectiveType = '4g',
    downlink = 10,
    saveData = false,
    isMobile = false,
    dataSaverOverride = false,
  } = input;

  const shouldSaveData = saveData || dataSaverOverride;

  // Even in data saver, we want a tiny video if the user requested "fast" Video.
  // But we'll respect the intent by using the smallest possible resolution.
  if (shouldSaveData) {
    return '480p'; 
  }

  // Mobile/Small screens: Always 480p for instant LCP
  if (isMobile || viewportWidth <= 768) {
    return '480p';
  }

  // High-end Desktop: 1080p
  if (effectiveType === '4g' && downlink >= 15 && deviceMemory >= 4) {
    return '1080p';
  }

  return '1080p';
}


export function getNextQuality(current: Quality): Quality {
  const qualities: Quality[] = ['480p', '720p', '1080p', '2k', '4k'];
  const currentIndex = qualities.indexOf(current);
  return currentIndex < qualities.length - 1 ? qualities[currentIndex + 1] : current;
}

export function getPrevQuality(current: Quality): Quality {
  const qualities: Quality[] = ['480p', '720p', '1080p', '2k', '4k'];
  const currentIndex = qualities.indexOf(current);
  return currentIndex > 0 ? qualities[currentIndex - 1] : current;
}

export function shouldUpgrade(
  currentQuality: Quality,
  input: QualityInput,
  isPlayingSmoothly: boolean,
  pageIsIdle: boolean
): boolean {
  if (currentQuality === '4k' || currentQuality === 'poster') {
    return false;
  }

  const nextQuality = getNextQuality(currentQuality);

  // More stringent and gradual upgrade conditions
  const requiredConditions = {
    '1080p': input.effectiveType === '4g' && (input.downlink ?? 0) >= 15 && (input.deviceMemory ?? 0) >= 4,
    '2k': input.viewportWidth >= 1440 && (input.downlink ?? 0) >= 25 && (input.deviceMemory ?? 0) >= 8,
    '4k': input.viewportWidth >= 1920 && (input.downlink ?? 0) >= 40 && (input.deviceMemory ?? 0) >= 12 && !input.batterySaver
  };

  return !!(isPlayingSmoothly && pageIsIdle && requiredConditions[nextQuality]);
}


export function shouldDowngrade(
  currentQuality: Quality,
  stallCount: number,
  effectiveType?: string
): boolean {
  if (currentQuality === '720p' || currentQuality === 'poster') {
    return false;
  }

  return stallCount > 2 || (effectiveType !== undefined && ['2g', '3g'].includes(effectiveType));
}
