import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = React.forwardRef<
  React.ElementRef<typeof Sonner>,
  ToasterProps
>(({ ...props }, ref) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      ref={ref}
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        } as React.CSSProperties
      }
      {...props} />
  );
})
Toaster.displayName = "Toaster"

export { Toaster }
