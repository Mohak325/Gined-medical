import { formatCurrency } from "@/lib/medical/format";
import { type CollegeCourse } from "@/lib/medical/mockData";
import { ShieldAlert, IndianRupee } from "lucide-react";

export default function CollegeFeesBreakdown({ courses }: { courses: CollegeCourse[] }) {
  if (courses.length === 0) return null;

  return (
    <div className="space-y-6">
      {courses.map((course) => (
        <div key={`${course.track}-${course.course}`} className="bg-paper border border-hairline rounded-[var(--radius-md)] p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-h3 text-text-main">{course.course}</h3>
            <span className="bg-paper-dim text-text-muted px-2 py-1 rounded-[var(--radius-sm)] text-micro uppercase tracking-wider">
              {course.track}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-paper-bright border border-hairline rounded-[var(--radius-sm)] p-4 flex flex-col justify-center">
              <span className="text-small text-text-muted flex items-center gap-2 mb-1">
                <IndianRupee className="w-4 h-4" /> Annual Fees
              </span>
              <span className="text-h2 text-text-main tabular-nums tracking-tight">
                {formatCurrency(course.fees)}
              </span>
            </div>

            {course.bondYears > 0 ? (
              <>
                <div className="bg-ambitious/5 border border-ambitious/20 rounded-[var(--radius-sm)] p-4 flex flex-col justify-center">
                  <span className="text-small text-ambitious flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4" /> Service Bond
                  </span>
                  <span className="text-h2 text-ambitious tabular-nums tracking-tight">
                    {course.bondYears} Year{course.bondYears > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="bg-ambitious/5 border border-ambitious/20 rounded-[var(--radius-sm)] p-4 flex flex-col justify-center">
                  <span className="text-small text-ambitious flex items-center gap-2 mb-1">
                    Bond Penalty
                  </span>
                  <span className="text-h2 text-ambitious tabular-nums tracking-tight">
                    {formatCurrency(course.bondPenalty)}
                  </span>
                </div>
              </>
            ) : (
              <div className="md:col-span-2 bg-safe/5 border border-safe/20 rounded-[var(--radius-sm)] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-safe/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-safe" />
                </div>
                <div>
                  <h4 className="text-body font-semibold text-safe">No Rural Service Bond</h4>
                  <p className="text-small text-safe/80">This college does not have a mandatory service bond penalty.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
