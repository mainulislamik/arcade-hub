#!/usr/bin/env python3
"""
Automated XML Sitemap Generator for Arcadex Web Gaming Platform.
Reads src/data/games_catalog.json and outputs enterprise-grade public/sitemap.xml
with Google Image Search extensions (<image:image>) for all 5,500+ games.
"""

import json
import os
import re
import html

CANONICAL_DOMAIN = "https://game.amarpdf.net"
CATALOG_PATH = os.path.join(os.path.dirname(__file__), "../src/data/games_catalog.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../public/sitemap.xml")

def escape_xml(text: str) -> str:
    """Escapes text for XML node content."""
    if not text:
        return ""
    return html.escape(str(text), quote=True)

def to_absolute_image_url(relative_or_abs: str) -> str:
    """Ensures image URL is absolute canonical URL."""
    if not relative_or_abs:
        return f"{CANONICAL_DOMAIN}/assets/hero-banner.png"
    if relative_or_abs.startswith("http://") or relative_or_abs.startswith("https://"):
        return relative_or_abs
    clean_path = relative_or_abs if relative_or_abs.startswith("/") else f"/{relative_or_abs}"
    return f"{CANONICAL_DOMAIN}{clean_path}"

def main():
    print(f"Loading games catalog from {CATALOG_PATH}...")
    if not os.path.exists(CATALOG_PATH):
        raise FileNotFoundError(f"Catalog file not found at {CATALOG_PATH}")

    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        games = json.load(f)

    print(f"Loaded {len(games)} games.")

    lines = []
    lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    lines.append('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">')

    # 1. Homepage
    lines.append('  <url>')
    lines.append(f'    <loc>{CANONICAL_DOMAIN}/</loc>')
    lines.append('    <changefreq>daily</changefreq>')
    lines.append('    <priority>1.0</priority>')
    lines.append('    <image:image>')
    lines.append(f'      <image:loc>{CANONICAL_DOMAIN}/assets/hero-banner.png</image:loc>')
    lines.append('      <image:title>Arcadex - Play 5,500+ Free Online Games</image:title>')
    lines.append('      <image:caption>Play 5,500+ free online games with zero download, zero lag and instant 60 FPS browser arcade.</image:caption>')
    lines.append('    </image:image>')
    lines.append('  </url>')

    # 2. Categories
    categories = sorted(list(set(g.get("category", "").lower().strip() for g in games if g.get("category"))))
    # Ensure standard categories exist
    standard_categories = ["action", "arcade", "driving", "playstation", "puzzle", "retro", "shooting", "strategy", "word"]
    all_categories = sorted(list(set(categories + standard_categories)))

    for cat in all_categories:
        cat_loc = f"{CANONICAL_DOMAIN}/category/{escape_xml(cat)}"
        cat_title = cat.capitalize()
        lines.append('  <url>')
        lines.append(f'    <loc>{cat_loc}</loc>')
        lines.append('    <changefreq>daily</changefreq>')
        lines.append('    <priority>0.9</priority>')
        lines.append('    <image:image>')
        lines.append(f'      <image:loc>{CANONICAL_DOMAIN}/assets/hero-banner.png</image:loc>')
        lines.append(f'      <image:title>{cat_title} Games - Free Online on Arcadex</image:title>')
        lines.append(f'      <image:caption>Play hundreds of free {cat} games online without download.</image:caption>')
        lines.append('    </image:image>')
        lines.append('  </url>')

    # 3. Platforms
    standard_platforms = [
        "android",
        "nokia-java",
        "symbian",
        "retro-gba",
        "nes",
        "snes",
        "sega-genesis",
        "playstation",
        "ps2",
        "psp",
        "ms-dos",
        "web-canvas",
        "webgl"
    ]
    for plat in standard_platforms:
        plat_loc = f"{CANONICAL_DOMAIN}/platform/{escape_xml(plat)}"
        plat_title = plat.replace("-", " ").title()
        lines.append('  <url>')
        lines.append(f'    <loc>{plat_loc}</loc>')
        lines.append('    <changefreq>daily</changefreq>')
        lines.append('    <priority>0.9</priority>')
        lines.append('    <image:image>')
        lines.append(f'      <image:loc>{CANONICAL_DOMAIN}/assets/hero-banner.png</image:loc>')
        lines.append(f'      <image:title>{plat_title} Games Emulation Online</image:title>')
        lines.append(f'      <image:caption>Play {plat_title} games online with zero VPS server lag.</image:caption>')
        lines.append('    </image:image>')
        lines.append('  </url>')

    # 4. Games (All 5,500+)
    seen_slugs = set()
    for g in games:
        slug = g.get("slug") or g.get("id")
        if not slug or slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        game_loc = f"{CANONICAL_DOMAIN}/game/{escape_xml(slug)}"
        is_featured = bool(g.get("featured") or (g.get("plays", 0) > 100000))
        priority = "0.8" if is_featured else "0.7"
        changefreq = "weekly"

        title = escape_xml(g.get("title", slug))
        desc = escape_xml(g.get("description", f"Play {title} free online on Arcadex"))
        img_url = escape_xml(to_absolute_image_url(g.get("coverImage")))

        lines.append('  <url>')
        lines.append(f'    <loc>{game_loc}</loc>')
        lines.append(f'    <changefreq>{changefreq}</changefreq>')
        lines.append(f'    <priority>{priority}</priority>')
        lines.append('    <image:image>')
        lines.append(f'      <image:loc>{img_url}</image:loc>')
        lines.append(f'      <image:title>{title} - Free Online Game</image:title>')
        lines.append(f'      <image:caption>{desc}</image:caption>')
        lines.append('    </image:image>')
        lines.append('  </url>')

    lines.append('</urlset>')
    lines.append('')

    content = "\n".join(lines)
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Successfully generated sitemap with {1 + len(all_categories) + len(standard_platforms) + len(seen_slugs)} URLs at {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
