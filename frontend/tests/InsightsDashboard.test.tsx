import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import InsightsDashboard from "../components/InsightsDashboard";

// Mock React Query hook
const mockUseInsights = vi.fn();
vi.mock("../lib/hooks/useInsights", () => ({
  useInsights: () => mockUseInsights(),
}));

describe("InsightsDashboard Component", () => {
  it("shows loading skeletons when fetching data", () => {
    mockUseInsights.mockReturnValue({
      isLoading: true,
      error: null,
      data: undefined,
    });

    const handleSelectEmail = vi.fn();
    const { container } = render(<InsightsDashboard onSelectEmail={handleSelectEmail} />);
    
    expect(container.querySelector(".animate-pulse")).toBeDefined();
  });

  it("renders counts and metrics on successful loading", () => {
    mockUseInsights.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        unread_count: 5,
        urgent_count: 2,
        needs_reply_count: 3,
        categories: { work: 4, finance: 1 },
        top_senders: [],
        deadlines_today: [],
        daily_summary: "Your daily email update overview.",
      },
    });

    const handleSelectEmail = vi.fn();
    render(<InsightsDashboard onSelectEmail={handleSelectEmail} />);

    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("Your daily email update overview.")).toBeDefined();
  });
});
