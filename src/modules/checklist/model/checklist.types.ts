// Espelha internal/domain/checklist/entity.go da API: itens do checklist de devolução (RN-01.6).
export interface ChecklistItem {
  id: string;
  key: string;
  label: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItemRequest {
  label: string;
  position: number;
  active?: boolean;
}

export function activeItems(items: ChecklistItem[] = []): ChecklistItem[] {
  return items.filter((i) => i.active).sort((a, b) => a.position - b.position);
}
