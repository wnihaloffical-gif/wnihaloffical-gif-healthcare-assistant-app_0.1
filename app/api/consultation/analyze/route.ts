// app/api/consultation/analyze/route.ts
import { NextRequest, NextResponse } from "next/server"
import { runSymptomAnalysis } from "@/lib/ai/runSymptomAnalysis"

export async function POST(request: NextRequest) {
  try {
    const { transcription, language, currentMedicines } = await request.json()

    if (!transcription || typeof transcription !== "string") {
      return NextResponse.json({ error: "Transcription required" }, { status: 400 })
    }

    if (!["en", "hi", "mr"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 })
    }

    const analysis = await runSymptomAnalysis(transcription, language, currentMedicines || [])

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("[ANALYZE API] Error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
