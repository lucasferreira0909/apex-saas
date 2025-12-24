import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { composeRefs } from "@radix-ui/react-compose-refs"
import { cn } from "@/lib/utils"

type FieldContextValue = {
  id: string
  descriptionId: string
  messageId: string
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

function useFieldContext() {
  const context = React.useContext(FieldContext)
  return context
}

interface FieldProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical"
}

function Field({ orientation = "vertical", className, ...props }: FieldProps) {
  const id = React.useId()
  const descriptionId = `${id}-description`
  const messageId = `${id}-message`

  return (
    <FieldContext.Provider value={{ id, descriptionId, messageId }}>
      <div
        data-slot="field"
        className={cn(
          "grid gap-2",
          orientation === "horizontal" && "flex flex-row items-center gap-3",
          className
        )}
        {...props}
      />
    </FieldContext.Provider>
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"label">) {
  const context = useFieldContext()

  return (
    <label
      data-slot="field-label"
      htmlFor={context?.id}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  const context = useFieldContext()

  return (
    <p
      data-slot="field-description"
      id={context?.descriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FieldMessage({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  const context = useFieldContext()

  if (!children) return null

  return (
    <p
      data-slot="field-message"
      id={context?.messageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
}

const FieldControl = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const context = useFieldContext()
  const innerRef = React.useRef<HTMLElement>(null)

  return (
    <Slot
      data-slot="field-control"
      ref={composeRefs(ref, innerRef)}
      id={context?.id}
      aria-describedby={
        context ? `${context.descriptionId} ${context.messageId}` : undefined
      }
      {...props}
    />
  )
})
FieldControl.displayName = "FieldControl"

function FieldGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("space-y-6", className)}
      {...props}
    />
  )
}

function FieldSet({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("space-y-4", className)}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  )
}

function FieldSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"hr">) {
  return (
    <hr
      data-slot="field-separator"
      className={cn("border-t border-border", className)}
      {...props}
    />
  )
}

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldMessage,
  FieldSeparator,
  FieldSet,
  useFieldContext,
}
