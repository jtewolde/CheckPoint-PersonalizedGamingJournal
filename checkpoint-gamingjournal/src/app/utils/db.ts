
import { MongoClient } from "mongodb";
// Throw an error if uri is not fetched from .env
if (!process.env.MONGODB_URI) {
     throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}
// initializing mongodb client instance 
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db();

export default db