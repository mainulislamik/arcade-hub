import React, { useEffect } from 'react';
import { GameItem } from '../../types/game';

interface GameSEOProps {
  game?: GameItem | null;
  siteName?: string;
  baseUrl?: string;
}

export const GameSEO: React.FC<GameSEOProps> = ({
  game,
  siteName = "Arcadex - Free Real Online Games",
  baseUrl = "https://arcadex.games"
}) => {
  useEffect(() => {
    if (!game) {
      document.title = `${siteName} · Play 100% Free Authentic HTML5 & 3D WebGL Games`;
      return;
    }

    // Dynamic Title & Meta
    document.title = `Play ${game.title} Online Free · ${siteName}`;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', `${game.description} Play ${game.title} unblocked directly in your browser with zero downloads, 60 FPS 3D graphics, and instant loading.`);

    // Inject or update Schema.org JSON-LD
    const scriptId = 'game-schema-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": game.title,
      "url": `${baseUrl}/game/${game.slug || game.id}`,
      "image": `${baseUrl}${game.cover}`,
      "description": game.longDescription || game.description,
      "genre": [game.category, ...(game.tags || [])],
      "gamePlatform": ["Web Browser", "Desktop", "Mobile", "Tablet"],
      "applicationCategory": "Game",
      "operatingSystem": "Any modern web browser with HTML5 & WebGL support",
      "author": {
        "@type": "Organization",
        "name": game.developer || "Arcadex Studio"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": game.rating || 4.8,
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": game.plays || 12500
      },
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };

    script.textContent = JSON.stringify(schemaData);

    return () => {
      // Reset title on unmount
      document.title = `${siteName} · Play 100% Free Authentic HTML5 & 3D WebGL Games`;
    };
  }, [game, siteName, baseUrl]);

  return null;
};
