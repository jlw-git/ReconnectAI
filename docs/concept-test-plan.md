# ReconnectAI — Concept Test Plan

**Type:** Remote, unmoderated concept test via WhatsApp
**Stimulus:** [`/demo`](../app/demo/page.tsx) — 5-step interactive walkthrough
**Goal:** Validate whether property agents recognize the problem and find the proposed solution worth using before we invest more in the product.

This is a **concept** test, not a usability test. We are not asking *"can they use it"* — we are asking *"do they want it"*.

---

## 1. Hypotheses we're testing

We expect agents will agree, but we want them to tell us in their own words. Anything below "agree" on any of these is a signal worth listening to.

| # | Hypothesis | Signal of failure |
|---|---|---|
| H1 | Agents recognize that they neglect their past-client database | "I already keep in touch with everyone" |
| H2 | Agents see the value of relevance over frequency | "I just want to send more messages" |
| H3 | Agents trust an AI-drafted message enough to send it (with review) | "I'd never trust software to write to my clients" |
| H4 | Agents would pay for this | "Cool, but not for me" / "Free maybe" |

---

## 2. Participants

**Target:** 8–12 active property agents.
8 is the minimum where qualitative themes start repeating; beyond 12 you usually hit diminishing returns for a concept test.

**Profile:**
- Active in the last 12 months (closed at least one transaction)
- Has a contact database of 50+ past clients
- Mixed seniority (3+ junior/mid, 3+ senior — different priorities surface)
- Mixed segments where possible (residential + commercial; new-launch + resale)

**Avoid:**
- Agents who already use a heavy CRM stack (HubSpot, Salesforce) — they'll evaluate against tools, not concept
- Friends and family — too biased toward yes
- Brokerage owners — they evaluate as buyers, not users (different test, do separately)

**Recruitment channels:**
1. Personal network — ask for warm intros, not direct asks
2. WhatsApp groups for agents (property-related)
3. LinkedIn DMs to agents with public listings
4. Agent associations / WhatsApp broadcast lists

---

## 3. Materials

### 3a. Demo link

```
https://<your-vercel-domain>/demo
```

The link preview will show the OG image (ReconnectAI logo + tagline). Don't paste it as a bare URL — always wrap it with a hook (see scripts below).

### 3b. WhatsApp scripts

Three messages, sent in sequence. **Do not send all three at once.** Wait for a reply (or 24h) between each.

**Message 1 — initial share (Day 0):**

> Hey [Name], working on something for property agents and would love your gut reaction. 60-second walkthrough — no signup, no commitment.
>
> [link]
>
> Just curious what you think.

**Message 2 — single open question (sent after they reply, or 24h if no reply):**

Pick ONE based on what they said:

- If they said something positive → *"Would you actually use it?"*
- If they said something neutral → *"What feels off?"*
- If they ignored it → *"Did you get a chance to look? No worries if not."*
- If they said no → *"What would have to be different for you to want it?"*

**Message 3 — willingness-to-pay probe (only if Messages 1–2 went well):**

> Last question — if this existed today, what would you pay for it monthly? Genuine answer, not what you think I want to hear.

This is the most uncomfortable question and the most valuable. Don't skip it.

### 3c. What NOT to do

- Don't explain the product before they click
- Don't apologize for it being early or rough — they'll calibrate down
- Don't argue with their reaction, ever
- Don't ask "do you like it?" — leading
- Don't send to multiple agents from the same brokerage at once (they'll talk)

---

## 4. Protocol

| Day | Action |
|---|---|
| -1 | Confirm Vercel Analytics → Custom Events is enabled |
| 0 | Send Message 1 to a batch of 3–4 agents max per day (so you can respond to each in real time) |
| 0–1 | Reply to anything that comes back the same day. Don't oversell. |
| 1–2 | Send Message 2 to anyone who replied or went silent past 24h |
| 3–5 | Send Message 3 to engaged agents only |
| 7 | Stop. Synthesize. |

**Pacing matters.** If you send to all 12 in one day, you can't react to early signal and adjust. Send in waves of 3–4.

---

## 5. Data capture

Keep one row per agent in a spreadsheet. Add a column for each:

| Field | Source |
|---|---|
| Agent name + brokerage | manual |
| Years experience, segment | manual (ask casually if you don't know) |
| Day sent | manual |
| Clicked? | Vercel Analytics → `demo_step` event (`name=hero`) |
| Last step reached | Vercel Analytics → highest `demo_step.name` for that session |
| Clicked Scan? | Vercel Analytics → `demo_scan_clicked` |
| Completed? | Vercel Analytics → `demo_completed` |
| First reaction (verbatim) | WhatsApp reply to Msg 1 |
| Would-use signal | yes / maybe / no — based on Msg 2 reply |
| WTP / month | from Msg 3, in their currency |
| Concerns / objections (verbatim) | from any reply |
| Notable quote | most striking thing they said |

Vercel Analytics doesn't tie events to individual agents. To estimate per-agent funnel, send the link with a `?u=<initial>` query param (e.g. `/demo?u=jt`) and filter in Vercel by URL. The query param is harmless to the page and lets you correlate clicks with names.

---

## 6. Analysis

After all responses are in (Day 7+), look for these patterns. **Themes, not counts.**

### Strong-go signals
- 70%+ reach the closer step (engagement is real)
- 4+ unprompted "I'd use this" or "where do I sign up"
- Real WTP numbers from 3+ agents (any number > $0 is a yes; $0 with enthusiasm is a yellow flag)
- They volunteer use cases we didn't pitch ("could I use this for my buyers too?")

### Yellow flags (re-test or narrow)
- High click-through but low completion (they bail mid-demo) → message ordering is wrong
- "I'd want to write the messages myself" from 3+ agents → reposition as draft helper, not auto-sender
- "My brokerage already does this" from 2+ agents → check what they actually mean before changing direction

### Stop signals
- 50%+ say some version of "I already keep in touch enough" → H1 is wrong, premise needs rethinking
- Trust concerns dominate ("I'd never let AI write to clients") from 5+ agents → product needs a fundamentally different framing (e.g. "AI suggests, you write")
- Nobody offers a real WTP → they're polite, not interested

### Synthesis output

Write **one paragraph** answering: *"What did agents tell us they actually want?"*

If you can't write that paragraph after 10 conversations, the test wasn't structured well — we run another round with sharper questions, not pretend we have signal.

---

## 7. Decision rules

After analysis, pick one:

- **Proceed** — go signals dominate, yellow flags are cosmetic. Build the next thing on the roadmap.
- **Reframe** — concept resonates but our framing/positioning is off. Rewrite the demo intro, retest with 5 fresh agents.
- **Pivot** — premise is wrong (H1 fails). Stop building, talk to 5 more agents about what they *actually* want before writing more code.

The point of the test is to make this decision honestly. If the data is mixed and you find yourself rationalizing, default to **Reframe** — it's the cheapest move and almost always reveals more signal.

---

## Appendix: Question bank (only if a conversation goes deep)

Use sparingly. One per agent maximum, only if they're engaged and willing.

- "When was the last time you reached out to a past client and they actually replied?"
- "What's the longest you've gone without contacting someone in your book?"
- "If we removed the AI bit and just sent you a daily reminder of who to call, would you still want it?"
- "What's the closest tool you use today? Why isn't it enough?"
- "Walk me through what you'd want to see on day 1 of using this."
