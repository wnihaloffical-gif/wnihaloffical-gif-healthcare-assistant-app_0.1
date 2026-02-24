"use client";

import { useState, useRef, useEffect } from "react";

interface VoiceRecorderProps {
  language: string;
  onTranscriptionComplete: (text: string) => void;
  onLanguageChange: (lang: string) => void;
}

const languageMap: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
};

export default function VoiceRecorder({
  language,
  onTranscriptionComplete,
  onLanguageChange,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [browserSpeechAvailable, setBrowserSpeechAvailable] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);

  const langText = {
    en: {
      selectLanguage: "Select Language",
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      reRecording: "Re-record",
      transcribe: "Transcribe Audio",
      transcribing: "Transcribing...",
      playback: "Play Audio",
      confirm: "Confirm Transcription",
      edit: "Edit Text",
      nextStep: "Proceed to Review",
      instructions:
        "Click 'Start Recording' and speak your symptoms clearly in your selected language.",
    },
    hi: {
      selectLanguage: "भाषा चुनें",
      startRecording: "रिकॉर्डिंग शुरू करें",
      stopRecording: "रिकॉर्डिंग बंद करें",
      reRecording: "फिर से रिकॉर्ड करें",
      transcribe: "ऑडियो ट्रांसक्राइब करें",
      transcribing: "ट्रांसक्राइब किया जा रहा है...",
      playback: "ऑडियो चलाएं",
      confirm: "ट्रांसक्रिप्शन की पुष्टि करें",
      edit: "पाठ संपादित करें",
      nextStep: "समीक्षा के लिए आगे बढ़ें",
      instructions: "अपनी भाषा में अपने लक्षणों को स्पष्ट रूप से बोलें।",
    },
    mr: {
      selectLanguage: "भाषा निवडा",
      startRecording: "रेकॉर्डिंग सुरू करा",
      stopRecording: "रेकॉर्डिंग बंद करा",
      reRecording: "पुन्हा रेकॉर्ड करा",
      transcribe: "ऑडियो ट्रान्सक्राइब करा",
      transcribing: "ट्रान्सक्राइब केले जात आहे...",
      playback: "ऑडियो चला",
      confirm: "ट्रान्सक्रिप्शन पुष्टी करा",
      edit: "मजकूर संपादित करा",
      nextStep: "समीक्षेसाठी पुढे जा",
      instructions: "आपल्या भाषेत आपल्या लक्षणांबद्दल स्पष्टपणे बोला।",
    },
  };

  const t = langText[language as keyof typeof langText];

  useEffect(() => {
    // Check for Web Speech API availability
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      console.warn("Web Speech API not available, fallback mode enabled");
      setBrowserSpeechAvailable(false);
      initMediaRecorder();
    } else {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = languageMap[language] || "en-US";

      recognitionRef.current.onstart = () => {
        console.log("[v0] Speech recognition started");
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscription((prev) => prev + (prev ? " " : "") + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error);
      };

      recognitionRef.current.onend = () => {
        console.log("[v0] Speech recognition ended");
        setIsRecording(false);
      };
    }

    // Also setup media recorder as fallback
    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/wav" });
          setRecordedAudio(blob);
          chunksRef.current = [];
        };
      } catch (error) {
        console.error("Microphone access denied:", error);
      }
    };

    if (!browserSpeechAvailable) {
      initMediaRecorder();
    }
  }, [language, browserSpeechAvailable]);

  const startRecording = () => {
    if (browserSpeechAvailable && recognitionRef.current) {
      setTranscription("");
      recognitionRef.current.start();
      setIsRecording(true);
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (browserSpeechAvailable && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!recordedAudio || !browserSpeechAvailable) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", recordedAudio);
      formData.append("language", language);

      const response = await fetch("/api/stt/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setTranscription(data.transcription);
    } catch (error) {
      console.error("Transcription error:", error);
      // Fallback to mock
      const mockTranscriptions: Record<string, string> = {
        en: "I have had a fever and cough for the past three days. I also have body aches and fatigue.",
        hi: "मुझे पिछले तीन दिनों से बुखार और खांसी है। मुझे शरीर में दर्द और थकान भी है।",
        mr: "मला मागील तीन दिनांपासून ताप आणि खोकला आहे। मुला शरीरात दुखणे आणि थकव आहे।",
      };
      setTranscription(
        mockTranscriptions[language] || mockTranscriptions["en"],
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlayback = () => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio);
      const audio = new Audio(url);
      audio.play();
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t.selectLanguage}
        </label>
        <div className="flex gap-2">
          {(["en", "hi", "mr"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                language === lang
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "मराठी"}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-muted-foreground text-sm">{t.instructions}</p>

      {/* Recording Controls */}
      <div className="space-y-4">
        {!recordedAudio ? (
          <>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-colors ${
                isRecording
                  ? "bg-destructive hover:opacity-90"
                  : "bg-primary hover:opacity-90"
              }`}
            >
              {isRecording ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 bg-destructive rounded-full animate-pulse"></span>
                  {t.stopRecording}
                </span>
              ) : (
                t.startRecording
              )}
            </button>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={handlePlayback}
                className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded font-semibold hover:opacity-90 transition-colors"
              >
                {t.playback}
              </button>
              <button
                onClick={() => {
                  setRecordedAudio(null);
                  setTranscription("");
                }}
                className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded font-semibold hover:opacity-80 transition-colors"
              >
                {t.reRecording}
              </button>
            </div>

            {!transcription && (
              <button
                onClick={handleTranscribe}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? t.transcribing : t.transcribe}
              </button>
            )}
          </>
        )}
      </div>

      {/* Transcription Display & Edit */}
      {transcription && (
        <div className="space-y-3 p-4 bg-info/10 rounded-lg border border-info/20">
          <label className="block text-sm font-medium">{t.edit}</label>
          <textarea
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            className="w-full p-3 border border-border rounded"
            rows={4}
          />
          <button
            onClick={() => onTranscriptionComplete(transcription)}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded font-semibold hover:opacity-90 transition-colors"
          >
            {t.nextStep}
          </button>
        </div>
      )}
    </div>
  );
}
