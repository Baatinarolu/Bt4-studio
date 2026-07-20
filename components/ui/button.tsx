"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn",
          {
            "btn-primary h-10 px-5": variant === "default",
            "btn-secondary h-10 px-5": variant === "secondary",
            "btn-ghost h-10 px-5": variant === "ghost",
            "border border-border bg-background hover:bg-muted h-10 px-5": variant === "outline",
            "bg-destructive text-destructive-foreground h-10 px-5": variant === "destructive",
          },
          {
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
