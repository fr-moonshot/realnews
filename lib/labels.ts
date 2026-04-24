import type { BiasRating, EvidenceStatus, FactualityRating } from "@/lib/types";

export function biasLabel(value: BiasRating) {
  switch (value) {
    case "lean_left":
      return "Lean Left";
    case "lean_right":
      return "Lean Right";
    case "center":
      return "Centre";
    case "left":
      return "Left";
    case "right":
      return "Right";
    case "unknown":
    default:
      return "Unknown";
  }
}

export function factualityLabel(value: FactualityRating) {
  switch (value) {
    case "very_high":
      return "Very high";
    case "high":
      return "High";
    case "mostly_factual":
      return "Mostly factual";
    case "mixed":
      return "Mixed";
    case "low":
      return "Low";
    case "unknown":
    default:
      return "Unknown";
  }
}

export function evidenceStatusLabel(value: EvidenceStatus) {
  switch (value) {
    case "supported":
      return "Supported by cited material";
    case "disputed":
      return "Disputed";
    case "unclear":
      return "Unclear";
    case "insufficient_evidence":
    default:
      return "Insufficient evidence";
  }
}
