# Baby Shower Mini-Site

A mobile-friendly baby shower game hub at `posts/baby-shower/`.

## Pages

- **[index.html](index.html)** -- Welcome landing page with links to all three games
- **[quiz.html](quiz.html)** -- "Vivek or Jenn?" quiz (15 multiple-choice questions)
- **[prediction-market.html](prediction-market.html)** -- Baby prediction polls (5 questions)
- **[whose-baby-is-it-anyways.html](whose-baby-is-it-anyways.html)** -- "What Will Our Baby Girl Look Like?" photo guessing game (10 AI-generated baby photos + 1 blooper)
- **[index.html](index.html) "Any Advice?" section** -- Free-form advice/encouragement prompts (3 questions)
- **images/** -- Downsized JPEG photos for the baby photo game

## Tech Stack

- Pure HTML + CSS + vanilla JS (no build step, no frameworks)
- Google Fonts: Cormorant Garamond + Nunito
- GitHub Gist for persistence (gist ID: `427359f6e41bcf04924234a6f6ae786e`)
- Hand-drawn SVG illustrations (bunny, deer, crystal ball)

## Backend

Both the quiz and prediction market pages share a single GitHub Gist as their backend.

The gist stores a JSON file (`quiz-data.json`) with three top-level keys:

- `votes` -- Quiz answer tallies (per-question Vivek/Jenn counts)
- `freeform` -- Free-form text responses from the quiz
- `predictions` -- Prediction market poll tallies (per-question, per-option counts)

A GitHub PAT with `gist` scope is used for writes. It is split into base64 chunks and reassembled at runtime for light obfuscation.

To reset all data, update the gist content back to zeroed-out counts (do not delete the gist -- the ID is referenced in the HTML).

## Theme

Warm, elegant palette (`#fdf8f4` background, `#8b6f5e` headings, `#c9a68e` accents) with cute animal motifs (sleeping bunny on a crescent moon, baby deer/fawn). Mobile-first responsive design.
