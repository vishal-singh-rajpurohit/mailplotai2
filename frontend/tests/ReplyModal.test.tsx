import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReplyModal from "../components/ReplyModal";

// Mock hooks
vi.mock("../lib/hooks/useEmails", () => ({
  useSendReply: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("ReplyModal Component", () => {
  it("renders when open status is true", () => {
    const handleClose = vi.fn();
    const handleToast = vi.fn();
    
    render(
      <ReplyModal
        emailId="email-1"
        emailSubject="AWS Overdue Invoice"
        senderName="AWS Billing"
        isOpen={true}
        onClose={handleClose}
        onSuccessToast={handleToast}
      />
    );

    expect(screen.getByText("Reply to AWS Billing")).toBeDefined();
    expect(screen.getByText("AWS Overdue Invoice")).toBeDefined();
  });

  it("does not render when open status is false", () => {
    const handleClose = vi.fn();
    const handleToast = vi.fn();

    const { container } = render(
      <ReplyModal
        emailId="email-1"
        emailSubject="AWS Overdue Invoice"
        senderName="AWS Billing"
        isOpen={false}
        onClose={handleClose}
        onSuccessToast={handleToast}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
