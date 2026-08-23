# INSTRUCTIONS FOR CODING

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

For multi-step tasks, state a brief plan with a verification step each.

---

# Sale Season — project instructions

## What this is

A calendar of seasonal sales, retail deal days and gift days across
Austria, Germany, Switzerland and Italy. Vite + React + TypeScript +
Tailwind, no backend yet. See `README.md` for the feature list and
`docs/DATA_SOURCES.md` for where the dates come from.

Martin is the sole developer, user and decision-maker.

## Mandatory workflow for every change

```bash
npm test && npm run build
```

Both must pass before delivering anything. `tsc` runs in strict mode with
`noUnusedLocals`/`noUnusedParameters`, so unused code fails the build
rather than lingering.

## Data accuracy is the point of this project

The dataset (`src/data/events.ts`) is the product; the UI is a viewer for
it. Three rules, none of them optional:

1. **Never invent a date.** If you cannot source it, leave the event out or
   mark it `retailer` precision with an honest blurb.
2. **`precision: 'regulated'` requires an actual authority** publishing
   binding dates — currently only the Italian regions and the Bolzano
   Chamber of Commerce. German and Austrian seasonal sales were
   deregulated in 2004 and are `traditional`. Switzerland was never
   regulated at all.
3. **`overrides` are for checked, published dates only.** Everything else
   comes from the recurrence rule and renders as "estimated" in the UI.
   Do not add an override to make a number look tidier.

Every event needs at least one entry in `sources` — this is enforced by a
test, not just convention.

## Dates are the risky part — test them

`src/lib/dates.ts` has real edge cases and `src/lib/dates.test.ts` pins
them. Any change there needs a test. Ones already caught:

- Black Friday is the day after the 4th **Thursday** of November, not the
  4th Friday. They disagree when 1 November is a Friday.
- "Last Monday of the month" ≠ "4th Monday" in five-Monday months.
- Periods crossing a year boundary (post-Christmas, Frühbucher) must use
  `durationDays`, never an end rule — an end rule resolves in the *same*
  year and produces an end before the start.
- Day arithmetic goes through `daysBetween`, which snaps to local midnight,
  because a naive millisecond division is off by an hour across DST.

## i18n — always update all three languages

Every user-facing string exists in English, German and Italian. UI strings
live in `src/i18n.ts`; dataset strings are `Localized` objects on the event
itself. A test asserts that every event name and blurb is filled in for all
three. Don't leave hardcoded English in a component.

## Deployment

Docker on the Synology NAS, host port **8086**. Pushing to `main` runs
`.github/workflows/deploy-sales-calendar.yml`, which tests, builds, copies
over Tailscale/SSH and runs `sudo /usr/local/bin/deploy-sales-calendar` on
the NAS. That script is created by hand on the NAS — see README.

Ports already taken by the other sites: 8080-8085, 8090.

## Git commits

Don't add a "Co-Authored-By: Claude" trailer or any similar AI-attribution
line to commit messages.
