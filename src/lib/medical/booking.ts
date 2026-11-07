import contact from "@/content/contact.json";

/** Details the booking form can prefill, so a student never retypes what the finder already knows. */
export interface BookingContext {
  source: string;
  package?: string;
  track?: string;
  rank?: number | string;
  quota?: string;
  category?: string;
  state?: string;
  stateCategory?: string;
}

export function bookingHref(context: BookingContext): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `/medical/book?${params.toString()}`;
}

/** WhatsApp chat link with a short opening message. */
export function whatsappHref(message = "Hi Gined, I'd like help with NEET counselling."): string {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const CONTACT_IS_PLACEHOLDER = contact.placeholder;
