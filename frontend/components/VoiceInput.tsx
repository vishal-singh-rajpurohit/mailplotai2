"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Globe, AlertCircle } from "lucide-react";
import { useVoiceCommand } from "@/lib/hooks/useVoiceCommand";

interface VoiceInputProps {
  onCommand: (transcript: string) => void;
  defaultLanguage?: "en" | "hi";
}

export default function VoiceInput({ onCommand, defaultLanguage = "en" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lang, setLang] = useState<"en" | "hi">(defaultLanguage);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { transcribeAudio, isTranscribing } = useVoiceCommand();

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = lang === "hi" ? "hi-IN" : "en-US";

        rec.onstart = () => {
          setIsListening(true);
          setTranscript("");
          setErrorMessage(null);
        };

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setTranscript(event.results[i][0].transcript);
            } else {
              interimTranscript += event.results[i][0].transcript;
              setTranscript(interimTranscript);
            }
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            setErrorMessage("Microphone permission denied.");
          } else {
            setErrorMessage("Speech recognition error. Trying audio fallback...");
            // Trigger audio recorder fallback
            startAudioRecording();
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [lang]);

  // Adjust speech recognition language on change
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-US";
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setErrorMessage(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // If start fails, use audio recording fallback
          startAudioRecording();
        }
      } else {
        startAudioRecording();
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && !mediaRecorderRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        onCommand(transcript);
      }
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  // Browser Audio Recording Fallback (Whisper)
  const startAudioRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsListening(true);
        setTranscript("Recording audio for AI translation...");
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        // Close mic stream
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
        
        setTranscript("Transcribing audio...");
        try {
          const res = await transcribeAudio(audioBlob);
          setTranscript(res.transcript);
          if (res.transcript.trim()) {
            onCommand(res.transcript);
          }
        } catch (e) {
          setErrorMessage("Failed to transcribe audio. Check API credentials.");
          setTranscript("");
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Audio recording permission failed:", err);
      setErrorMessage("No microphone access available.");
      setIsListening(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-3">
      <div className="w-full flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-5 py-3 shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-violet-500/20">
        
        {/* Language selector toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          disabled={isListening}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          title="Toggle language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === "en" ? "EN" : "HI"}</span>
        </button>

        {/* Text input container displaying transcript */}
        <div className="flex-1 overflow-hidden select-none">
          <input
            type="text"
            readOnly
            placeholder={
              lang === "en"
                ? "Tap mic and say 'Show urgent emails'..."
                : "माइक दबाकर बोलें 'आज के ज़रूरी ईमेल दिखाओ'..."
            }
            value={transcript}
            className="w-full bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 cursor-default"
          />
        </div>

        {/* Mic activation button */}
        <button
          onClick={toggleListening}
          disabled={isTranscribing}
          className={`relative flex items-center justify-center w-10 h-10 rounded-full text-white shadow-md transition-all duration-300 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse scale-105"
              : isTranscribing
              ? "bg-violet-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700 hover:scale-105"
          }`}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}

          {/* Pulse animation rings */}
          {isListening && (
            <span className="absolute -inset-1.5 rounded-full border-2 border-red-500/30 animate-ping" />
          )}
        </button>
      </div>

      {/* Interim results visualizer (Audio Wave) */}
      {isListening && (
        <div className="flex items-center gap-1 mt-1 justify-center">
          <div className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
          <div className="w-1 h-5 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
          <div className="w-1 h-7 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_300ms]" />
          <div className="w-1 h-4 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_400ms]" />
          <div className="w-1 h-2 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_500ms]" />
          <span className="text-xs text-red-500 font-medium ml-2">Listening...</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full border border-amber-500/20 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
