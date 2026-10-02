import axios from "axios";
import type { NftDetail } from "@/@types/nft-detail";
import { api } from "@/lib/api";

export class NftDetailApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "NftDetailApiError";
    this.status = status;
  }
}

function normalizeError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return new NftDetailApiError(
      data?.message ?? "Não foi possível concluir a operação.",
      error.response?.status,
    );
  }
  return new NftDetailApiError("Não foi possível concluir a operação.");
}

export async function getNftDetail(nftId: string, token: string | null) {
  try {
    const response = await api.get<{ nft: NftDetail }>(`/nfts/${nftId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data.nft;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function setFavorite(
  nftId: string,
  token: string,
  isFavorite: boolean,
) {
  try {
    const response = isFavorite
      ? await api.post<{ isFavorite: boolean }>(
          `/favorites/${nftId}`,
          undefined,
          { headers: { Authorization: `Bearer ${token}` } },
        )
      : await api.delete<{ isFavorite: boolean }>(`/favorites/${nftId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    return response.data.isFavorite;
  } catch (error) {
    throw normalizeError(error);
  }
}
