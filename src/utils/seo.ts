import { GameItem, GameCategory } from '../types/game';

export const CANONICAL_ORIGIN = 'https://game.amarpdf.net';

export interface SEOConfig {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'game';
  ogImage?: string;
  keywords?: string[];
  game?: GameItem;
  category?: string;
  isPlatform?: boolean;
}

export interface UpdatePageSEOOptions {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'game';
  ogImage?: string;
  game?: GameItem;
  category?: string;
  isPlatform?: boolean;
}

/**
 * Normalizes absolute canonical URL ensuring https://game.amarpdf.net base
 */
export const getCanonicalUrl = (pathOrQuery: string = ''): string => {
  if (!pathOrQuery || pathOrQuery === '/') {
    return `${CANONICAL_ORIGIN}/`;
  }
  if (pathOrQuery.startsWith('http://') || pathOrQuery.startsWith('https://')) {
    try {
      const parsed = new URL(pathOrQuery);
      return `${CANONICAL_ORIGIN}${parsed.pathname}${parsed.search}`;
    } catch {
      return `${CANONICAL_ORIGIN}/`;
    }
  }
  const cleanPath = pathOrQuery.startsWith('/') ? pathOrQuery : `/${pathOrQuery}`;
  return `${CANONICAL_ORIGIN}${cleanPath}`;
};

/**
 * Resolves an absolute image URL for Open Graph and Twitter Card tags
 */
export const getAbsoluteImageUrl = (imagePath?: string): string => {
  if (!imagePath) {
    return `${CANONICAL_ORIGIN}/assets/hero-banner.png`;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const clean = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${CANONICAL_ORIGIN}${clean}`;
};

/**
 * Core SEO updater that synchronizes document head tags and JSON-LD schema
 */
export const updateSEO = (config: SEOConfig): void => {
  if (typeof document === 'undefined') return;

  // Update Page Title
  document.title = config.title;

  // Helper for meta tags
  const setMeta = (name: string, content: string, isProperty: boolean = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const canonicalUrl = getCanonicalUrl(config.canonicalUrl);
  const imageUrl = getAbsoluteImageUrl(config.ogImage || (config.game ? config.game.coverImage : undefined));
  const ogType = config.ogType || (config.game ? 'game' : 'website');

  // Core Meta Tags
  setMeta('description', config.description);
  setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  setMeta('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large');

  // Open Graph Tags
  setMeta('og:type', ogType, true);
  setMeta('og:title', config.title, true);
  setMeta('og:description', config.description, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:image', imageUrl, true);
  setMeta('og:site_name', 'Arcadex', true);

  // Twitter Card Tags
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:site', '@ArcadexGames');
  setMeta('twitter:title', config.title);
  setMeta('twitter:description', config.description);
  setMeta('twitter:image', imageUrl);

  // Keywords
  if (config.keywords && config.keywords.length > 0) {
    setMeta('keywords', config.keywords.join(', '));
  }

  // Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl);

  // JSON-LD Structured Data Schema
  let schemaScript = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'json-ld-schema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  if (config.game) {
    const g = config.game;
    const ratingValue = (g.rating && g.rating > 0 ? g.rating : 4.8).toFixed(1);
    const gameFaqs = g.faqs && g.faqs.length > 0 ? g.faqs : [
      {
        question: `How do I play ${g.title} online for free?`,
        answer: `You can play ${g.title} instantly in your browser on Arcadex with zero downloads, no installation, and no signup required. Simply visit ${canonicalUrl} and click play to run the game in 60 FPS.`
      },
      {
        question: `What are the controls for ${g.title}?`,
        answer: `Controls for ${g.title} include universal PC keyboard controls (Arrow keys or WASD, Spacebar), mouse drag-to-swipe emulation, and responsive touch controls on mobile devices and tablets.`
      },
      {
        question: `Do I need to download or install any emulator to play ${g.title}?`,
        answer: `No download or emulator installation is required. ${g.title} executes 100% client-side via optimized WebAssembly (WASM) and HTML5 Canvas with sub-millisecond responsiveness.`
      },
      {
        question: `Can I play ${g.title} on mobile phones and tablets?`,
        answer: `Yes, ${g.title} is fully responsive and supports iOS Safari, Android Chrome, and all modern mobile web browsers with on-screen virtual touchpads and gesture controls.`
      },
      {
        question: `How are high scores and save progress stored for ${g.title}?`,
        answer: `Game achievements, high scores, and save states are automatically saved directly in your browser's private local storage (IndexedDB & LocalStorage).`
      }
    ];

    const gameSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['VideoGame', 'WebApplication'],
          '@id': `${canonicalUrl}#game`,
          name: g.title,
          alternateName: `Play ${g.title} Online`,
          description: g.longDescription || g.description,
          image: imageUrl,
          genre: [g.category, ...(g.tags || [])],
          playMode: 'SinglePlayer',
          applicationCategory: 'GameApplication',
          operatingSystem: 'WebBrowser, Windows, macOS, Linux, Android, iOS',
          url: canonicalUrl,
          inLanguage: 'en',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: ratingValue,
            reviewCount: '350',
            bestRating: '5',
            worstRating: '1',
          },
          author: {
            '@type': 'Organization',
            name: 'Arcadex Studio',
            url: CANONICAL_ORIGIN,
          },
          publisher: {
            '@type': 'Organization',
            name: 'Arcadex',
            url: CANONICAL_ORIGIN,
          },
          potentialAction: {
            '@type': 'PlayAction',
            target: canonicalUrl,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${CANONICAL_ORIGIN}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: (g.category || 'Arcade').toUpperCase(),
              item: `${CANONICAL_ORIGIN}/category/${encodeURIComponent(g.category || 'all')}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: g.title,
              item: canonicalUrl,
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: gameFaqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
      ],
    };
    schemaScript.textContent = JSON.stringify(gameSchema);
  } else if (config.category) {
    const catName = config.category.toUpperCase();
    const isPlatform = config.isPlatform || false;
    const categoryUrl = canonicalUrl;

    const categorySchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${categoryUrl}#collection`,
          name: config.title,
          url: categoryUrl,
          description: config.description,
          inLanguage: 'en',
          isPartOf: {
            '@type': 'WebSite',
            '@id': `${CANONICAL_ORIGIN}/#website`,
            name: 'Arcadex',
            url: `${CANONICAL_ORIGIN}/`,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${CANONICAL_ORIGIN}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: `${isPlatform ? 'Platform: ' : 'Category: '}${catName}`,
              item: categoryUrl,
            },
          ],
        },
      ],
    };
    schemaScript.textContent = JSON.stringify(categorySchema);
  } else {
    const portalSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${CANONICAL_ORIGIN}/#website`,
          name: 'Arcadex - Play 5,500+ Free Online Games',
          url: `${CANONICAL_ORIGIN}/`,
          description: config.description,
          publisher: {
            '@type': 'Organization',
            name: 'Arcadex Studio',
            url: `${CANONICAL_ORIGIN}/`,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${CANONICAL_ORIGIN}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Organization',
          '@id': `${CANONICAL_ORIGIN}/#organization`,
          name: 'Arcadex',
          url: `${CANONICAL_ORIGIN}/`,
          logo: `${CANONICAL_ORIGIN}/assets/hero-banner.png`,
          description: 'Enterprise-grade high-speed client-side web gaming hub with 5,500+ arcade classics, android games, and retro titles.',
        },
      ],
    };
    schemaScript.textContent = JSON.stringify(portalSchema);
  }
};

/**
 * General page SEO updater
 */
export const updatePageSEO = (opts: UpdatePageSEOOptions): void => {
  updateSEO({
    title: opts.title,
    description: opts.description,
    canonicalUrl: opts.canonical || `${CANONICAL_ORIGIN}/`,
    ogType: opts.ogType,
    ogImage: opts.ogImage,
    game: opts.game,
    category: opts.category,
    isPlatform: opts.isPlatform,
  });
};

/**
 * Dedicated SEO updater for individual game pages
 */
export const updateGameSEO = (game: GameItem): void => {
  const directUrl = `${CANONICAL_ORIGIN}/game/${encodeURIComponent(game.slug || game.id)}`;
  const genreLabel = (game.category || 'Arcade').toUpperCase();
  const platformLabel = game.platform || 'Browser';

  updateSEO({
    title: `Play ${game.title} Free Online - Arcadex`,
    description: `Play ${game.title} (${genreLabel}) free online on Arcadex. Instant play ${platformLabel} game with zero download, zero lag, mouse/touch controls, and 60 FPS performance!`,
    canonicalUrl: directUrl,
    ogType: 'game',
    ogImage: game.coverImage,
    keywords: [
      game.title,
      `play ${game.title} online`,
      `${game.title} unblocked`,
      `${game.title} no download`,
      game.category,
      platformLabel,
      ...(game.tags || []),
      'free online games',
      'browser games',
      'crazygames alternative',
      'html5 arcade'
    ],
    game,
  });
};

/**
 * Dedicated SEO updater for Category and Platform views
 */
export const updateCategorySEO = (category: string, isPlatform: boolean = false): void => {
  const directUrl = isPlatform
    ? `${CANONICAL_ORIGIN}/platform/${encodeURIComponent(category)}`
    : `${CANONICAL_ORIGIN}/category/${encodeURIComponent(category)}`;
  const displayTitle = category.charAt(0).toUpperCase() + category.slice(1);

  updateSEO({
    title: `Free ${displayTitle.toUpperCase()} Games Online - Arcadex`,
    description: `Explore hundreds of free ${displayTitle} games on Arcadex. Play instantly in your browser with zero download, zero lag, and no registration required.`,
    canonicalUrl: directUrl,
    ogType: 'website',
    category,
    isPlatform,
    keywords: [
      `${category} games`,
      `free ${category} games`,
      `play ${category} online`,
      'browser games',
      'unblocked games',
      'instant play games',
      'html5 arcade'
    ],
  });
};

/**
 * Reset document to homepage root SEO metadata
 */
export const resetToHomeSEO = (): void => {
  updateSEO({
    title: 'Arcadex - Play 5,500+ Free Online Games (No Download, No Install, 60 FPS Browser Arcade)',
    description: 'Play 5,500+ free online games on Arcadex. Instant play Android, Retro GBA, Nokia Java, Action, Puzzle & Driving games with zero download, zero lag & mouse/touch controls.',
    canonicalUrl: `${CANONICAL_ORIGIN}/`,
    ogType: 'website',
    keywords: [
      'free online games',
      'play games without download',
      'unblocked games',
      'android games on pc',
      'retro arcade games',
      'crazygames alternative',
      'html5 canvas games',
      'play nokia java games online',
      'gba web emulator'
    ],
  });
};
