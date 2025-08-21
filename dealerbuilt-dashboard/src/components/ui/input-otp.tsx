"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface InputOTPProps {
  containerClassName?: string
  className?: string
  maxLength: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  autoFocus?: boolean
  pattern?: string
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
  inputType?: "text" | "number" | "tel" | "password"
  textAlign?: "left" | "center" | "right"
  pasteTransformer?: (pasted: string) => string
  pushPasswordManagerStrategy?: "none" | "increase-width"
}

const InputOTP = React.forwardRef<
  HTMLInputElement,
  InputOTPProps
>(({ className, containerClassName, maxLength, ...props }, ref) => {
  return (
    <OTPInput
      ref={ref}
      data-slot="input-otp"
      maxLength={maxLength}
      containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...(props as any)} />
  );
})
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props} />
  );
})
InputOTPGroup.displayName = "InputOTPGroup"

interface InputOTPSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number
}

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  InputOTPSlotProps
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      ref={ref}
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
      {...props}>
      {char}
      {hasFakeCaret && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  return (
    <div ref={ref} data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
})
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
