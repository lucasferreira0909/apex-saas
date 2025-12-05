import * as React from 'react';
import { flexRender } from '@tanstack/react-table';
import { useDataGrid } from './data-grid';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface DataGridTableProps {
  className?: string;
}

export function DataGridTable({ className }: DataGridTableProps) {
  const { table } = useDataGrid();

  return (
    <table className={cn('w-full caption-bottom text-sm', className)}>
      <thead className="border-b border-border bg-muted/50">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta as { headerClassName?: string } | undefined;
              const canSort = header.column.getCanSort();
              const sortDirection = header.column.getIsSorted();

              return (
                <th
                  key={header.id}
                  className={cn(
                    'h-11 px-4 text-left align-middle font-medium text-muted-foreground',
                    canSort && 'cursor-pointer select-none hover:text-foreground',
                    meta?.headerClassName
                  )}
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                >
                  <div className="flex items-center gap-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {canSort && (
                      <span className="text-muted-foreground/60">
                        {sortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : sortDirection === 'desc' ? (
                          <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as { cellClassName?: string } | undefined;
                return (
                  <td
                    key={cell.id}
                    className={cn('p-4 align-middle text-foreground', meta?.cellClassName)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={table.getAllColumns().length}
              className="h-24 text-center text-muted-foreground"
            >
              Nenhum resultado encontrado.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
