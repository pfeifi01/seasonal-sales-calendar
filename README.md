# Sale Season

A calendar of every sale worth waiting for across **Austria, Germany,
Switzerland and Italy** — seasonal clearances, Black Friday, Prime Day,
gift days and the season-turnover windows — filterable by country,
category and season, so you can answer "when does the winter sale actually
start, and is it worth waiting?" in one look.

Built because sale dates in this corner of Europe are genuinely
inconsistent: Italy regulates them by law and region, South Tyrol runs its
own calendar on top of that (with a *second* one again for tourist
municipalities), Germany and Austria deregulated theirs in 2004 but
everyone still follows the old dates out of habit, and Switzerland never
regulated them at all. Most listings online flatten all of that into one
undifferentiated list of dates.

## What it does today

- **Year timeline** — every sale in the year as a bar chart across twelve
  months, with a marker on today. The fastest way to see what is coming.
- **Month calendar** — a normal month grid with multi-day sales drawn as
  continuous bars across the weeks.
- **Upcoming list** — what is running right now and what is next, with a
  countdown in days.
- **Filters** — by country, by category (clothing, electronics, food,
  home, sports, beauty, travel, toys), by season, and free-text search.
- **Trilingual** — English, German and Italian, including all the event
  descriptions.

### Honest dates, or none

Every entry carries a **precision** flag, shown in the UI, because
conflating these three is the main way sale listings mislead people:

| Badge | Meaning |
|---|---|
| ⚖️ **Official dates** | Set by law or an official body. Shops are bound by them. Only the Italian regions and the Bolzano Chamber of Commerce qualify. |
| 🕰️ **Traditional** | Was regulated once, is not any more, but most retailers still follow the old window (German/Austrian WSV & SSV). |
| 🏷️ **Retail event** | Pure marketing, no official date anywhere (Black Friday, Prime Day). |

Separately, a period is marked **confirmed** when its dates have been
published and checked for that specific year, and **estimated** when the
app generated them from the usual recurrence pattern because nobody has
announced the real ones yet. Every event links its sources.

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

```bash
npm test
```

The tests cover the date engine, which is where the real risk sits — Easter
calculation, "last Monday of the month" versus "fourth Monday", Black
Friday being the day after US Thanksgiving rather than simply the fourth
Friday of November, periods that cross a year boundary, and day arithmetic
across a DST change.

## Deployment

Docker on the Synology NAS, same pattern as the other sites. Host port
**8086** → container port 8000.

```bash
docker compose up -d --build
```

Pushing to `main` triggers `.github/workflows/deploy-sales-calendar.yml`,
which runs the tests and the build, then copies the repo to the NAS over
Tailscale/SSH and runs `sudo /usr/local/bin/deploy-sales-calendar` there.

**One-time NAS setup** — that deploy script does not exist yet and is not
part of this repo. Create it alongside the ones for the other projects:

```bash
sudo tee /usr/local/bin/deploy-sales-calendar >/dev/null <<'EOF'
#!/bin/sh
set -e
cd /volume1/Martin/Webhosting/docker/webhosting/sales-calendar
docker compose up -d --build
EOF
sudo chmod +x /usr/local/bin/deploy-sales-calendar
```

Then point the reverse proxy at port 8086 and add the subdomain.

## Where this is going

**Milestone 1 — the calendar. Done, this is what you are looking at.**

**Milestone 2 — email reminders.** A small backend service (a second
compose service, not published to the host, proxied at `/api/` — the
commented-out block in `nginx.conf` is already the right shape) holding
subscriptions, plus a daily scheduler that sends "the winter sale starts in
2 days". Sending goes through a dedicated Gmail account over SMTP with an
app password, matching how `mailer.py` works in the ancestry project.

**Milestone 3 — installable web app with push.** A service worker,
manifest and Web Push, so reminders arrive on the phone without email.

## Data

The dataset is `src/data/events.ts` — around 30 events, hand-curated with
sources rather than scraped. See [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md)
for where each group of dates comes from, what is confirmed for 2026, and
the known thin spots (the food category in particular is genuinely sparse,
because outside holidays there is little that is calendar-driven).

Adding an event means adding one object to that array. Adding a country
means adding it to `src/types.ts`, `src/data/countries.ts`, and giving it
events.
