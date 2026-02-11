// app/api/stt/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server"
import { transcribeAudio } from "@/lib/stt/client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = formData.get("language") as "en" | "hi" | "mr"

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file required" }, { status: 400 })
    }

    if (!["en", "hi", "mr"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 })
    }

    // Convert File to Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // Transcribe
    const transcription = await transcribeAudio(audioBuffer, language)

    return NextResponse.json({ transcription })
  } catch (error) {
    console.error("[STT API] Error:", error)
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
  }
}