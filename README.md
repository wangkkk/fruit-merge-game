# Fruit Merge King

A Suika-style merge puzzle game in vanilla JavaScript and Canvas.
No framework, no build step, no runtime dependencies — clone it, serve it,
play it.

Drop fruits into the jar. Two identical fruits merge into the next size up.
Chain merges within two seconds for combo multipliers — but if the pile
rests above the red line for too long, the run ends.

![gameplay](screenshot/screenshot.png)

## Features

- Physics-driven merging on a fixed-timestep simulation (frame-rate independent)
- Combo scoring with a 2-second chain window
- Coin economy with three consumable tools: level hammer, bomb, rainbow orb
- Four unlockable skins (fruit / pets / planets / sweets)
- 11 achievements
- Daily check-in with a 7-day reward cycle and streaks
- End-of-run share card rendered on canvas, shareable via Web Share API or clipboard
- Localized UI: English, 简体中文, 日本語, Español — browser language autodetect
- Progress saved to localStorage
- Sound effects synthesized live with WebAudio; the repo ships no binary assets

## Play it live

Try the game online: https://game.ssqlab.online/

## Getting started

ES modules won't load over `file://`, so serve the folder with any static
server:

```bash
npx serve
# or
python3 -m http.server 8080
```
