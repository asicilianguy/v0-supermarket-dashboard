import { NextResponse } from "next/server"
import { getChartsData } from "@/lib/mongodb"

export async function GET() {
  try {
    const data = await getChartsData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching charts data:", error)
    return NextResponse.json({ error: "Failed to fetch charts data" }, { status: 500 })
  }
}
