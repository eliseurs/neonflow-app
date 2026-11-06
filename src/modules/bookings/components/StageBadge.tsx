import { Badge } from "@/shared/ui/Badge";
import { STAGE, type Stage } from "../model/booking.types";

export function StageBadge({ stage }: { stage: Stage }) {
  return <Badge tone={STAGE[stage].tone}>{STAGE[stage].label}</Badge>;
}
