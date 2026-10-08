import { GameItem } from '../types/game';

export interface SEOConfig {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'game';
  keywords?: string[];
  game?: GameItem;
}

export const updateSEO = (config: SEOConfig): void => {
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
      '@type': 'VideoGame',
      name: g.title,
      description: g.longDescription || g.description,
      genre: [g.category, ...g.tags],
      playMode: 'SinglePlayer',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any Web Browser (HTML5 Canvas/Web Audio)',
      url: config.canonicalUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: g.rating.toFixed(1),
        reviewCount: '128',
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Organization',
        name: 'Arcadex Studio',
      },
      potentialAction: {
        '@type': 'PlayAction',
        target: config.canonicalUrl,
      },
    };
    schemaScript.textContent = JSON.stringify(gameSchema);
  } else {
    const portalSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Arcadex',
      url: config.canonicalUrl,
      description: config.description,
      publisher: {
        '@type': 'Organization',
        name: 'Arcadex Studio',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${config.canonicalUrl}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
    schemaScript.textContent = JSON.stringify(portalSchema);
  }
};

export const updateGameSEO = (game: GameItem): void => {
  const directUrl = `http://localhost:3080/?game=${game.slug}`;
  updateSEO({
    title: `Play ${game.title} Online Free - No Download, Instant Arcade`,
    description: `Play ${game.title} (${game.category.toUpperCase()}) free in your browser. Zero login, 0% server lag, pure client-side HTML5 & Web Audio!`,
    canonicalUrl: directUrl,
    ogType: 'game',
    keywords: [game.title, game.category, ...game.tags, 'free online games', 'no download games', 'html5 arcade'],
    game,
  });
};
