import { MongoClient } from "mongodb"
import { VALID_SUPERMARKETS } from "@/lib/valid-supermarkets"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI environment variable")
}

let client: MongoClient | null = null

async function getMongoClient() {
  if (!client) {
    console.log("[v0] Creating new MongoDB client...")
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("[v0] MongoDB client connected successfully")
  }
  return client
}

async function getCollection() {
  const client = await getMongoClient()
  const db = client.db("cart")
  const collection = db.collection("productoffers")
  console.log("[v0] Using database: cart, collection: productoffers")
  return collection
}

export async function getProductsCollection() {
  return getCollection()
}

export async function getSupermarketStatus() {
  const collection = await getCollection()
  const now = new Date()

  // Get all supermarkets with products
  const supermarketsWithProducts = await collection.distinct("chainName")

  // Get supermarkets without products
  const supermarketsWithoutProducts = VALID_SUPERMARKETS.filter((sm) => !supermarketsWithProducts.includes(sm))

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(23, 59, 59, 999)

  const dayAfterTomorrow = new Date(now)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
  dayAfterTomorrow.setHours(0, 0, 0, 0)
  const dayAfterTomorrowEnd = new Date(dayAfterTomorrow)
  dayAfterTomorrowEnd.setHours(23, 59, 59, 999)

  const in3Days = new Date(now)
  in3Days.setDate(in3Days.getDate() + 3)
  in3Days.setHours(0, 0, 0, 0)
  const in3DaysEnd = new Date(in3Days)
  in3DaysEnd.setHours(23, 59, 59, 999)

  const [expiringToday, expiringTomorrow, expiringDayAfter, expiringIn3Days] = await Promise.all([
    collection.distinct("chainName", {
      offerEndDate: { $gte: today, $lte: todayEnd },
    }),
    collection.distinct("chainName", {
      offerEndDate: { $gte: tomorrow, $lte: tomorrowEnd },
    }),
    collection.distinct("chainName", {
      offerEndDate: { $gte: dayAfterTomorrow, $lte: dayAfterTomorrowEnd },
    }),
    collection.distinct("chainName", {
      offerEndDate: { $gte: in3Days, $lte: in3DaysEnd },
    }),
  ])

  // Get last update date and product count for each supermarket
  const supermarketDetails = await collection
    .aggregate([
      {
        $group: {
          _id: "$chainName",
          productCount: { $sum: 1 },
          lastUpdate: { $max: "$updatedAt" },
          oldestOffer: { $min: "$offerEndDate" },
          newestOffer: { $max: "$offerEndDate" },
        },
      },
      { $sort: { productCount: -1 } },
    ])
    .toArray()

  const supermarketMap = new Map(
    supermarketDetails.map((sm) => [
      sm._id,
      {
        chainName: sm._id,
        productCount: sm.productCount,
        lastUpdate: sm.lastUpdate,
        oldestOffer: sm.oldestOffer,
        newestOffer: sm.newestOffer,
      },
    ]),
  )

  return {
    summary: {
      totalSupermarkets: VALID_SUPERMARKETS.length,
      activeSupermarkets: supermarketsWithProducts.length,
      inactiveSupermarkets: supermarketsWithoutProducts.length,
      expiringTodayCount: expiringToday.length,
      expiringTomorrowCount: expiringTomorrow.length,
      expiringDayAfterCount: expiringDayAfter.length,
      expiringIn3DaysCount: expiringIn3Days.length,
    },
    supermarketsWithProducts: supermarketsWithProducts.map((sm) => supermarketMap.get(sm)!),
    supermarketsWithoutProducts,
    expiringToday: expiringToday.map((sm) => supermarketMap.get(sm)!),
    expiringTomorrow: expiringTomorrow.map((sm) => supermarketMap.get(sm)!),
    expiringDayAfter: expiringDayAfter.map((sm) => supermarketMap.get(sm)!),
    expiringIn3Days: expiringIn3Days.map((sm) => supermarketMap.get(sm)!),
  }
}

export async function getChartsData() {
  const collection = await getCollection()
  const now = new Date()

  // Supermarket distribution (top 15)
  const supermarketDistribution = await collection
    .aggregate([
      { $group: { _id: "$chainName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ])
    .toArray()

  // Expiration data
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)

  const in3Days = new Date(now)
  in3Days.setDate(in3Days.getDate() + 3)
  in3Days.setHours(23, 59, 59, 999)

  const in7Days = new Date(now)
  in7Days.setDate(in7Days.getDate() + 7)
  in7Days.setHours(23, 59, 59, 999)

  const in14Days = new Date(now)
  in14Days.setDate(in14Days.getDate() + 14)
  in14Days.setHours(23, 59, 59, 999)

  const [expTomorrow, exp3Days, exp7Days, exp14Days] = await Promise.all([
    collection.countDocuments({
      offerEndDate: { $lte: tomorrow, $gte: now },
    }),
    collection.countDocuments({
      offerEndDate: { $lte: in3Days, $gte: now },
    }),
    collection.countDocuments({
      offerEndDate: { $lte: in7Days, $gte: now },
    }),
    collection.countDocuments({
      offerEndDate: { $lte: in14Days, $gte: now },
    }),
  ])

  const expirationData = [
    { period: "Domani", count: expTomorrow },
    { period: "3 Giorni", count: exp3Days },
    { period: "7 Giorni", count: exp7Days },
    { period: "14 Giorni", count: exp14Days },
  ]

  // Brand distribution (top 10)
  const brandDistribution = await collection
    .aggregate([
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ])
    .toArray()

  // Price distribution
  const priceRanges = [
    { range: "0-1€", min: 0, max: 1 },
    { range: "1-2€", min: 1, max: 2 },
    { range: "2-5€", min: 2, max: 5 },
    { range: "5-10€", min: 5, max: 10 },
    { range: "10-20€", min: 10, max: 20 },
    { range: "20+€", min: 20, max: 999999 },
  ]

  const priceDistribution = await Promise.all(
    priceRanges.map(async ({ range, min, max }) => ({
      range,
      count: await collection.countDocuments({
        offerPrice: { $gte: min, $lt: max },
      }),
    })),
  )

  // Insertion trend (last 30 days)
  const last30Days = new Date(now)
  last30Days.setDate(last30Days.getDate() - 30)

  const insertionTrend = await collection
    .aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ])
    .toArray()

  // Aisle distribution (top 5)
  const aisleDistribution = await collection
    .aggregate([
      { $unwind: "$supermarketAisle" },
      { $group: { _id: "$supermarketAisle", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ])
    .toArray()

  return {
    supermarketDistribution,
    expirationData,
    brandDistribution,
    priceDistribution,
    insertionTrend,
    aisleDistribution,
  }
}
