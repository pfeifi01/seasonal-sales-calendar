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

## Email reminders

`backend/` is a small Express service holding the subscriber list and a
daily job that sends "the winter sale starts in 7 days". It is not
published to the host — only the frontend container reaches it, proxied at
`/api/`, so confirmation links are same-origin.

Signup is **double opt-in**: subscribing sends a confirmation email and
nothing is ever sent to an address that has not clicked the link. Every
reminder carries a one-click unsubscribe.

### One-time setup

Copy the template and fill in the Gmail credentials:

```bash
cp .env.example .env
```

`SMTP_PASSWORD` must be a Google **app password**, not the account
password — Google rejects the account password for SMTP once 2-Step
Verification is on, and 2SV must be on before app passwords can be created
at all. Generate one at <https://myaccount.google.com/apppasswords>, then
paste it **without the spaces** it is displayed with.

Without `SMTP_USER` and `SMTP_PASSWORD` the backend refuses to start,
rather than coming up and failing silently at 08:00 on the morning a
reminder was due. For local work without a mailbox, set `MAIL_DRY_RUN=1`
and emails are printed to the container log instead of sent.

### Checking it works

```bash
docker compose exec backend node send-test.js you@example.com
```

That verifies the credentials against Gmail and sends one test message.
To see what a given day would send without waiting for the scheduler:

```bash
docker compose exec backend node run-reminders.js 2026-11-20 --dry
```

### API

| Route | Purpose |
|---|---|
| `POST /api/subscribe` | `{email, country, lang, categories, leadDays}` → sends a confirmation email. Rate limited per IP, counting only successful signups. |
| `GET /api/confirm?token=` | Activates a subscription. Single use — the token is burned. |
| `GET /api/unsubscribe?token=` | Removes a subscription. |
| `GET /api/health` | Status, dataset size, and when the dataset was generated. |

Subscribers live in `backend/data/subscriptions.json` and delivered
reminders in `backend/data/sent.json`, both gitignored and both mounted as
a volume so they survive rebuilds. There is no database.

### One source of truth for dates

The backend does **not** re-implement the recurrence rules. `npm run
export:events` runs the real TypeScript engine and writes every resolved
occurrence to `backend/catalog/events.json`, which the backend only reads.
The backend Dockerfile does this in a build stage, so editing
`src/data/events.ts` reaches the emails on the next deploy — and there is
no second copy of "Black Friday is the day after the fourth Thursday" to
drift out of sync.

## Where this is going

**Milestone 1 — the calendar.** Done.

**Milestone 2 — email reminders.** Done, see above.

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
