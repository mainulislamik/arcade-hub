import os

with open("/home/imon/Extra_SSD/arcade-hub/src/components/PlayStationHeroCarousel.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace PlayStation terminology
code = code.replace("PlayStationHeroCarousel", "CinematicHeroCarousel")
code = code.replace("PlayStation Featured", "Featured Spotlight")
code = code.replace("PlayStation Style", "Cinematic Style")
code = code.replace("PlayStation-Grade", "Pro Arcade Grade")
code = code.replace("playStationBadge", "proBadge")

with open("/home/imon/Extra_SSD/arcade-hub/src/components/CinematicHeroCarousel.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("CinematicHeroCarousel.tsx created cleanly!")
