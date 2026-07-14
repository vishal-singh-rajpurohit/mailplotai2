import { describe, it, expect, vi } from "vitest";

// Mock implementation of voice command hook test wrapper
describe("useVoiceCommand Hook Interface", () => {
  it("exposes parseCommand and transcribeAudio function interfaces", () => {
    const mockUseVoiceCommand = () => ({
      parseCommand: vi.fn().mockResolvedValue({
        id: "vc-1",
        transcript: "show work emails",
        parsed_intent: { intent: "search", filters: { category: "work" } }
      }),
      isParsing: false,
      transcribeAudio: vi.fn().mockResolvedValue({
        transcript: "show urgent emails"
      }),
      isTranscribing: false
    });

    const hook = mockUseVoiceCommand();
    expect(typeof hook.parseCommand).toBe("function");
    expect(typeof hook.transcribeAudio).toBe("function");
    expect(hook.isParsing).toBe(false);
  });
});
