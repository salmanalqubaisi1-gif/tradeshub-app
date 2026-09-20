# Trades Hub Architecture

## App
- React Native / Expo
- TypeScript
- Supabase backend
- GitHub for version history
- VS Code for development

## Main User Roles
- Tradesperson / Apprentice
- Contractor
- Supplier
- Homeowner

## Current Priority Order
1. Tradesperson / Apprentice
2. Contractor
3. Supplier
4. Homeowner

## Marketplace Structure

### Products
Table:
marketplace_products

Purpose:
Stores one normalized master product.

Important identifiers:
- brand
- name
- model_number
- normalized_model_number
- UPC / GTIN when available
- manufacturer SKU
- category
- subcategory

### Product Trade Mapping
Table:
marketplace_product_trades

Purpose:
Maps products to one or more trades.

Relevance types:
- general
- trade_specific
- specialty

### Retailers
Table:
marketplace_retailers

Purpose:
Stores retailer/company information.

### Retailer Locations
Table:
marketplace_retailer_locations

Purpose:
Stores individual physical store locations.

Important fields:
- retailer_id
- store_name
- store_number
- address
- city
- province
- postal code
- pickup / delivery support
- active status

### Retailer Offers
Table:
marketplace_retailer_offers

Purpose:
Stores a retailer's current offer for a product.

Important fields:
- product_id
- retailer_id
- retailer_location_id
- price
- regular_price
- product_url
- retailer_sku
- in_stock
- online_available
- pickup_available
- sale
- clearance
- city
- province
- source_type
- last_checked_at
- observed_at
- expires_at
- verification_status
- source_config_id
- ingestion_run_id
- is_test

## Deal Scanner Rules

### Location
If Edmonton is selected:
- show Edmonton physical-store offers
- show offers available for pickup in Edmonton
- show online offers available to Edmonton
- do not show Calgary-only in-store offers

### Price
- display retailer advertised pre-tax price
- Alberta GST estimate may be shown separately
- cheapest valid current offer can be labeled Best Available Price

### Freshness
- stale offers must not be treated as current
- expired offers should be hidden or clearly marked stale
- test offers must never appear to customers

## Import Pipeline

Retailer data can come from:
- approved CSV
- retailer spreadsheet
- authorized product feed
- approved affiliate source
- approved API
- direct supplier data

Flow:

source
→ ingestion run
→ staging
→ validation
→ authorization check
→ live retailer offer
→ Deal Scanner

## Authorization

Table:
marketplace_retailer_source_configs

Statuses:
- unverified
- approved
- restricted
- revoked

Production price data should require:
- approved source
- price ingestion allowed
- public display allowed

## Important Development Rules
- No giant home.tsx refactor during V0.
- Prefer controlled component-level changes.
- Test before moving to the next feature.
- Commit working checkpoints frequently.