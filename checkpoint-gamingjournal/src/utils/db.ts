import { MongoClient } from "mongodb";

// Throw an error if uri is not fetched from .env
if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// Initializing MongoDB client instance
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db();

// Define collections for models
export const UserCollection = db.collection("users");
export const GameCollection = db.collection("games");
export const JournalEntriesCollection = db.collection("journalEntries");

// Export the database instance
export default db;