import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "mimosuterinos"

let client
let db

export async function connectDB() {
  if (db) {
    return db
  }

  try {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db(dbName)

    console.log("Connected to MongoDB")
    return db
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

export async function closeDB() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
