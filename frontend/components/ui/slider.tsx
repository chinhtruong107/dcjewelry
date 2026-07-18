"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
Slider.displayName = "Slider"

export { Slider }
