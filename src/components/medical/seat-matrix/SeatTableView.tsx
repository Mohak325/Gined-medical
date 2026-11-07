"use client";

import { useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { type College, type SeatEntry } from "@/lib/medical/mockData";

type SeatWithCollege = SeatEntry & { college: College };
const columnHelper = createColumnHelper<SeatWithCollege>();
/** Extra classes a column asks for, such as hiding it on phones. */
const columnClass = (meta: unknown) => (meta as { className?: string } | undefined)?.className ?? "";

export default function SeatTableView({ seats }: { seats: SeatWithCollege[] }) {
  // Bars are scaled against the largest row shown.
  const maxSeats = Math.max(...seats.map((s) => s.seats), 10);

  const columns = useMemo(
    () => [
      columnHelper.accessor("college.name", {
        header: "College",
        cell: (info) => (
          <div className="flex flex-col max-w-[170px] sm:max-w-[320px]">
            <Link
              href={`/medical/college/${info.row.original.collegeId}`}
              className="group/link inline-flex items-center gap-1.5 font-semibold text-ink hover:text-gold-deep transition-colors"
            >
              <span className="line-clamp-2">{info.getValue()}</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 -translate-x-1 transition-[opacity,transform] duration-300 group-hover/link:opacity-100 group-hover/link:translate-x-0" aria-hidden />
            </Link>
            <span className="text-micro font-normal tracking-normal text-text-muted mt-0.5">
              {info.row.original.college.city}, {info.row.original.college.state}
              <span className="sm:hidden"> · {info.row.original.course}</span>
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("course", {
        header: "Course",
        meta: { className: "hidden sm:table-cell" },
        cell: (info) => <span className="text-small text-ink">{info.getValue()}</span>,
      }),
      columnHelper.accessor("seats", {
        header: "Seats",
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="flex items-center gap-3 sm:gap-4 min-w-[110px] sm:min-w-[160px]">
              <span className="w-10 sm:w-12 text-right font-[family-name:var(--font-instrument)] text-[1.5rem] leading-none text-ink tabular-nums">{val}</span>
              <span className="relative flex-1 h-1.5 rounded-full bg-ink/[0.07] overflow-hidden" aria-hidden>
                <span className="bar-fill bg-gold rounded-full" style={{ "--s": val / maxSeats } as CSSProperties} />
              </span>
            </div>
          );
        },
      }),
    ],
    [maxSeats]
  );

  const table = useReactTable({
    data: seats,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (seats.length === 0) return null;

  return (
    <div data-reveal="up" className="rounded-[28px] surface-premium overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse sm:min-w-[560px] text-small">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-paper/60 border-b border-hairline">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className={`${columnClass(header.column.columnDef.meta)} px-4 sm:px-5 md:px-6 py-4 text-micro font-semibold text-text-muted whitespace-nowrap`}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-hairline">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.original.collegeId + row.original.course} className="transition-colors hover:bg-gold/[0.06]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={`${columnClass(cell.column.columnDef.meta)} px-4 sm:px-5 md:px-6 py-4 align-middle`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
