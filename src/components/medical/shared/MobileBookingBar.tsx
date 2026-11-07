"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useCompare } from "@/lib/medical/CompareProvider";
import { whatsappHref } from "@/lib/medical/booking";

/**
 * A slim booking bar fixed to the bottom of phone screens. It steps aside on the booking page
 * and while the compare tray (which also sits at the bottom) is open.
 */
export default function MobileBookingBar() {
  const pathname = usePathname();
  const { ids } = useCompare();
  if (pathname.startsWith("/medical/book") || ids.length > 0) return null;

  return (
    <>
      {/* Keeps the footer's last lines clear of the bar. */}
      <div className="h-20 md:hidden print:hidden" aria-hidden />
      <div className="md:hidden print:hidden fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-hairline bg-paper/95 backdrop-blur-xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
        <Link
          href="/medical/book?source=mobile-bar"
          className="flex-1 inline-flex items-center justify-center py-3 bg-ink text-text-on-dark font-semibold text-small rounded-full"
        >
          Book a session
        </Link>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-border-strong text-ink font-semibold text-small rounded-full"
        >
          <MessageCircle className="w-4 h-4" aria-hidden /> WhatsApp
        </a>
      </div>
    </>
  );
}
