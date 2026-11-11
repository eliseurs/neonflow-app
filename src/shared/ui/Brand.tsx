import { cn } from "@/shared/lib/cn";

interface WordmarkProps {
  className?: string;
  /** Altura do símbolo; o texto acompanha. */
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { mark: "h-7 w-7", text: "text-lg" },
  md: { mark: "h-9 w-9", text: "text-[22px]" },
  lg: { mark: "h-14 w-14", text: "text-4xl" },
};

/** Logo do Neon Flow em linha: símbolo (anel, estrada e seta) e "neon flow" em Poppins 600, dourados.
 *  O logo completo (empilhado, com moldura) é `/brand/neonflow-icone-app.svg`. */
export function Wordmark({ className, size = "md" }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img src="/brand/neonflow-simbolo.svg" alt="" className={sizes[size].mark} />
      <span className={cn("font-brand font-semibold lowercase leading-none tracking-[-0.02em] text-[#D4AC62]", sizes[size].text)}>
        neon flow
      </span>
    </span>
  );
}
