import * as React from "react";
import { cn } from "@/lib/utils";

interface LabeledHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  type: "source" | "target";
  position: "left" | "right" | "top" | "bottom";
  handleClassName?: string;
  labelClassName?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
}

export const LabeledHandle = React.forwardRef<HTMLDivElement, LabeledHandleProps>(
  ({ id, title, type, position, className, handleClassName, labelClassName, onMouseDown, onMouseUp, ...props }, ref) => {
    const positionClass = {
      left: "left-0 -translate-x-1/2",
      right: "right-0 translate-x-1/2",
      top: "top-0 -translate-y-1/2",
      bottom: "bottom-0 translate-y-1/2"
    }[position];

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        <div
          className={cn(
            "relative h-3 w-3 rounded-full border-2 border-primary bg-background cursor-pointer hover:bg-primary transition-colors",
            positionClass,
            handleClassName
          )}
          data-handleid={id}
          data-handletype={type}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        />
        <span className={cn("text-xs", labelClassName)}>{title}</span>
      </div>
    );
  }
);

LabeledHandle.displayName = "LabeledHandle";
