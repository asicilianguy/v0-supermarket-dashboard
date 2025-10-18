import { NextResponse } from "next/server"
import { getProductsCollection } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const brand = searchParams.get("brand") || ""
    const aisle = searchParams.get("aisle") || ""
    const chainName = searchParams.get("chainName") || ""

    const collection = await getProductsCollection()

    // Build query
    const query: any = {}

    if (search) {
      query.productName = { $regex: search, $options: "i" }
    }

    if (brand) {
      query.brand = brand
    }

    if (aisle) {
      query.supermarketAisle = aisle
    }

    if (chainName) {
      query.chainName = chainName
    }

    // Get filtered products
    const products = await collection.find(query).sort({ createdAt: -1 }).limit(100).toArray()

    // Get unique brands
    const brands = await collection.distinct("brand")

    // Get unique aisles (flatten arrays)
    const aislesResult = await collection
      .aggregate([{ $unwind: "$supermarketAisle" }, { $group: { _id: "$supermarketAisle" } }, { $sort: { _id: 1 } }])
      .toArray()
    const aisles = aislesResult.map((a) => a._id)

    return NextResponse.json({
      products: products.map((p) => ({
        id: p._id.toString(),
        productName: p.productName,
        brand: p.brand,
        chainName: p.chainName,
        offerPrice: p.offerPrice,
        pricePerKg: p.pricePerKg,
        productQuantity: p.productQuantity,
        offerEndDate: p.offerEndDate,
        supermarketAisle: p.supermarketAisle,
        createdAt: p.createdAt,
      })),
      filters: {
        brands: brands.filter(Boolean).sort(),
        aisles: aisles.filter(Boolean),
      },
      total: products.length,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
