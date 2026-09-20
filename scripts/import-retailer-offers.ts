/// <reference types="node" />

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

type CsvRow = Record<string, string>;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(
      'CSV must contain a header row and at least one data row.'
    );
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = values[index] ?? '';
      return row;
    }, {});
  });
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;

  return ['true', '1', 'yes', 'y'].includes(
    value.trim().toLowerCase()
  );
}

function optionalNumber(value: string | undefined): number | null {
  const clean = value?.trim();

  if (!clean) return null;

  const number = Number(clean);

  if (!Number.isFinite(number)) {
    throw new Error(`Invalid number: ${value}`);
  }

  return number;
}

async function main() {
  const args = process.argv.slice(2);

  const csvPathArg = args[0];
  const retailerSlugArg = args[1];

  if (!csvPathArg) {
    throw new Error(
      'Usage: npx tsx scripts/import-retailer-offers.ts <csv-path> <retailer-slug>'
    );
  }

  if (!retailerSlugArg) {
    throw new Error('Missing retailer slug.');
  }

  const csvPath = path.resolve(csvPathArg);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const csvText = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsv(csvText);

  console.log(`Loaded ${rows.length} CSV row(s).`);

  const { data: retailer, error: retailerError } = await supabase
    .from('marketplace_retailers')
    .select('id, name, slug')
    .eq('slug', retailerSlugArg)
    .eq('is_active', true)
    .single();

  if (retailerError || !retailer) {
    throw retailerError || new Error('Retailer not found.');
  }

  console.log(`Retailer: ${retailer.name}`);

  const { data: run, error: runError } = await supabase
    .from('marketplace_retailer_ingestion_runs')
    .insert({
      retailer_id: retailer.id,
      status: 'running',
      notes: `CSV import for ${retailer.name}`,
    })
    .select('id')
    .single();

  if (runError || !run) {
    throw runError || new Error('Could not create ingestion run.');
  }

  console.log(`Ingestion run: ${run.id}`);

  const payload = rows.map((row) => ({
    normalized_model_number:
      row.normalized_model_number?.trim() || '',

    retailer_slug: retailerSlugArg,

    store_number:
      row.store_number?.trim() || null,

    price: optionalNumber(row.price),

    regular_price:
      optionalNumber(row.regular_price),

    product_url:
      row.product_url?.trim() || '',

    retailer_sku:
      row.retailer_sku?.trim() || null,

    in_stock:
      parseBoolean(row.in_stock),

    online_available:
      parseBoolean(row.online_available),

    pickup_available:
      parseBoolean(row.pickup_available),

    sale:
      parseBoolean(row.sale),

    clearance:
      parseBoolean(row.clearance),

    store_location:
      row.store_location?.trim() || null,

    city:
      row.city?.trim() || null,

    province:
      row.province?.trim() || 'Alberta',

    source_record_id:
      row.source_record_id?.trim() || null,

    observed_at:
      row.observed_at?.trim() ||
      new Date().toISOString(),

    expires_at:
      row.expires_at?.trim() || null,

    is_test:
      parseBoolean(row.is_test),
  }));

  const { data: stagedResult, error: stagedError } =
    await supabase.rpc(
      'stage_marketplace_retailer_offer_batch',
      {
        p_rows: payload,
        p_ingestion_run_id: run.id,
      }
    );

  if (stagedError) {
    throw stagedError;
  }

  console.log('Staging result:');
  console.table(stagedResult);

  const { data: validation, error: validationError } =
    await supabase.rpc(
      'validate_marketplace_retailer_offer_imports',
      {
        p_ingestion_run_id: run.id,
      }
    );

  if (validationError) {
    throw validationError;
  }

  console.log('Validation result:');
  console.table(validation);

  const invalidRows =
    validation?.filter(
      (row: any) => row.status !== 'valid'
    ) ?? [];

  if (invalidRows.length > 0) {
    console.error(
      `Import stopped: ${invalidRows.length} invalid row(s).`
    );

    process.exitCode = 1;
    return;
  }

  const { data: processed, error: processedError } =
    await supabase.rpc(
      'process_pending_marketplace_retailer_offer_imports',
      {
        p_limit: Math.max(payload.length, 100),
      }
    );

  if (processedError) {
    throw processedError;
  }

  console.log('Processed offers:');
  console.table(processed);

  const failedRows =
    processed?.filter(
      (row: any) => row.status !== 'processed'
    ) ?? [];

  if (failedRows.length > 0) {
    console.error(
      `${failedRows.length} offer(s) failed processing.`
    );
  }

  const { error: finalizeError } =
    await supabase.rpc(
      'finalize_marketplace_retailer_ingestion_run',
      {
        p_ingestion_run_id: run.id,
      }
    );

  if (finalizeError) {
    throw finalizeError;
  }

  const { data: finalRun, error: finalRunError } =
    await supabase
      .from('marketplace_retailer_ingestion_runs')
      .select(
        `
          id,
          status,
          records_received,
          records_processed,
          records_rejected,
          started_at,
          completed_at
        `
      )
      .eq('id', run.id)
      .single();

  if (finalRunError) {
    throw finalRunError;
  }

  console.log('Import complete.');
  console.table([finalRun]);
}

main().catch((error) => {
  console.error('');
  console.error('Retailer import failed:');
  console.error(error);

  process.exitCode = 1;
});