import type { ElementType, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useReveal } from "@/shared/lib/useReveal";

interface RevealProps {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
  id?: string;
}

export function Reveal({ as: Tag = "div", delay = 0, className, children, id }: RevealProps) {
  const ref = useReveal<HTMLElement>(delay);
  return (
    <Tag ref={ref} id={id} className={cn("reveal", className)}>
      {children}
    </Tag>
  );
}
