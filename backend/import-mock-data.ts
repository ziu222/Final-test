import mongoose from 'mongoose';
import { EJSON } from 'bson';
import fs from 'fs';
import path from 'path';

async function importFile(collection: string, file: string) {
  const raw = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
  const docs = EJSON.parse(raw) as any[];
  const db = mongoose.connection.db!;
  await db.collection(collection).deleteMany({});
  await db.collection(collection).insertMany(docs);
  console.log(`imported ${docs.length} docs into ${collection}`);
}

async function main() {
  await mongoose.connect('mongodb://localhost:27017/mindx-teacher');
  await importFile('users', 'school.users.json');
  await importFile('teacherpositions', 'school.teacherpositions.json');
  await importFile('teachers', 'school.teachers.json');
  await mongoose.disconnect();
}

main();
