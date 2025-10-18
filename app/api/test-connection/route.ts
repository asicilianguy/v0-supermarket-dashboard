import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI

    console.log("[v0] Testing MongoDB connection...")
    console.log("[v0] MONGODB_URI exists:", !!MONGODB_URI)

    if (!MONGODB_URI) {
      return NextResponse.json(
        {
          error: "MONGODB_URI not configured",
          message: "Please add MONGODB_URI to your environment variables",
        },
        { status: 500 },
      )
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("[v0] Connected to MongoDB successfully")

    const db = client.db("cart")
    const collections = await db.listCollections().toArray()
    console.log(
      "[v0] Available collections:",
      collections.map((c) => c.name),
    )

    const productsCollection = db.collection("products")
    const count = await productsCollection.countDocuments()
    console.log("[v0] Total documents in products collection:", count)

    // Get a sample document
    const sample = await productsCollection.findOne()
    console.log("[v0] Sample document:", JSON.stringify(sample, null, 2))

    await client.close()

    return NextResponse.json({
      success: true,
      database: "cart",
      collections: collections.map((c) => c.name),
      productsCount: count,
      sampleDocument: sample,
    })
  } catch (error) {
    console.error("[v0] MongoDB connection test failed:", error)
    return NextResponse.json(
      {
        error: "Connection test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
