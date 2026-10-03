import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { getNftDetail } from "@/features/nft-detail/api/nft-detail-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { NftGallery } from "@/features/nft-detail/components/nft-gallery";
import { NftPurchasePanel } from "@/features/nft-detail/components/nft-purchase-panel";
import { NftInfoTabs } from "@/features/nft-detail/components/nft-info-tabs";
import { RelatedNftsCarousel } from "@/features/nft-detail/components/related-nfts-carousel";
import { queryKeys } from '@/lib/query-keys'

export function NftDetailPage() {
  const { nftId } = useParams({ from: "/nft/$nftId" });
  const { token, user } = useAuthStore();
  const {
    data: nft,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.nft(nftId, user?.id ?? null),
    queryFn: ({ signal }) => getNftDetail(nftId, token, signal),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8" aria-label="Carregando NFT">
        <div className="skeleton h-5 w-48 rounded" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-24 rounded" />
            <div className="skeleton h-10 w-1/2 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const notFound = isError && (error as { status?: number }).status === 404;

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-heading text-text-primary">NFT não encontrado</p>
        <p className="text-body-14-compact text-text-secondary">
          O NFT que você procura não existe ou foi removido.
        </p>
        <Link
          className="mt-2 rounded-md bg-primary px-5 py-3 text-body-16-bold-compact text-ink"
          to="/"
        >
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  if (isError || !nft) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p
          className="text-body-14-compact text-text-secondary"
          aria-live="polite"
        >
          Não foi possível carregar este NFT.
        </p>
        <button
          className="rounded-md bg-primary px-5 py-3 text-body-16-bold-compact text-ink"
          onClick={() => void refetch()}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 md:gap-16">
      <div className="flex flex-col gap-7 md:gap-7">
        <nav
          aria-label="Trilha de navegação"
          className="hidden text-body-15 text-text-secondary md:block"
        >
          <Link className="hover:text-text-primary" to="/">
            Início
          </Link>{" "}
          / Mercado
        </nav>
        <div className="grid grid-cols-1 gap-0 md:gap-12 lg:grid-cols-2">
          <NftGallery
            gallery={nft.gallery}
            name={`${nft.name} ${nft.tokenId}`}
          />
          <NftPurchasePanel key={nft.id} nft={nft} />
        </div>
      </div>
      <div className="hidden md:block"><NftInfoTabs nft={nft} /></div>
      <div className="hidden md:block"><RelatedNftsCarousel relatedNfts={nft.relatedNfts} /></div>
    </div>
  );
}
