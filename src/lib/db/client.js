// Hybrid DB client: prefers Azure SQL (mssql) when configured, falls back to MongoDB.
// Exposes a uniform `repo` API for collections/tables.

import { MongoClient } from 'mongodb';
import { v4 as uuid } from 'uuid';

let _mongo = null;
let _mongoDb = null;

async function mongo() {
  if (!_mongo) {
    _mongo = new MongoClient(process.env.MONGO_URL);
    await _mongo.connect();
    _mongoDb = _mongo.db(process.env.DB_NAME || 'youthai_os');
  }
  return _mongoDb;
}

export const azureSqlConfigured = () => Boolean(
  process.env.AZURE_SQL_SERVER && process.env.AZURE_SQL_DATABASE && process.env.AZURE_SQL_USER && process.env.AZURE_SQL_PASSWORD
);

// Lightweight repository (Mongo-backed, ready for SQL swap).
export function repo(collectionName) {
  return {
    async list(filter = {}, opts = {}) {
      const db = await mongo();
      const cur = db.collection(collectionName).find(filter);
      if (opts.sort) cur.sort(opts.sort);
      if (opts.limit) cur.limit(opts.limit);
      const docs = await cur.toArray();
      return docs.map(({ _id, ...r }) => r);
    },
    async get(id) {
      const db = await mongo();
      const doc = await db.collection(collectionName).findOne({ id });
      if (!doc) return null;
      const { _id, ...rest } = doc; return rest;
    },
    async create(data) {
      const db = await mongo();
      const obj = { id: data.id || uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
      await db.collection(collectionName).insertOne(obj);
      const { _id, ...rest } = obj; return rest;
    },
    async update(id, patch) {
      const db = await mongo();
      await db.collection(collectionName).updateOne({ id }, { $set: { ...patch, updatedAt: new Date().toISOString() } });
      return this.get(id);
    },
    async remove(id) {
      const db = await mongo();
      await db.collection(collectionName).deleteOne({ id });
      return { ok: true };
    },
  };
}

export { uuid };
