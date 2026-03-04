# RPI Helper — Metaswarm Product Spec

> **Purpose**: This document is the complete product specification for RPI Helper V1. It is designed to be fed directly into Metaswarm's `/metaswarm:start-task` command. Metaswarm will decompose it into work units, run design review, and execute the build autonomously.
>
> **How to use**: Copy the content of the "Start Task Prompt" section below and paste it into a Claude Code session with Metaswarm installed.

---

## Start Task Prompt

```
/metaswarm:start-task

Build "RPI Helper" — an AI-powered conversion engine for RPI Education, a real estate investment education company. The product replaces a broken website with an intelligent landing hub, AI chatbot advisor, self-serve onboarding quiz, and lead intelligence system.

## Tech Stack (Locked — do not change)

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: Next.js API Routes, TypeScript
- Database: Supabase (PostgreSQL + pgvector for vector embeddings)
- AI: Anthropic Claude API (claude-sonnet-4-5-20250929), Voyage AI for embeddings
- Hosting: Vercel
- CRM: Keap REST API
- Payments: Teachable checkout (external redirect — we do NOT build payment processing)
- Analytics: PostHog (self-hostable)

## Product Context

RPI Education is led by Monika Jazyk, who teaches real estate investing. She generates demand through speaking, podcasts, and LinkedIn, but her website has dead links, an inactive members portal, and no working conversion path. She has ~2,000 email subscribers in Keap with a 36% open rate, and 100 paying members across 4 tiers.

RPI Helper's job: turn website visitors into paying members by engaging them with an AI chatbot trained on Monika's content, qualifying them through a needs assessment quiz, and routing them to the right product on Teachable.

## Content Library

There are 136 files (.docx and .pdf) containing:
- 7 Wealth Immersion program modules (video transcripts, text content, downloadable PDFs)
- ~30 blog posts on real estate investing and wealth building
- Podcast transcripts from multiple shows
- Membership tier details and product descriptions
- Testimonials and brand assets

These files need to be extracted, cleaned, chunked, embedded, and stored in Supabase pgvector for RAG retrieval.

## V1 Scope — Five Epics

### Epic 1: Modern Landing Hub
A redesigned web presence replacing the broken website. Must include:
- Hero section with Monika's value proposition and video embed capability
- About section with credentials, team of experts
- Testimonials section with real member success stories
- Membership comparison table showing 4 tiers with pricing and "Join Now" buttons linking to Teachable checkout:
  - Community Access: $29.97/month
  - Wealth Immersion: $1,997 one-time
  - Personal Coaching: $8,000
  - Elite: $15,000+
- Mobile-responsive design
- SEO optimization (structured data, Open Graph, sitemap)
- Email capture forms connected to Keap
- All references to inactive chapter network and dead links removed

### Epic 2: Content Pipeline & AI Knowledge Base
Process Monika's content library into a vector database:
- Extract text from .docx (using mammoth) and .pdf (using pdf-parse) files
- Clean, deduplicate, and categorize by content type (module, blog, podcast, product, testimonial)
- Implement intelligent chunking with overlap and metadata preservation
- Generate embeddings and store in Supabase pgvector
- Build hybrid retrieval engine (vector similarity + keyword search) with re-ranking
- End-to-end testing: query → relevant results with source attribution

### Epic 3: AI Advisor ("Digital Monika")
The centerpiece — a conversational AI chatbot that engages visitors in Monika's voice:
- Claude API integration with streaming responses (Server-Sent Events)
- Conversation history stored in Supabase
- RAG-augmented responses using the content knowledge base
- System prompt crafted to match Monika's communication style: warm, empowering, direct, action-focused
- Floating chat widget UI with typing indicators, markdown rendering
- Conversation flow: ask qualifying questions → assess investment stage → recommend appropriate product
- Product recommendation engine: beginner → Wealth Immersion, experienced → Personal Coaching, high-net-worth → Elite
- Warm handoff to Monika for high-value prospects (booking link integration)
- Guardrails: never provides specific investment advice, always disclaims AI status, stays on-topic
- Chat analytics: log conversations, track topics, measure recommendation acceptance
- Rate limiting: 20 messages/hour per conversation

### Epic 4: Self-Serve Onboarding Flow
A guided quiz that recommends the right membership tier:
- Multi-step needs assessment with branching logic
- Questions about: investment experience, goals, budget, timeline, preferred learning style
- Scoring rules that map answers to tier recommendations
- Personalized results page showing recommended tier with comparison
- Direct link to Teachable checkout with UTM tracking
- Quiz analytics: completion rates, drop-off points, recommendation distribution

### Epic 5: Lead Intelligence & CRM Integration
Capture and qualify every visitor interaction:
- Anonymous visitor tracking with session persistence
- Email capture at multiple touchpoints with progressive profiling
- Lead scoring based on: pages visited, quiz completion, chat engagement, time on site
- Keap API integration: create contacts, assign tags, sync scores
- Real-time sync pipeline from Supabase to Keap
- Admin dashboard (protected page): lead pipeline view, recent conversations, conversion funnel
- Admin chat review interface: browse AI conversations, flag issues, see FAQ trends
- End-to-end integration test: visitor → chat → quiz → lead capture → Keap sync → Teachable checkout

## Definition of Done

1. Landing page loads in <2 seconds on mobile (Lighthouse Performance >90)
2. AI Advisor responds to real estate investing questions using content from the knowledge base with source attribution
3. AI Advisor correctly recommends membership tiers based on conversation context
4. AI Advisor maintains Monika's brand voice across 20+ test conversations
5. AI Advisor never provides specific investment advice in 50+ adversarial test prompts
6. Onboarding quiz routes users to correct Teachable checkout URL based on recommendation
7. Quiz completion rate >60% in test sessions (no abandonment on question design)
8. New leads appear in Keap within 60 seconds of email capture
9. Lead scores update in Keap when visitors engage with chat or quiz
10. Admin dashboard shows real-time lead pipeline, conversation logs, and analytics
11. All API routes have error handling and return appropriate HTTP status codes
12. TypeScript strict mode enabled with zero type errors
13. ESLint passes with zero warnings
14. Test coverage >80% on backend services (chat, RAG, quiz logic, lead scoring, Keap sync)
15. Deployed to Vercel with working preview and production URLs
16. Mobile responsive at 320px, 375px, 768px, 1024px, 1440px
17. WCAG 2.1 AA accessibility compliance on all public pages
18. Environment variables documented in .env.local.example
19. README with setup instructions, architecture overview, and deployment guide
20. All Supabase migrations versioned and reproducible

## Human Checkpoints

Pause for human review at these points:

1. **After landing page design is complete** (before building AI features) — Monika needs to approve the visual design and copy
2. **After system prompt is written** — Monika needs to validate that the AI sounds like her
3. **After RAG retrieval is working** — Test with 10 real questions Monika's prospects ask; verify answer quality
4. **After quiz logic is complete** — Monika needs to approve the questions, flow, and recommendation mapping
5. **After Keap integration is connected** — Verify with a test contact that sync works before going live
6. **Before production deployment** — Full end-to-end walkthrough with Monika

## Architecture Constraints

- Supabase is the ONLY database. No additional databases or caches.
- Authentication: admin dashboard uses a simple password-protected route (no full auth system in V1)
- All API keys stored in environment variables, never committed to git
- No server-side rendering of the chat widget — it's a client component
- Teachable checkout is an external redirect — we generate the URL, Teachable handles payment
- Keap integration is one-way: RPI Helper → Keap. We don't read back from Keap in V1.
- Content extraction pipeline is a one-time script, not a live service
- Vector embeddings use Voyage AI (voyage-3) for quality; OpenAI ada-002 as fallback

## What NOT to Build

- User authentication / login (except admin password)
- Payment processing (Teachable handles this)
- Email sending (Keap handles this)
- Blog / content management system
- Member portal or course delivery (Teachable handles this)
- Mobile app
- Multi-language support
```

---

## How to Run This Build Plan

### Prerequisites

1. **Claude Code** installed and configured
2. **Metaswarm** installed: `claude plugin marketplace add dsifry/metaswarm-marketplace && claude plugin install metaswarm`
3. **GitHub repo** created: `rpi-helper` with `dev` and `main` branches
4. **Supabase project** created with pgvector extension enabled
5. **Anthropic API key** for Claude access
6. **Vercel account** connected to the GitHub repo
7. _(Optional)_ Gemini CLI and/or Codex CLI for cross-model adversarial review

### Setup Steps

```bash
# 1. Create and enter project
mkdir rpi-helper && cd rpi-helper && git init
git checkout -b dev

# 2. Initialize Node.js project
npm init -y

# 3. Open Claude Code
claude

# 4. Inside Claude Code, set up Metaswarm
/metaswarm:setup

# 5. Copy the "Start Task Prompt" from above and paste it
```

### What Happens Next

Metaswarm will:
1. **Research**: Explore the project (empty at this point) and analyze the spec
2. **Plan**: Architect agent creates an implementation plan
3. **Validate**: Pre-flight checklist runs (architecture, deps, API contracts, security)
4. **Design Review**: 6 agents (PM, Architect, Designer, Security, UX, CTO) review the plan in parallel
5. **Decompose**: Break the plan into work units with file scopes and dependency graph
6. **External Deps**: Prompt you for API keys (Anthropic, Supabase, Keap)
7. **Execute**: Build each work unit through the 4-phase loop (Implement → Validate → Adversarial Review → Commit)
8. **Pause at checkpoints**: Stop for your review at the 6 human checkpoints defined above
9. **PR Creation**: Create PR with test plan when work units are complete
10. **Learn**: Extract patterns and decisions into the knowledge base

### Content Library Access

The content library (136 files) must be accessible to the build. Place it at:
```
rpi-helper/content/raw/
```

Or provide a path to the content directory when Metaswarm prompts for external dependencies.

---

## Comparison Notes

This Build Plan differs from the repo-template Build Plan in these ways:

| Aspect | Repo-Template (Plan 1) | Metaswarm (Plan 2) |
|--------|----------------------|-------------------|
| Decomposition | 38 hand-crafted phases | Metaswarm auto-decomposes into work units |
| Architecture | Pre-decided in phase specs | Metaswarm's Architect agent decides |
| Review | Manual testing per phase | Adversarial review by separate agents |
| Quality | 10 acceptance criteria per phase | Blocking quality gates (lint, typecheck, coverage) |
| Code review | Manual (or skip) | Cross-model adversarial review |
| Knowledge capture | alignment.md after each phase | Auto-reflect after each PR |
| Human involvement | Review after each phase | Review at 6 defined checkpoints |
| Flexibility | Must follow phase spec exactly | Agents adapt to what they discover |
| Risk | Over-specified → rigid | Under-specified → agents may diverge |

---

*This document is the input for the Metaswarm experiment. For the repo-template experiment, use the BuildPlan-RepoTemplate/ directory.*
