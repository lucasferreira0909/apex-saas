import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

interface DataGridContextValue<T> {
  table: Table<T>;
  recordCount: number;
}

const DataGridContext = React.createContext<DataGridContextValue<any> | null>(null);

export function useDataGridContext<T>() {
  const context = React.useContext(DataGridContext);
  if (!context) {
    throw new Error('DataGrid components must be used within DataGrid');
  }
  return context as DataGridContextValue<T>;
}

interface DataGridProps<T> {
  table: Table<T>;
  recordCount: number;
  children: React.ReactNode;
}

export function DataGrid<T>({ table, recordCount, children }: DataGridProps<T>) {
  return (
    <DataGridContext.Provider value={{ table, recordCount }}>
      {children}
    </DataGridContext.Provider>
  );
}

interface DataGridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function DataGridContainer({ children, className }: DataGridContainerProps) {
  return (
    <div className={cn('rounded-md border bg-card', className)}>
      {children}
    </div>
  );
}
