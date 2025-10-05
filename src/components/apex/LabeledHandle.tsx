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
  type,
  ...props
}: LabeledHandleProps) {
  if (!type) {
    console.warn('LabeledHandle requer type="source" ou "target"');
  }

  const isHorizontal = position === Position.Left || position === Position.Right;
  const flexDir = isHorizontal ? 'flex-row' : 'flex-col';

  return (
    <div className={cn(`flex items-center gap-2 ${flexDir}`, className)}>
      {(position === Position.Left || position === Position.Top) && (
        <Handle
          type={type}
          position={position}
          {...props}
          className={cn(
            "!w-3 !h-3 !border-2 !border-primary !bg-background",
            handleClassName
          )}
        />
      )}
      <span className={cn("text-sm", labelClassName)}>{title}</span>
      {(position === Position.Right || position === Position.Bottom) && (
        <Handle
          type={type}
          position={position}
          {...props}
          className={cn(
            "!w-3 !h-3 !border-2 !border-primary !bg-background",
            handleClassName
          )}
        />
      )}
    </div>
  );
}
