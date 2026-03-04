# RPI Helper — Open Questions for Monika

**Purpose**: Before we begin building RPI Helper, we need answers to these questions to make the right architectural and design decisions. Please answer as thoroughly as you can — specifics matter more than generalities here.

---

## 1. Teachable Setup

1. **What is your exact Teachable URL?** (e.g., rpieducation.teachable.com or a custom domain?)
2. **Which Teachable plan are you on?** (Basic, Pro, Business?) — This determines API access and checkout customization options.
3. **List every product/course currently in Teachable**, with:
   - Product name
   - Price
   - Whether it's active or draft
   - Which membership tier it corresponds to (if any)
4. **Do you use Teachable's built-in checkout, or do you redirect to Stripe directly?**
5. **Do you have Teachable API access enabled?** (Pro plan and above)
6. **Are there any coupon codes or promotional pricing currently active?**
7. **Do you use Teachable's affiliate program feature?**

---

## 2. Keap (Infusionsoft) CRM Setup

1. **What Keap plan are you on?** (Keap Grow, Pro, Max, or legacy Infusionsoft?)
2. **How many contacts are currently in your Keap account?** (The brief says ~2,000 — is that still accurate?)
3. **What tags do you currently use to segment contacts?** Please list all active tags.
4. **Do you have any active automation sequences/campaigns?** If so, briefly describe each one.
5. **What is your current email sending frequency?** (Weekly newsletter? Monthly? Ad hoc?)
6. **Do you have Keap API credentials available?** (API key or OAuth2 setup)
7. **Are there any custom fields on your contact records that we should know about?**
8. **What is the typical journey a contact takes through Keap today?** (e.g., opt-in → welcome sequence → weekly newsletter → ?)

---

## 3. Stripe / Payment Processing

1. **Do you have a Stripe account, or does payment flow entirely through Teachable?**
2. **If you have Stripe directly**: Is it connected to Teachable, or used independently for other products?
3. **Do you offer any recurring/subscription billing?** (Monthly membership fees, annual plans?)
4. **What currencies do you accept?** (CAD only? USD? Both?)
5. **Do you need to support payment plans?** (e.g., $1,997 split into 4 monthly payments)

---

## 4. Domain & Hosting

1. **What is your current primary domain?** (rpieducation.com? Other?)
2. **Where is your domain registered?** (GoDaddy, Namecheap, Cloudflare, etc.)
3. **Where is your current website hosted?** (WordPress on what hosting provider?)
4. **Do you want RPI Helper to replace the current website entirely, or live on a subdomain?** (e.g., helper.rpieducation.com vs. replacing rpieducation.com)
5. **Do you have access to DNS settings to point domains/subdomains to Vercel?**
6. **Do you have any other subdomains in use?** (blog, members, app, etc.)

---

## 5. Content & Brand

1. **Do you have a brand style guide?** (I see the RPI Branding doc — is that the current/complete guide?)
2. **Do you have high-resolution versions of your logo?** (PNG with transparent background, SVG?)
3. **Do you have professional headshots/photos of yourself for the website?**
4. **Are there specific testimonial quotes you want featured prominently?** Or should we use all available testimonials?
5. **The blog posts in the content folder — are all of these still accurate and relevant, or are some outdated?**
6. **The podcast transcripts — are these complete transcripts or just notes/links?**
7. **Do you have video content hosted somewhere** (YouTube, Vimeo, Wistia) that we should embed? Please share URLs.
8. **Is there any content that should NOT be included in the AI Advisor's training data?** (e.g., outdated pricing, discontinued programs, personal information)

---

## 6. Membership Tiers (Verification)

The brief describes 4 tiers. Please confirm or correct:

| Tier | Price | What's Included | Still Active? |
|------|-------|-----------------|---------------|
| Community Access | $29.97/month | Newsletter, forums, basic resources | ? |
| Wealth Immersion | $1,997 one-time | 7-module program, group coaching | ? |
| Personal Coaching | $8,000 | 1-on-1 with Monika, all WI content | ? |
| Elite | $15,000+ | Everything + direct deal review | ? |

1. **Are these prices current?**
2. **Is Community Access a monthly subscription or one-time?**
3. **Are there any tiers or products NOT listed here?** (Books, courses, workshops, etc.)
4. **What is the actual checkout URL for each tier?** (The Teachable links we should send people to)

---

## 7. AI Advisor Specifics

1. **Are there specific phrases, frameworks, or "Monika-isms" that the AI should use?** (e.g., "invest like the top 2%", specific acronyms or mental models)
2. **Are there topics the AI should explicitly avoid?** (Beyond the obvious — no specific investment advice, no financial advisor claims)
3. **What should the AI do when someone asks about the old chapter network?** (Redirect? Explain it's no longer active?)
4. **Should the AI be able to book discovery calls directly?** If so, what booking tool do you use? (Calendly, Acuity, etc.)
5. **What is your booking link for discovery calls?**
6. **In a typical discovery call, what are the 3-5 questions you always ask?** (This helps us design the onboarding quiz)

---

## 8. Analytics & Tracking

1. **Do you currently have Google Analytics (or any analytics) on your website?**
2. **Do you have a Facebook Pixel or any ad tracking pixels installed?**
3. **Do you use Google Tag Manager?**
4. **Do you run any paid advertising currently?** (Google Ads, Facebook Ads, LinkedIn Ads?)

---

## 9. Legal & Compliance

1. **Do you have a privacy policy and terms of service for your current website?**
2. **Do you serve clients in the EU?** (Affects GDPR compliance requirements)
3. **Do you have any required disclaimers** for your educational content? (e.g., "not financial advice" language that your legal advisor has approved)
4. **Is there a specific disclaimer or terms page we should link to?**

---

## 10. Success Metrics

1. **What does success look like in the first 30 days after launch?** (Number of chatbot conversations? Signups? Sales?)
2. **What is your current monthly website traffic?** (Approximate number of visitors)
3. **What is your current conversion rate?** (Visitors to paying members)
4. **What is the target conversion rate you'd consider a success?**
5. **How many discovery calls do you currently do per month?**

---

*Please answer these as completely as possible. Partial answers are fine — flag anything you're unsure about and we'll work through it together. The more we know before building, the less we'll need to rebuild later.*
