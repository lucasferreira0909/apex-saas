import * as React from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface LabeledHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  type: "source" | "target";
  position: "left" | "right" | "top" | "bottom";
  handleClassName?: string;
  labelClassName?: string;
}

const positionMap = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

export const LabeledHandle = React.forwardRef<HTMLDivElement, LabeledHandleProps>(
  ({ id, title, type, position, className, handleClassName, labelClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 relative", className)}
        {...props}
      >
        <Handle
          type={type}
          position={positionMap[position]}
          id={id}
          className={cn(
            "!h-3 !w-3 !rounded-full !border-2 !bg-background",
            "!border-[hsl(var(--chart-1))]",
            handleClassName
          )}
          style={{ position: 'relative', transform: 'none', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <span className={cn("text-xs", labelClassName)}>{title}</span>
      </div>
    );
  }
);

LabeledHandle.displayName = "LabeledHandle";
