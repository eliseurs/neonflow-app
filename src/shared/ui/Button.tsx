import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { buttonClass, type Variant } from "./buttonClass";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClass(variant), className)} {...props} />;
}
