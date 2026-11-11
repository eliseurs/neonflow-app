import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { renderPage } from "@/test/render";
import { actionsFor, downloadName, type ContractDocument, type ContractVersion } from "./model/contract.types";
import { ContractsPage } from "./pages/ContractsPage";
import { ContractVersionPage } from "./pages/ContractVersionPage";
import { contractService } from "./services/contract.service";

vi.mock("./services/contract.service", () => ({
  contractService: { list: vi.fn(), versions: vi.fn(), createVersion: vi.fn(), version: vi.fn(), addEvent: vi.fn() },
}));

const loginAs = (role: string) =>
  useAuthStore.setState({ token: "t", expiresAt: "2099-01-01T00:00:00Z", user: { id: "u1", name: "Admin Teste", email: "a@neonflow.test", role } } as never);

beforeEach(() => {
  vi.resetAllMocks();
  useAuthStore.setState({ token: null, expiresAt: null, user: null });
});

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
    expect(screen.getByRole("link", { name: "Abrir · baixar · editar" })).toHaveAttribute("href", "/contratos/versoes/v4");
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

  const minuta: ContractVersion = {
    id: "v4", version: 1, label: "v0.4", sha256: sha, status: "minuta", created_at: "2026-11-08T14:00:00-03:00",
    document_code: "04", document_title: "Ordem de Locação de Veículo sem Motorista", body: "1.1. Texto original", events: [], comments: [],
  };

  it("baixa o texto da versão como .md", async () => {
    vi.mocked(contractService.version).mockResolvedValue(minuta);
    const create = vi.fn(() => "blob:x");
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderPage(<ContractVersionPage />, { path: "/contratos/versoes/:id", route: "/contratos/versoes/v4" });
    fireEvent.click(await screen.findByRole("button", { name: /Baixar .md/ }));
    expect(create).toHaveBeenCalledTimes(1);
    expect((click.mock.instances[0] as unknown as HTMLAnchorElement).download).toBe("contrato-04-v1-v0.4.md");
    expect(revoke).toHaveBeenCalledWith("blob:x");
    click.mockRestore();
  });

  it("admin edita o texto no sistema e salva como nova versão", async () => {
    loginAs("admin");
    vi.mocked(contractService.version).mockResolvedValue(minuta);
    vi.mocked(contractService.createVersion).mockResolvedValue({ id: "v5", version: 2, label: "v0.5", sha256: sha, status: "minuta", created_at: "" });
    renderPage(<ContractVersionPage />, { path: "/contratos/versoes/:id", route: "/contratos/versoes/v4" });
    fireEvent.click(await screen.findByRole("button", { name: /Editar texto/ }));
    const save = screen.getByRole("button", { name: "Salvar como nova versão" });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Texto do contrato"), { target: { value: "1.1. Texto corrigido" } });
    fireEvent.change(screen.getByLabelText("Rótulo da nova versão (opcional)"), { target: { value: "v0.5" } });
    fireEvent.click(save);
    await waitFor(() => expect(contractService.createVersion).toHaveBeenCalledWith("04", "v0.5", "1.1. Texto corrigido"));
    // Vai para a versão nova.
    await waitFor(() => expect(contractService.version).toHaveBeenCalledWith("v5"));
  });

  it("revisora não vê edição; a aprovação exige a confirmação e manda o hash", async () => {
    loginAs("legal_reviewer");
    vi.mocked(contractService.version).mockResolvedValue({ ...minuta, status: "enviado_para_revisao" });
    vi.mocked(contractService.addEvent).mockResolvedValue({
      id: "e1", action: "aprovar", status: "aprovado_pela_revisora", note: "", sha256: sha, user_id: "u1", user_name: "Revisora", role: "legal_reviewer", created_at: "",
    });
    renderPage(<ContractVersionPage />, { path: "/contratos/versoes/:id", route: "/contratos/versoes/v4" });
    const approve = await screen.findByRole("button", { name: "Aprovar esta versão" });
    expect(screen.queryByRole("button", { name: /Editar texto/ })).toBeNull();
    expect(approve).toBeDisabled();
    expect(screen.getByRole("button", { name: "Pedir ajustes" })).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Li a íntegra da versão 1/));
    fireEvent.click(approve);
    await waitFor(() =>
      expect(contractService.addEvent).toHaveBeenCalledWith("v4", { action: "aprovar", note: "", sha256: sha, confirm: true }),
    );
  });

  it("mostra só as ações possíveis para a situação e o papel", () => {
    const names = (status: Parameters<typeof actionsFor>[0], role?: string) => actionsFor(status, role).map((a) => a.action);
    expect(names("minuta", "admin")).toEqual(["enviar"]);
    expect(names("minuta", "legal_reviewer")).toEqual([]);
    expect(names("enviado_para_revisao", "admin")).toEqual(["aprovar", "solicitar_ajustes"]);
    expect(names("aprovado_pela_revisora", "legal_reviewer")).toEqual(["revogar"]);
    expect(names("liberacao_administrativa", "admin")).toEqual(["publicar", "revogar"]);
    expect(names("publicado", "admin")).toEqual([]);
    expect(names("minuta", "central")).toEqual([]);
    expect(downloadName({ document_code: "01", version: 3, label: " v 0.6/final " })).toBe("contrato-01-v3-v-0.6-final.md");
    expect(downloadName({ document_code: "02", version: 1, label: "" })).toBe("contrato-02-v1.md");
  });
});
