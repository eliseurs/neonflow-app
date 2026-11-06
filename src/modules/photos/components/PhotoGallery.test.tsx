import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "@/test/render";
import type { Photo } from "../model/photo.types";
import { photoService } from "../services/photo.service";
import { PhotoGallery } from "./PhotoGallery";

vi.mock("../services/photo.service", () => ({
  photoService: { vehicle: vi.fn(), uploadVehicle: vi.fn(), booking: vi.fn(), uploadBooking: vi.fn(), remove: vi.fn(), cover: vi.fn() },
}));

const photo = (over: Partial<Photo> = {}): Photo => ({
  id: "p1", owner_type: "veiculo", owner_id: "v1", stage: "", content_type: "image/jpeg", size_bytes: 1000, position: 0,
  url: "https://bucket.test/p1.jpg", created_at: "", ...over,
});
const file = (name: string, type: string, size = 1000) => new File([new Uint8Array(size)], name, { type });

beforeEach(() => vi.resetAllMocks());

describe("PhotoGallery", () => {
  it("mostra as fotos do veículo com a capa, envia várias e escolhe outra capa", async () => {
    vi.mocked(photoService.vehicle).mockResolvedValue([photo(), photo({ id: "p2", url: "https://bucket.test/p2.jpg", position: 1 })]);
    vi.mocked(photoService.uploadVehicle).mockResolvedValue(photo({ id: "p3" }));
    vi.mocked(photoService.cover).mockResolvedValue(photo({ id: "p2" }));
    vi.mocked(photoService.remove).mockResolvedValue({} as never);
    renderPage(<PhotoGallery target={{ kind: "veiculo", id: "v1" }} label="Foto do carro" />);

    expect(await screen.findByRole("img", { name: "Foto do carro 1" })).toHaveAttribute("src", "https://bucket.test/p1.jpg");
    expect(screen.getByText("Capa")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Enviar fotos: Foto do carro"), {
      target: { files: [file("a.jpg", "image/jpeg"), file("b.png", "image/png")] },
    });
    await waitFor(() => expect(photoService.uploadVehicle).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Usar como capa: Foto do carro 2" }));
    await waitFor(() => expect(photoService.cover).toHaveBeenCalledWith("p2"));
    fireEvent.click(screen.getByRole("button", { name: "Apagar Foto do carro 1" }));
    await waitFor(() => expect(photoService.remove).toHaveBeenCalledWith("p1"));
  });

  it("recusa formato e tamanho no navegador, antes de enviar", async () => {
    vi.mocked(photoService.vehicle).mockResolvedValue([]);
    renderPage(<PhotoGallery target={{ kind: "veiculo", id: "v1" }} label="Foto" />);
    const input = await screen.findByLabelText("Enviar fotos: Foto");
    fireEvent.change(input, { target: { files: [file("doc.pdf", "application/pdf")] } });
    expect(await screen.findByText(/doc.pdf: envie JPEG, PNG ou WebP/)).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [file("grande.jpg", "image/jpeg", 10 * 1024 * 1024 + 1)] } });
    expect(await screen.findByText(/grande.jpg: passa de 10 MB/)).toBeInTheDocument();
    expect(photoService.uploadVehicle).not.toHaveBeenCalled();
  });

  it("na reserva, envia pela etapa e mostra o erro da API", async () => {
    vi.mocked(photoService.booking).mockResolvedValue([]);
    vi.mocked(photoService.uploadBooking).mockRejectedValue(new Error("x"));
    renderPage(<PhotoGallery target={{ kind: "reserva", id: "b1", stage: "devolucao" }} label="Foto da devolução" />);
    fireEvent.change(await screen.findByLabelText("Enviar fotos: Foto da devolução"), { target: { files: [file("a.webp", "image/webp")] } });
    await waitFor(() => expect(photoService.uploadBooking).toHaveBeenCalledWith("b1", "devolucao", expect.any(File)));
    expect(await screen.findByText(/Não foi possível enviar/)).toBeInTheDocument();
  });

  it("sem envio permitido, só mostra", async () => {
    vi.mocked(photoService.booking).mockResolvedValue([]);
    renderPage(<PhotoGallery target={{ kind: "reserva", id: "b1", stage: "entrega" }} canUpload={false} label="Foto da entrega" />);
    expect(await screen.findByText("Sem fotos.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Adicionar fotos/ })).toBeNull();
  });
});
