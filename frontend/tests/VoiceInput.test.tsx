import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VoiceInput from "../components/VoiceInput";

// Mock voice commands hook
vi.mock("../lib/hooks/useVoiceCommand", () => ({
  useVoiceCommand: () => ({
    transcribeAudio: vi.fn(),
    isTranscribing: false,
  }),
}));

describe("VoiceInput Component", () => {
  it("renders with placeholders and language toggles", () => {
    const handleCommand = vi.fn();
    render(<VoiceInput onCommand={handleCommand} />);

    expect(screen.getByPlaceholderText(/Tap mic and say/)).toBeDefined();
    expect(screen.getByText("EN")).toBeDefined();
  });

  it("switches speech recognition language between English and Hindi on toggle click", () => {
    const handleCommand = vi.fn();
    render(<VoiceInput onCommand={handleCommand} />);

    const langToggle = screen.getByText("EN");
    fireEvent.click(langToggle);

    expect(screen.getByText("HI")).toBeDefined();
  });
});
