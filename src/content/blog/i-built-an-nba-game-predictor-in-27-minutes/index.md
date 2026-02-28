---
title: "I Built an NBA Game Predictor in 27 Minutes. The Score Doesn't Matter."
published: 2026-02-28
type: essay
---

It started with a text from a friend: *"Can you make us some sports betting agentic bookies."* I didn't bite on that exactly, but it got me thinking: given nothing but raw box score history, how well could an LLM actually predict the winner of an NBA game? Twenty-seven minutes later, I had a working answer: **64.7% accuracy across 730 games**, beating the naive baseline of 52.6%. Not bad. Also not the point.

---

## The Prompts (Because Transparency Is the Point)

| # | Time (EST) | Elapsed | What I Said |
|---|---|---|---|
| 1 | 4:16 PM | +0 min | *"I wonder, given just previous box scores for all games to date, how well a LLM would predict the winner of NBA games? Can you use python to write a script to pull box scores from the NBA from the start of the 25-26 season... I do not know what APIs are out there to get this data, so do some research, plan software and work with me to run it"* |
| 2 | 4:33 PM | +16 min | *"can you have it generate a md report from the json?"* |
| 3 | 4:35 PM | +19 min | *"I want mostly summary data in the report, not reasoning for each game, per team is great. I want to run for all games thus far with a threshold of 10"* |
| 4 | 4:38 PM | +21 min | *"and are we not using uv?"* |
| 5 | 4:41 PM | +24 min | *"how do I set the openai model?"* |
| 6 | 4:42 PM | +25 min | *"OPENAI_MODEL=gpt-5.2 uv run report -- error: Failed to spawn: `report`"* |
| 7 | 4:43 PM | +27 min | *"how can I do all games NUM_GAMES_TO_PREDICT= seem set at 50"* |

---

## Timeline

```
4:16 ──────────────────────────────────────────── 4:43
 │                                                   │
 ▼                                                   ▼
[+0m]          [+16m]   [+19m] [+21m] [+24m][+25m][+27m]
Research &     Add MD   Tune   Switch  Model  Fix   Run
full script    report   report  to uv  env   error  all
written                                            730 games
                                               64.7% accuracy
```

---

## What This Actually Tells Us About Agentic Coding in Early 2026

The 700-line Python script (pulling NBA box scores via `nba_api`, feeding them to an LLM, and generating a full analytics report) is unremarkable code. What *is* remarkable is that I wrote basically none of it. Seven prompts. Most of them under 20 words. One of them was literally just *"and are we not using uv?"* and the agent restructured the entire project toolchain. All of this was done using Claude Code running Claude Sonnet 4.6 (not an endorsement — just what I had open). That's the real story here.

We're at a point where the bottleneck isn't coding anymore. It's knowing what to ask, catching when something's off (the broken run command in prompt 6), and having enough technical intuition to steer. The 64.7% accuracy is fine, but the actual win was validating an idea end-to-end faster than most meetings get to an agenda.

*Code is on GitHub: [shawnzam/jumpshot_oracle](https://github.com/shawnzam/jumpshot_oracle)*
