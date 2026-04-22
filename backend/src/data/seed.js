import fs from 'fs';
import path from 'path';
import { readDb } from './db.js';

const DB_FILE = path.resolve('backend/src/data/db.json');

const data = readDb();
fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
console.log('Base demo inicializada en', DB_FILE);
