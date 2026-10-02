import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { RelatedNft } from "@/@types/nft-detail";

export function RelatedNftsCarousel({
  relatedNfts,
}: {
  relatedNfts: RelatedNft[];
}) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  if (relatedNfts.length === 0) return null;

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const itemWidth = scroller.scrollWidth / relatedNfts.length;
    const index = Math.round(scroller.scrollLeft / itemWidth);
    setActiveDot(Math.min(index, relatedNfts.length - 1));
  };

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const itemWidth = scroller.scrollWidth / relatedNfts.length;
    scroller.scrollTo({ left: itemWidth * index, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-7 border-t border-border pt-7">
      <h2 className="text-body-15-medium text-text-primary">
        Mais desta coleção
      </h2>
      <ul
        className="flex snap-x gap-6 overflow-x-auto pb-2"
        onScroll={handleScroll}
        ref={scrollerRef}
      >
        {relatedNfts.map((relatedNft) => (
          <li className="w-[219px] shrink-0 snap-start" key={relatedNft.id}>
            <Link
              className="group flex flex-col gap-3"
              params={{ nftId: relatedNft.id }}
              to="/nft/$nftId"
            >
              <div className="aspect-square overflow-hidden rounded-2xl bg-surface-card">
                <img
                  alt={relatedNft.name}
                  className="size-full object-cover transition duration-300 group-hover:scale-105"
                  src={relatedNft.image}
                />
              </div>
              <div>
                <p className="text-body-16-compact text-text-primary">
                  {relatedNft.name}
                </p>
                <p className="mt-1 text-body-14-compact text-text-accent">
                  {relatedNft.priceEth} ETH
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {relatedNfts.length > 1 && (
        <div
          className="flex justify-center gap-2"
          role="tablist"
          aria-label="Navegação do carrossel"
        >
          {relatedNfts.map((relatedNft, index) => (
            <button
              aria-label={`Ir para ${relatedNft.name}`}
              aria-selected={activeDot === index}
              className={`size-3 rounded-full transition-colors ${
                activeDot === index ? "bg-text-accent" : "bg-surface-card"
              }`}
              key={relatedNft.id}
              onClick={() => scrollToIndex(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      )}
    </section>
  );
}
