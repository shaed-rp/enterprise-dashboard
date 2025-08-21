import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        data-slot="skeleton"
        ref={ref}
        className={cn("bg-accent animate-pulse rounded-md", className)}
        {...props} />
    );
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
