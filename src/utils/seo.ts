import { GameItem } from '../types/game';

export interface SEOConfig {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'game';
  keywords?: string[];
  game?: GameItem;
}

export interface UpdatePageSEOOptions {
  title: string;
  description: string;
  canonical?: string;
  game?: GameItem;
}

export const updateSEO = (config: SEOConfig): void => {
  if (typeof document === 'undefined') return;

  // Update Title
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

  setMeta('description', config.description);
  setMeta('og:title', config.title, true);
  setMeta('og:description', config.description, true);
  setMeta('og:url', config.canonicalUrl, true);
  setMeta('twitter:title', config.title);
  setMeta('twitter:description', config.description);

  if (config.keywords && config.keywords.length > 0) {
    setMeta('keywords', config.keywords.join(', '));
  }

  // Update Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', config.canonicalUrl);

  // Update JSON-LD Structured Data Schema
  let schemaScript = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'json-ld-schema';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  if (config.game) {
    const g = config.game;
    const gameSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'VideoGame',
          '@id': `${config.canonicalUrl}#game`,
          name: g.title,
          description: g.longDescription || g.description,
          genre: [g.category, ...g.tags],
          playMode: 'SinglePlayer',
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any Web Browser (HTML5 Canvas/Web Audio/WebGL)',
          url: config.canonicalUrl,
          inLanguage: 'en',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: g.rating.toFixed(2),
            reviewCount: '240',
            bestRating: '5',
            worstRating: '1',
          },
          author: {
            '@type': 'Organization',
            name: 'Arcadex Studio',
            url: window.location.origin,
          },
          publisher: {
            '@type': 'Organization',
            name: 'Arcadex',
            url: window.location.origin,
          },
          potentialAction: {
            '@type': 'PlayAction',
            target: config.canonicalUrl,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: window.location.origin,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: g.category.toUpperCase(),
              item: `${window.location.origin}/?category=${g.category}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: g.title,
              item: config.canonicalUrl,
            },
          ],
        },
        ...(g.faqs && g.faqs.length > 0
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: g.faqs.map((f) => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: f.answer,
                  },
                })),
              },
            ]
          : []),
      ],
    };
    schemaScript.textContent = JSON.stringify(gameSchema);
  } else {
    const portalSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${config.canonicalUrl}#website`,
          name: 'Arcadex - Free Web Games',
          url: config.canonicalUrl,
          description: config.description,
          publisher: {
            '@type': 'Organization',
            name: 'Arcadex Studio',
            url: config.canonicalUrl,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${config.canonicalUrl}?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Organization',
          '@id': `${config.canonicalUrl}#organization`,
          name: 'Arcadex Games',
          url: config.canonicalUrl,
          logo: `${config.canonicalUrl}/logo192.png`,
          description: 'High-speed, 100% client-side web arcade and instant browser games.',
        },
      ],
    };
    schemaScript.textContent = JSON.stringify(portalSchema);
  }
};

export const updatePageSEO = (opts: UpdatePageSEOOptions): void => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3080';
  updateSEO({
    title: opts.title,
    description: opts.description,
    canonicalUrl: opts.canonical || `${origin}/`,
    game: opts.game,
  });
};

export const updateGameSEO = (game: GameItem): void => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3080';
  const directUrl = `${origin}/?game=${game.slug}`;
  updateSEO({
    title: `Play ${game.title} Free Online - CrazyGames Style Arcade`,
    description: `Play ${game.title} (${game.category.toUpperCase()}) free online in your browser. No download, no login, 0% server lag, instant client-side HTML5 & Web Audio!`,
    canonicalUrl: directUrl,
    ogType: 'game',
    keywords: [game.title, game.category, ...game.tags, 'free online games', 'no download games', 'html5 arcade', 'crazy games'],
    game,
  });
};

export const resetToHomeSEO = (): void => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3080';
  updateSEO({
    title: 'Arcadex - 100% Free Web Arcade Games (Zero Download & No Login)',
    description: 'Instant client-side web gaming hub with 18+ retro classics, puzzles, action & combat games. Zero latency, 100% browser-rendered physics & procedural Web Audio.',
    canonicalUrl: `${origin}/`,
    ogType: 'website',
    keywords: ['free web games', 'crazygames', 'retro arcade', 'browser games', 'no download games', 'html5 games', '2048 online', 'mecha blaster 2'],
  });
};
