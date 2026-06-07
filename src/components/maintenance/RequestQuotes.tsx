"use client";

import { FormEvent, useEffect, useState } from "react";
import type { CurrentUser } from "@/context/UserContext";
import type { RequestStatus } from "@/lib/types";

type RequestQuotesProps = {
  requestId: string;
  currentUser: CurrentUser;
  selectedQuoteId?: number | null;
  approvedQuoteId?: number | null;
  canSelectForApproval?: boolean;
  onRequirementChange?: (requirement: QuoteRequirement | null) => void;
  onStatusChange?: (status: QuoteStatusUpdate | null) => void;
  onQuotesChange?: (quotes: MaintenanceQuote[]) => void;
  onSelectedQuoteChange?: (quoteId: number) => void;
  onApprovedQuoteChange?: (quote: MaintenanceQuote | null) => void;
};

export type QuoteRequirement = {
  isRequirementMet: boolean;
  quoteCount: number;
  hasPreapprovedQuote: boolean;
};

export type QuoteStatusUpdate = {
  status: RequestStatus;
  approved_quote_id: number | null;
  approved_by: number | null;
  acknowledged_at: string | null;
  in_progress_at: string | null;
  awaiting_landlord_approval_at: string | null;
  landlord_approved_at: string | null;
  invoice_received_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
};

export type MaintenanceQuote = {
  id: number;
  contractorName: string;
  quotedAmount: string;
  availabilityNote: string | null;
  quoteNotes: string | null;
  isPreapprovedContractor: boolean;
  createdByName: string;
  createdAt: string;
};

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getRequirementLabel(requirement: QuoteRequirement | null) {
  if (!requirement) {
    return "Checking requirement";
  }

  if (requirement.hasPreapprovedQuote) {
    return "Pre-approved contractor added";
  }

  if (requirement.quoteCount >= 3) {
    return "Requirement met";
  }

  if (requirement.quoteCount > 0) {
    return `${requirement.quoteCount} quote${
      requirement.quoteCount === 1 ? "" : "s"
    } added`;
  }

  return "More quotes needed";
}

export default function RequestQuotes({
  requestId,
  currentUser,
  selectedQuoteId,
  approvedQuoteId,
  canSelectForApproval = false,
  onRequirementChange,
  onStatusChange,
  onQuotesChange,
  onSelectedQuoteChange,
  onApprovedQuoteChange,
}: RequestQuotesProps) {
  const [quotes, setQuotes] = useState<MaintenanceQuote[]>([]);
  const [requirement, setRequirement] = useState<QuoteRequirement | null>(null);
  const [contractorName, setContractorName] = useState("");
  const [quotedAmount, setQuotedAmount] = useState("");
  const [availabilityNote, setAvailabilityNote] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [isPreapprovedContractor, setIsPreapprovedContractor] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canAddQuotes = currentUser.role === "property_manager";

  useEffect(() => {
    let isMounted = true;

    async function loadQuotes() {
      if (
        currentUser.id === null ||
        currentUser.role === "null" ||
        currentUser.role === "tenant"
      ) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          userId: String(currentUser.id),
          role: currentUser.role,
        });

        const response = await fetch(
          `/api/maintenance/requests/${requestId}/quotes?${params}`
        );
        const data = (await response.json()) as {
          error?: string;
          quotes?: MaintenanceQuote[];
          requirement?: QuoteRequirement;
          approvedQuoteId?: number | null;
        };

        if (!response.ok || !data.quotes || !data.requirement) {
          throw new Error(data.error ?? "Unable to load quotes.");
        }

        if (isMounted) {
          setQuotes(data.quotes);
          setRequirement(data.requirement);
          const nextApprovedQuoteId =
            data.approvedQuoteId ?? approvedQuoteId ?? null;
          const approvedQuote =
            data.quotes.find((quote) => quote.id === nextApprovedQuoteId) ??
            null;
          onRequirementChange?.(data.requirement);
          onQuotesChange?.(data.quotes);
          onApprovedQuoteChange?.(approvedQuote);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load quotes."
          );
          onRequirementChange?.(null);
          onQuotesChange?.([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQuotes();

    return () => {
      isMounted = false;
    };
  }, [
    currentUser.id,
    currentUser.role,
    onQuotesChange,
    onRequirementChange,
    onApprovedQuoteChange,
    approvedQuoteId,
    requestId,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentUser.id === null || currentUser.role !== "property_manager") {
      setError("Only property managers can add quotes.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const params = new URLSearchParams({
        userId: String(currentUser.id),
        role: currentUser.role,
      });

      const response = await fetch(
        `/api/maintenance/requests/${requestId}/quotes?${params}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contractorName,
            quotedAmount,
            availabilityNote,
            quoteNotes,
            isPreapprovedContractor,
          }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        quote?: MaintenanceQuote;
        requirement?: QuoteRequirement;
        status?: QuoteStatusUpdate | null;
        approvedQuoteId?: number | null;
      };

      if (!response.ok || !data.quote || !data.requirement) {
        throw new Error(data.error ?? "Unable to add quote.");
      }

      setQuotes((currentQuotes) => {
        const nextQuotes = [...currentQuotes, data.quote!];
        onQuotesChange?.(nextQuotes);
        const nextApprovedQuote =
          nextQuotes.find(
            (quote) => quote.id === (data.approvedQuoteId ?? approvedQuoteId)
          ) ?? null;
        onApprovedQuoteChange?.(nextApprovedQuote);
        return nextQuotes;
      });
      setRequirement(data.requirement);
      onRequirementChange?.(data.requirement);
      if (data.status) {
        onStatusChange?.(data.status);
      }
      setContractorName("");
      setQuotedAmount("");
      setAvailabilityNote("");
      setQuoteNotes("");
      setIsPreapprovedContractor(false);
      setIsFormOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to add quote."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (currentUser.role === "tenant" || currentUser.role === "null") {
    return null;
  }

  return (
    <section className="pm-maintenance-quotes-card">
      <div className="pm-maintenance-card-heading">
        <div>
          <div className="pm-maintenance-quotes-title-row">
            <h2>Quotes</h2>
            <span
              className={`pm-maintenance-quote-pill ${
                requirement?.isRequirementMet ? "is-met" : ""
              }`}
            >
              {getRequirementLabel(requirement)}
            </span>
          </div>
          <p>Contractor quote options for landlord approval.</p>
        </div>
        {canAddQuotes ? (
          <button
            className="btn pm-maintenance-quote-toggle"
            onClick={() => setIsFormOpen((isOpen) => !isOpen)}
            type="button"
          >
            {isFormOpen ? "Cancel" : "+ Add quote"}
          </button>
        ) : null}
      </div>

      {canAddQuotes && isFormOpen ? (
        <form className="pm-maintenance-quote-form" onSubmit={handleSubmit}>
          <label>
            <span>Contractor/business name</span>
            <input
              value={contractorName}
              onChange={(event) => setContractorName(event.target.value)}
              type="text"
            />
          </label>
          <label>
            <span>Quoted amount</span>
            <input
              value={quotedAmount}
              onChange={(event) => setQuotedAmount(event.target.value)}
              min="0"
              step="0.01"
              type="number"
            />
          </label>
          <label>
            <span>Availability</span>
            <input
              value={availabilityNote}
              onChange={(event) => setAvailabilityNote(event.target.value)}
              type="text"
            />
          </label>
          <label className="pm-maintenance-quote-form-wide">
            <span>Notes</span>
            <textarea
              value={quoteNotes}
              onChange={(event) => setQuoteNotes(event.target.value)}
              rows={2}
            />
          </label>
          <label className="pm-maintenance-quote-checkbox">
            <input
              checked={isPreapprovedContractor}
              onChange={(event) =>
                setIsPreapprovedContractor(event.target.checked)
              }
              type="checkbox"
            />
            <span>Pre-approved contractor</span>
          </label>
          <button className="btn" disabled={isSaving} type="submit">
            {isSaving ? "Adding..." : "Add quote"}
          </button>
        </form>
      ) : null}

      {error ? <p className="pm-maintenance-chat-error">{error}</p> : null}

      <div className="pm-maintenance-quote-list">
        {isLoading ? (
          <div className="pm-maintenance-empty-state">Loading quotes...</div>
        ) : quotes.length > 0 ? (
          quotes.map((quote) => {
            const isSelected = selectedQuoteId === quote.id;
            const isApproved = approvedQuoteId === quote.id;

            return (
            <article
              className={`pm-maintenance-quote-item ${
                isSelected ? "is-selected" : ""
              } ${isApproved ? "is-approved" : ""}`}
              key={quote.id}
            >
              <div>
                {canSelectForApproval ? (
                  <label className="pm-maintenance-quote-select">
                    <input
                      checked={isSelected}
                      onChange={() => onSelectedQuoteChange?.(quote.id)}
                      type="radio"
                      name={`maintenance-quote-${requestId}`}
                    />
                    <strong>{quote.contractorName}</strong>
                  </label>
                ) : (
                  <strong>{quote.contractorName}</strong>
                )}
                <span className="pm-maintenance-quote-badges">
                  {isApproved ? <span>Approved by landlord</span> : null}
                  {isSelected && !isApproved ? (
                    <span>Selected for approval</span>
                  ) : null}
                  {quote.isPreapprovedContractor ? (
                    <span>Pre-approved</span>
                  ) : null}
                </span>
              </div>
              <dl>
                <div>
                  <dt>Amount</dt>
                  <dd>{formatMoney(quote.quotedAmount)}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{quote.availabilityNote || "Not specified"}</dd>
                </div>
                <div>
                  <dt>Added</dt>
                  <dd>{formatDate(quote.createdAt)}</dd>
                </div>
              </dl>
              {quote.quoteNotes ? <p>{quote.quoteNotes}</p> : null}
            </article>
            );
          })
        ) : (
          <div className="pm-maintenance-empty-state">
            No quotes added yet.
          </div>
        )}
      </div>
    </section>
  );
}
