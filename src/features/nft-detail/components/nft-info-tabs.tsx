import { useState } from "react";
import { Star } from "lucide-react";
import type { NftDetail } from "@/@types/nft-detail";

type Tab = "details" | "reviews";

export function NftInfoTabs({ nft }: { nft: NftDetail }) {
  const [activeTab, setActiveTab] = useState<Tab>("details");

  return (
    <section className="flex flex-col gap-7 border-t border-border pt-7">
      <div
        className="flex flex-wrap gap-8 border-b border-border pb-2"
        role="tablist"
        aria-label="Informações do NFT"
      >
        <button
          aria-selected={activeTab === "details"}
          className={`relative pb-2 text-body-15-medium ${
            activeTab === "details"
              ? "text-text-accent after:absolute after:inset-x-0 after:-bottom-[9px] after:h-0.5 after:bg-text-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("details")}
          role="tab"
          type="button"
        >
          Detalhes do NFT
        </button>
        <button
          aria-selected={activeTab === "reviews"}
          className={`relative pb-2 text-body-15-medium ${
            activeTab === "reviews"
              ? "text-text-accent after:absolute after:inset-x-0 after:-bottom-[9px] after:h-0.5 after:bg-text-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("reviews")}
          role="tab"
          type="button"
        >
          Avaliações de colecionadores ({nft.reviews.count})
        </button>
      </div>

      {activeTab === "details" ? (
        <div className="flex flex-col gap-6" role="tabpanel">
          <p className="text-body-14-relaxed text-text-secondary">
            {nft.description}
          </p>
          <div className="flex flex-col gap-4 text-body-14-copy text-text-secondary">
            <p>
              <span className="text-text-primary">Rede: </span>
              {nft.network}
            </p>
            <p>
              Cunhado na {nft.network} com procedência imutável e metadados
              armazenados no IPFS.
            </p>
            <p>
              <span className="text-text-primary">Contrato: </span>
              {nft.contractAddress}
            </p>
            <p>
              <span className="text-text-primary">Direitos autorais: </span>
              {nft.copyright}
            </p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-6" role="tabpanel">
          {nft.reviewsList.length === 0 ? (
            <li className="text-body-14-compact text-text-secondary">
              Ainda não há avaliações para este NFT.
            </li>
          ) : (
            nft.reviewsList.map((review) => (
              <li
                className="flex flex-col gap-2 border-b border-border pb-6 last:border-none"
                key={review.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body-15-medium text-text-primary">
                    {review.authorName}
                  </p>
                  <div className="flex items-center gap-1" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        className={`size-icon-sm ${
                          index < review.rating
                            ? "fill-text-accent text-text-accent"
                            : "fill-transparent text-text-secondary"
                        }`}
                        key={index}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-body-14-compact text-text-secondary">
                  {review.comment}
                </p>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
