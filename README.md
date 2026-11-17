# Masartech website redesign (proposal, not deployed)

A static HTML/CSS prototype of the whole masartech.com.sa site, built in the new design with the real content from the live site (read 13/11/2026). A developer can port it into the site's PHP templates. Nothing has been published.

## How to open it
Run a local server from this folder:
```
python -m http.server 8765
```
Then open http://localhost:8765/. Opening the files directly also works, but the fonts and some scripts may behave differently.

## Structure
- `assets/site.css`: the shared design system (colours, type, header, footer, cards, forms, tables, accordion, legal-text layout).
- `assets/site.js`: mobile menu, tabs, filter chips, demo forms and the subtle scroll animation.
- `assets/catalog.css` / `company.css` / `content.css` / `camps.css`: page-group styles.
- `_template.html`: the empty page template (header, footer, mobile action bar).
- `CHANGES.md`: the homepage audit and the reasons for the changes (the ui-ux-pro-max rules applied).
- `screenshots/`: before and after shots of the homepage, plus `screenshots/pages/` with a desktop shot of every page.

## Pages (21)
| File | Live page | Notes |
|------|-----------|-------|
| index.html | / | Homepage |
| courses.html | /products/top-products | 14 courses. Bakkah-style: filter sidebar (field, level, mode, Hadaf) with counts, sort, search, centred cards, then a carousel of 8 real reviews |
| course-<name>.html (70) | /product/<slug> | One page per live course, built from that page's own content (title, number, duration, fee, image, description sections incl. outline table, FAQ, reviews) and its open sessions read from the live page's own date/time requests. Courses with no open session show the waitlist. course.html now redirects to the CCNA page. |
| schedule.html | /training-schedule/individuals | Table on desktop, cards on mobile |
| supported-courses.html | /supported-courses | 10 courses supported by «هدف» (HRDF) |
| **camps.html** | **new** | **New camps page with clearly marked placeholders** |
| corporate.html | /corporate-solutions | Training options, fields, client reviews, request form |
| about.html | /about-us | |
| contact.html | /contact-us | Contact cards and form |
| faqs.html | /faqs | The live page holds only placeholder text, so this one does too |
| testimonials.html | /testimonials | 21 real reviews |
| partners.html | /our-partners + /our-clients | |
| be-partner.html | /be-partner | |
| blog.html | /blogs | 10 articles with a filter |
| privacy / refund / terms / disclaimer.html | Legal pages | One template with a table of contents |
| login.html / register.html | /user/login, /user/register | |
| cart.html | /cart | Empty state, plus a clearly labelled filled example |

## Checks done
At 375px and 1440px, all 21 pages have no horizontal scroll, exactly one h1, `lang="ar" dir="rtl"`, and no broken internal links or anchors. Text contrast is at least 4.5:1, and touch targets are at least 44px. Forms are demo-only: they validate but send nothing.

## Things for Masartech to fill in (anything marked `[...]` in yellow)
- **camps.html:** camp names, dates, durations, prices, the day-by-day agenda, trainers and FAQ answers. The live site has no camps content. The page has no countdown or «مقاعد محدودة» claim; add those only with real data.
- **faqs.html:** real questions and answers (the live page shows Lorem text).
- **COBIT 2019:** its duration and image. **Python:** its price.
- How Hadaf eligibility and the support rate work.

## Data problems found on the live site (fix in the CMS)
1. Past dates still shown as «أقرب موعد» (SHRM and Network+ on 08/11/2026).
2. Price conflicts. The Network+ card shows 1,150, but its sessions are 1,265. CCNA shows "from 1,265", but every listed session is 1,495.
3. Three different WhatsApp numbers (966115116066, wa.me/966920014582, and 966544956205 on the corporate page).
4. /training-schedule lists 3 sessions, while /products/top-products shows 28.
5. Every blog excerpt shows raw CSS code instead of text, and the article slugs look cut off.
6. The live FAQ page is Lorem placeholder text.
7. Spelling: «مساراتك» instead of «مسارتك» in the terms and disclaimer, «المصدمة» instead of «المصدرة» in the refund policy, and «مدينة [الرياض]».
8. The register form shows an untranslated key (`words.auth.birth_date`).
9. Contradictory opening hours on /contact-us (Friday).
10. The Facebook link goes to facebook.com and the Pinterest link goes to the homepage. The CCNA image has no alt text. The header logo is 3533px wide.

## Camps: proposed programmes (المعسكرات)
- `camps.html` lists 4 proposed camps. Each has its own page: `camp-ccna.html`, `camp-power-bi.html`, `camp-pmp.html`, `camp-aphri.html`.
- Each camp is built **only** on the facts from its live course page: exam domains and weights, exam code, question count and length, exam language, eligibility, and the base course's price and duration. The day-by-day plan (5–6 days) is **a proposal** and is marked yellow so the trainer reviews it.
- Every camp page has: who it's for, outcomes, the day-by-day plan, exam and certificate, what's included, FAQ, a link to the full course, «قائمة الانتظار» (in the side panel and the mobile bar), and the Google rating.
- **To fill in (yellow):** start date, price, daily hours, seats, camp extras, PMI acceptance of the camp hours as 35 education hours, whether exam fees are included, instalments, and Hadaf support.
- The pages were generated from one data set. A new camp is a copy of any camp page with its content changed, or one entry in the camps table once this moves into the CMS.

## Google rating (replaces per-course ratings, as Bakkah does)
- The institute's rating from its Google Maps listing: **4.6 ★ from 212 reviews** (checked 13/11/2026). Listing: https://maps.google.com/?cid=1297278102350562421
- Shown on: every course card, the top of the course page (links to Google Maps), above the review sections (homepage, course page, reviews page), and the footer of every page.
- The text says it is the **institute's** Google rating, not a rating of the individual course.
- These numbers change. Have the developer pull them automatically from the Google Places API (rating + user_ratings_total) with daily caching, or update them by hand. Don't put this rating in structured data (aggregateRating) on course pages: Google treats it as self-serving.

## Course waitlist (قائمة الانتظار)
- Files: `assets/waitlist.css` + `assets/waitlist.js`. Any button with `data-waitlist="Course name"` (optional `data-waitlist-mode="onsite|online"`) opens one shared dialog. It's a modal on desktop and a bottom sheet on mobile.
- **course.html:** if the chosen attendance mode has no open session (online for CCNA), the waitlist replaces «سجّل الآن». If sessions exist, a link «المواعيد ما تناسبك؟ انضم لقائمة الانتظار» appears under the button.
- **courses.html:** a course with no date (Python, «يُحدَّد قريبًا») shows «قائمة الانتظار» instead of «تفاصيل الدورة».
- Fields: name*, mobile* (Saudi format), email (optional), preferred mode, preferred time (optional), consent*. Validation, loading state and success message are built in. It's a demo and sends nothing.
- Developer: save the requests per course in the database, show them in the admin panel, and notify the waitlist (SMS, WhatsApp or email) when a new session opens. Add an error state if sending fails.

## Bakkah-style layout (Masartech brand)
- Site-wide theme layer at the end of site.css: pill buttons, dark navy heroes on inner pages, centred section titles.
- Homepage rebuilt in Bakkah's section order: dark hero with a trust strip (Google 4.6/212, accreditation, test centre, onsite/online; no visitor or session counts since none are confirmed), career-path cards linking to courses.html?level=… / ?cat=…, partners, a courses carousel, 4 benefits, a dark corporate band, clients, 4 blog posts, a reviews carousel and the newsletter.
- Bakkah's colours, logo, photos and copy are not used.

## Courses menu (like Bakkah)
- «الدورات التدريبية» in the header opens a mega menu: 5 fields on the right (from the live course categories), and each field's courses split into مبتدئ / متوسط / متقدم, with the «مدعومة من هدف» badge, a link to the field's camp and «كل دورات المجال» (courses.html?cat=…). On mobile it becomes nested accordions in the menu.
- Only the 14 real courses are listed. **The level split is a proposal** (e.g. CAPM مبتدئ, PMP متقدم, aPHRi مبتدئ, PHRi/SHRM متوسط, A+ → Network+ → CCNA). Confirm it with Masartech; in the CMS add a level field per course.
- No «الأكثر مبيعًا» badge was added: there is no sales data for it.

## Notes for the developer
- Images are hot-linked from the live site for this preview. Use the site's own asset paths instead.
- The page HTML repeats the header and footer. Turn them into PHP partials (includes).
- Connect the forms to the existing endpoints and add a captcha or other bot protection on the server.
