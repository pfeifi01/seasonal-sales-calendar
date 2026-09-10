# Known issues and open questions

Things that are wrong, thin, or deliberately unfinished. Kept honest so
none of it has to be rediscovered later.

## Data

### Confirmed dates only cover 2026

Six events carry published, checked dates — the four South Tyrol windows
and the two national Italian saldi — and all six are for 2026 only.
Everything else, and every year past 2026, is generated from the
recurrence rule and labelled **estimated** in the UI.

The backend now warns about this at startup and reports it on
`GET /api/health` as `datesNeedRefresh`, so it cannot quietly rot for a
year. **Refresh schedule:** Italian regions publish winter dates in late
December and summer dates in June; South Tyrol publishes to the Bolzano
Chamber of Commerce page linked in `DATA_SOURCES.md`.

### Italian regional end dates are flattened

The national saldi entries store a single end date — the latest of any
region — with the variation explained in the blurb. Per-region accuracy
would need a `regionalVariants` array on the event rather than more
top-level entries.

### Trentino is not modelled

The autonomous province of Trento sets dates *by district*. Those shops
currently fall under the national Italian entry, which is wrong in detail.
South Tyrol (Bolzano) is modelled correctly and separately.

### Amazon Prime Day is a guess

Amazon announces dates a few weeks ahead. The mid-July and early-October
slots are the historical pattern and nothing more. Each year's real dates
want an `overrides` entry once announced.

### Switzerland is the softest country in the file

No authority has ever regulated Swiss sale periods, so the summer window
(15 June – 27 July) comes from retail aggregators rather than any official
source. Treat it accordingly.

### Food is a thin category

Easter, Christmas, post-Christmas and Spargelzeit are in. Beyond those,
grocery discounting in the DACH region is weekly and retailer-specific
rather than calendar-driven, so there may genuinely be little else to add.

## Deal sites

`src/data/dealSites.ts` holds plain outbound links, not integrations.

None of these sites offers a general public API. A real integration would
mean either scraping (fragile, and against their terms) or applying for
partner/affiliate feed access, which several of them do offer. That is a
deliberate decision with commercial and disclosure implications, so it is
not something to slide in quietly — the current links carry no affiliate
or referral parameters, and the UI says so.

If it is ever revisited, the plausible order is: idealo and Geizhals both
run affiliate programmes with product feeds; mydealz and Preisjäger are
Pepper-network sites and expose per-group RSS, which is the cheapest
possible "live deals" strip; Toppreise and Trovaprezzi would need
individual enquiries.

## Frontend

### Light mode has not been reviewed by a human

The light palette was built by inverting the ink scale behind CSS
variables and checked programmatically for contrast, but never actually
looked at — the dev environment could not produce screenshots. Worth a
proper once-over, particularly the year-timeline bars, which are drawn
from category colours at low alpha and were tuned against a dark ground.

### The month grid caps at three lanes

Weeks with more than three overlapping sales show `+N` rather than
expanding. Fine in practice — the busiest week of the year is late
November — but it is a cap, not a scroll.

## Backend

### No backup of subscriber data

The most serious operational gap in the project. `backend/data` holds
`subscriptions.json`, `push-subscriptions.json` and `sent.json` as plain
JSON on one NAS volume, and nothing in this repo backs it up or exports
it. Losing that volume loses every subscription. It also leaves no way to
tell anyone why their reminders stopped, because their addresses went with
it.

It may already be covered: a Synology Hyper Backup task on the
`Webhosting` share would include it. That hasn't been checked, so treat it
as unprotected until it has been.

If it isn't covered, the fix is small. Add a nightly copy of `backend/data`
to a second location, plus an export command, so the subscriber list can
be rebuilt from a file.

### Reminder sends are sequential

`runReminders` awaits each message in turn. Correct and easy to follow,
and irrelevant at the current subscriber count; it would want batching
long before it became a real problem.

### The preferences page reuses the unsubscribe token

`/api/manage` is keyed by the unsubscribe token, so anyone holding that
link can change lead times and categories as well as unsubscribe. That is
the same capability the link already granted, and it avoids inventing a
second secret or a password — but it does mean a forwarded reminder email
hands over preference control, not just unsubscribe.

## Push

Untested against a real push service. The endpoints, storage, expiry
pruning and the reminder job's push branch were all exercised locally with
fabricated subscriptions, but no notification has yet travelled through
FCM to a real device — that needs the deployed HTTPS site and a phone.

Push payloads are shorter than the emails by design: a title and one line.
There is no per-notification unsubscribe, only the toggle in the app.

## Environment

Neither Python nor Docker is installed on the Windows development machine.
Consequences: the backend is Node rather than Flask (see `CLAUDE.md`), and
the Docker build cannot be verified locally — the first real test of any
`Dockerfile` change is the deploy itself.
