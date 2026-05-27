export const CAMPAIGN_STATUS = ["active", "paused", "completed"] as const;

export function normalizeCampaignStatus(status?: string) {
  if (!status) return "active";

  const normalized = status.toLowerCase().trim();

  return CAMPAIGN_STATUS.includes(normalized as any)
    ? normalized
    : "active";
}