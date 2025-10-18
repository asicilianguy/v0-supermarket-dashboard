import { NextResponse } from "next/server"
import { getSupermarketStatus } from "@/lib/mongodb"

export async function GET() {
  try {
    const data = await getSupermarketStatus()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching supermarket status:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch supermarket status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
