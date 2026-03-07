// src/utils/products.js
import { parse } from 'csv-parse';


export async function parseCSV(buffer) {
return new Promise((resolve, reject) => {
const records = [];
parse(buffer.toString('utf-8'), { columns: true, trim: true }, (err, rows) => {
if (err) return reject(err);
for (const row of rows) records.push(row);
resolve(records);
});
});
}