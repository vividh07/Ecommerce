import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_CATALOG_PATH = path.resolve(__dirname, '../../../Data/products.json');

export function dataCatalogPath() {
  return DATA_CATALOG_PATH;
}

export function hasDataCatalog() {
  return fs.existsSync(DATA_CATALOG_PATH);
}

/** Load Data/products.json (repo root). Throws if missing. */
export function loadDataCatalog() {
  if (!fs.existsSync(DATA_CATALOG_PATH)) {
    throw new Error(`Data catalog not found at ${DATA_CATALOG_PATH}`);
  }
  const raw = fs.readFileSync(DATA_CATALOG_PATH, 'utf8');
  return JSON.parse(raw);
}

/**
 * Build email for a demo seller from its slug.
 * e.g. studio-supply → studio-supply@demo.shop
 */
export function sellerDemoEmail(slug) {
  return `${String(slug).trim().toLowerCase()}@demo.shop`;
}
