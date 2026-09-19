"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type College, type SeatEntry } from "@/lib/medical/mockData";
import { motion, AnimatePresence } from "framer-motion";

type SeatWithCollege = SeatEntry & { college: College };
const columnHelper = createColumnHelper<SeatWithCollege>();

export default function SeatTableView({ seats }: { seats: SeatWithCollege[] }) {
  const maxSeats = Math.max(...seats.map(s => s.seats), 10); // for visual scaling

  const columns = useMemo(
    () => [
      columnHelper.accessor("college.name", {
        header: "College & Location",
        cell: (info) => (
          <div className="flex flex-col max-w-[280px]">
            <Link
              href={`/medical/college/${info.row.original.collegeId}`}
              className="font-bold text-text-main hover:text-gold transition-colors truncate"
            >
              {info.getValue()}
            </Link>
            <div className="text-micro text-text-muted mt-1 uppercase tracking-wider">
              {info.row.original.college.city}, {info.row.original.college.state}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("course", {
        header: "Course",
        cell: (info) => <span className="text-small font-medium text-text-main">{info.getValue()}</span>,
      }),
      columnHelper.accessor("quota", {
        header: "Quota / Cat",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex px-2 py-1 rounded-[var(--radius-sm)] bg-gold/10 text-gold-deep text-micro font-bold uppercase tracking-wider">
              {info.getValue()}
            </span>
            <span className="inline-flex px-2 py-1 rounded-[var(--radius-sm)] bg-paper-dim border border-hairline/50 text-text-muted text-micro font-bold uppercase tracking-wider">
              {info.row.original.category}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("seats", {
        header: "Available Seats",
        cell: (info) => {
          const val = info.getValue();
          const percentage = (val / maxSeats) * 100;
          return (
            <div className="flex flex-col gap-2 min-w-[120px]">
              <span className="text-small font-bold text-text-main">
                {val} <span className="text-text-muted font-normal">seats</span>
              </span>
              <div className="w-full h-1.5 bg-paper-dim rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gold rounded-full"
                />
              </div>
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
    <div className="border border-hairline rounded-[var(--radius-lg)] overflow-hidden bg-paper-bright shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-paper border-b border-hairline/80">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-micro text-text-muted uppercase tracking-wider font-bold whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  key={row.original.collegeId + row.original.course + row.original.quota + row.original.category}
                  className="border-b border-hairline/60 last:border-0 hover:bg-gold/5 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
