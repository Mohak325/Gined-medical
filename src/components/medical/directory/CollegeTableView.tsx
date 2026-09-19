"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type College } from "@/lib/medical/mockData";
import AddToCompareButton from "@/components/medical/shared/AddToCompareButton";

const columnHelper = createColumnHelper<College>();

export default function CollegeTableView({ colleges }: { colleges: College[] }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "College",
        cell: (info) => (
          <div>
            <Link
              href={`/medical/college/${info.row.original.id}`}
              className="font-semibold text-text-main hover:text-gold-deep transition-colors"
            >
              {info.getValue()}
            </Link>
            <div className="text-small text-text-muted mt-0.5">
              {info.row.original.city}, {info.row.original.state}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <span className="inline-flex px-2 py-0.5 rounded-[var(--radius-sm)] bg-paper-dim text-small text-text-muted">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("established", {
        header: "Est.",
        cell: (info) => (
          <span className="text-small text-text-muted">{info.getValue() || "—"}</span>
        ),
      }),
      columnHelper.accessor("hospitalBeds", {
        header: "Beds",
        cell: (info) => (
          <span className="text-small tabular-nums text-text-muted">
            {info.getValue() || "—"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="text-right">
            <AddToCompareButton
              collegeId={info.row.original.id}
              collegeName={info.row.original.name}
            />
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: colleges,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (colleges.length === 0) return null;

  return (
    <div className="border border-hairline rounded-[var(--radius-md)] overflow-hidden bg-paper-bright">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-paper border-b border-hairline">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3 text-micro text-text-muted uppercase tracking-wider font-semibold whitespace-nowrap"
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-hairline last:border-0 hover:bg-paper-dim/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4 align-middle">
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
