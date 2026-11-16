import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/app/providers/api/client";
import { auditService } from "./audit.service";

vi.mock("@/app/providers/api/client", () => ({ apiClient: { get: vi.fn() } }));

beforeEach(() => vi.mocked(apiClient.get).mockResolvedValue({ status: 200, data: [] }));

describe("auditService", () => {
  it("monta os filtros na query", async () => {
    await auditService.list();
    expect(apiClient.get).toHaveBeenLastCalledWith("/audit");
    await auditService.list({ userId: "u1", denied: true });
    expect(apiClient.get).toHaveBeenLastCalledWith("/audit?user_id=u1&denied=true");
  });
});
