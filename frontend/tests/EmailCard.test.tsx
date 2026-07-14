import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EmailCard from "../components/EmailCard";
import { EmailType } from "../lib/validators";

// Mock child components
vi.mock("../components/CategoryBadge", () => ({
  default: ({ category }: { category: string }) => <span data-testid="cat-badge">{category}</span>,
}));

vi.mock("../components/UrgencyBadge", () => ({
  default: ({ score }: { score: number }) => <span data-testid="urg-badge">{score >= 0.7 ? "urgent" : "medium"}</span>,
}));

const mockEmail: EmailType = {
  id: "e9a0f0a0-0000-0000-0000-000000000000",
  provider: "gmail",
  message_id: "gmail-123",
  thread_id: "thread-123",
  subject: "AWS Invoice Overdue!",
  sender_email: "billing@aws.com",
  sender_name: "Amazon Web Services",
  recipients: [{ name: "Developer", email: "dev@inboxpilot.ai" }],
  snippet: "Your bill of $42.50 is past due.",
  body_plain: "Your bill of $42.50 is past due. Please pay.",
  body_html: "<p>Your bill of $42.50 is past due. Please pay.</p>",
  received_at: "2026-06-11T12:00:00Z",
  is_read: false,
  is_starred: true,
  labels: ["INBOX", "UNREAD"],
  category: "invoice",
  urgency_score: 0.85,
  importance_score: 0.9,
  summary: "AWS Overdue payment invoice",
  action_items: ["Complete payment of $42.50"],
  deadlines: [{ task: "AWS Bill Pay", deadline: "2026-06-15" }],
  entities: { people: [], companies: ["Amazon"], dates: [], amounts: ["$42.50"] },
  needs_reply: true,
  created_at: "2026-06-11T12:00:00Z",
};

describe("EmailCard Component", () => {
  it("renders email header sender and subject information", () => {
    const handleClick = vi.fn();
    render(<EmailCard email={mockEmail} isSelected={false} onClick={handleClick} />);

    expect(screen.getByText("Amazon Web Services")).toBeDefined();
    expect(screen.getByText("billing@aws.com")).toBeDefined();
    expect(screen.getByText("AWS Invoice Overdue!")).toBeDefined();
    expect(screen.getByText("AWS Overdue payment invoice")).toBeDefined();
  });

  it("handles user clicks and propagates selection trigger", () => {
    const handleClick = vi.fn();
    render(<EmailCard email={mockEmail} isSelected={false} onClick={handleClick} />);

    const card = screen.getByText("AWS Invoice Overdue!");
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
