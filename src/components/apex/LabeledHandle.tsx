import { Handle, HandleProps, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface LabeledHandleProps extends HandleProps {
  title: string;
  className?: string;
  handleClassName?: string;
  labelClassName?: string;
}

export function LabeledHandle({
  title,
  className,
  handleClassName,
  labelClassName,
  position,
  ...props
}: LabeledHandleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {position === Position.Left && (
        <Handle
          position={position}
          {...props}
          className={cn(
            "!w-4 !h-4 !border-2 !border-primary !bg-background",
            handleClassName
          )}
        />
      )}
      <span className={cn("text-sm", labelClassName)}>{title}</span>
      {position === Position.Right && (
        <Handle
          position={position}
          {...props}
          className={cn(
            "!w-4 !h-4 !border-2 !border-primary !bg-background",
            handleClassName
          )}
        />
      )}
    </div>
  );
}
