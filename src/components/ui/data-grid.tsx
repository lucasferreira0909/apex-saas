import * as React from 'react';
import { Table as TanstackTable } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

interface DataGridContextValue<T = any> {
  table: TanstackTable<T>;
  recordCount: number;
}

const DataGridContext = React.createContext<DataGridContextValue | null>(null);

export function useDataGrid<T = any>() {
  const context = React.useContext(DataGridContext);
  if (!context) {
    throw new Error('DataGrid components must be used within DataGrid');
  }
  return context as DataGridContextValue<T>;
}

interface DataGridProps<T> {
  table: TanstackTable<T>;
  recordCount: number;
  children: React.ReactNode;
  className?: string;
}

export function DataGrid<T>({ table, recordCount, children, className }: DataGridProps<T>) {
  return (
    <DataGridContext.Provider value={{ table, recordCount }}>
      <div className={cn('w-full', className)}>{children}</div>
    </DataGridContext.Provider>
  );
}

interface DataGridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function DataGridContainer({ children, className }: DataGridContainerProps) {
  return (
    <div className={cn('rounded-md border border-border bg-card', className)}>
      {children}
    </div>
  );
}
