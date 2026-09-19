"use client";

import { useCompare } from "@/lib/medical/CompareProvider";
import { Plus, Check } from "lucide-react";

interface AddToCompareButtonProps {
  collegeId: string;
  collegeName: string;
}

/**
 * AddToCompareButton — Writes to CompareProvider.
 * Toggles between add/remove. Shows full indicator when max reached.
 */
export default function AddToCompareButton({
  collegeId,
  collegeName,
}: AddToCompareButtonProps) {
  const { add, remove, has, isFull } = useCompare();
  const isSelected = has(collegeId);

  const handleClick = () => {
    if (isSelected) {
      remove(collegeId);
    } else if (!isFull) {
      add(collegeId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isSelected && isFull}
      aria-label={
        isSelected
          ? `Remove ${collegeName} from comparison`
          : `Add ${collegeName} to comparison`
      }
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-small font-medium transition-colors duration-[var(--dur-fast)] ${
        isSelected
          ? "bg-gold/15 text-gold-deep border border-gold/30"
          : isFull
            ? "bg-paper-dim text-text-muted cursor-not-allowed border border-hairline"
            : "bg-paper-bright text-text-muted hover:text-text-main border border-hairline hover:border-border-strong"
      }`}
    >
      {isSelected ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Comparing
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          Compare
        </>
      )}
    </button>
  );
}
