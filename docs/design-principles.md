# Design principles

Every page of gined.in follows these rules. Each design phase takes one page at a time and brings every section up to them.

## Feel

Calm, expert, cinematic. The site should feel like a precise instrument in a well-lit room: dark ink and warm paper, gold used sparingly for what matters, real photography, and motion that explains rather than decorates.

## Rules

1. **One dramatic moment per screen.** Each section has one focal point: a large serif line, a photo, or a number. Everything else is quiet.
2. **Real photography, treated consistently.** Photos are free-licence Unsplash images listed in `src/content/images.ts`. Each one sits under an ink gradient and a fine grain, so different photos look like one set. Never use people as fake students or testimonials.
3. **Type does the heavy lifting.** Instrument Serif for display lines, revealed line by line. Switzer for everything you read or tap. Numbers are tabular and count up when they first appear.
4. **Motion has a job.** Entering content rises and sharpens (from blur) once. Photos wipe in and drift slowly with scroll (parallax). Hover states respond to the pointer (spotlight, magnetic buttons). Nothing loops forever except a slow marquee.
5. **Depth, not borders.** Premium surfaces use soft layered shadows, a hairline highlight on top, and gentle gradients. Flat grey boxes and plain 1px borders are the exception.
6. **Dark and light sections alternate** to pace the page: ink hero, paper content, ink story, paper detail, photo band, ink close.
7. **Speed and access are part of the design.** Everything works with motion turned off (`prefers-reduced-motion`): content simply appears. Animations use transform and opacity only. Images go through `next/image` with sizes set. Contrast stays at 4.5:1 for text, and the axe tests in `tests/e2e/a11y.spec.ts` must pass.

## Building blocks

All live in `src/components/motion/` and `src/app/globals.css`.

| Block | Use |
| --- | --- |
| `data-reveal` (`up`, `fade`, `clip`, `scale`) | Any element that should animate in when scrolled into view; `--delay` staggers siblings |
| `SplitLines` | Serif display lines that slide up from behind a mask |
| `CountUp` | Numbers that count up once when seen |
| `Photo` | An Unsplash photo with the ink treatment, optional parallax and wipe-in |
| `data-spotlight` | A card whose glow follows the pointer |
| `data-magnetic` | A button that leans toward the pointer |
| `Marquee` | A slow, pausable ticker |
| `.grain` | The fine film grain over photos and dark sections |
| `.surface-premium` | Raised card: layered shadow, top highlight, soft gradient |
| `TweenNumber` | A number that glides to its new value when a control changes it |
| `.bar-fill` / `.bar-dot` | Bars and markers moved with transform only (`--s` length, `--o` offset); they grow in with their revealed card |
| `.range-premium` | The gold slider for dark panels (`--fill` sets the filled part) |
| `.skeleton` | Loading placeholder with a light sweep; size it to match what it stands in for, so nothing jumps |
