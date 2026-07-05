import { MongoClient, type Db } from "mongodb";

let client: MongoClient | undefined;
let database: Db | undefined;
let connectPromise: Promise<Db | null> | undefined;

export function getMongoDbName(): string {
  return process.env.MONGODB_DB?.trim() || "proxima_gov";
}

export function getMongoUri(): string | undefined {
  return process.env.MONGODB_URI?.trim();
}

export async function getMongoDb(): Promise<Db | null> {
  const uri = getMongoUri();
  if (!uri) return null;
  if (database) return database;

  if (!connectPromise) {
    connectPromise = (async () => {
      client = new MongoClient(uri);
      await client.connect();
      database = client.db(getMongoDbName());
      return database;
    })();
  }

  return connectPromise;
}