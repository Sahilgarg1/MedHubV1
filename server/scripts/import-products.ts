import { createReadStream } from 'fs';
import { resolve } from 'path';
import csv from 'csv-parser';
import { PrismaClient, Prisma } from '@prisma/client';

type CsvRow = {
	name?: string; // maps to product_name
	manufacturer_name?: string; // maps to manufacturer
	"price(₹)"?: string; // maps to mrp (optional)
};

function toNumberOrNull(value?: string): number | null {
	if (!value) return null;
	const cleaned = value.replace(/[^0-9.\-]/g, '');
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}

function normalize(value?: string): string | undefined {
	if (typeof value !== 'string') return undefined;
	const t = value.trim();
	return t.length ? t : undefined;
}

async function main() {
	const prisma = new PrismaClient();
	const inputRel = process.argv[2] || '../A_Z_medicines_dataset_of_India.csv';
	const inputPath = resolve(process.cwd(), inputRel);
	const batchSize = Number(process.env.IMPORT_BATCH_SIZE || 2000);

	console.log(`📄 Importing from: ${inputPath}`);

	// Deduplicate within this import by composite key product_name|manufacturer
	const seen = new Set<string>();

	let buffer: Prisma.ProductCreateManyInput[] = [];
	let total = 0;
	let inserted = 0;

	function flushBatch() {
		if (buffer.length === 0) return Promise.resolve();
		const data = buffer;
		buffer = [];
		return prisma.product.createMany({ data, skipDuplicates: false }).then((res) => {
			inserted += res.count;
		});
	}

    await new Promise<void>((resolvePromise, reject) => {
        const stream = createReadStream(inputPath);
        const pipeline = stream.pipe(csv());
        pipeline
            .on('data', (row: CsvRow) => {
				total++;
				const product_name = normalize(row.name);
				const manufacturer = normalize(row.manufacturer_name);
				if (!product_name || !manufacturer) return; // only required columns

				const mrpNum = toNumberOrNull(row['price(₹)']);
				const key = `${product_name}|${manufacturer}`.toLowerCase();
				if (seen.has(key)) return;
				seen.add(key);

				buffer.push({
					product_name,
					manufacturer,
					mrp: mrpNum === null ? undefined : mrpNum,
				});
				if (buffer.length >= batchSize) {
					// pause stream while we flush
                    stream.pause();
					flushBatch()
                        .then(() => stream.resume())
						.catch(reject);
				}
            })
            .on('end', () => resolvePromise())
            .on('error', reject);
	});

	await flushBatch();
	await prisma.$disconnect();
	console.log(`✅ Done. Rows read: ${total}, inserted: ${inserted}`);
}

main().catch((e) => {
	console.error('❌ Import failed:', e);
	process.exit(1);
});


