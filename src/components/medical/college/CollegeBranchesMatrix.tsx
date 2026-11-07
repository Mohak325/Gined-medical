import { type CollegeCourse, type CutoffEntry } from "@/lib/medical/mockData";
import { formatRank } from "@/lib/medical/format";
import { allRoundsIndex, allRoundsYear, seatGroupKey } from "@/lib/medical/rounds";

interface CollegeBranchesMatrixProps {
  courses: CollegeCourse[];
  cutoffs: CutoffEntry[];
}

// Quotas with their own eligibility rules are never used as the benchmark.
const QUOTA_ORDER = ["aiq", "deemed", "central", "state"];

export default function CollegeBranchesMatrix({ courses, cutoffs }: CollegeBranchesMatrixProps) {
  // UG first, then PG.
  const ugCourses = courses.filter((c) => c.track === "ug");
  const pgCourses = courses.filter((c) => c.track === "pg");
  // How far each seat group reached across every round of the latest full year.
  const allRounds = allRoundsIndex(cutoffs);

  const renderTable = (courseList: CollegeCourse[], trackLabel: string) => {
    if (courseList.length === 0) return null;
    const seats = courseList.reduce((sum, c) => sum + c.totalSeats, 0);

    return (
      <div className="mb-8 last:mb-0">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h3 className="text-eyebrow text-text-muted">{trackLabel}</h3>
          <p className="text-small text-text-muted">
            <span className="font-semibold text-ink tabular-nums">{seats.toLocaleString("en-IN")}</span> seats across {courseList.length} course{courseList.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="overflow-x-auto rounded-[24px] surface-premium">
          <table className="w-full text-left border-collapse sm:min-w-[720px] text-small">
            <thead>
              <tr className="border-b border-hairline bg-paper/60 text-micro font-semibold text-text-muted">
                <th scope="col" className="py-4 px-5">Course</th>
                <th scope="col" className="py-4 px-5 text-right">Seats</th>
                <th scope="col" className="hidden sm:table-cell py-4 px-5 text-right">Round 1 opening</th>
                <th scope="col" className="py-4 px-5 text-right">Round 1 closing</th>
                <th scope="col" className="hidden sm:table-cell py-4 px-5 text-right" title="The furthest rank that got this seat in any round of that year, including the stray round">
                  All rounds closing
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {courseList.map((course, i) => {
                // The benchmark: General, Round 1, latest year, All India first.
                const benchmark =
                  cutoffs
                    .filter((c) => c.course === course.course && c.category === "general" && c.round === 1 && QUOTA_ORDER.includes(c.quota))
                    .sort((a, b) => b.year - a.year || QUOTA_ORDER.indexOf(a.quota) - QUOTA_ORDER.indexOf(b.quota))[0] ??
                  // With no All India figure, show a state's own open seat, clearly labelled as its rank.
                  cutoffs.find((c) => c.course === course.course && c.rankType === "state" && c.round === 1 && ["OC", "SM"].includes(c.stateCategory ?? ""));
                const final = benchmark && allRounds.get(seatGroupKey({ ...benchmark, year: allRoundsYear(benchmark.track) }));

                return (
                  <tr key={`${course.course}-${i}`} className="transition-colors hover:bg-gold/[0.06]">
                    <th scope="row" className="py-4 px-5 font-medium text-ink">{course.course}</th>
                    <td className="py-4 px-5 text-right tabular-nums text-ink">{course.totalSeats}</td>
                    <td className="hidden sm:table-cell py-4 px-5 text-right tabular-nums text-text-muted">{benchmark ? formatRank(benchmark.openingRank) : "—"}</td>
                    <td className="py-4 px-5 text-right">
                      {benchmark ? (
                        <>
                          <span className="font-semibold text-ink tabular-nums">{formatRank(benchmark.closingRank)}</span>
                          <span className="block text-micro font-normal tracking-normal text-text-muted">
                            {benchmark.year} · {benchmark.rankType === "state" ? `${benchmark.state} state rank` : benchmark.quota.toUpperCase()}
                          </span>
                        </>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="hidden sm:table-cell py-4 px-5 text-right">
                      {final ? (
                        <>
                          <span className="font-semibold text-ink tabular-nums">{formatRank(final.closingRank)}</span>
                          <span className="block text-micro font-normal tracking-normal text-text-muted">{final.year}</span>
                        </>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (courses.length === 0) {
    return <p className="rounded-[24px] surface-premium p-6 md:p-7 text-body text-text-muted">We don&apos;t hold course or seat data for this college yet.</p>;
  }

  return (
    <div>
      {renderTable(ugCourses, "Undergraduate")}
      {renderTable(pgCourses, "Postgraduate")}
    </div>
  );
}
