import { catalogNfts } from '@/features/catalog/data/catalog-fixtures'
import artworkOne from '@/assets/optimized/home/nft-artwork-01.jpg'
import artworkTwo from '@/assets/optimized/home/nft-artwork-02.jpg'
import artworkThree from '@/assets/optimized/home/nft-artwork-03.jpg'
import heroApe from '@/assets/optimized/home/hero-ape.jpg'
import type {
  CollectorReview,
  EditionLabel,
  NftAttribute,
  NftDetail
} from '@/@types/nft-detail'
import type { Nft } from '@/@types/catalog'

const galleryImages = [artworkOne, artworkTwo, artworkThree, heroApe]
const editionLabels: EditionLabel[] = ['1/1', '1/10', '1/50', 'ABERTA']
const attributePool: NftAttribute[] = [
  { trait: 'Fundo', value: 'Esmeralda' },
  { trait: 'Acessório', value: 'Óculos' },
  { trait: 'Raridade', value: 'Raro' },
  { trait: 'Humor', value: 'Confiante' },
  { trait: 'Pele', value: 'Dourada' },
  { trait: 'Roupa', value: 'Moletom roxo' }
]
const reviewAuthors = [
  'Ana Souza',
  'Bruno Lima',
  'Carla Dias',
  'Diego Alves',
  'Elisa Nunes'
]
const reviewComments = [
  'Peça incrível, a entrega da propriedade na blockchain foi rápida e segura.',
  'Arte linda, os metadados são verificáveis e o suporte da Kurio foi ótimo.',
  'Edição limitada vale cada centavo, recomendo para colecionadores.',
  'Processo de compra simples e transparente, já estou de olho em outras peças.',
  'Qualidade da arte impressionante, procedência bem documentada na rede.'
]

/** Simple deterministic string hash, used to vary fixtures without randomness. */
function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function buildReviews(nftId: string, count: number): CollectorReview[] {
  const baseHash = hashString(nftId)
  return Array.from({ length: count }, (_, index) => ({
    authorName: reviewAuthors[(baseHash + index) % reviewAuthors.length],
    comment: reviewComments[(baseHash + index * 3) % reviewComments.length],
    createdAt: new Date(
      Date.UTC(2024, (baseHash + index) % 12, ((baseHash + index * 5) % 27) + 1)
    ).toISOString(),
    id: `${nftId}-review-${index + 1}`,
    rating: 3 + ((baseHash + index) % 3)
  }))
}

function buildDetail(nft: Nft, forcedAvailability?: number): NftDetail {
  const hash = hashString(nft.id)
  const reviewCount = 8 + (hash % 25)
  const reviewsList = buildReviews(nft.id, Math.min(reviewCount, 12))
  const averageRating =
    reviewsList.reduce((total, review) => total + review.rating, 0) /
    reviewsList.length
  const availability = forcedAvailability ?? nft.availability
  const sameCategory = catalogNfts.filter(
    candidate => candidate.category === nft.category && candidate.id !== nft.id
  )
  const related = (sameCategory.length > 0 ? sameCategory : catalogNfts)
    .slice(0, 5)
    .map(candidate => ({
      id: candidate.id,
      image: candidate.image,
      name: `${candidate.name} ${candidate.tokenId}`,
      priceEth: candidate.priceEth
    }))

  return {
    ...nft,
    attributes: [
      attributePool[hash % attributePool.length],
      attributePool[(hash + 1) % attributePool.length],
      attributePool[(hash + 2) % attributePool.length]
    ],
    availability,
    collection: {
      id: `${nft.category.toLocaleLowerCase('pt-BR').replaceAll(' ', '-')}-collection`,
      name: `Kurio ${nft.category}`
    },
    contractAddress: `0x${hash.toString(16).padStart(8, '0')}...${nft.tokenId.replace('#', '')}`,
    copyright:
      'Direitos autorais do criador: 5% sobre vendas secundárias, pagos automaticamente por marketplaces compatíveis.',
    description: `${nft.name} ${nft.tokenId} é uma obra digital ${editionLabels[hash % editionLabels.length]} finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na ${nft.network}. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras. A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede.`,
    editionLabel: editionLabels[hash % editionLabels.length],
    gallery: [
      nft.image,
      galleryImages[hash % galleryImages.length],
      galleryImages[(hash + 1) % galleryImages.length],
      galleryImages[(hash + 2) % galleryImages.length]
    ],
    isFavorite: false,
    network: nft.network,
    relatedNfts: related,
    reviews: {
      average: Math.round(averageRating * 10) / 10,
      count: reviewsList.length
    },
    reviewsList
  }
}

export const nftDetails: Record<string, NftDetail> = Object.fromEntries(
  catalogNfts.map(nft => [
    nft.id,
    buildDetail(nft, nft.id === 'sage-nomad-009' ? 0 : undefined)
  ])
)

export function getNftDetailFixture(nftId: string): NftDetail | undefined {
  return nftDetails[nftId]
}
