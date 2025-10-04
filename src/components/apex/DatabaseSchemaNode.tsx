import * as React from "react";
import { cn } from "@/lib/utils";

const DatabaseSchemaNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border-2 border-primary bg-card text-card-foreground shadow-lg min-w-[240px]",
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
      "flex items-center gap-2 p-3 bg-primary text-primary-foreground font-semibold border-b-2 border-primary rounded-t-md",
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
    className={cn("divide-y divide-border", className)}
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
    className={cn("flex items-center gap-2 p-2 hover:bg-accent/50 transition-colors", className)}
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
    className={cn("flex items-center text-sm", className)}
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
