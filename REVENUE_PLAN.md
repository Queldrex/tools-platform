# Queldrex Revenue Plan
# Goal: $5,000/month
# Company: Queldrex LLC — Castle Rock, CO

---

## What's Live Right Now

| Product | Price | Status |
|---|---|---|
| AI Visibility Scanner | $149 one-time | Live at queldrex.com/scanner |
| AI Visibility Monitor | $29/month | Live at queldrex.com/monitor |
| Build for Me (custom projects) | $750–$3,500 | Live at queldrex.com/services |
| Threat Intelligence Feed | Free (gated coming) | Live |
| Breach Lookup | Free (gated coming) | Live |
| Agency Plan | $99/month | Coming |
| AI Citation Tracker | TBD | Building next |

---

## The Math to $5,000/Month

| Path | What it takes |
|---|---|
| Scanner only | 34 sales/month (~1/day) |
| Monitor only | 173 subscribers |
| Custom builds only | 3–4 projects/month |
| Mixed (realistic) | 10 scanner + 50 subscribers + 1 project = $5,040 |

---

## WEEK 1 — Bridge Money (Do These Today)

### You do:
1. **Create Upwork profile** — upwork.com/freelancer
   - Title: "Full-Stack Developer — Custom Tools, Automations, AI Integrations"
   - Portfolio: link queldrex.com (shows real shipped software)
   - Bid on 5–10 jobs per day (web dev, automation, tool building)
   - First client can come within days
   - Rate: $50–75/hr to start, raise after reviews

2. **Post on Reddit r/forhire** — reddit.com/r/forhire
   - "Developer available. I build custom tools, automations, AI integrations, web apps. Fast turnaround. Portfolio: queldrex.com. DM me."

3. **Apply to AppSumo** — sell.appsumo.com
   - Product: AI Visibility Scanner
   - AppSumo drives 1M+ buyers. A launch can bring $10,000–$50,000 in one week.
   - They take 30 days to review. Apply TODAY so the clock starts.

4. **Set up Stripe webhook** (5 minutes — unlocks monitor subscriptions):
   - stripe.com → Developers → Webhooks → Add endpoint
   - URL: https://queldrex.com/api/monitor/webhook
   - Events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
   - Copy signing secret → Vercel env var: STRIPE_WEBHOOK_SECRET

5. **Set up TOTP 2FA** (5 minutes — locks down your admin):
   - Visit queldrex.com/admin/setup-2fa
   - Scan QR code with Google Authenticator
   - Add ADMIN_TOTP_SECRET to Vercel env vars

### I build:
- Pricing page (converting visitors now) ← IN PROGRESS
- Tool gating (reason to pay $29/month) ← IN PROGRESS
- Portfolio/case studies page (wins Upwork clients)
- AppSumo-ready landing page for scanner

---

## MONTH 1 — First Real Revenue

### Channels:
- **Upwork** → $1,500–3,000 (2 projects)
- **Scanner sales** → $149 × 10 = $1,490
- **Monitor subscribers** → $29 × 20 = $580
- **Total target: $3,000–5,000**

### Actions:
- Post on LinkedIn 3x/week about AI visibility
  - "Does ChatGPT recommend your business? Most don't know."
  - Share interesting scan results (anonymized)
  - Link to free scan at queldrex.com/scanner
- Post in Facebook small business groups — offer free scans for feedback
- Direct outreach to 5 web agencies about the Agency plan
- Answer questions in r/smallbusiness, r/entrepreneur with helpful info + link

### I build:
- AI Citation Tracker ("Does ChatGPT mention your business?") — new product, no competition at SMB level
- Shareable scan result cards — every scan becomes free marketing on LinkedIn/Twitter
- Agency landing page for the $99/month plan

---

## MONTH 2–3 — Compounding

### Channels:
- Monitor subscribers building to 100+ ($2,900/month recurring)
- Agency plan first clients ($99 × 10 = $990/month)
- Scanner sales steady ($149 × 20 = $2,980)
- **Total target: $5,000–7,000/month**

### ProductHunt Launch:
- Launch the AI Visibility Scanner + Monitor bundle on ProductHunt
- Free traffic, tech-savvy early adopters, potential #1 Product of the Day
- Can drive 500–2,000 visitors in 24 hours

### AppSumo Launch (if approved):
- Lifetime deal at $49–97 one-time
- 500 sales × $49 = $24,500 in one week
- Builds email list and word of mouth

---

## Platforms to Sell On

| Platform | What to sell | Timeline |
|---|---|---|
| queldrex.com | Everything | Now |
| Upwork | Custom build services | This week |
| AppSumo | AI Scanner lifetime deal | Apply now, launch in 30 days |
| ProductHunt | Scanner + Monitor bundle | Month 2 |
| Reddit r/forhire | Custom build services | This week |
| Fiverr | Automation + tool builds | This week |
| RapidAPI | Threat Feed API access | Month 2 |

---

## Products to Build (Priority Order)

1. **Portfolio/case studies page** — wins Upwork clients NOW
2. **Shareable scan results** — viral marketing, drives scanner sales
3. **AI Citation Tracker** — next big product, no SMB competition
4. **Agency landing page** — targets $99/month plan
5. **AppSumo landing page** — optimized for their audience

---

## The Non-Negotiables

- Stripe webhook must be set up — every day without it is lost monitor revenue
- TOTP 2FA must be set up — you cannot have a business with an insecure admin
- Upwork profile must go live this week — fastest bridge to real income
- AppSumo application must be submitted this week — 30 day clock starts now

---

## Revenue Projection

| Month | Scanner | Monitor | Services | Total |
|---|---|---|---|---|
| Month 1 | $1,490 | $580 | $2,000 | $4,070 |
| Month 2 | $2,235 | $1,450 | $2,000 | $5,685 |
| Month 3 | $2,980 | $2,320 | $1,500 | $6,800 |

This assumes active outreach and Upwork work. With AppSumo launch, Month 2 could spike to $20,000+.

---

*Last updated: June 2026*
*Built by Queldrex LLC — queldrex.com*
