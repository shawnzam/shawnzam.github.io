---
title: "I Started With 12 Names. An LLM Sieve Found the Rest."
published: 2026-06-25
type: essay
description: "I seeded a map of indie record-makers with 12 names I trusted, then let an LLM sieve (filter, never author) grow it to 469 verifiable nodes. Live at 2inch.fm."
---

I wanted to map who *actually* made the indie and post-rock records I grew up on — not the bands, the people behind the glass. The engineers, the producers, the studios. I didn't start with a database or a spreadsheet. I started with twelve names I'd vouch for without thinking — Steve Albini, John McEntire, Bob Weston, and nine more like them. That's the whole seed. A dozen people I trusted, typed by hand. Everything else — 469 nodes, 620 album credits, all live at **[2inch.fm](https://2inch.fm)** — grew out of those twelve through a process I keep calling **the sieve**.

The trick was never letting the machine make anything up.

---

## The one rule that makes it trustworthy

Every "let an LLM build my dataset" project fails the same way: the model fabricates. It invents a plausible credit that never happened and hands it to you with total confidence. So I gave the model exactly one job, and made it a rule:

> **The LLM is a filter, not a source.** The data comes from a structured API and is parsed by code. The model only throws out junk and suggests where to look next.

It can't invent a credit because it never *writes* one. That single constraint is the difference between a verifiable graph and a confident hallucination.

---

## The cycle of sieves

The graph grows in rounds. Each round starts from engineers I already trust, crawls their credits out of [MusicBrainz](https://musicbrainz.org), and runs everything that comes back through three sieves before a single node is added.

<iframe
  src="/blog/the-sieve-growing-from-a-seed.html"
  style="width: 100%; aspect-ratio: 4 / 5; max-height: 760px; border: 1px solid var(--line-strong); border-radius: 4px; background: var(--bg);"
  title="The cycle of sieves: seed, crawl, three sieves, merge, repeat"
  loading="lazy"
></iframe>

**Sieve ①** is a hard year window — 1995 to 2003, my admitted bias — enforced in code. Cheap, exact, no model. **Sieve ②** is the *only* place the LLM touches the data: it looks at each newly-discovered band and answers one yes/no question — *is this a real, notable act, or is it noise?* It kills the "Various Artists" rows, the mis-parsed garbage, the DJ-mix-volume-7s. It does not judge taste or genre, and when it's unsure, it keeps. **Sieve ③** drops anything already in the index. Then everything that survives gets merged in, tagged `src:"mb"`, with the exact MusicBrainz release ID on every edge — so each fact deep-links to the record it came from. The curated core I typed by hand carries no tag at all, which means the part I personally vouch for and the part the machine added are *always* separable. One line trims all of it.

The clever part is the loop. After merging, I ask the model to **nominate more engineers** I don't have yet — hubs from the same scene. That's the only generative thing it does, and even there it's proposing *search terms*, not facts. Those names seed the next round, get crawled, and get sieved like everything else. You know you're done when the nominations start coming back as names you already have. The well runs dry; the scene is saturated.

---

## What the seed actually bought me

Twelve names became 469 without my ever trusting the machine to tell the truth. The seed didn't just give the crawler a starting point — it gave the whole system its standards. Every name I hand-picked dragged in a cluster of real collaborators, and every one of those was checked against a source before it counted. The expansion is only as honest as the seed is good, and only as verifiable as the provenance you bolt onto it.

That's the trade I'd make every time: start from a small thing you can personally stand behind, and let a sieve — never an author — grow it into something you couldn't have written down from memory.

*The method, with the prompts published verbatim, is at [2inch.fm/about](https://2inch.fm/about).*
