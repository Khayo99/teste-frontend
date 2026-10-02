import artworkOne from '@/assets/home/nft-artwork-01.png'
import artworkTwo from '@/assets/home/nft-artwork-02.png'
import artworkThree from '@/assets/home/nft-artwork-03.png'
import heroApe from '@/assets/home/hero-ape.png'
import type { Nft } from '@/@types/catalog'

export const catalogNfts: Nft[] = [
  { id: 'emerald-ape-042', name: 'Emerald Ape', tokenId: '#042', priceEth: '1.19', image: artworkOne, category: 'Arte digital', network: 'Ethereum', availability: 4 },
  { id: 'sage-nomad-009', name: 'Sage Nomad', tokenId: '#009', priceEth: '1.69', image: artworkTwo, category: 'Colecionáveis', network: 'Ethereum', availability: 2 },
  { id: 'neon-vessel-552', name: 'Neon Vessel', tokenId: '#552', priceEth: '1.99', image: heroApe, category: 'Generativa', network: 'Solana', availability: 1, rarity: 'Raro' },
  { id: 'cosmic-bloom-118', name: 'Cosmic Bloom', tokenId: '#118', priceEth: '1.29', image: artworkThree, category: 'Arte digital', network: 'Polygon', availability: 5 },
  { id: 'violet-nomad-314', name: 'Violet Nomad', tokenId: '#314', priceEth: '1.39', image: artworkTwo, category: 'Fotografia', network: 'Ethereum', availability: 3 },
  { id: 'ivory-baron-088', name: 'Ivory Baron', tokenId: '#088', priceEth: '1.79', image: artworkOne, category: 'Arte 3D', network: 'Solana', availability: 2 },
  { id: 'golden-beat-207', name: 'Golden Beat', tokenId: '#207', priceEth: '0.99', image: heroApe, category: 'Música', network: 'Polygon', availability: 6 },
  { id: 'golden-frequency-071', name: 'Golden Frequency', tokenId: '#071', priceEth: '0.39', image: artworkThree, category: 'Música', network: 'Ethereum', availability: 7 },
  { id: 'golden-signal-160', name: 'Golden Signal', tokenId: '#160', priceEth: '0.99', image: artworkTwo, category: 'Jogos', network: 'Solana', availability: 3 },
]

const collectionTotals: Record<Nft['category'], number> = {
  'Arte digital': 33,
  'Arte 3D': 39,
  'Assinaturas': 13,
  'Colecionáveis': 23,
  'Fotografia': 12,
  'Generativa': 17,
  'Jogos': 19,
  'Música': 65,
  'Utilidade': 18,
}

const collectionImages = [artworkOne, artworkTwo, artworkThree, heroApe]
const collectionNfts = Object.entries(collectionTotals).flatMap(([category, total]) => {
  const typedCategory = category as Nft['category']
  const existingCount = catalogNfts.filter(nft => nft.category === typedCategory).length

  return Array.from({ length: total - existingCount }, (_, index): Nft => {
    const number = existingCount + index + 1
    return {
      availability: (number % 7) + 1,
      category: typedCategory,
      id: `${typedCategory.toLocaleLowerCase('pt-BR').replaceAll(' ', '-')}-${number}`,
      image: collectionImages[index % collectionImages.length],
      name: typedCategory,
      network: ['Ethereum', 'Polygon', 'Solana'][index % 3] as Nft['network'],
      priceEth: (0.25 + ((index * 37) % 950) / 100).toFixed(2),
      tokenId: `#${String(number).padStart(3, '0')}`,
    }
  })
})

catalogNfts.push(...collectionNfts)
