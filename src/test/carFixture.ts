import type { PublicCar } from "@/modules/landing/model/fleet";

export const publicCar = (over: Partial<PublicCar> = {}): PublicCar => ({
  id: "v1", name: "Jetta Confortline", category: "economy", seats: 5, gear: "automatico", year: 2014, color: "Preto",
  fuel: "flex", doors: 4, features: ["ar_condicionado", "multimidia"], description: "Sedã confortável.", photo_id: "p1", ...over,
});
