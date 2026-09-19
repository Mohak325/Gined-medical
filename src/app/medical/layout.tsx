import { TrackProvider } from "@/lib/medical/TrackProvider";
import { CompareProvider } from "@/lib/medical/CompareProvider";

import CompareTray from "@/components/medical/compare/CompareTray";

/**
 * Medical section layout.
 * Provides Track state (UG/PG) and Compare tray state across all medical routes.
 */
export default function MedicalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrackProvider>
      <CompareProvider>
        <div className="min-h-screen flex flex-col bg-background relative">
          {children}
          <CompareTray />
        </div>
      </CompareProvider>
    </TrackProvider>
  );
}
