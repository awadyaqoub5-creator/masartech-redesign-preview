# Masartech homepage redesign (proposal)

- `index.html`: a standalone homepage (HTML + CSS + about 40 lines of vanilla JS). Arabic, RTL, responsive.
- `screenshots/`: before and after shots at desktop (1440px) and mobile (375px).
- Status: **not deployed**. The live site (custom PHP, Bootstrap, jQuery) is unchanged.

All content comes from the live homepage as read on 13/11/2026: courses, prices, dates, ratings, testimonials, accreditation text, client and partner logos, and links. The corporate band copy comes from `/corporate-solutions`. No courses, numbers or reviews were made up. Images are hot-linked from masartech.com.sa for the preview only.

## Problems found on the live homepage

| # | Problem | Impact |
|---|---------|--------|
| 1 | The hero headline «مهارات اليوم لفرص المستقبل» is baked into the banner image. The page has **no `<h1>`**. | SEO and screen readers miss the main message. The text can't be translated or resized. |
| 2 | `<html lang="en">` with no `dir` attribute. RTL is applied only through CSS. | Wrong language for screen readers and search engines. |
| 3 | A "سجل بياناتك…" popup opens over the hero as soon as the page loads. | It blocks the first impression, which hurts conversion and mobile UX. |
| 4 | Main buttons use `#0793D0` with white text: **3.45:1** contrast. | Fails WCAG AA (4.5:1). |
| 5 | Body font falls back to Arial. Tajawal, Tahoma and Arial are mixed across the page. | Inconsistent Arabic type. |
| 6 | "أقرب الدورات" and "أكثر الدورات طلبا" repeat the same 5 of 6 courses as two long grids. | A long, repetitive page, especially on mobile (~5,800px). |
| 7 | Every card shows «0.0 (0 تقييم)» with five empty stars. | Reads as negative social proof. |
| 8 | Course titles are long SEO strings cut off with "…" on cards. | Hard to scan, and the cut text loses meaning. |
| 9 | Partner and client logos sit in auto-scrolling marquees with duplicated items and no pause control. | Fails the "auto-rotating content needs control" guideline. Screen readers hear every logo twice. |
| 10 | The newsletter input uses a placeholder as its only label. | Accessibility and form UX. |
| 11 | 22 tap targets under 32px tall and 116 text nodes under 13px on mobile. | Touch accuracy and readability. |
| 12 | The CCNA card image has an empty `alt`. Social icons have no labels. The Facebook link goes to facebook.com and the Pinterest link goes to the homepage. | Accessibility and broken links. |
| 13 | **Stale data:** «أقرب موعد: الأحد 2026-11-08» (Network+, SHRM) is already in the past. | Trust. Fix this in the CMS, not in the design. |
| 14 | The header logo PNG is 3533×1052px. | A heavy LCP asset. Export it at about 2× display size, or as SVG. |

## What changed and why

| Change | Reason (ui-ux-pro-max rule or finding) |
|--------|------------------------------|
| Live-text `<h1>` hero with the same headline, subtitle, attendance modes and CTAs. `lang="ar" dir="rtl"`. | `heading-hierarchy` (UX, Medium). Fixes problems 1–2. |
| Accreditation line (TVTC, NELC, منار) placed under the hero CTAs. | The landing-pattern rule puts trust and social proof next to the primary CTA. |
| On-load popup replaced by an «اختر مجالك» panel in the hero: 7 real categories plus a WhatsApp link for help choosing. | Lets visitors pick for themselves without being interrupted. Fixes problem 3. |
| Brand blue kept. Text and buttons use `#0670A8` (5.4:1). Original `#0793D0` stays for decoration only. Navy `#0B1B33` for the top bar, corporate band and footer. | `color-contrast` 4.5:1 (Accessibility, CRITICAL). Fixes problem 4. |
| One font: **IBM Plex Sans Arabic** (400–700), 16px base, 1.7 line height. | The skill's `google-fonts` search for Arabic sans returned IBM Plex Sans Arabic (full weight range, Arabic and Latin). Base 16px and line height ≥1.5 come from the Typography rules. Fixes problem 5. |
| The two course lists merged into one section with accessible **tabs** (أقرب الدورات المتاحة / الأكثر طلبًا), keyboard arrows in RTL order. | Cuts repetition and page length. Fixes problem 6. |
| Ratings shown only when a course has reviews (aPHRi 5.0 with one review, CCNA 5.0 with 11). | Avoids negative social proof. Fixes problem 7. |
| Card title split into a short name (h3) and the qualification line under it. Duration and date shown with icons. Price and button in the footer. The whole card is clickable. | `Compact Label Overflow`: no truncated text. Fixes problem 8. |
| Logos in a static grid with real `alt` text and no duplicates. | `Auto-Rotating Content Controls` (High). Fixes problem 9. |
| Newsletter field has a visible label, `type=email`, `autocomplete` and `dir=ltr`. | Forms: visible labels, no placeholder-only labels. Fixes problem 10. |
| Every control is at least 44px tall. Mobile **sticky action bar** (استعراض الدورات, واتساب, اتصال) with body padding so it never covers content. | `Touch Target Size` (High). `Sticky Navigation`: don't cover content. The CTA placement follows the skill's "Hero (sticky) + after features + bottom" pattern. Fixes problem 11. |
| SVG icons (Lucide style, `aria-hidden`). Labelled icon buttons. Skip link. Visible focus rings. | Pre-delivery checklist: no emoji icons, aria-labels, visible focus. Fixes problem 12. |
| Subtle 12px fade-up on scroll, turned off under `prefers-reduced-motion`. | Design dial `--motion 3` (Subtle Scroll Reveal, 300–400ms) and the `Reduced Motion` rule (High). |
| Corporate band (copy from /corporate-solutions) plus a link to «الدورات المدعومة من هدف». | Gives B2B its own CTA instead of a single hero button. |

## ui-ux-pro-max recommendations I did not follow

- `--design-system` suggested **Claymorphism**, indigo and orange, and **Baloo 2 / Comic Neue**. Those are tuned for children's and playful education apps, which is wrong for an adult professional-certification institute, and they would replace the Masartech brand colours. I kept the brand palette and used the skill's `--rtl=full` style results instead: Flat / Minimalism & Swiss / Bento cards (rtl_level: full, low accessibility risk).
- The typography search's "Arabic Elegant" (Noto Naskh) reads as traditional or religious. A sans fits a tech and management training brand better.

## Notes for the developer

1. Port the sections into the existing PHP templates. Course cards, ratings and dates should come from the same data the current homepage uses. Show the rating line only when `reviews_count > 0`.
2. Self-host the font, or keep the Google Fonts link with `display=swap`.
3. Replace the hot-linked images with the site's asset helpers, and add `width`/`height` to prevent layout shift.
4. The search button needs to open the existing search UI.
5. Hook the newsletter form up to the existing endpoint.
6. Fix the Facebook and Pinterest URLs and the past course dates in the CMS.
