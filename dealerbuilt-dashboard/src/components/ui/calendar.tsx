import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CalendarProps {
  className?: string
  classNames?: {
    months?: string
    month?: string
    caption?: string
    caption_label?: string
    nav?: string
    nav_button?: string
    nav_button_previous?: string
    nav_button_next?: string
    table?: string
    head_row?: string
    head_cell?: string
    row?: string
    cell?: string
    day?: string
    day_range_start?: string
    day_range_end?: string
    day_selected?: string
    day_today?: string
    day_outside?: string
    day_disabled?: string
    day_range_middle?: string
    day_hidden?: string
  }
  showOutsideDays?: boolean
  mode?: "single" | "multiple" | "range"
  selected?: Date | Date[] | { from: Date; to: Date }
  onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void
  disabled?: Date[] | ((date: Date) => boolean)
  initialFocus?: boolean
  captionLayout?: "buttons" | "dropdown"
  fromYear?: number
  toYear?: number
  fromMonth?: Date
  toMonth?: Date
  fromDate?: Date
  toDate?: Date
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  ISOWeek?: boolean
  fixedWeeks?: boolean
  numberOfMonths?: number
  pagedNavigation?: boolean
  month?: Date
  onMonthChange?: (month: Date) => void
  defaultMonth?: Date
  modifiers?: Record<string, Date | Date[] | ((date: Date) => boolean)>
  modifiersStyles?: Record<string, React.CSSProperties>
  modifiersClassNames?: Record<string, string>
  locale?: any
  dir?: "ltr" | "rtl"
  id?: string
  name?: string
  required?: boolean
  form?: string
  children?: React.ReactNode
}

const Calendar = React.forwardRef<
  HTMLDivElement,
  CalendarProps
>(({ className, classNames, showOutsideDays = true, ...props }, _ref) => {
  return (
    <DayPicker
      {...(props as any)}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          (props as any).mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props} />
  );
})
Calendar.displayName = "Calendar"

export { Calendar }
