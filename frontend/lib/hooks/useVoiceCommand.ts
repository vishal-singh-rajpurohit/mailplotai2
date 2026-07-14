import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface VoiceCommandParsedResponse {
  id: string;
  transcript: string;
  parsed_intent: {
    intent: string;
    filters: {
      from_sender?: string | null;
      keyword?: string | null;
      category?: string | null;
      date_range?: {
        start?: string | null;
        end?: string | null;
      } | null;
      is_unread?: boolean | null;
      needs_reply?: boolean | null;
      urgency_min?: number | null;
      limit?: number;
    };
    original_query: string;
  };
}

export function useVoiceCommand() {
  // Mutation to parse text transcript into structured filters
  const commandMutation = useMutation<VoiceCommandParsedResponse, Error, string>({
    mutationFn: async (transcript: string) => {
      const res = await apiClient.post("/api/v1/voice/command", { transcript });
      return res.data;
    },
  });

  // Mutation to upload raw audio for speech-to-text transcription
  const transcribeMutation = useMutation<{ transcript: string }, Error, Blob>({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      // Whisper supports mp3, wav, webm, etc.
      formData.append("file", audioBlob, "command.wav");
      
      const res = await apiClient.post("/api/v1/voice/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
  });

  return {
    parseCommand: commandMutation.mutateAsync,
    isParsing: commandMutation.isPending,
    parsedData: commandMutation.data,
    
    transcribeAudio: transcribeMutation.mutateAsync,
    isTranscribing: transcribeMutation.isPending,
  };
}
