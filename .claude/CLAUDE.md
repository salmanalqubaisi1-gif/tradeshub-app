# Trades Hub — Claude Code Instructions

## Role
Code review, debugging, and small targeted fixes only. Not architecture or planning.

## Project
Trades Hub is a skilled-trades platform for apprentices/tradespeople, contractors, suppliers, and homeowners.

## Deadline
- V0 feature-complete: Oct 16, 2026
- QA / freeze: Oct 17–23
- School demo: Oct 23, 2026

## Stack
React Native / Expo, TypeScript, Supabase, GitHub, VS Code

## Development Rules
- No large refactors unless explicitly requested.
- Prefer the smallest safe change.
- Do not redesign unrelated UI.
- Preserve working behavior.
- Identify the exact file before changing code.
- Do not invent database tables or columns.
- Do not expose secrets or service-role keys.
- Do not use fake marketplace prices as production data.
- Keep changes demo-safe.
- If a file is very large, focus only on the section related to the task.
- If unsure about something, ask for the exact code or schema instead of guessing.

## Current Priority
Finish V0 reliably: 1) apprentice/tradesperson experience, 2) contractor experience, 3) supplier experience, 4) homeowner experience.

## Marketplace (Deal Scanner)
File: src/components/marketplace/MarketplaceScreen.tsx

Rules:
- Only authorized production pricing sources.
- Test prices must never appear to users.
- Stale prices must not be shown as current.
- Edmonton selection should not show Calgary-only store offers.
- One normalized product maps to many retailer offers.

Tables (do not invent others):
- marketplace_products
- marketplace_product_trades
- marketplace_retailers
- marketplace_retailer_locations
- marketplace_retailer_offers
- marketplace_retailer_source_configs
- marketplace_retailer_ingestion_runs
- marketplace_retailer_offer_import_staging

## Important Warning
src/app/home.tsx is very large. A previous major refactor caused major breakage and wasted time. Do NOT refactor home.tsx broadly. Only make targeted changes when strictly necessary.

## Project Context Docs
Read these before working on related tasks:
@src/app/docs/AI-CONTEXT.md
@src/app/docs/ARCHITECTURE.md
@src/app/docs/MVP-MASTER.md
@src/app/docs/BUGS.md

## Expected Output Format
For every task:
1. File involved
2. Cause of the issue
3. Smallest safe fix
4. Exact code change
5. What to test afterward
6. Any risk to know about

Do not suggest unrelated improvements unless they're likely to break the demo.