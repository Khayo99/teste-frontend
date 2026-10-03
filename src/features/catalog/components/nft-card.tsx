import { Heart, Search, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { NftCardProps } from "@/@types/catalog";
import { Button } from "@/components/ui/button";

export function NftCard({ mobileImage, nft }: NftCardProps) {
  const navigate = useNavigate();
  const goToDetail = () =>
    void navigate({ to: "/nft/$nftId", params: { nftId: nft.id } });

  return (
    <article className="group min-w-0">
      <div
        className="relative flex h-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-surface-card sm:h-card-visual-height"
        onClick={goToDetail}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") goToDetail();
        }}
        role="link"
        tabIndex={0}
        aria-label={`Ver ${nft.name} ${nft.tokenId}`}
      >
        <picture className="size-[calc(100%-8px)] sm:size-card-artwork">
          {mobileImage && <source media="(max-width: 639px)" srcSet={mobileImage} />}
          <img
            alt={`NFT ${nft.name} ${nft.tokenId}`}
            className="size-full rounded-2xl object-cover transition duration-300 group-hover:scale-card-hover"
            src={nft.image}
          />
        </picture>
        {nft.rarity && (
          <span className="absolute left-0 top-0 bg-primary px-3 py-1 text-caption-bold uppercase text-ink">
            {nft.rarity}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 hidden items-center justify-end gap-2 bg-ink/80 p-2 group-hover:flex">
          <Button
            aria-label={`Adicionar ${nft.name} ao carrinho`}
            className="rounded-sm border border-text-secondary p-1 text-text-primary"
            onClick={(event) => event.stopPropagation()}
            variant="ghost"
            type="button"
          >
            <ShoppingCart className="size-icon-sm" />
          </Button>
          <Button
            aria-label={`Favoritar ${nft.name}`}
            className="rounded-sm border border-text-secondary p-1 text-text-primary"
            onClick={(event) => event.stopPropagation()}
            variant="ghost"
            type="button"
          >
            <Heart className="size-icon-sm" />
          </Button>
          <Button
            aria-label={`Ver ${nft.name}`}
            className="rounded-sm border border-text-secondary p-1 text-text-primary"
            onClick={(event) => {
              event.stopPropagation();
              goToDetail();
            }}
            variant="ghost"
            type="button"
          >
            <Search className="size-icon-sm" />
          </Button>
        </div>
      </div>
      <Link
        className="mt-2 block pl-2 text-[15px] leading-normal text-text-primary hover:text-text-accent sm:mt-3 sm:pl-0 sm:text-body-16-compact"
        params={{ nftId: nft.id }}
        to="/nft/$nftId"
      >
        {nft.name} {nft.tokenId}
      </Link>
      <p className="mt-1 pl-2 text-[16px] font-bold leading-4 text-text-accent sm:mt-3 sm:pl-0 sm:text-body-18-bold-compact">
        {nft.priceEth} ETH
      </p>
    </article>
  );
}
