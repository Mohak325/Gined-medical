"use server";

import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().regex(/^\+?[\d\s-]{10,16}$/),
  rank: z.string().trim().max(20).optional(),
  package: z.string().trim().max(40),
  source: z.string().trim().max(60).optional(),
});

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "delivery" };

/**
 * Forwards a booking request to LEADS_WEBHOOK_URL. Reports success only when
 * the webhook accepts it, so a student is never told a lost request was received.
 */
export async function submitLead(formData: FormData): Promise<LeadResult> {
  // Honeypot: hidden from people, so a filled value means a bot.
  if (formData.get("website")) return { ok: true };

  const parsed = LeadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    rank: formData.get("rank") || undefined,
    package: formData.get("package"),
    source: formData.get("source") || undefined,
  });
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const webhookUrl = process.env.LEADS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("Booking request not delivered: LEADS_WEBHOOK_URL is not set");
    return { ok: false, reason: "delivery" };
  }

  const lead = parsed.data;
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...lead,
        submittedAt: new Date().toISOString(),
        // Lets chat webhooks such as Slack display the lead without any mapping.
        text: `New gined.in booking: ${lead.name}, ${lead.phone}, ${lead.email}, package ${lead.package}, rank ${lead.rank ?? "not given"}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`Booking request not delivered: webhook returned ${response.status}`);
      return { ok: false, reason: "delivery" };
    }
    return { ok: true };
  } catch (error) {
    console.error("Booking request not delivered:", error instanceof Error ? error.name : "unknown error");
    return { ok: false, reason: "delivery" };
  }
}
