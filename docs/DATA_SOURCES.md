# Data sources — where the dates come from

The dataset is `src/data/events.ts`. Nothing in it is scraped; every entry
was checked against a source and carries that source in the UI. This file
records what was actually verified, what is inferred, and what is weak — so
a future pass knows where to look first.

## The four countries are genuinely different

This is the whole reason the `precision` field exists.

| Country | Status | What that means for the dates |
|---|---|---|
| **Italy** | Regulated | The Conference of Regions coordinates a common start date; each region legislates its own end. Binding on shops. |
| **South Tyrol** | Regulated, separately | Does **not** follow the national calendar. The Bolzano Chamber of Commerce publishes its own four-week windows — and a second, later set for tourist municipalities. |
| **Germany** | Deregulated 2004 | The Sommer-/Winterschlussverkauf ordinance is gone. The dates survive as custom only. |
| **Austria** | Deregulated | Same story; no rules on timing, duration or product groups. |
| **Switzerland** | Never regulated | Retailers set their own. In practice sales start noticeably earlier than in DE/AT — the winter sale opens right after Christmas rather than late January. |

## Confirmed 2026 dates

These are in `overrides` and render as **confirmed** in the app.

### South Tyrol — Bolzano Chamber of Commerce
Source: <https://www.handelskammer.bz.it/de/dienstleistungen/marktregelung/saisonschlussverkäufe>

| Window | Most municipalities | Tourist municipalities |
|---|---|---|
| Winter | 8 Jan – 5 Feb 2026 | 7 Mar – 4 Apr 2026 |
| Summer | 16 Jul – 13 Aug 2026 | 21 Aug – 18 Sep 2026 |

The tourist-area split is the detail almost every other listing drops. Ski
resorts hold their winter clearance *after* the season instead of during
it, which is why that window sits in March.

### Italy, national
Source: Confcommercio / Conferenza delle Regioni

- **Winter 2026**: common start Saturday **3 January**. Valle d'Aosta
  started 2 January, Liguria 5 January.
- **Summer 2026**: common start Saturday **4 July** — the Conference fixed
  the first Saturday in July as the standing national rule.

⚠️ **Known soft spot.** End dates are set per region and range from late
February to early March (winter) and August to September (summer). The
dataset stores a single latest-regional-end, and the blurb says so, but
this is the least precise thing in the file. If per-region granularity
matters later, the right fix is a `regionalVariants` array on the event
rather than more entries.

## Rules used for unconfirmed years

When no official dates exist for a year, the app generates them and labels
the result **estimated**. The rules:

| Event | Rule |
|---|---|
| Black Friday | Day after the 4th Thursday of November. **Not** the 4th Friday — those differ whenever 1 November is a Friday (e.g. 2030). |
| Cyber Monday | 4th Thursday of November + 4 days |
| Black Week | 4th Thursday of November − 3 days, through Cyber Monday |
| Italian winter saldi | First Saturday of January |
| Italian summer saldi | First Saturday of July |
| German/Austrian WSV | Last Monday of January, two weeks |
| German/Austrian SSV | Last Monday of July, two weeks |
| Easter promotions | Easter − 12 days to Easter + 1 |
| Vatertag (DE) | Ascension Day = Easter + 39 |

Easter uses the anonymous Gregorian algorithm, pinned in the tests against
six known years.

## Father's Day is different in all four countries

Worth stating explicitly because it looks like a bug otherwise:

- **Italy** — 19 March (St Joseph's Day), fixed
- **Germany** — Ascension Day, moves with Easter
- **Switzerland** — first Sunday in June
- **Austria** — second Sunday in June

Mother's Day, by contrast, is the second Sunday in May in all four.

## Weak spots, in priority order

1. **Italian regional end dates** — see above.
2. **Food** — the thinnest category by far. Easter, Christmas, post-Christmas
   and Spargelzeit are in; beyond that, grocery discounting in DACH is
   weekly and retailer-specific, not calendar-driven, so there may simply
   not be much more to add.
3. **Amazon Prime Day** — Amazon announces dates only a few weeks ahead.
   The mid-July / early-October slots are the historical pattern, nothing
   more. These want an override each year once announced.
4. **Switzerland** — the summer window (15 June – 27 July) comes from
   retail aggregators rather than any authority, because no authority
   exists. Treat it as the softest entry in the file.
5. **Trentino** — the autonomous province of Trento sets dates *by
   district*, which is not modelled at all. Currently it falls under the
   national Italian entry, which is wrong in detail.

## When re-checking

Regional Italian dates for the following year are normally published in
late December (winter) and June (summer). South Tyrol publishes on the
Chamber of Commerce page linked above. When new dates land, add a year key
to that event's `overrides` — the rule stays as the fallback for years
further out.
