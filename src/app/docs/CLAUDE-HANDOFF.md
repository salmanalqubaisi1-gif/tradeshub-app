# Trades Hub — Claude Handoff

## Role
You are helping with code review, debugging, and small targeted fixes.

## Project
Trades Hub is a skilled-trades platform for:
- apprentices / tradespeople
- contractors
- suppliers
- homeowners

## Deadline
- V0 feature-complete target: Oct 16, 2026
- QA / freeze: Oct 17–23
- school demo: Oct 23, 2026

## Stack
- React Native / Expo
- TypeScript
- Supabase
- GitHub
- VS Code

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

## Current Priority
Finish V0 reliably, especially:
1. apprentice / tradesperson experience
2. contractor experience
3. supplier experience
4. homeowner experience

## Marketplace
Trades Hub includes a Deal Scanner.

It:
- organizes products by trade
- compares retailer offers
- supports city/location filtering
- shows price, stock, pickup and online availability
- sends users directly to retailers
- does not process the transaction

## Marketplace Rules
- Only authorized production pricing sources.
- Test prices must never appear to users.
- Stale prices must not be shown as current.
- Edmonton selection should not show Calgary-only store offers.
- One normalized product should map to many retailer offers.

## Main Marketplace Tables
- marketplace_products
- marketplace_product_trades
- marketplace_retailers
- marketplace_retailer_locations
- marketplace_retailer_offers
- marketplace_retailer_source_configs
- marketplace_retailer_ingestion_runs
- marketplace_retailer_offer_import_staging

## Current Deal Scanner File
src/components/marketplace/MarketplaceScreen.tsx

## Important Warning
src/app/home.tsx is very large.

A previous major refactor caused major breakage and wasted time.

Do not refactor home.tsx broadly during V0.

Only make targeted changes when necessary.

## Current AI Workflow
- ChatGPT = project lead / architecture / task planning
- Claude = code review / debugging
- Gemini = external research
- VS Code = implementation
- GitHub = version control

## Expected Claude Output
When given a bug or task:
1. identify the exact file
2. explain the cause briefly
3. propose the smallest safe fix
4. give exact code changes
5. list what to test afterward
6. avoid unrelated improvements