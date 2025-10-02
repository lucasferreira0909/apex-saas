import * as React from "react";
import { cn } from "@/lib/utils";

const DatabaseSchemaNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm min-w-[200px]",
      className
    )}
    {...props}
  />
));
DatabaseSchemaNode.displayName = "DatabaseSchemaNode";

const DatabaseSchemaNodeHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-4 bg-primary text-primary-foreground rounded-t-lg font-semibold",
      className
    )}
    {...props}
  />
));
DatabaseSchemaNodeHeader.displayName = "DatabaseSchemaNodeHeader";

const DatabaseSchemaNodeBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-0", className)}
    {...props}
  />
));
DatabaseSchemaNodeBody.displayName = "DatabaseSchemaNodeBody";

const DatabaseSchemaTableRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center border-b last:border-b-0 hover:bg-muted/50 transition-colors",
      className
    )}
    {...props}
  />
));
DatabaseSchemaTableRow.displayName = "DatabaseSchemaTableRow";

const DatabaseSchemaTableCell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-3 text-sm", className)}
    {...props}
  />
));
DatabaseSchemaTableCell.displayName = "DatabaseSchemaTableCell";

export {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
};
