# Figma → code mapping (post-approval)

Use after Figma frames are approved. Maps design components to existing classes in [`src/css/input.css`](../../src/css/input.css) and [`index.html`](../../index.html).

| Figma component | CSS class / element | Notes |
|-----------------|---------------------|--------|
| Section container | `.section-shell` | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Section title centered | `.section-title` | `max-w-lg` |
| Section title wide | `.section-title-wide` | `max-w-3xl` |
| Primary button | `.btn-primary` | Update `@theme --color-primary` to `#F7931A` |
| Nav link | `.nav-link` | |
| Nav link active | `.nav-link-active` | |
| Social icon button | `.social-btn` | 44×44 min |
| Theme toggle | `.theme-toggle` | `data-theme-toggle` in HTML |
| Service card | `.service-card` | |
| Stat card | `.stat-card` | |
| Stat icon circle | `.stat-icon` | |
| Stat value / label | `.stat-value` / `.stat-label` | |
| Partner brand card | `.brand-card` | `data-brand` for accent colors |
| FAQ accordion | `.accordion-item`, `.accordion-btn`, `.accordion-panel` | |
| Footer link | `.footer-link` | |
| Newsletter panel | `.site-panel` + `.site-input` | |
| Back to top | `.back-to-top` | |
| Logo | `.logo-img` | Switch `src` to `/img/duacrypto-mark.svg` |

## Token migration (input.css)

Replace cyan theme after approval:

```css
@theme {
  --color-primary: #F7931A;
  --color-primary-dark: #E8850F;
  /* keep page/surface/card/border structure; align dark mode to tokens.json */
}
```

## Files to touch (implementation phase only)

| File | Changes |
|------|---------|
| `index.html` | Full homepage structure per approved Figma |
| `src/css/input.css` | Orange tokens + any new utilities |
| `src/js/main.js` | Remove `initCarousel` / slideshow |
| `src/js/nav.js` | Click dropdown, nav overlap fixes |

## Bootstrap pages

Nav/footer HTML already partially unified in `about.html`, `contact.html`, etc. Match approved Figma chrome — no separate Tailwind build.

## Do not implement until

Approval checklist in [`figma-frame-checklist.md`](figma-frame-checklist.md) is complete and Figma URL is shared.
