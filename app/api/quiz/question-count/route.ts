import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const segment = req.nextUrl.searchParams.get("segment")

  if (!segment) {
    return NextResponse.json({ error: "Missing segment" }, { status: 400 })
  }

  const normalizedSegment = segment.replace(/-/g, "_")
  const [book, start, end] = normalizedSegment.split("_")

  const { count, error } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("book", book.charAt(0).toUpperCase() + book.slice(1))
    .gte("chapter", Number(start))
    .lte("chapter", Number(end))

  if (error) {
    return NextResponse.json({ error: "Failed to count" }, { status: 500 })
  }

  return NextResponse.json({ count: count || 0 })
}
