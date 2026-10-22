/**
 * Retro SVG Poster Generator & Image Fallback Handler
 * Generates high-contrast, beautiful retro arcade poster data URLs for game cards
 * with zero external network dependencies.
 */

interface Palette {
  from: string;
  via: string;
  to: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  patternColor: string;
}

const PALETTES: Record<string, Palette> = {
  snes: {
    from: '#1e1b4b',
    via: '#312e81',
    to: '#4c1d95',
    accent: '#a855f7',
    badgeBg: '#581c87',
    badgeText: '#f3e8ff',
    patternColor: '#818cf8',
  },
  nes: {
    from: '#450a0a',
    via: '#7f1d1d',
    to: '#18181b',
    accent: '#ef4444',
    badgeBg: '#991b1b',
    badgeText: '#fee2e2',
    patternColor: '#f87171',
  },
  gba: {
    from: '#022c22',
    via: '#064e3b',
    to: '#065f46',
    accent: '#10b981',
    badgeBg: '#047857',
    badgeText: '#d1fae5',
    patternColor: '#34d399',
  },
  psx: {
    from: '#0f172a',
    via: '#1e293b',
    to: '#1e3a8a',
    accent: '#38bdf8',
    badgeBg: '#1d4ed8',
    badgeText: '#e0f2fe',
    patternColor: '#60a5fa',
  },
  ps2: {
    from: '#020617',
    via: '#0f172a',
    to: '#172554',
    accent: '#60a5fa',
    badgeBg: '#1e40af',
    badgeText: '#dbeafe',
    patternColor: '#3b82f6',
  },
  psp: {
    from: '#09090b',
    via: '#18181b',
    to: '#27272a',
    accent: '#e4e4e7',
    badgeBg: '#3f3f46',
    badgeText: '#fafafa',
    patternColor: '#71717a',
  },
  sega: {
    from: '#082f49',
    via: '#075985',
    to: '#0369a1',
    accent: '#38bdf8',
    badgeBg: '#0284c7',
    badgeText: '#e0f2fe',
    patternColor: '#7dd3fc',
  },
  genesis: {
    from: '#082f49',
    via: '#075985',
    to: '#0369a1',
    accent: '#38bdf8',
    badgeBg: '#0284c7',
    badgeText: '#e0f2fe',
    patternColor: '#7dd3fc',
  },
  dos: {
    from: '#18181b',
    via: '#27272a',
    to: '#78350f',
    accent: '#f59e0b',
    badgeBg: '#92400e',
    badgeText: '#fef3c7',
    patternColor: '#fbbf24',
  },
  symbian: {
    from: '#134e4a',
    via: '#115e59',
    to: '#0f172a',
    accent: '#2dd4bf',
    badgeBg: '#0d9488',
    badgeText: '#ccfbf1',
    patternColor: '#5eead4',
  },
  web: {
    from: '#1e1b4b',
    via: '#4338ca',
    to: '#3b82f6',
    accent: '#818cf8',
    badgeBg: '#4f46e5',
    badgeText: '#e0e7ff',
    patternColor: '#a5b4fc',
  },
  arcade: {
    from: '#311042',
    via: '#581c87',
    to: '#1e1b4b',
    accent: '#f43f5e',
    badgeBg: '#be123c',
    badgeText: '#ffe4e6',
    patternColor: '#fb7185',
  },
};

const DEFAULT_PALETTES: Palette[] = [
  {
    from: '#1e1b4b',
    via: '#312e81',
    to: '#4338ca',
    accent: '#818cf8',
    badgeBg: '#4f46e5',
    badgeText: '#e0e7ff',
    patternColor: '#a5b4fc',
  },
  {
    from: '#0f172a',
    via: '#1e293b',
    to: '#334155',
    accent: '#38bdf8',
    badgeBg: '#0284c7',
    badgeText: '#f0f9ff',
    patternColor: '#7dd3fc',
  },
  {
    from: '#1c1917',
    via: '#292524',
    to: '#44403c',
    accent: '#fb923c',
    badgeBg: '#ea580c',
    badgeText: '#fff7ed',
    patternColor: '#fdba74',
  },
  {
    from: '#042f2e',
    via: '#115e59',
    to: '#0f766e',
    accent: '#2dd4bf',
    badgeBg: '#0d9488',
    badgeText: '#f0fdfa',
    patternColor: '#5eead4',
  },
];

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPalette(platform?: string, title?: string): Palette {
  const normPlatform = (platform || '').toLowerCase().trim();
  for (const key of Object.keys(PALETTES)) {
    if (normPlatform.includes(key)) {
      return PALETTES[key];
    }
  }

  // Hash title for stable selection among defaults
  let hash = 0;
  const str = title || 'Retro Game';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_PALETTES.length;
  return DEFAULT_PALETTES[index];
}

function wrapTitle(title: string, maxCharsPerLine = 18): string[] {
  // Clean up title (remove year or region tags if too long)
  const cleanTitle = title
    .replace(/\s*\((USA|Europe|Japan|En|Fr|De|Es|It|v[\d.]+|Beta)\)/gi, '')
    .trim();

  const words = cleanTitle.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Return at most 3 lines
  if (lines.length > 3) {
    return [lines[0], lines[1], lines.slice(2).join(' ')];
  }
  return lines;
}

/**
 * Generates an authentic, high-contrast Retro Arcade SVG poster string
 */
export function getRetroPosterSvg(title: string, platform?: string, category?: string): string {
  const safeTitle = title || 'Arcade Classic';
  const palette = getPalette(platform, safeTitle);
  const displayPlatform = (platform || category || 'RETRO ARCADE').toUpperCase();
  const titleLines = wrapTitle(safeTitle, 20);

  const titleFontSize = titleLines.length >= 3 ? 20 : titleLines.length === 2 ? 24 : 28;
  const lineSpacing = titleFontSize * 1.25;
  const totalTextHeight = titleLines.length * lineSpacing;
  const startY = 175 - totalTextHeight / 2;

  const textSpans = titleLines
    .map(
      (line, i) =>
        `<tspan x="200" y="${startY + (i + 1) * lineSpacing}">${escapeXml(line)}</tspan>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="50%" stop-color="${palette.via}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>

    <!-- Radial Glow -->
    <radialGradient id="glow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${palette.from}" stop-opacity="0" />
    </radialGradient>

    <!-- Retro Horizon Grid Pattern -->
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${palette.patternColor}" stroke-opacity="0.12" stroke-width="1" />
    </pattern>

    <!-- Shadow filter for text -->
    <filter id="retroShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Base Card Background -->
  <rect width="400" height="260" fill="url(#bgGrad)" />

  <!-- Radial Glow Backdrop -->
  <rect width="400" height="260" fill="url(#glow)" />

  <!-- Grid Pattern -->
  <rect y="110" width="400" height="150" fill="url(#grid)" opacity="0.6" />

  <!-- Scanlines Effect -->
  <line x1="0" y1="3" x2="400" y2="3" stroke="${palette.accent}" stroke-width="2" opacity="0.8" />
  <line x1="0" y1="257" x2="400" y2="257" stroke="${palette.accent}" stroke-width="2" opacity="0.8" />

  <!-- Retro Frame Border -->
  <rect x="8" y="8" width="384" height="244" rx="16" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" />

  <!-- Top Retro Badge: Platform -->
  <g transform="translate(200, 32)">
    <rect x="-70" y="-14" width="140" height="24" rx="12" fill="${palette.badgeBg}" stroke="${palette.accent}" stroke-width="1.2" />
    <text x="0" y="2" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="900" letter-spacing="1.5" fill="${palette.badgeText}" text-transform="uppercase">
      ${escapeXml(displayPlatform)}
    </text>
  </g>

  <!-- Central Retro Gamepad Icon -->
  <g transform="translate(200, 85)" filter="url(#retroShadow)">
    <!-- Gamepad Body -->
    <rect x="-44" y="-22" width="88" height="44" rx="12" fill="#0f172a" stroke="${palette.accent}" stroke-width="2" />

    <!-- D-Pad (Left) -->
    <rect x="-32" y="-12" width="6" height="24" rx="1" fill="#475569" />
    <rect x="-41" y="-3" width="24" height="6" rx="1" fill="#475569" />
    <circle cx="-29" cy="0" r="2.5" fill="#1e293b" />

    <!-- Action Buttons (Right) -->
    <circle cx="21" cy="-7" r="4.5" fill="#f43f5e" />
    <circle cx="31" cy="2" r="4.5" fill="#eab308" />
    <circle cx="11" cy="2" r="4.5" fill="#3b82f6" />
    <circle cx="21" cy="11" r="4.5" fill="#10b981" />

    <!-- Center Menu Slits -->
    <rect x="-7" y="3" width="5" height="2" rx="0.5" fill="#64748b" transform="rotate(-25 -7 3)" />
    <rect x="2" y="3" width="5" height="2" rx="0.5" fill="#64748b" transform="rotate(-25 2 3)" />
  </g>

  <!-- Game Title (High Legibility Drop Shadow) -->
  <text text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="${titleFontSize}" font-weight="900" fill="#ffffff" filter="url(#retroShadow)" letter-spacing="-0.3">
    ${textSpans}
  </text>

  <!-- Bottom Accent / Authenticity Banner -->
  <g transform="translate(200, 238)">
    <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" letter-spacing="2" fill="${palette.accent}" opacity="0.9">
      AUTHENTIC PLAYABLE ROM
    </text>
  </g>
</svg>`;
}

/**
 * Returns a data URL for the generated retro poster SVG
 */
export function getRetroPosterUrl(title: string, platform?: string, category?: string): string {
  const svg = getRetroPosterSvg(title, platform, category);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Global onError handler for game cover <img> tags.
 * Replaces broken images with a high-contrast, beautiful retro SVG data URL poster.
 */
export function handleGameImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  title: string,
  platform?: string,
  category?: string
): void {
  const target = e.currentTarget;
  // Prevent infinite retry loop
  target.onerror = null;
  target.src = getRetroPosterUrl(title, platform, category);
}
