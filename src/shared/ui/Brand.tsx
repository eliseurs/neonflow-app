import { cn } from "@/shared/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <img src="/brand/neonflow-simbolo.svg" alt="" className="h-9 w-9" />
      <span className="font-serif text-lg font-light tracking-[0.16em] text-bone">NEON FLOW</span>
    </span>
  );
}
