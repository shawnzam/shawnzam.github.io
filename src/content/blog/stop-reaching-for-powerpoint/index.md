---
title: "Stop Reaching for PowerPoint"
published: 2026-04-14
type: essay
description: "A Claude Code skill that turns a prompt into a self-contained HTML deck — and why that should be your new default."
---

Someone asks you to "put together a few slides" and your hand drifts to the PowerPoint icon out of pure muscle memory. Then come the next twenty minutes of fighting a template you didn't pick, nudging a text box three pixels to the left, and discovering that your brand colors aren't in the theme. None of that is the presentation. None of that is the idea. That is tax you pay for using a tool built in 1987.

I wrote a Claude Code skill called [keynot](https://github.com/shawnzam/keynot) to stop paying it. Ask Claude for "slides" or "a deck" and it ships you a single `.html` file — keyboard nav, swipe, fullscreen, staggered reveals, editorial typography, all wired up. It opens in any browser, runs offline, and weighs less than the email you were going to attach a 40MB `.pptx` to. If you hand Claude a brand guide — a PDF, a URL, even a paragraph describing the vibe — it extracts the palette and type system into CSS variables and the whole deck inherits it. That last part is the unlock. "Match this brand" stops being a half-day in Figma and starts being a sentence.

Here is a live one I generated in a single prompt — *"keynot, but if the audience was zombies, and lean into it"*. Hit it with arrow keys or press `f` for fullscreen. Everything you see is in one file.

<iframe
  src="/blog/keynot-for-zombies.html"
  style="width: 100%; aspect-ratio: 16 / 10; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: #000;"
  title="Keynot for Zombies demo deck"
  loading="lazy"
  allowfullscreen
></iframe>

The new default should be: reach for Claude and HTML first, reach for PowerPoint only when someone on the other end genuinely needs to edit a `.pptx`. Pitches, internal readouts, lunch-and-learns, conference talks, client one-pagers — all of that ships faster and looks sharper as a browser deck. Install the skill via `/plugin marketplace add shawnzam/keynot` and then `/plugin install keynot@keynot-marketplace`, or grab the `SKILL.md` directly from the [repo](https://github.com/shawnzam/keynot). The next time someone says "can you throw together some slides," throw together some HTML instead.

---

*Thanks to [Brandon Lafving](https://www.linkedin.com/in/brandon-lafving) for putting the "just have Claude build the deck in HTML" idea in front of me in the first place.*
