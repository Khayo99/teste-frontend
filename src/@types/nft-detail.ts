import type { CatalogCategory, CatalogNetwork, Nft } from "./catalog";

export type NftAttribute = {
  trait: string;
  value: string;
};

export type NftCollection = {
  id: string;
  name: string;
};

export type NftReviewsSummary = {
  average: number;
  count: number;
};

export type CollectorReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type RelatedNft = {
  id: string;
  name: string;
  priceEth: string;
  image: string;
};

export type EditionLabel = "1/1" | "1/10" | "1/50" | "ABERTA";

export type NftDetail = Nft & {
  gallery: string[];
  editionLabel: EditionLabel;
  description: string;
  attributes: NftAttribute[];
  collection: NftCollection;
  contractAddress: string;
  network: CatalogNetwork;
  category: CatalogCategory;
  copyright: string;
  reviews: NftReviewsSummary;
  reviewsList: CollectorReview[];
  relatedNfts: RelatedNft[];
  isFavorite?: boolean;
};

export type Favorite = {
  userId: string;
  nftId: string;
  createdAt: string;
};
