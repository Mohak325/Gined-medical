"use server";

import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

/**
 * A booking arrives in two stages, each its own row in the leads sheet with the same leadId:
 * "contact" (name and phone, sent first so a half-finished booking still reaches the team) and
 * "details" (everything else).
 */
const LeadSchema = z.object({
  leadId: z.string().trim().regex(/^[a-z0-9-]{8,40}$/),
  stage: z.enum(["contact", "details"]),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[\d\s-]{10,16}$/),
  email: z.union([z.literal(""), z.string().trim().email().max(200)]).optional(),
  rank: optionalText(20),
  track: optionalText(4),
  category: optionalText(20),
  quota: optionalText(20),
  state: optionalText(40),
  stateCategory: optionalText(20),
  package: optionalText(40),
  message: optionalText(600),
  source: optionalText(60),
});

export type LeadResult = { ok: true } | { ok: false; reason: "invalid" | "delivery" };

/**
 * Forwards a booking stage to LEADS_WEBHOOK_URL. Reports success only when the webhook accepts
 * it, so a student is never told a lost request was received.
 */
export async function submitLead(formData: FormData): Promise<LeadResult> {
  // Honeypot: hidden from people, so a filled value means a bot.
  if (formData.get("website")) return { ok: true };

  const field = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value !== "" ? value : undefined;
  };
  const parsed = LeadSchema.safeParse({
    leadId: field("leadId"),
    stage: field("stage"),
    name: field("name"),
    phone: field("phone"),
    email: field("email"),
    rank: field("rank"),
    track: field("track"),
    category: field("category"),
    quota: field("quota"),
    state: field("state"),
    stateCategory: field("stateCategory"),
    package: field("package"),
    message: field("message"),
    source: field("source"),
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
        email: lead.email ?? "",
        submittedAt: new Date().toISOString(),
        // Lets chat webhooks such as Slack display the lead without any mapping.
        text: `New gined.in booking (${lead.stage}): ${lead.name}, ${lead.phone}${lead.rank ? `, rank ${lead.rank}` : ""}${lead.package ? `, package ${lead.package}` : ""}`,
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
