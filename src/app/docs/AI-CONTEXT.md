# Trades Hub AI Context

## Project
Trades Hub is a platform for skilled tradespeople, apprentices, contractors, suppliers and homeowners.

## Current V0 Priority
1. Apprentice / Tradesperson
2. Contractor
3. Supplier
4. Homeowner

## Current Deadline
- Feature complete target: Oct 16, 2026
- QA / freeze: Oct 17–23, 2026
- School demo: Oct 23, 2026

## Stack
- React Native / Expo
- TypeScript
- Supabase
- GitHub
- VS Code

## Core Rules
- Do not perform large refactors unless explicitly requested.
- Prefer the smallest safe code change.
- Preserve existing UI and working behavior unless asked to change it.
- Do not redesign unrelated features.
- Do not invent database fields or tables.
- Do not expose Supabase service role keys.
- Do not use fake/test prices as production data.
- Marketplace pricing must come from authorized sources.
- Location-specific offers must respect the selected city.
- Stale pricing should not be presented as current.

## Current Marketplace Focus
Trades Hub has a Deal Scanner that:
- organizes products by trade
- compares retailer offers
- supports city/location filtering
- shows price, stock, pickup and online availability
- sends the customer directly to the retailer
- does not process the transaction

## Current Main Goal
Finish V0 with real authorized supplier data and reliable core workflows.

## AI Working Rule
When helping with code:
- identify the exact file first
- make the smallest safe change
- avoid unrelated cleanup
- explain exactly what changed
- preserve existing functionality