import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitterService } from '../utils/event-emitter.service';
import { PerformanceMonitor } from '../utils/performance-monitor';
// csv-parser removed - using custom parser
import * as fs from 'fs';
import { Readable } from 'stream';
// Custom secure parsers - no external dependencies
const parseCSV = (csvText: string): { headers: string[], data: any[] } => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], data: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  
  return { headers, data };
};


const SIMILARITY_THRESHOLD = 0.4; // tune after testing

export interface UniversalProductData {
  product_id?: string;
  brand_name: string;
  manufacturer?: string;
  price_inr?: string;
  is_discontinued?: string;
  dosage_form?: string;
  pack_unit?: string;
  num_active_ingredients?: string;
  primary_ingredient?: string;
  primary_strength?: string;
  active_ingredients?: string;
  therapeutic_class?: string;
  packaging_raw?: string;
  manufacturer_raw?: string;
}

export interface InventoryRow {
  product_name: string;
  manufacturer: string;
  mrp?: number;
  batch?: string;
  expiry?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService
  ) { }

  /* Convert string ID to integer for distributors array */
  private stringToInt(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /* Extract numbers from product name */
  private extractNumbers(productName: string): number[] {
    const numbers = productName.match(/\d+/g);
    return numbers ? numbers.map(num => parseInt(num, 10)) : [];
  }

  /* Check if two product names have compatible numbers */
  private areNumbersCompatible(name1: string, name2: string): boolean {
    const numbers1 = this.extractNumbers(name1);
    const numbers2 = this.extractNumbers(name2);

    // If neither has numbers, they're compatible
    if (numbers1.length === 0 && numbers2.length === 0) {
      return true;
    }

    // If one has numbers and the other doesn't, they're compatible
    // (e.g., "dolo" matches "dolo 650")
    if (numbers1.length === 0 || numbers2.length === 0) {
      return true;
    }

    // If both have numbers, they must match exactly
    // (e.g., "dolo 500" should NOT match "dolo 650")
    if (numbers1.length !== numbers2.length) {
      return false;
    }

    // Check if all numbers match
    for (let i = 0; i < numbers1.length; i++) {
      if (numbers1[i] !== numbers2[i]) {
        return false;
      }
    }

    return true;
  }

  async findAll(searchQuery: string) {
    const searchTerm = searchQuery.toLowerCase().trim();
    
    if (!searchTerm) {
      return [];
    }
  }

  async findAvailableProducts(searchQuery: string) {
    const searchTerm = searchQuery.toLowerCase().trim();

    if (!searchTerm) {
      return [];
    }

    // Optimized search with better performance and smarter prioritization
    const results = await this.prisma.$queryRaw<
      {
        id: number;
        product_name: string;
        manufacturer: string;
        mrp: number;
        distributors: number[];
        similarity: number;
        search_rank: number;
      }[]
    >`
WITH search_results AS (
  -- Tier 1: Exact product name matches (highest priority)
  SELECT id, product_name, manufacturer, mrp, distributors,
         similarity(lower(product_name), ${searchTerm}) AS similarity,
         1 as search_rank
  FROM "Product"
  WHERE lower(product_name) = ${searchTerm}

  UNION ALL

  -- Tier 2: Product name starts with search term
  SELECT id, product_name, manufacturer, mrp, distributors,
         similarity(lower(product_name), ${searchTerm}) AS similarity,
         2 as search_rank
  FROM "Product"
  WHERE lower(product_name) LIKE ${searchTerm + '%'}
    AND similarity(lower(product_name), ${searchTerm}) > 0.4

  UNION ALL

  -- Tier 3: Product name contains search term
  SELECT id, product_name, manufacturer, mrp, distributors,
         similarity(lower(product_name), ${searchTerm}) AS similarity,
         3 as search_rank
  FROM "Product"
  WHERE lower(product_name) LIKE ${'%' + searchTerm + '%'}
    AND similarity(lower(product_name), ${searchTerm}) > 0.3

  UNION ALL

  -- Tier 4: Manufacturer exact matches
  SELECT id, product_name, manufacturer, mrp, distributors,
         similarity(lower(manufacturer), ${searchTerm}) AS similarity,
         4 as search_rank
  FROM "Product"
  WHERE lower(manufacturer) = ${searchTerm}

  UNION ALL

  -- Tier 5: Manufacturer starts with search term
  SELECT id, product_name, manufacturer, mrp, distributors,
         similarity(lower(manufacturer), ${searchTerm}) AS similarity,
         5 as search_rank
  FROM "Product"
  WHERE lower(manufacturer) LIKE ${searchTerm + '%'}
    AND similarity(lower(manufacturer), ${searchTerm}) > 0.4

  UNION ALL

  -- Tier 6: Manufacturer contains search term
  SELECT id, product_name, manufacturer, mrp, distributors,
         similarity(lower(manufacturer), ${searchTerm}) AS similarity,
         6 as search_rank
  FROM "Product"
  WHERE lower(manufacturer) LIKE ${'%' + searchTerm + '%'}
    AND similarity(lower(manufacturer), ${searchTerm}) > 0.3

  UNION ALL

  -- Tier 7: Fuzzy product name matches (only if we have few results)
  SELECT id, product_name, manufacturer, mrp, distributors,
         similarity(lower(product_name), ${searchTerm}) AS similarity,
         7 as search_rank
  FROM "Product"
  WHERE similarity(lower(product_name), ${searchTerm}) > 0.2
),
ranked_results AS (
  SELECT DISTINCT ON (id) *
  FROM search_results
  ORDER BY id, search_rank ASC, similarity DESC
),
product_side AS (
  SELECT id, product_name, manufacturer, mrp, distributors, similarity, search_rank,
         CASE WHEN array_length(distributors, 1) > 0 THEN 0 ELSE 1 END as has_inventory
  FROM ranked_results
  ORDER BY search_rank ASC, has_inventory ASC, similarity DESC
  LIMIT 25
),
unidentified AS (
  SELECT
    -- negative synthetic id based on hash of name, cast to int to avoid BigInt in JSON
    (-abs(hashtextextended(raw_product_name, 0))::int) AS id,
    raw_product_name AS product_name,
    COALESCE(NULLIF(MAX(raw_manufacturer), ''), 'Unknown') AS manufacturer,
    NULL::float AS mrp,
    ARRAY(SELECT DISTINCT d FROM unnest(array_agg(distributor_id)) AS d) AS distributors,
    similarity(lower(raw_product_name), ${searchTerm}) AS similarity,
    9 as search_rank,
    1 as has_inventory
  FROM "UnidentifiedP"
  WHERE similarity(lower(raw_product_name), ${searchTerm}) > 0.3
  GROUP BY raw_product_name
  ORDER BY similarity DESC
  LIMIT 10
)
SELECT * FROM (
  SELECT * FROM product_side
  UNION ALL
  SELECT * FROM unidentified
) combined
ORDER BY search_rank ASC, similarity DESC
LIMIT 20;
`;

    // If we have good results, return them
    if (results.length > 0) {
      return results;
    }

    // Fallback: Return some products if no matches found
    const fallbackResults = await this.prisma.$queryRaw<
      {
        id: number;
        product_name: string;
        manufacturer: string;
        mrp: number;
        distributors: number[];
        similarity: number;
        search_rank: number;
      }[]
    >`
SELECT id, product_name, manufacturer, mrp, distributors,
       0.1 as similarity,
       8 as search_rank
FROM "Product"
ORDER BY
  CASE WHEN array_length(distributors, 1) > 0 THEN 0 ELSE 1 END,
  product_name ASC
LIMIT 10;
`;

    return fallbackResults;
  }

  /* Reset distributor references before new upload */
  async resetDistributor(tx: any, distributorId: string) {
    // Convert string ID to a hash-based integer for the distributors array
    const distributorHash = this.stringToInt(distributorId);
    await tx.$executeRaw`
      UPDATE "Product"
      SET distributors = array_remove(distributors, ${distributorHash})
      WHERE ${distributorHash} = ANY(distributors);
    `;
  }

  /* Enhanced product matching without manufacturer requirement */
  async findBestProduct(tx: any, name: string, manufacturer: string): Promise<number | null> {
    const nameLc = name.trim().toLowerCase();

    // Single global search by product name similarity; manufacturer is optional and not required
    const globalCandidates = await tx.$queryRaw<
      { id: number; product_name: string; similarity: number }[]
    >`
      SELECT id, product_name,
             similarity(lower(product_name), ${nameLc}) AS similarity
      FROM "Product"
      WHERE similarity(lower(product_name), ${nameLc}) > ${SIMILARITY_THRESHOLD}
      ORDER BY similarity DESC
      LIMIT 25;
    `;

    for (const candidate of globalCandidates) {
      if (this.areNumbersCompatible(nameLc, candidate.product_name.toLowerCase())) {
        return candidate.id;
      }
    }

    return null;
  }

  /* 🚀 OPTIMIZED: Batch product matching for multiple products at once */
  async findBestProductsBatch(tx: any, products: { name: string; manufacturer?: string }[]): Promise<Map<string, number | null>> {
    const results = new Map<string, number | null>();

    // Process in parallel batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    const batches: { name: string; manufacturer?: string }[][] = [];

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      batches.push(products.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (product) => {
        const productId = await this.findBestProduct(tx, product.name, product.manufacturer || '');
        return { key: `${product.name}|${product.manufacturer || ''}`, productId };
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ key, productId }) => {
        results.set(key, productId);
      });
    }

    return results;
  }

  // Helper function to normalize column names (shared between CSV and XLSX)
  private normalizeColumnName(name: string): string {
    if (!name || typeof name !== 'string') return '';
    return name.toLowerCase()
      .replace(/[_\s-]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Helper function to find mapped column (shared between CSV and XLSX)
  private findMappedColumn(targetColumn: string, availableHeaders: string[]): string | null {
    const validHeaders = availableHeaders.filter(header => header && typeof header === 'string');
    const normalizedTarget = this.normalizeColumnName(targetColumn);
    
    // First try exact match
    if (validHeaders.includes(targetColumn)) {
      return targetColumn;
    }
    
    // Then try normalized match
    for (const header of validHeaders) {
      if (this.normalizeColumnName(header) === normalizedTarget) {
        return header;
      }
    }
    
    // For product_name, also check common variations
    if (targetColumn === 'product_name') {
      const productNameVariations = [
        'product name', 'product', 'medicine name', 
        'product-name', 'product_name', 'medicine_name',
        'productname', 'medicinename'
      ];
      
      for (const variation of productNameVariations) {
        if (validHeaders.includes(variation)) {
          return variation;
        }
        // Also check normalized versions
        for (const header of validHeaders) {
          if (this.normalizeColumnName(header) === this.normalizeColumnName(variation)) {
            return header;
          }
        }
      }
    }
    
    // For manufacturer, also check common variations
    if (targetColumn === 'manufacturer') {
      const manufacturerVariations = [
        'manufacturer', 'company', 'company name',
        'manufacturer_name', 'company_name',
        'manufacturer-name', 'company-name',
        'manufacturername', 'companyname', 'brandname',
        'mfg', 'mfg name', 'mfg-name'
      ];
      
      for (const variation of manufacturerVariations) {
        if (validHeaders.includes(variation)) {
          return variation;
        }
        // Also check normalized versions
        for (const header of validHeaders) {
          if (this.normalizeColumnName(header) === this.normalizeColumnName(variation)) {
            return header;
          }
        }
      }
    }
    
    return null;
  }

  // Helper method to analyze CSV headers and provide mapping feedback
  private analyzeColumnMapping(headers: string[]): {
    productNameColumn: string | null;
    manufacturerColumn: string | null;
    availableColumns: string[];
    mappingSummary: string;
  } {
    const productNameColumn = this.findMappedColumn('product_name', headers);
    const manufacturerColumn = this.findMappedColumn('manufacturer', headers);
    
    let mappingSummary = 'Column Mapping Analysis:\n';
    mappingSummary += `📋 Available columns: ${headers.join(', ')}\n`;
    mappingSummary += `✅ Product name column: ${productNameColumn || 'NOT FOUND'}\n`;
    mappingSummary += `✅ Manufacturer column: ${manufacturerColumn || 'NOT FOUND'}\n`;

    
    return {
      productNameColumn,
      manufacturerColumn,
      availableColumns: headers,
      mappingSummary
    };
  }

  // Helper function to process row data with flexible column mapping
  private processRowData(rowObject: { [key: string]: any }, headers: string[]): InventoryRow | null {
    const productNameColumn = this.findMappedColumn('product_name', headers);
    const manufacturerColumn = this.findMappedColumn('manufacturer', headers);
    const mrpColumn = this.findMappedColumn('mrp', headers);
    const batchColumn = this.findMappedColumn('batch', headers);
    const expiryColumn = this.findMappedColumn('expiry', headers);
    
    // Only process rows that have a product name column
    if (productNameColumn && rowObject[productNameColumn]) {
      return {
        product_name: rowObject[productNameColumn],
        manufacturer: manufacturerColumn ? (rowObject[manufacturerColumn] || '') : '',
        mrp: mrpColumn && rowObject[mrpColumn] ? parseFloat(rowObject[mrpColumn]) : undefined,
        batch: batchColumn ? rowObject[batchColumn] : undefined,
        expiry: expiryColumn ? rowObject[expiryColumn] : undefined,
      };
    }
    return null;
  }

  /* 🚀 OPTIMIZED: Main upload handler using set-based staging - CSV only */
  async uploadInventory(
    fileBuffer: Buffer,
    distributorId: string
  ) {
    const rows: InventoryRow[] = [];

    try {
      // Parse CSV file
      const csvText = fileBuffer.toString('utf-8');
      const { headers, data } = parseCSV(csvText);
      
      if (headers.length === 0) {
        throw new Error('No headers found in CSV file');
      }
      
      // Analyze column mapping and provide feedback
      const columnAnalysis = this.analyzeColumnMapping(headers);
      console.log(columnAnalysis.mappingSummary);
      
      // Process data
      const processedRows = data
        .filter((row: any) => row && Object.keys(row).length > 0)
        .map((row: any) => this.processRowData(row, headers))
        .filter(Boolean);
      
      rows.push(...(processedRows as InventoryRow[]));
      
      // Process the parsed rows
      const result = await this.processInventoryStaged(rows, distributorId);
      
      // Add column mapping info to the result
      return {
        ...result,
        columnMapping: {
          productNameColumn: columnAnalysis.productNameColumn,
          manufacturerColumn: columnAnalysis.manufacturerColumn,
          availableColumns: columnAnalysis.availableColumns
        }
      };
    } catch (error) {
      this.eventEmitter.emitUploadError(distributorId, (error as Error).message);
      throw error;
    }
  }

  /* 🚀 OPTIMIZED: Set-based processing with TEMP TABLE and SQL joins */
  private async processInventoryStaged(rows: InventoryRow[], distributorId: string) {
    PerformanceMonitor.startTimer(`Inventory Upload - ${distributorId}`);
    PerformanceMonitor.logMemoryUsage();

    const distributorHash = this.stringToInt(distributorId);
    const totalRows = rows.length;

    // Preflight: perform schema/index setup OUTSIDE the transaction to avoid timeouts
    await this.prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await this.prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Product' AND column_name = 'normalized_name'
        ) THEN
          ALTER TABLE "Product" ADD COLUMN normalized_name TEXT;
        END IF;
      END$$;
    `);
    await this.prisma.$executeRawUnsafe(`
      UPDATE "Product"
      SET normalized_name = regexp_replace(lower(product_name), '[^a-z0-9]+', ' ', 'g')
      WHERE normalized_name IS NULL;
    `);
    await this.prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE tablename = 'Product' AND indexname = 'product_normalized_name_btree'
        ) THEN
          CREATE INDEX product_normalized_name_btree ON "Product"(normalized_name);
        END IF;
      END$$;
    `);
    await this.prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE tablename = 'Product' AND indexname = 'product_normalized_name_trgm'
        ) THEN
          CREATE INDEX product_normalized_name_trgm ON "Product" USING gin (normalized_name gin_trgm_ops);
        END IF;
      END$$;
    `);
    // Ensure UnidentifiedP table exists and migrate from legacy NotFound name
    await this.prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF to_regclass('"UnidentifiedP"') IS NULL THEN
          CREATE TABLE "UnidentifiedP" (
            id SERIAL PRIMARY KEY,
            uploaded_at TIMESTAMP DEFAULT now(),
            distributor_id INT,
            raw_product_name TEXT,
            raw_manufacturer TEXT
          );
          CREATE INDEX IF NOT EXISTS unidentifiedp_distributor_idx ON "UnidentifiedP"(distributor_id);
          CREATE INDEX IF NOT EXISTS unidentifiedp_uploaded_idx ON "UnidentifiedP"(uploaded_at);
        END IF;
        IF to_regclass('"NotFound"') IS NOT NULL AND to_regclass('"UnidentifiedP"') IS NOT NULL THEN
          INSERT INTO "UnidentifiedP" (uploaded_at, distributor_id, raw_product_name, raw_manufacturer)
          SELECT uploaded_at, distributor_id, raw_product_name, raw_manufacturer FROM "NotFound"
          ON CONFLICT DO NOTHING;
          DROP TABLE IF EXISTS "NotFound";
        END IF;
      END$$;
    `);

    const result = await this.prisma.$transaction(async (tx) => {
      // Transaction body focuses on data processing only

      // 1) Create TEMP table for staging
      await tx.$executeRawUnsafe(`
        CREATE TEMP TABLE tmp_inventory (
          product_name TEXT,
          manufacturer TEXT,
          mrp DOUBLE PRECISION,
          batch TEXT,
          expiry TEXT,
          normalized_name TEXT,
          matched BOOLEAN DEFAULT FALSE
        ) ON COMMIT DROP;
      `);

      // 2) Bulk insert rows in optimized chunks
      const CHUNK = 2000; // Increased chunk size for better performance
      const totalChunks = Math.ceil(rows.length / CHUNK);
      
      for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        if (slice.length === 0) continue;

        const valuesSqlParts: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        slice.forEach((r) => {
          valuesSqlParts.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
          params.push(
            r.product_name || null,
            r.manufacturer || null,
            r.mrp ?? null,
            r.batch || null,
            r.expiry || null,
          );
        });

        const insertSQL = `INSERT INTO tmp_inventory (product_name, manufacturer, mrp, batch, expiry) VALUES ${valuesSqlParts.join(',')};`;
        await tx.$executeRawUnsafe(insertSQL, ...params);
        
        // Emit progress for large uploads
        if (totalChunks > 5) {
          const progress = Math.round(((i + slice.length) / rows.length) * 100);
          this.eventEmitter.emitUploadProgress({
            distributorId,
            totalRows: rows.length,
            processedRows: i + slice.length,
            matchedCount: 0,
            notFoundCount: 0,
            percentage: progress,
            status: 'processing',
            message: `Inserting data: ${progress}%`
          });
        }
      }

      // 3) Compute normalized_name in staging (lowercase, collapse non-alphanum to space)
      await tx.$executeRawUnsafe(`
        UPDATE tmp_inventory
        SET normalized_name = regexp_replace(lower(product_name), '[^a-z0-9]+', ' ', 'g');
      `);

      // 4) Exact normalized match: update distributors and MRP, and mark matched
      this.eventEmitter.emitUploadProgress({
        distributorId,
        totalRows: rows.length,
        processedRows: rows.length,
        matchedCount: 0,
        notFoundCount: 0,
        percentage: 25,
        status: 'processing',
        message: 'Performing exact matches...'
      });
      
      await tx.$executeRawUnsafe(`
        WITH matched_rows AS (
          SELECT p.id AS product_id, t.normalized_name, MAX(t.mrp) AS max_mrp,
                 (SELECT t2.manufacturer 
                  FROM tmp_inventory t2 
                  WHERE t2.normalized_name = t.normalized_name 
                    AND t2.manufacturer IS NOT NULL 
                    AND t2.manufacturer != ''
                  GROUP BY t2.manufacturer 
                  ORDER BY COUNT(*) DESC 
                  LIMIT 1) AS most_common_manufacturer
          FROM tmp_inventory t
          JOIN "Product" p
            ON p.normalized_name = t.normalized_name
          GROUP BY p.id, t.normalized_name
        )
        UPDATE "Product" p
        SET distributors = CASE WHEN NOT (${distributorHash} = ANY(distributors)) THEN array_append(distributors, ${distributorHash}) ELSE distributors END,
            mrp = CASE WHEN m.max_mrp IS NOT NULL AND (p.mrp IS NULL OR p.mrp < m.max_mrp) THEN m.max_mrp ELSE p.mrp END,
            manufacturer = CASE WHEN m.most_common_manufacturer IS NOT NULL AND m.most_common_manufacturer != '' AND (p.manufacturer IS NULL OR p.manufacturer = 'Unknown') THEN m.most_common_manufacturer ELSE p.manufacturer END
        FROM matched_rows m
        WHERE p.id = m.product_id;
      `);

      await tx.$executeRawUnsafe(`
        UPDATE tmp_inventory t
        SET matched = TRUE
        WHERE EXISTS (
          SELECT 1
          FROM "Product" p
          WHERE p.normalized_name = t.normalized_name
        );
      `);

      // 5) Fuzzy match via pg_trgm for remaining
      this.eventEmitter.emitUploadProgress({
        distributorId,
        totalRows: rows.length,
        processedRows: rows.length,
        matchedCount: 0,
        notFoundCount: 0,
        percentage: 50,
        status: 'processing',
        message: 'Performing fuzzy matches...'
      });
      
      await tx.$executeRawUnsafe(`
        WITH candidates AS (
          SELECT p.id AS product_id,
                 t.normalized_name,
                 MAX(t.mrp) AS max_mrp,
                 similarity(p.normalized_name, t.normalized_name) AS sim,
                 (SELECT t2.manufacturer 
                  FROM tmp_inventory t2 
                  WHERE t2.normalized_name = t.normalized_name 
                    AND t2.manufacturer IS NOT NULL 
                    AND t2.manufacturer != ''
                  GROUP BY t2.manufacturer 
                  ORDER BY COUNT(*) DESC 
                  LIMIT 1) AS most_common_manufacturer
          FROM tmp_inventory t
          JOIN "Product" p
            ON left(p.normalized_name, 5) = left(t.normalized_name, 5)
           AND similarity(p.normalized_name, t.normalized_name) > ${Math.max(SIMILARITY_THRESHOLD, 0.45)}
          WHERE t.matched = FALSE
          GROUP BY p.id, t.normalized_name, sim
        ), best AS (
          SELECT DISTINCT ON (normalized_name) product_id, normalized_name, max_mrp, most_common_manufacturer
          FROM candidates
          ORDER BY normalized_name, sim DESC
        )
        UPDATE "Product" p
        SET distributors = CASE WHEN NOT (${distributorHash} = ANY(distributors)) THEN array_append(distributors, ${distributorHash}) ELSE distributors END,
            mrp = CASE WHEN b.max_mrp IS NOT NULL AND (p.mrp IS NULL OR p.mrp < b.max_mrp) THEN b.max_mrp ELSE p.mrp END,
            manufacturer = CASE WHEN b.most_common_manufacturer IS NOT NULL AND b.most_common_manufacturer != '' AND (p.manufacturer IS NULL OR p.manufacturer = 'Unknown') THEN b.most_common_manufacturer ELSE p.manufacturer END
        FROM best b
        WHERE p.id = b.product_id;
      `);

      await tx.$executeRawUnsafe(`
        UPDATE tmp_inventory t
        SET matched = TRUE
        WHERE t.matched = FALSE AND EXISTS (
          SELECT 1 FROM "Product" p
          WHERE left(p.normalized_name, 5) = left(t.normalized_name, 5)
            AND similarity(p.normalized_name, t.normalized_name) > ${Math.max(SIMILARITY_THRESHOLD, 0.45)}
        );
      `);

      // 6) Replace prior UnidentifiedP rows for this distributor, then insert current unmatched
      this.eventEmitter.emitUploadProgress({
        distributorId,
        totalRows: rows.length,
        processedRows: rows.length,
        matchedCount: 0,
        notFoundCount: 0,
        percentage: 75,
        status: 'processing',
        message: 'Finalizing upload...'
      });
      
      await tx.$executeRawUnsafe(`
        DELETE FROM "UnidentifiedP" WHERE distributor_id = $1
      `, distributorHash);

      // Insert current unmatched rows
      await tx.$executeRawUnsafe(`
        INSERT INTO "UnidentifiedP" (distributor_id, raw_product_name, raw_manufacturer)
        SELECT ${distributorHash} AS distributor_id, COALESCE(product_name, '') AS raw_product_name, COALESCE(manufacturer, '') AS raw_manufacturer
        FROM tmp_inventory t
        WHERE t.matched = FALSE;
      `);

      // 7) Promote common UnidentifiedP names (shared by multiple distributors) to Product
      await tx.$executeRawUnsafe(`
        WITH groups AS (
          SELECT raw_product_name AS name,
                 ARRAY(SELECT DISTINCT d FROM unnest(array_agg(distributor_id)) AS d) AS dist_array,
                 COUNT(DISTINCT distributor_id) AS dist_count,
                 -- Get the most common manufacturer for this product name
                 (SELECT raw_manufacturer 
                  FROM "UnidentifiedP" u2 
                  WHERE u2.raw_product_name = u.raw_product_name 
                    AND u2.raw_manufacturer IS NOT NULL 
                    AND u2.raw_manufacturer != ''
                  GROUP BY raw_manufacturer 
                  ORDER BY COUNT(*) DESC 
                  LIMIT 1) AS most_common_manufacturer,
                 -- Get the highest MRP for this product name
                 (SELECT MAX(t.mrp) 
                  FROM tmp_inventory t 
                  WHERE t.product_name = u.raw_product_name 
                    AND t.mrp IS NOT NULL) AS max_mrp
          FROM "UnidentifiedP" u
          GROUP BY raw_product_name
          HAVING COUNT(DISTINCT distributor_id) > 1
        ),
        inserted AS (
          INSERT INTO "Product" (product_name, manufacturer, mrp, distributors, normalized_name)
          SELECT g.name,
                 COALESCE(g.most_common_manufacturer, 'Unknown') AS manufacturer,
                 g.max_mrp AS mrp,
                 g.dist_array AS distributors,
                 regexp_replace(lower(g.name), '[^a-z0-9]+', ' ', 'g') AS normalized_name
          FROM groups g
          WHERE NOT EXISTS (
            SELECT 1 FROM "Product" p
            WHERE p.normalized_name = regexp_replace(lower(g.name), '[^a-z0-9]+', ' ', 'g')
          )
          RETURNING normalized_name
        ),
        updated AS (
          UPDATE "Product" p
          SET distributors = (
            SELECT ARRAY(SELECT DISTINCT x FROM unnest(
              COALESCE(p.distributors, ARRAY[]::int[]) || g.dist_array
            ) AS x)
          )
          FROM groups g
          WHERE p.normalized_name = regexp_replace(lower(g.name), '[^a-z0-9]+', ' ', 'g')
          RETURNING p.id
        )
        DELETE FROM "UnidentifiedP"
        WHERE raw_product_name IN (SELECT name FROM groups);
      `);

      // 7) Aggregate results
      const counts = await tx.$queryRawUnsafe(`
        SELECT
          COUNT(*) FILTER (WHERE matched = TRUE)::int AS matched,
          COUNT(*) FILTER (WHERE matched = FALSE)::int AS not_found
        FROM tmp_inventory;
      `);

      const result = counts as { matched: number; not_found: number }[];
      return {
        matchedCount: result[0]?.matched || 0,
        notFoundCount: result[0]?.not_found || 0,
      };
    });

    const totalDuration = PerformanceMonitor.endTimer(`Inventory Upload - ${distributorId}`);
    PerformanceMonitor.logMemoryUsage();

    this.eventEmitter.emitUploadComplete({
      distributorId,
      totalRows,
      processedRows: totalRows,
      matchedCount: result.matchedCount,
      notFoundCount: result.notFoundCount,
      percentage: 100,
      status: 'completed',
      message: `Successfully processed ${totalRows} inventory items in ${totalDuration}ms`
    });

    return {
      message: `Successfully processed ${totalRows} inventory items`,
      totalProcessed: totalRows,
      matchedCount: result.matchedCount,
      notFoundCount: result.notFoundCount,
      processingTimeMs: totalDuration,
    };
  }

  /* Get NotFound entries for a distributor */
  async getNotFoundEntries(distributorId: string) {
    const distributorHash = this.stringToInt(distributorId);
    return this.prisma.$queryRawUnsafe(
      `SELECT id, uploaded_at, distributor_id, raw_product_name, raw_manufacturer
       FROM "UnidentifiedP"
       WHERE distributor_id = $1
       ORDER BY uploaded_at DESC`,
      distributorHash,
    );
  }

  /* Clear NotFound entries for a distributor */
  async clearNotFoundEntries(distributorId: string) {
    const distributorHash = this.stringToInt(distributorId);
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM "UnidentifiedP" WHERE distributor_id = $1`,
      distributorHash,
    );
    return { count: 0 };
  }

  /* Get inventory counts for a distributor */
  async getInventoryCounts(distributorId: string) {
    const distributorHash = this.stringToInt(distributorId);
    
    // Count identified products from Product table
    const identifiedCount = await this.prisma.product.count({
      where: { 
        distributors: { has: distributorHash } 
      },
    });

    // Count unidentified products from UnidentifiedP table
    const unidentifiedCount = await this.prisma.unidentifiedP.count({
      where: {
        distributor_id: distributorHash,
      },
    });

    return {
      identified: identifiedCount,
      unidentified: unidentifiedCount,
      total: identifiedCount + unidentifiedCount,
    };
  }

  /* Get inventory products for a distributor */
  async getInventoryProducts(distributorId: string, page: number = 0, limit: number = 20) {
    const distributorHash = this.stringToInt(distributorId);
    const offset = page * limit;
    
    // Fetch from Product table
    const products = await this.prisma.product.findMany({
      where: { 
        distributors: { has: distributorHash } 
      },
      select: {
        id: true,
        product_name: true,
        manufacturer: true,
        mrp: true,
      },
      orderBy: { product_name: 'asc' },
    });

    // Fetch from UnidentifiedP table
    const unidentifiedProducts = await this.prisma.$queryRaw`
      SELECT 
        id,
        raw_product_name as product_name,
        raw_manufacturer as manufacturer,
        NULL as mrp,
        NULL as batch,
        NULL as expiry
      FROM "UnidentifiedP" 
      WHERE distributor_id = ${distributorHash}
      ORDER BY raw_product_name ASC
    `;

    // Combine and format both results
    const allProducts = [
      ...products.map(p => ({
        id: p.id,
        product_name: p.product_name,
        manufacturer: p.manufacturer,
        mrp: p.mrp,
        batch: null,
        expiry: null,
      })),
      ...(unidentifiedProducts as any[]).map(p => ({
        id: p.id,
        product_name: p.product_name,
        manufacturer: p.manufacturer,
        mrp: p.mrp,
        batch: p.batch,
        expiry: p.expiry,
      }))
    ];

    // Sort combined results
    allProducts.sort((a, b) => a.product_name.localeCompare(b.product_name));

    // Apply pagination
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    return paginatedProducts;
  }

  /* 🚀 OPTIMIZED: Clear all inventory for a distributor using bulk operations */
  async clearInventory(distributorId: string, deleteActiveBids: boolean = false) {
    const distributorHash = this.stringToInt(distributorId);
    
    PerformanceMonitor.startTimer(`Clear Inventory - ${distributorId}`);
    
    try {
      // Use a single transaction for all operations
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Bulk remove distributor from all products using SQL array operations
        const updatedProducts = await tx.$executeRawUnsafe(`
          UPDATE "Product" 
          SET distributors = array_remove(distributors, $1)
          WHERE $1 = ANY(distributors)
        `, distributorHash);

        // 2. Clear unidentified products and get count
        const deletedUnidentifiedProducts = await tx.$executeRawUnsafe(
          `DELETE FROM "UnidentifiedP" WHERE distributor_id = $1`,
          distributorHash,
        );

        // 3. Delete active bids if requested
        let deletedBidsCount = 0;
        if (deleteActiveBids) {
          const deletedBids = await tx.bid.deleteMany({
            where: {
              wholesalerId: distributorId,
              status: 'PENDING'
            }
          });
          deletedBidsCount = deletedBids.count;
        }

        // Total products removed = identified products + unidentified products
        const totalProductsRemoved = (updatedProducts as number) + (deletedUnidentifiedProducts as number);

        return {
          message: 'Inventory cleared successfully',
          deletedProducts: totalProductsRemoved,
          deletedBids: deletedBidsCount
        };
      });

      PerformanceMonitor.endTimer(`Clear Inventory - ${distributorId}`);
      return result;
    } catch (error) {
      PerformanceMonitor.endTimer(`Clear Inventory - ${distributorId}`);
      throw error;
    }
  }

  /* 🚀 OPTIMIZED: Clear individual products for a distributor */
  async clearIndividualProducts(distributorId: string, productIds: number[]) {
    const distributorHash = this.stringToInt(distributorId);
    
    PerformanceMonitor.startTimer(`Clear Individual Products - ${distributorId}`);
    
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Bulk remove distributor from specific products
        const updatedProducts = await tx.$executeRawUnsafe(`
          UPDATE "Product" 
          SET distributors = array_remove(distributors, $1)
          WHERE id = ANY($2) AND $1 = ANY(distributors)
        `, distributorHash, productIds);

        return {
          message: 'Products cleared successfully',
          deletedProducts: updatedProducts
        };
      });

      PerformanceMonitor.endTimer(`Clear Individual Products - ${distributorId}`);
      return result;
    } catch (error) {
      PerformanceMonitor.endTimer(`Clear Individual Products - ${distributorId}`);
      throw error;
    }
  }

  /* 🚀 OPTIMIZED: Batch update product information */
  async batchUpdateProducts(updates: Array<{
    productId: number;
    mrp?: number;
    batch?: string;
    expiry?: string;
  }>) {
    PerformanceMonitor.startTimer(`Batch Update Products - ${updates.length} items`);
    
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const updatePromises = updates.map(update => 
          tx.product.update({
            where: { id: update.productId },
            data: {
              ...(update.mrp !== undefined && { mrp: update.mrp }),
              ...(update.batch !== undefined && { batch: update.batch }),
              ...(update.expiry !== undefined && { expiry: update.expiry }),
            }
          })
        );

        await Promise.all(updatePromises);
        return {
          message: 'Products updated successfully',
          updatedCount: updates.length
        };
      });

      PerformanceMonitor.endTimer(`Batch Update Products - ${updates.length} items`);
      return result;
    } catch (error) {
      PerformanceMonitor.endTimer(`Batch Update Products - ${updates.length} items`);
      throw error;
    }
  }
}