import { SourceType, AccessMethod } from "./schemas";

export interface SourceValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  normalizedLinkedInUrl?: string;
  normalizedInstagramUrl?: string;
}

export function validateProfileSources(
  linkedinUrl: string,
  instagramUrl: string,
  consentGiven: boolean
): SourceValidationResult {
  const errors: Record<string, string> = {};

  if (!consentGiven) {
    errors.consentGiven = "Explicit participant consent is mandatory to create a dating profile.";
  }

  // LinkedIn validation
  const cleanLinkedIn = linkedinUrl.trim();
  if (!cleanLinkedIn) {
    errors.linkedinUrl = "LinkedIn profile URL is required.";
  } else if (!/^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/i.test(cleanLinkedIn)) {
    if (!cleanLinkedIn.startsWith("https://")) {
      errors.linkedinUrl = "LinkedIn URL must begin with https://";
    } else {
      errors.linkedinUrl = "Must be a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)";
    }
  }

  // Instagram validation
  const cleanInstagram = instagramUrl.trim();
  if (!cleanInstagram) {
    errors.instagramUrl = "Public Instagram profile URL is required.";
  } else if (!/^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/i.test(cleanInstagram)) {
    if (!cleanInstagram.startsWith("https://")) {
      errors.instagramUrl = "Instagram URL must begin with https://";
    } else {
      errors.instagramUrl = "Must be a valid Instagram profile URL (e.g. https://instagram.com/username)";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedLinkedInUrl: cleanLinkedIn.replace(/\/+$/, ""),
    normalizedInstagramUrl: cleanInstagram.replace(/\/+$/, ""),
  };
}

export interface SourceProvenanceRecord {
  sourceType: SourceType;
  sourceUrl: string;
  accessMethod: AccessMethod;
  contentStatus: "content_supplied" | "url_only";
  providedAt: string;
}

export function buildSourceProvenance(
  linkedinUrl: string,
  instagramUrl: string,
  hasProvidedContent: boolean
): SourceProvenanceRecord[] {
  const now = new Date().toISOString();
  return [
    {
      sourceType: "linkedin",
      sourceUrl: linkedinUrl,
      accessMethod: "participant_provided",
      contentStatus: hasProvidedContent ? "content_supplied" : "url_only",
      providedAt: now,
    },
    {
      sourceType: "instagram",
      sourceUrl: instagramUrl,
      accessMethod: "participant_provided",
      contentStatus: hasProvidedContent ? "content_supplied" : "url_only",
      providedAt: now,
    },
  ];
}
