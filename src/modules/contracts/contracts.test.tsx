import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import type { ContractDocument, ContractVersion } from "./model/contract.types";
import { ContractsPage } from "./pages/ContractsPage";
import { ContractVersionPage } from "./pages/ContractVersionPage";
import { contractService } from "./services/contract.service";

vi.mock("./services/contract.service", () => ({
  contractService: { list: vi.fn(), versions: vi.fn(), createVersion: vi.fn(), version: vi.fn() },
}));

beforeEach(() => vi.resetAllMocks());

const sha = "183697cf9a2df2038bda43f77c144d974d4a3d203119d3d4c47c3fa46737adb6";
const docs: ContractDocument[] = [
  { id: "d1", code: "01", title: "Termos Gerais de Uso e Intermediação", latest: null },
  {
    id: "d4", code: "04", title: "Ordem de Locação de Veículo sem Motorista",
    latest: { id: "v4", version: 1, label: "v0.4", sha256: sha, status: "enviado_para_revisao", created_at: "2026-11-08T14:00:00-03:00" },
  },
];

// O jsdom 20 não tem Blob.text(); o arquivo do teste traz o próprio.
function textFile(name: string, content: string): File {
  const f = new File([content], name, { type: "text/markdown" });
  Object.defineProperty(f, "text", { value: () => Promise.resolve(content) });
  return f;
}

describe("Contratos", () => {
  it("lista os contratos com a situação e o hash da última versão", async () => {
    vi.mocked(contractService.list).mockResolvedValue(docs);
    renderPage(<ContractsPage />);
    expect(await screen.findByText("Termos Gerais de Uso e Intermediação")).toBeInTheDocument();
    expect(screen.getByText("Sem texto")).toBeInTheDocument();
    expect(screen.getByText("Em revisão")).toBeInTheDocument();
    expect(screen.getByText(/Versão 1 \(v0.4\)/)).toBeInTheDocument();
    expect(screen.getByText("183697cf9a2d…")).toHaveAttribute("title", sha);
    expect(screen.getByRole("link", { name: "Ver texto" })).toHaveAttribute("href", "/contratos/versoes/v4");
  });

  it("envia o arquivo do contrato como versão nova, com o rótulo", async () => {
    vi.mocked(contractService.list).mockResolvedValue(docs);
    vi.mocked(contractService.createVersion).mockResolvedValue({
      id: "v1", version: 1, label: "v0.4", sha256: sha, status: "minuta", created_at: "",
    });
    renderPage(<ContractsPage />);
    const input = await screen.findByLabelText("Arquivo (.md ou .txt)", { selector: "#contract-file-01" });
    const btn = screen.getAllByRole("button", { name: /Enviar versão/ })[0];
    expect(btn).toBeDisabled();
    fireEvent.change(input, { target: { files: [textFile("01_termos_gerais_v0.4.md", "# TERMOS GERAIS\n1.1. Texto")] } });
    fireEvent.change(screen.getAllByLabelText("Rótulo (opcional)")[0], { target: { value: "v0.4" } });
    fireEvent.click(btn);
    await waitFor(() => expect(contractService.createVersion).toHaveBeenCalledWith("01", "v0.4", "# TERMOS GERAIS\n1.1. Texto"));
  });

  it("recusa arquivo que não é .md nem .txt", async () => {
    vi.mocked(contractService.list).mockResolvedValue(docs);
    renderPage(<ContractsPage />);
    const input = await screen.findByLabelText("Arquivo (.md ou .txt)", { selector: "#contract-file-01" });
    fireEvent.change(input, { target: { files: [new File(["%PDF"], "contrato.pdf", { type: "application/pdf" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent("Envie um arquivo .md ou .txt.");
    expect(screen.getAllByRole("button", { name: /Enviar versão/ })[0]).toBeDisabled();
  });

  it("mostra o erro da API no envio", async () => {
    vi.mocked(contractService.list).mockResolvedValue(docs);
    vi.mocked(contractService.createVersion).mockRejectedValue(new Error("falhou"));
    renderPage(<ContractsPage />);
    const input = await screen.findByLabelText("Arquivo (.md ou .txt)", { selector: "#contract-file-01" });
    fireEvent.change(input, { target: { files: [textFile("a.txt", "x")] } });
    fireEvent.click(screen.getAllByRole("button", { name: /Enviar versão/ })[0]);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("mostra o texto integral, o hash, o histórico e os comentários da versão", async () => {
    const v: ContractVersion = {
      id: "v4", version: 1, label: "v0.4", sha256: sha, status: "aprovado_pela_revisora", created_at: "2026-11-08T14:00:00-03:00",
      document_code: "04", document_title: "Ordem de Locação de Veículo sem Motorista", body: "### 4. Preço, pagamento e caução\n4.2. Caução...",
      events: [{ id: "e1", action: "aprovar", status: "aprovado_pela_revisora", note: "ok", sha256: sha, user_id: "u1", user_name: "Admin Teste", role: "admin", created_at: "2026-11-08T15:00:00-03:00" }],
      comments: [{ id: "c1", clause: "4.2", kind: "correcao", body: "Definir prazo", proposed_text: "Em até [X] dias", user_id: "u1", user_name: "Admin Teste", role: "admin", created_at: "2026-11-08T14:30:00-03:00" }],
    };
    vi.mocked(contractService.version).mockResolvedValue(v);
    renderPage(<ContractVersionPage />, { path: "/contratos/versoes/:id", route: "/contratos/versoes/v4" });
    expect(await screen.findByText("Ordem de Locação de Veículo sem Motorista")).toBeInTheDocument();
    expect(contractService.version).toHaveBeenCalledWith("v4");
    expect(screen.getByText(`SHA-256 ${sha}`)).toBeInTheDocument();
    expect(screen.getByText(/4.2. Caução/)).toBeInTheDocument();
    expect(screen.getByText(/Aprovado · Admin Teste \(admin\) · ok/)).toBeInTheDocument();
    expect(screen.getByText(/Cláusula 4.2 · correção/)).toBeInTheDocument();
    expect(screen.getByText(/Redação proposta: Em até \[X\] dias/)).toBeInTheDocument();
  });
});
