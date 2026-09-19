import React from "react";
import { type CollegeCourse, type CutoffEntry } from "@/lib/medical/mockData";
import { Network, Users, TrendingUp } from "lucide-react";

interface CollegeBranchesMatrixProps {
  courses: CollegeCourse[];
  cutoffs: CutoffEntry[];
}

export default function CollegeBranchesMatrix({ courses, cutoffs }: CollegeBranchesMatrixProps) {
  // We'll show UG first, then PG
  const ugCourses = courses.filter((c) => c.track === "ug");
  const pgCourses = courses.filter((c) => c.track === "pg");

  const renderTable = (courseList: CollegeCourse[], trackLabel: string) => {
    if (courseList.length === 0) return null;

    return (
      <div className="mb-10 last:mb-0">
        <h3 className="text-h4 text-text-main mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-gold" />
          {trackLabel} Branches
        </h3>
        <div className="overflow-x-auto bg-paper-bright border border-hairline rounded-[var(--radius-md)] shadow-sm">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-paper border-b border-hairline">
                <th className="py-4 px-6 font-semibold text-small text-text-muted">Course / Branch</th>
                <th className="py-4 px-6 font-semibold text-small text-text-muted">Total Seats</th>
                <th className="py-4 px-6 font-semibold text-small text-text-muted">Benchmark Opening Rank</th>
                <th className="py-4 px-6 font-semibold text-small text-text-muted">Benchmark Closing Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {courseList.map((course, idx) => {
                // Find the benchmark cutoff (General, AIQ, Round 1, latest year)
                // If not AIQ, we fallback to whatever is available by sorting
                let benchmark = cutoffs
                  .filter(c => c.course === course.course && c.category === "general" && c.round === 1)
                  .sort((a, b) => b.year - a.year)[0]; // Latest year

                return (
                  <tr key={idx} className="hover:bg-paper/50 transition-colors">
                    <td className="py-4 px-6 text-small font-medium text-text-main">
                      {course.course}
                    </td>
                    <td className="py-4 px-6 text-small text-text-main">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-text-muted" />
                        {course.totalSeats}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-small text-text-main">
                      {benchmark ? (
                        <div className="flex items-center gap-2 text-gold-deep">
                          <TrendingUp className="w-4 h-4 opacity-70" />
                          #{benchmark.openingRank.toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-text-muted italic">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-small text-text-main">
                      {benchmark ? (
                        <div className="font-semibold">
                          #{benchmark.closingRank.toLocaleString()}
                          <span className="text-micro text-text-muted font-normal ml-2">
                            ({benchmark.year} {benchmark.quota.toUpperCase()})
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">N/A</span>
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
    return (
      <div className="text-center py-12 bg-paper-bright border border-hairline rounded-[var(--radius-md)]">
        <p className="text-text-muted">No branch or course data available.</p>
      </div>
    );
  }

  return (
    <div>
      {renderTable(ugCourses, "Undergraduate (UG)")}
      {renderTable(pgCourses, "Postgraduate (PG)")}
    </div>
  );
}
